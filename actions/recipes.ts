"use server";

import { db } from "@/db";
import { ingredients, recipeIngredients, recipes, steps } from "@/db/schema";
import {
  getUserDisplayName,
  requireCurrentUser,
  userHasAdminRole,
} from "@/lib/auth/session";
import { destroyCloudinaryImage } from "@/lib/cloudinary";
import { RecipeOutput, recipeSchema } from "@/lib/schemas/recipe";
import { generateSlug } from "@/lib/slug";
import { desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { forbidden } from "next/navigation";

const DUPLICATE_RECIPE_TITLE_ERROR = "A recipe with that title already exists.";

/**
 * Returns true when the error represents a unique constraint violation for recipe titles.
 */
function isRecipeTitleUniqueConstraintError(error: unknown): boolean {
  if (error == null || typeof error !== "object") {
    return false;
  }

  const asRecord = error as {
    code?: unknown;
    constraint?: unknown;
    cause?: unknown;
  };

  if (
    asRecord.code === "23505" ||
    asRecord.constraint === "recipes_title_unique"
  ) {
    return true;
  }

  const cause = asRecord.cause;

  if (cause != null && typeof cause === "object") {
    const causeRecord = cause as { code?: unknown; constraint?: unknown };

    return (
      causeRecord.code === "23505" ||
      causeRecord.constraint === "recipes_title_unique"
    );
  }

  return false;
}

/**
 * Creates a new recipe in the database.
 * @param data The data for the new recipe.
 * @returns A Promise that resolves to a discriminated union indicating success or failure.
 */
export async function createRecipe(
  data: RecipeOutput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  try {
    const user = await requireCurrentUser();
    const userId = user.id;
    const parsed = recipeSchema.safeParse(data);

    if (!parsed.success) {
      return { ok: false, error: "Invalid recipe data" };
    }

    const valid = parsed.data;

    if (!(await isRecipeTitleAvailable(valid.title))) {
      return { ok: false, error: DUPLICATE_RECIPE_TITLE_ERROR };
    }

    const slug = await generateSlug(valid.title);

    const [recipe] = await db
      .insert(recipes)
      .values({
        userId,
        ownerDisplayName: getUserDisplayName(user),
        slug,
        title: valid.title,
        description: valid.description,
        servings: valid.servings,
        prepTimeMins: valid.prepTimeMins || undefined,
        cookTimeMins: valid.cookTimeMins || undefined,
        imageUrl: valid.imageUrl,
        imagePublicId: valid.imagePublicId,
      })
      .returning();

    if (!recipe || !recipe.id) {
      return { ok: false, error: "Failed to create recipe" };
    }

    const ingredients = await Promise.all(
      valid.ingredients.map(async (ingredient, index) => ({
        recipeId: recipe.id,
        ingredientId: await getOrCreateIngredientId(
          ingredient.name.trim(),
          ingredient.unit,
        ),
        amount: ingredient.amount?.toString() || undefined,
        unit: ingredient.unit?.trim() || undefined,
        notes: ingredient.notes?.trim() || undefined,
        sortOrder: index,
      })),
    );

    if (valid.ingredients.length > 0) {
      await db.insert(recipeIngredients).values(ingredients);
    }

    if (valid.steps.length > 0) {
      await db.insert(steps).values(
        valid.steps.map((step) => ({
          recipeId: recipe.id,
          stepNumber: step.stepNumber,
          instruction: step.instruction,
        })),
      );
    }

    revalidatePath("/");
    revalidatePath(`/recipes/${recipe.slug}`);
    revalidateTag("recipes", "max");

    return { ok: true, slug: recipe.slug };
  } catch (error) {
    if (isRecipeTitleUniqueConstraintError(error)) {
      return { ok: false, error: DUPLICATE_RECIPE_TITLE_ERROR };
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create recipe. Please try again.",
    };
  }
}

/**
 * Checks if a recipe title is available, optionally excluding a specific recipe ID.
 * @param title The title of the recipe to check.
 * @param excludeId The ID of the recipe to exclude from the check (useful for editing).
 * @returns A promise that resolves to true if the title is available, false otherwise.
 */
export async function isRecipeTitleAvailable(
  title: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await db.query.recipes.findFirst({
    where: eq(recipes.title, title.trim()),
  });

  if (!existing) return true;

  return excludeId != null && existing.id === excludeId;
}

/**
 * Retrieves the ID of an ingredient by name. If the ingredient does not exist, it creates a new one.
 * @param name The name of the ingredient.
 * @param defaultUnit The default unit for the ingredient, if creating a new one.
 * @returns The ID of the existing or newly created ingredient.
 */
export async function getOrCreateIngredientId(
  name: string,
  defaultUnit?: string,
) {
  const normalizedName = name.trim();

  if (!normalizedName) {
    throw new Error("Ingredient name cannot be empty");
  }

  const existingIngredient = await db.query.ingredients.findFirst({
    where: eq(ingredients.name, normalizedName),
  });

  if (existingIngredient) {
    return existingIngredient.id;
  }

  const [createdIngredient] = await db
    .insert(ingredients)
    .values({
      name: normalizedName,
      defaultUnit,
    })
    .onConflictDoNothing()
    .returning();

  if (createdIngredient) {
    return createdIngredient.id;
  }

  const ingredient = await db.query.ingredients.findFirst({
    where: eq(ingredients.name, normalizedName),
  });

  if (!ingredient) {
    throw new Error(`Unable to create ingredient: ${normalizedName}`);
  }

  return ingredient.id;
}

type IngredientRow = typeof ingredients.$inferSelect;

/**
 * Retrieves all ingredients from the database, ordered by name.
 * @returns A Promise that resolves to an array of ingredients.
 */
export async function getIngredients(): Promise<IngredientRow[]> {
  return db.query.ingredients.findMany({
    orderBy: (ingredients, { asc }) => [asc(ingredients.name)],
  });
}

/**
 * Retrieves recipes from the database, optionally filtered by a search query.
 * @param query The search query to filter recipes by title or description.
 * @returns A Promise that resolves to an array of recipes.
 */
export async function getRecipes(query?: string) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return db.query.recipes.findMany({
      orderBy: desc(recipes.createdAt),
    });
  }

  return db.query.recipes.findMany({
    where: or(
      ilike(recipes.title, `%${trimmedQuery}%`),
      ilike(recipes.description, `%${trimmedQuery}%`),
    ),
    orderBy: desc(recipes.createdAt),
  });
}

/**
 * Retrieves a recipe by its ID, including its ingredients and steps.
 * @param id The ID of the recipe.
 * @returns A Promise that resolves to the recipe or null if not found.
 */
export async function getRecipe(id: string) {
  return db.query.recipes.findFirst({
    where: eq(recipes.id, id),
    with: {
      recipeIngredients: {
        with: { ingredient: true },
        orderBy: (ri, { asc }) => [asc(ri.sortOrder)],
      },
      steps: {
        orderBy: (s, { asc }) => [asc(s.stepNumber)],
      },
    },
  });
}

/**
 * Retrieves a recipe by its slug, including its ingredients and steps.
 * @param slug The slug of the recipe.
 * @returns A Promise that resolves to the recipe or null if not found.
 */
export async function getRecipeBySlug(slug: string) {
  return db.query.recipes.findFirst({
    where: eq(recipes.slug, slug),
    with: {
      recipeIngredients: {
        with: { ingredient: true },
        orderBy: (ri, { asc }) => [asc(ri.sortOrder)],
      },
      steps: {
        orderBy: (s, { asc }) => [asc(s.stepNumber)],
      },
    },
  });
}

/**
 * Retrieves a recipe by ID and ensures the current user owns it.
 * @param id The ID of the recipe.
 * @returns The owned recipe.
 */
async function getEditableRecipe(id: string) {
  const user = await requireCurrentUser();
  const recipe = await getRecipe(id);

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const isOwner = recipe.userId === user.id;
  const isAdmin = userHasAdminRole(user);

  if (!isOwner && !isAdmin) {
    forbidden();
  }

  return { recipe, user, isOwner };
}

/**
 * Updates an existing recipe in the database.
 * @param id The ID of the recipe to update.
 * @param data The updated data for the recipe.
 * @returns A Promise that resolves to the updated recipe.
 */
export async function updateRecipe(
  id: string,
  data: RecipeOutput,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  try {
    const parsed = recipeSchema.safeParse(data);

    if (!parsed.success) {
      return { ok: false, error: "Invalid recipe data" };
    }

    const valid = parsed.data;
    const { recipe: existingRecipe, user } = await getEditableRecipe(id);

    if (
      existingRecipe.title !== valid.title &&
      !(await isRecipeTitleAvailable(valid.title, id))
    ) {
      return { ok: false, error: DUPLICATE_RECIPE_TITLE_ERROR };
    }

    const previousSlug = existingRecipe.slug;
    const existingImagePublicId = existingRecipe.imagePublicId?.trim();
    const nextImagePublicId = valid.imagePublicId?.trim();

    const slug =
      existingRecipe.title !== valid.title
        ? await generateSlug(valid.title)
        : existingRecipe.slug;

    const [recipe] = await db
      .update(recipes)
      .set({
        userId: user.id,
        slug,
        ownerDisplayName: getUserDisplayName(user),
        title: valid.title,
        description: valid.description,
        servings: valid.servings,
        prepTimeMins: valid.prepTimeMins || undefined,
        cookTimeMins: valid.cookTimeMins || undefined,
        imageUrl: valid.imageUrl,
        imagePublicId: valid.imagePublicId,
        updatedAt: new Date(),
      })
      .where(eq(recipes.id, id))
      .returning();

    // Delete and re-insert ingredients and steps
    await db
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, id));
    await db.delete(steps).where(eq(steps.recipeId, id));

    const ingredients = await Promise.all(
      valid.ingredients.map(async (ingredient, index) => ({
        recipeId: recipe.id,
        ingredientId: await getOrCreateIngredientId(
          ingredient.name.trim(),
          ingredient.unit,
        ),
        amount: ingredient.amount?.toString() || undefined,
        unit: ingredient.unit?.trim() || undefined,
        notes: ingredient.notes?.trim() || undefined,
        sortOrder: index,
      })),
    );

    if (valid.ingredients.length > 0) {
      await db.insert(recipeIngredients).values(ingredients);
    }

    if (valid.steps.length > 0) {
      await db.insert(steps).values(
        valid.steps.map((step) => ({
          recipeId: id,
          stepNumber: step.stepNumber,
          instruction: step.instruction,
        })),
      );
    }

    if (existingImagePublicId && existingImagePublicId !== nextImagePublicId) {
      await destroyCloudinaryImage(existingImagePublicId);
    }

    revalidatePath("/");
    revalidatePath(`/recipes/${previousSlug}`);
    revalidatePath(`/recipes/${recipe.slug}`);
    revalidateTag("recipes", "max");

    return { ok: true, slug: recipe.slug };
  } catch (error) {
    if (isRecipeTitleUniqueConstraintError(error)) {
      return { ok: false, error: DUPLICATE_RECIPE_TITLE_ERROR };
    }

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update recipe. Please try again.",
    };
  }
}

/**
 * Deletes a recipe from the database.
 * If the recipe has an associated image, it will also be deleted from Cloudinary.
 * @param id The ID of the recipe to delete.
 * @returns A Promise that resolves when the recipe is deleted.
 */
export async function deleteRecipe(id: string) {
  const { recipe } = await getEditableRecipe(id);
  await db.delete(recipes).where(eq(recipes.id, id));

  if (recipe.imagePublicId) {
    await destroyCloudinaryImage(recipe.imagePublicId);
  }

  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.slug}`);
  revalidateTag("recipes", "max");
}

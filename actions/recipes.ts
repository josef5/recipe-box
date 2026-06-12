"use server";

import { db } from "@/db";
import { ingredients, recipes, recipeIngredients, steps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { generateSlug } from "@/lib/slug";
import { forbidden, redirect } from "next/navigation";
import { desc, ilike, or } from "drizzle-orm";
import {
  getUserDisplayName,
  requireCurrentUser,
  userHasAdminRole,
} from "@/lib/auth/session";
import {
  type RecipeRawInput,
  type RecipeFormState,
  validateRecipeFormData,
} from "@/lib/validation/recipes";
import { destroyCloudinaryImage } from "@/lib/cloudinary";

export type RecipeFormData = {
  title: string;
  description?: string;
  servings?: number;
  prepTimeMins?: number;
  cookTimeMins?: number;
  imageUrl?: string;
  imagePublicId?: string;
  ingredients: {
    ingredientId: string;
    amount?: number;
    unit?: string;
    notes?: string;
  }[];
  steps: {
    stepNumber: number;
    instruction: string;
  }[];
};

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const numberValue = Number(trimmedValue);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

/**
 * Retrieves the ID of an ingredient by name. If the ingredient does not exist, it creates a new one.
 * @param name The name of the ingredient.
 * @param defaultUnit The default unit for the ingredient, if creating a new one.
 * @returns The ID of the existing or newly created ingredient.
 */
async function getOrCreateIngredientId(name: string, defaultUnit?: string) {
  const normalizedName = name.trim();

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

/**
 * Resolves the ingredient and step arrays from FormData into a full RecipeFormData
 * object.  Should only be called after validateRecipeFormData() has succeeded so
 * DB side effects (getOrCreateIngredientId) never run on invalid submissions.
 */
async function buildRecipeFormData(
  validated: RecipeRawInput,
  formData: FormData,
): Promise<RecipeFormData> {
  const ingredientNames = formData
    .getAll("ingredientName")
    .map((v) => v.toString().trim());
  const ingredientAmounts = formData
    .getAll("ingredientAmount")
    .map((v) => v.toString().trim());
  const ingredientUnits = formData
    .getAll("ingredientUnit")
    .map((v) => v.toString().trim());
  const ingredientNotes = formData
    .getAll("ingredientNotes")
    .map((v) => v.toString().trim());
  const stepInstructions = formData
    .getAll("stepInstruction")
    .map((v) => v.toString().trim());

  const ingredientData = await Promise.all(
    ingredientNames.map(async (name, index) => {
      if (!name) return null;
      const unit = ingredientUnits[index] || undefined;
      const amountValue = ingredientAmounts[index];
      const amount = amountValue ? Number(amountValue) : undefined;
      return {
        ingredientId: await getOrCreateIngredientId(name, unit),
        amount: Number.isFinite(amount) ? amount : undefined,
        unit,
        notes: ingredientNotes[index] || undefined,
      };
    }),
  );

  return {
    title: formData.get("title")?.toString().trim() ?? "",
    description: getOptionalString(formData, "description"),
    servings: getOptionalNumber(formData, "servings"),
    prepTimeMins: getOptionalNumber(formData, "prepTimeMins"),
    cookTimeMins: getOptionalNumber(formData, "cookTimeMins"),
    imageUrl: getOptionalString(formData, "imageUrl"),
    imagePublicId: getOptionalString(formData, "imagePublicId"),
    ingredients: ingredientData.filter((ingredient) => ingredient !== null),
    steps: stepInstructions
      .filter((instruction) => instruction.length > 0)
      .map((instruction, index) => ({ stepNumber: index + 1, instruction })),
  };
}

async function parseRecipeFormData(
  formData: FormData,
): Promise<
  | { success: true; data: RecipeFormData }
  | { success: false; state: RecipeFormState }
> {
  const validated = validateRecipeFormData(formData);

  if (!validated.success) {
    return { success: false, state: { errors: validated.errors } };
  }

  const data = await buildRecipeFormData(validated.data, formData);
  return { success: true, data };
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
 * Retrieves all ingredients from the database, ordered by name.
 * @returns A Promise that resolves to an array of ingredients.
 */
export async function getIngredients() {
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
 * Creates a new recipe in the database.
 * @param data The data for the new recipe.
 * @returns A Promise that resolves to the newly created recipe.
 */
export async function createRecipe(data: RecipeFormData) {
  const user = await requireCurrentUser();
  const userId = user.id;
  const slug = await generateSlug(data.title);

  const [recipe] = await db
    .insert(recipes)
    .values({
      userId,
      ownerDisplayName: getUserDisplayName(user),
      slug,
      title: data.title,
      description: data.description,
      servings: data.servings,
      prepTimeMins: data.prepTimeMins,
      cookTimeMins: data.cookTimeMins,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
    })
    .returning();

  if (data.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      data.ingredients.map((ing, index) => ({
        recipeId: recipe.id,
        ingredientId: ing.ingredientId,
        amount: ing.amount?.toString(),
        unit: ing.unit,
        notes: ing.notes,
        sortOrder: index,
      })),
    );
  }

  if (data.steps.length > 0) {
    await db.insert(steps).values(
      data.steps.map((step) => ({
        recipeId: recipe.id,
        stepNumber: step.stepNumber,
        instruction: step.instruction,
      })),
    );
  }

  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.slug}`);
  revalidateTag("recipes", "max");
  return recipe;
}

export async function createRecipeFromForm(
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = await parseRecipeFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  const recipe = await createRecipe(parsed.data);
  redirect(`/recipes/${recipe.slug}?toast=recipe-saved`);
}

/**
 * Updates an existing recipe in the database.
 * @param id The ID of the recipe to update.
 * @param data The updated data for the recipe.
 * @returns A Promise that resolves to the updated recipe.
 */
export async function updateRecipe(id: string, data: RecipeFormData) {
  const { recipe: existingRecipe, user } = await getEditableRecipe(id);
  const previousSlug = existingRecipe.slug;
  const existingImagePublicId = existingRecipe.imagePublicId?.trim();
  const nextImagePublicId = data.imagePublicId?.trim();

  const slug =
    existingRecipe.title !== data.title
      ? await generateSlug(data.title)
      : existingRecipe.slug;

  const [recipe] = await db
    .update(recipes)
    .set({
      userId: user.id,
      slug,
      ownerDisplayName: getUserDisplayName(user),
      title: data.title,
      description: data.description,
      servings: data.servings,
      prepTimeMins: data.prepTimeMins,
      cookTimeMins: data.cookTimeMins,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      updatedAt: new Date(),
    })
    .where(eq(recipes.id, id))
    .returning();

  // Delete and re-insert ingredients and steps
  await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));
  await db.delete(steps).where(eq(steps.recipeId, id));

  if (data.ingredients.length > 0) {
    await db.insert(recipeIngredients).values(
      data.ingredients.map((ing, index) => ({
        recipeId: id,
        ingredientId: ing.ingredientId,
        amount: ing.amount?.toString(),
        unit: ing.unit,
        notes: ing.notes,
        sortOrder: index,
      })),
    );
  }

  if (data.steps.length > 0) {
    await db.insert(steps).values(
      data.steps.map((step) => ({
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
  return recipe;
}

/**
 * Updates an existing recipe in the database from form data.
 * @param id The ID of the recipe to update.
 * @param formData The form data containing the updated recipe information.
 * @returns A Promise that resolves to the canonical recipe URL.
 */
export async function updateRecipeFromForm(
  id: string,
  _prevState: RecipeFormState,
  formData: FormData,
): Promise<RecipeFormState> {
  const parsed = await parseRecipeFormData(formData);

  if (!parsed.success) {
    return parsed.state;
  }

  const recipe = await updateRecipe(id, parsed.data);
  redirect(`/recipes/${recipe.slug}?toast=recipe-saved`);
}

/**
 * Deletes a recipe from the database.
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

/**
 * Deletes a recipe via form submission.
 * @param id The ID of the recipe to delete.
 * @returns A Promise that resolves to the home page URL.
 */
export async function deleteRecipeFromForm(id: string) {
  await deleteRecipe(id);
  return "/";
}

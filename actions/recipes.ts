"use server";

import { db } from "@/db";
import { ingredients, recipes, recipeIngredients, steps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateSlug } from "@/lib/slug";
import { redirect } from "next/navigation";

export type RecipeFormData = {
  title: string;
  description?: string;
  servings?: number;
  prepTimeMins?: number;
  cookTimeMins?: number;
  imageUrl?: string;
  sourceUrl?: string;
  sourceName?: string;
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

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getOptionalNumber(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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

async function parseRecipeFormData(
  formData: FormData,
): Promise<RecipeFormData> {
  const ingredientNames = formData
    .getAll("ingredientName")
    .map((value) => value.toString().trim());
  const ingredientAmounts = formData
    .getAll("ingredientAmount")
    .map((value) => value.toString().trim());
  const ingredientUnits = formData
    .getAll("ingredientUnit")
    .map((value) => value.toString().trim());
  const ingredientNotes = formData
    .getAll("ingredientNotes")
    .map((value) => value.toString().trim());
  const stepInstructions = formData
    .getAll("stepInstruction")
    .map((value) => value.toString().trim());

  const ingredientData = await Promise.all(
    ingredientNames.map(async (name, index) => {
      if (!name) {
        return null;
      }

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
    sourceUrl: getOptionalString(formData, "sourceUrl"),
    sourceName: getOptionalString(formData, "sourceName"),
    ingredients: ingredientData.filter((ingredient) => ingredient !== null),
    steps: stepInstructions
      .filter((instruction) => instruction.length > 0)
      .map((instruction, index) => ({
        stepNumber: index + 1,
        instruction,
      })),
  };
}

export async function getIngredients() {
  return db.query.ingredients.findMany({
    orderBy: (ingredients, { asc }) => [asc(ingredients.name)],
  });
}

export async function getRecipes() {
  return db.query.recipes.findMany({
    orderBy: (recipes, { desc }) => [desc(recipes.createdAt)],
  });
}

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

export async function createRecipe(data: RecipeFormData) {
  const slug = await generateSlug(data.title);

  const [recipe] = await db
    .insert(recipes)
    .values({
      slug,
      title: data.title,
      description: data.description,
      servings: data.servings,
      prepTimeMins: data.prepTimeMins,
      cookTimeMins: data.cookTimeMins,
      imageUrl: data.imageUrl,
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
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
  return recipe;
}

export async function createRecipeFromForm(formData: FormData) {
  const recipe = await createRecipe(await parseRecipeFormData(formData));

  redirect(`/recipes/${recipe.slug}`);
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  const existingRecipe = await getRecipe(id);

  if (!existingRecipe) {
    throw new Error("Recipe not found");
  }

  const slug =
    existingRecipe.title !== data.title
      ? await generateSlug(data.title)
      : existingRecipe.slug;

  const [recipe] = await db
    .update(recipes)
    .set({
      slug,
      title: data.title,
      description: data.description,
      servings: data.servings,
      prepTimeMins: data.prepTimeMins,
      cookTimeMins: data.cookTimeMins,
      imageUrl: data.imageUrl,
      sourceUrl: data.sourceUrl,
      sourceName: data.sourceName,
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

  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.slug}`);
  return recipe;
}

export async function updateRecipeFromForm(id: string, formData: FormData) {
  const recipe = await updateRecipe(id, await parseRecipeFormData(formData));

  redirect(`/recipes/${recipe.slug}`);
}

export async function deleteRecipe(id: string) {
  await db.delete(recipes).where(eq(recipes.id, id));
  revalidatePath("/");
}

"use server";

import { db } from "@/db";
import { recipes, recipeIngredients, steps, ingredients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

export async function createRecipe(data: RecipeFormData) {
  const [recipe] = await db
    .insert(recipes)
    .values({
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

  await db.insert(steps).values(
    data.steps.map((step) => ({
      recipeId: recipe.id,
      stepNumber: step.stepNumber,
      instruction: step.instruction,
    })),
  );

  revalidatePath("/");
  return recipe;
}

export async function updateRecipe(id: string, data: RecipeFormData) {
  const [recipe] = await db
    .update(recipes)
    .set({
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
  revalidatePath(`/recipes/${id}`);
  return recipe;
}

export async function deleteRecipe(id: string) {
  await db.delete(recipes).where(eq(recipes.id, id));
  revalidatePath("/");
}

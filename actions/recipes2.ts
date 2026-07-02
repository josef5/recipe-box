"use server";

import { db } from "@/db";
import { recipeIngredients, recipes, steps } from "@/db/schema";
import { getUserDisplayName, requireCurrentUser } from "@/lib/auth/session";
import { recipeSchema, RecipeOutput } from "@/lib/schemas/recipe";
import { generateSlug } from "@/lib/slug";
import { revalidatePath, revalidateTag } from "next/cache";
import { getOrCreateIngredientId } from "./recipes";

/**
 * Creates a new recipe in the database.
 * @param data The data for the new recipe.
 * @returns A Promise that resolves to the newly created recipe.
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
        prepTimeMins: valid.prepTimeMins ?? undefined,
        cookTimeMins: valid.cookTimeMins ?? undefined,
        imageUrl: valid.imageUrl,
        imagePublicId: data.imagePublicId,
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
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to create recipe. Please try again.",
    };
  }
}

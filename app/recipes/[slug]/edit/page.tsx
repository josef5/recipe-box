import {
  deleteRecipeFromForm,
  getIngredients,
  getRecipeBySlug,
  updateRecipeFromForm,
} from "@/actions/recipes";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUserId } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUserId = await requireCurrentUserId();
  const recipe = await getRecipeBySlug(slug);

  if (!recipe || recipe.userId !== currentUserId) {
    notFound();
  }

  const ingredients = await getIngredients();
  const updateRecipeAction = updateRecipeFromForm.bind(null, recipe.id);
  const deleteAction = deleteRecipeFromForm.bind(null, recipe.id);

  return (
    <main className="flex flex-col gap-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold">Edit recipe</h1>
        <p className="text-sm text-gray-600">
          Update details, ingredients, and steps.
        </p>
      </div>
      <RecipeForm
        action={updateRecipeAction}
        submitLabel="Save recipe"
        cancelHref={`/recipes/${recipe.slug}`}
        ingredientSuggestions={ingredients}
        initialValues={{
          title: recipe.title,
          description: recipe.description,
          servings: recipe.servings,
          prepTimeMins: recipe.prepTimeMins,
          cookTimeMins: recipe.cookTimeMins,
          imageUrl: recipe.imageUrl,
          sourceUrl: recipe.sourceUrl,
          sourceName: recipe.sourceName,
          ingredients: recipe.recipeIngredients.map((ingredient) => ({
            name: ingredient.ingredient.name,
            amount: ingredient.amount?.toString() ?? "",
            unit: ingredient.unit ?? "",
            notes: ingredient.notes ?? "",
          })),
          steps: recipe.steps.map((step) => ({
            instruction: step.instruction,
          })),
        }}
        deleteAction={deleteAction}
      />
    </main>
  );
}

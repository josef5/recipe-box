import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId();
  const ingredients = await getIngredients();

  return (
    <main className="flex flex-col gap-8">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-bold">Add recipe</h1>
        <p className="text-sm text-gray-600">
          Create a new recipe with ingredients and ordered steps.
        </p>
      </div>
      <RecipeForm
        action={createRecipeFromForm}
        submitLabel="Create recipe"
        cancelHref="/"
        ingredientSuggestions={ingredients}
      />
    </main>
  );
}

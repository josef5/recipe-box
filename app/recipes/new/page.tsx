import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import { AppMenu } from "@/components/app-menu";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId();
  const ingredients = await getIngredients();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-6 sm:px-6 sm:py-10">
      <AppMenu variant="recipe" />

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

import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import Main from "@/components/main";
import { RecipeForm, SubmitButton } from "@/components/recipe-form";
import { HistoryBackButton } from "@/components/ui/history-back-button";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId({ redirectTo: "/recipes/new" });
  const ingredients = await getIngredients();

  return (
    <Main>
      <div className="space-y-2 sm:col-start-1 sm:row-start-1">
        <h1 className="text-2xl font-bold">Add recipe</h1>
        <p className="text-sm text-gray-600">
          Create a new recipe with ingredients and ordered steps.
        </p>
        <RecipeForm
          action={createRecipeFromForm}
          ingredientSuggestions={ingredients}
        />
      </div>
      <aside className="flex items-start gap-3 sm:col-start-2 sm:row-start-1 sm:flex-col">
        <SubmitButton label="Save recipe" form="recipe-form" />
        <HistoryBackButton
          fallbackHref="/"
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </HistoryBackButton>
      </aside>
    </Main>
  );
}

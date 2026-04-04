import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import { HomePageContent } from "@/components/home-page-content";
import { ModalShell } from "@/components/modal-shell";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUserId } from "@/lib/auth/session";
import { getPublicRecipes } from "@/lib/recipes";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId();
  const recipes = await getPublicRecipes();
  const ingredients = await getIngredients();

  return (
    <main className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-40 blur-[1px]"
      >
        <HomePageContent recipes={recipes} query="" />
      </div>

      <ModalShell
        title="Add recipe"
        description="Create a new recipe with ingredients and ordered steps."
        fallbackHref="/"
      >
        <RecipeForm
          action={createRecipeFromForm}
          submitLabel="Create recipe"
          cancelHref="/"
          ingredientSuggestions={ingredients}
        />
      </ModalShell>
    </main>
  );
}

import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import Main from "@/components/main";
import Header from "@/components/header";
import { RecipeForm, SubmitButton } from "@/components/recipe-form";
import Sidebar from "@/components/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId({ redirectTo: "/recipes/new" });
  const ingredients = await getIngredients();

  return (
    <Main>
      <Header
        title="Add recipe"
        description="Create a new recipe with ingredients and ordered steps."
      />
      <div className="space-y-2 sm:col-start-1 sm:row-start-2">
        <RecipeForm
          action={createRecipeFromForm}
          ingredientSuggestions={ingredients}
        />
      </div>
      <Sidebar>
        <SubmitButton
          label="Save recipe"
          form="recipe-form"
          className="w-full"
        />
        <BackButton
          type="button"
          variant="secondary"
          fallbackHref="/"
          className="w-full"
        >
          Cancel
        </BackButton>
      </Sidebar>
    </Main>
  );
}

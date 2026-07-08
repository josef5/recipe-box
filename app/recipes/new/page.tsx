import { getIngredients } from "@/actions/recipes";
import { Main } from "@/components/main";
import { RecipeFormPageContent } from "@/components/recipe-form-page-content";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId({ redirectTo: "/recipes/new" });
  const ingredientSuggestions = await getIngredients();

  return (
    <Main>
      <RecipeFormPageContent
        title="Add recipe"
        ingredientSuggestions={ingredientSuggestions}
        description="Create a new recipe with ingredients and ordered steps."
      />
    </Main>
  );
}

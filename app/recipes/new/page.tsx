import { createRecipeFromForm, getIngredients } from "@/actions/recipes";
import Footer from "@/components/footer";
import Main from "@/components/main";
import { RecipeForm, SubmitButton } from "@/components/recipe-form";
import { BackButton } from "@/components/ui/back-button";
import { requireCurrentUserId } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  await requireCurrentUserId({ redirectTo: "/recipes/new" });
  const ingredients = await getIngredients();

  return (
    <Main>
      <div className="col-span-full flex flex-col items-start justify-between sm:row-start-1">
        <h1 className="font-bold">Add recipe</h1>
        <p className="text-sm text-gray-600">
          Create a new recipe with ingredients and ordered steps.
        </p>
      </div>
      <div className="space-y-2 sm:col-start-1 sm:row-start-2">
        <RecipeForm
          action={createRecipeFromForm}
          ingredientSuggestions={ingredients}
        />
      </div>
      <aside className="flex items-start gap-2 sm:col-start-2 sm:row-start-2 sm:max-h-40 sm:flex-col">
        <SubmitButton
          label="Save recipe"
          form="recipe-form"
          className="w-full"
        />
        <BackButton fallbackHref="/" className="w-full">
          Cancel
        </BackButton>
      </aside>
      <Footer />
    </Main>
  );
}

import {
  DeleteButton,
  RecipeForm,
  SubmitButton,
} from "@/components/recipe-form";
import {
  deleteRecipeFromForm,
  getIngredients,
  getRecipeBySlug,
  updateRecipeFromForm,
} from "@/actions/recipes";
import { HistoryBackButton } from "@/components/ui/history-back-button";
import { requireCurrentUser, userHasAdminRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await requireCurrentUser();
  const recipe = await getRecipeBySlug(slug);
  const canEditRecipe =
    !!recipe &&
    (recipe.userId === currentUser.id || userHasAdminRole(currentUser));

  if (!canEditRecipe) {
    notFound();
  }

  const ingredients = await getIngredients();
  const updateRecipeAction = updateRecipeFromForm.bind(null, recipe.id);
  const deleteAction = deleteRecipeFromForm.bind(null, recipe.id);

  return (
    <main className="grid items-start gap-8 sm:grid-cols-[3fr_1fr]">
      <div className="space-y-2 sm:col-start-1 sm:row-start-1">
        <h1 className="text-2xl font-bold">Edit recipe</h1>
        <p className="text-sm text-gray-600">
          Update details, ingredients, and steps.
        </p>
        <RecipeForm
          action={updateRecipeAction}
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
        />
      </div>
      <aside className="flex items-start gap-3 sm:col-start-2 sm:row-start-1 sm:flex-col">
        <SubmitButton label="Save recipe" form="recipe-form" />
        <HistoryBackButton
          fallbackHref={`/recipes/${recipe.slug}`}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </HistoryBackButton>
        <DeleteButton action={deleteAction} />
      </aside>
    </main>
  );
}

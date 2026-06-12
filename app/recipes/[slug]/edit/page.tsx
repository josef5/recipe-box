import {
  deleteRecipeFromForm,
  getIngredients,
  getRecipeBySlug,
  updateRecipeFromForm,
} from "@/actions/recipes";
import Main from "@/components/main";
import Header from "@/components/header";
import {
  DeleteButton,
  RecipeForm,
  SubmitButton,
} from "@/components/recipe-form";
import Sidebar from "@/components/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { requireCurrentUser, userHasAdminRole } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUser = await requireCurrentUser({
    redirectTo: `/recipes/${slug}/edit`,
  });
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
    <Main>
      <Header
        title="Edit recipe"
        description="Update details, ingredients, and steps."
      />
      <div className="space-y-2 sm:col-start-1 sm:row-start-2">
        <RecipeForm
          key={recipe.id}
          action={updateRecipeAction}
          ingredientSuggestions={ingredients}
          initialValues={{
            title: recipe.title,
            description: recipe.description,
            servings: recipe.servings,
            prepTimeMins: recipe.prepTimeMins,
            cookTimeMins: recipe.cookTimeMins,
            imageUrl: recipe.imageUrl,
            imagePublicId: recipe.imagePublicId,
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
      <Sidebar>
        <SubmitButton
          label="Save recipe"
          form="recipe-form"
          className="w-full"
        />
        <div className="flex w-full gap-2 sm:flex-col">
          <BackButton
            type="button"
            variant="secondary"
            fallbackHref={`/recipes/${recipe.slug}`}
            className="w-full"
          >
            Cancel
          </BackButton>
          <DeleteButton action={deleteAction} className="w-full" />
        </div>
      </Sidebar>
    </Main>
  );
}

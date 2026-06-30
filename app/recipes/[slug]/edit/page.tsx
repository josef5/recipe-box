import { getRecipeBySlug } from "@/actions/recipes";
import Main from "@/components/main";
import { RecipeFormPageContent } from "@/components/recipe-form-page-content";
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

  return (
    <Main>
      <RecipeFormPageContent
        title="Edit recipe"
        description="Update details, ingredients, and steps."
        recipeId={recipe.id}
        initialValues={{
          title: recipe.title,
          description: recipe.description ?? undefined,
          servings: recipe.servings ?? undefined,
          prepTimeMins: recipe.prepTimeMins ?? undefined,
          cookTimeMins: recipe.cookTimeMins ?? undefined,
          imageUrl: recipe.imageUrl ?? undefined,
          ingredients: recipe.recipeIngredients.map((ingredient) => ({
            name: ingredient.ingredient.name,
            amount: ingredient.amount?.toString() ?? "",
            unit: ingredient.unit ?? "",
            notes: ingredient.notes ?? "",
          })),
          steps: recipe.steps.map((step) => ({
            instruction: step.instruction,
            stepNumber: step.stepNumber,
          })),
        }}
      />
    </Main>
  );
}

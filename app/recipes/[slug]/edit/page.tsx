import {
  deleteRecipeFromForm,
  getIngredients,
  getRecipeBySlug,
  updateRecipeFromForm,
} from "@/actions/recipes";
import { ModalShell } from "@/components/modal-shell";
import { RecipeDetail } from "@/components/recipe-detail";
import { RecipeForm } from "@/components/recipe-form";
import { requireCurrentUserId } from "@/lib/auth/session";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentUserId = await requireCurrentUserId();
  const recipe = await getRecipeBySlug(slug);

  if (!recipe || recipe.userId !== currentUserId) {
    notFound();
  }

  const ingredients = await getIngredients();
  const updateRecipeAction = updateRecipeFromForm.bind(null, recipe.id);
  const deleteAction = deleteRecipeFromForm.bind(null, recipe.id);

  return (
    <main className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-40 blur-[1px]"
      >
        <RecipeDetail recipe={recipe} />
      </div>

      <ModalShell
        title="Edit recipe"
        description="Update details, ingredients, and steps."
        fallbackHref={`/recipes/${recipe.slug}`}
      >
        <RecipeForm
          action={updateRecipeAction}
          submitLabel="Save recipe"
          cancelHref={`/recipes/${recipe.slug}`}
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
          deleteAction={deleteAction}
        />
      </ModalShell>
    </main>
  );
}

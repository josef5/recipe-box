import { RecipeDetail } from "@/components/recipe-detail";
import { RecipeOwnerActions } from "@/components/recipe-owner-actions";
import { getPublicRecipeBySlug, getRecipeSlugs } from "@/lib/recipes";
import { notFound } from "next/navigation";

export const dynamic = "force-static";
export const revalidate = 300;

export async function generateStaticParams() {
  const recipes = await getRecipeSlugs();

  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getPublicRecipeBySlug(slug);

  if (!recipe) notFound();

  return (
    <main>
      <RecipeDetail
        recipe={recipe}
        actions={
          <RecipeOwnerActions
            recipeUserId={recipe.userId}
            editHref={`/recipes/${slug}/edit`}
          />
        }
      />
    </main>
  );
}

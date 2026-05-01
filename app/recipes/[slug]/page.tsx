import Main from "@/components/main";
import { RecipeDetail } from "@/components/recipe-detail";
import { getPublicRecipeBySlug, getRecipeSlugs } from "@/lib/recipes";
import { Suspense } from "react";

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
  const recipePromise = getPublicRecipeBySlug(slug);

  return (
    <Main>
      <Suspense fallback={<p>Loading recipe...</p>}>
        <RecipeDetail recipePromise={recipePromise} />
      </Suspense>
    </Main>
  );
}

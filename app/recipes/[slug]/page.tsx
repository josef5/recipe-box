import { RecipeDetail } from "@/components/recipe-detail";
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
    <main className="grid grid-cols-[3fr_1fr] gap-8">
      <RecipeDetail recipe={recipe} />
    </main>
  );
}

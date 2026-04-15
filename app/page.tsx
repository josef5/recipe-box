import { HomePageContent } from "@/components/home-page-content";
import { getPublicRecipes } from "@/lib/recipes";

// TODO: Add GitHub OAuth
// TODO: Add My Recipes filter toggle?
// TODO: Main component?

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const recipes = await getPublicRecipes(query);

  return (
    <main className="grid grid-cols-1 gap-8 sm:grid-cols-[3fr_1fr]">
      <HomePageContent recipes={recipes} query={query} />
    </main>
  );
}

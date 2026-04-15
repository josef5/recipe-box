import { HomePageContent } from "@/components/home-page-content";
import { getPublicRecipes } from "@/lib/recipes";

// TODO: Add GitHub OAuth
// TODO: Add My Recipes filter toggle?
// TODO: Main component?
// TODO: Apply TW Prettier plugin

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const recipes = await getPublicRecipes(query);

  return (
    <main className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] gap-8">
      <HomePageContent recipes={recipes} query={query} />
    </main>
  );
}

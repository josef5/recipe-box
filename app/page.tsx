import { HomePageContent } from "@/components/home-page-content";
import { getPublicRecipes } from "@/lib/recipes";

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

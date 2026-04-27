import { HomePageContent } from "@/components/home-page-content";
import Main from "@/components/main";
import { getPublicRecipes } from "@/lib/recipes";

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
    <Main>
      <HomePageContent recipes={recipes} query={query} />
    </Main>
  );
}

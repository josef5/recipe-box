import { HomePageContent } from "@/components/home-page-content";
import Main from "@/components/main";
import { getPublicRecipes } from "@/lib/recipes";

// TODO: Use Suspense etc
// TODO: Use error boundaries

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

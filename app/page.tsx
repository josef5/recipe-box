import { HomePageContent } from "@/components/home-page-content";
import Main from "@/components/main";
import { getPublicRecipes } from "@/lib/recipes";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const recipesPromise = getPublicRecipes(query);

  return (
    <Main>
      <Suspense fallback={<p>Loading recipes...</p>}>
        <HomePageContent recipesPromise={recipesPromise} query={query} />
      </Suspense>
    </Main>
  );
}

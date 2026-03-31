import { getRecipes } from "@/actions/recipes";

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main>
      <h1>Recipe Box</h1>
      <pre>{JSON.stringify(recipes, null, 2)}</pre>
    </main>
  );
}

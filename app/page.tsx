import { getRecipes } from "@/actions/recipes";
import Link from "next/link";

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main>
      <h1>Recipe Box</h1>
      {recipes.length === 0 ? (
        <p>No recipes yet.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link href={`/recipes/${recipe.id}`}>
                <h2>{recipe.title}</h2>
                {recipe.description && <p>{recipe.description}</p>}
                <div>
                  {recipe.prepTimeMins && (
                    <span>Prep: {recipe.prepTimeMins}m</span>
                  )}
                  {recipe.cookTimeMins && (
                    <span>Cook: {recipe.cookTimeMins}m</span>
                  )}
                  {recipe.servings && <span>Serves: {recipe.servings}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

import Link from "next/link";
import { NewRecipeButton } from "./ui/new-recipe-button";

type HomeRecipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  ownerDisplayName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function HomePageContent({
  recipes,
  query,
}: {
  recipes: HomeRecipe[];
  query: string;
}) {
  return (
    <>
      <aside className="col-start-2 row-start-1">
        <form action="/" method="get" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search recipes"
            className="w-full rounded-md border px-3 py-2"
          />
          <button type="submit" className="rounded-md border px-4 py-2">
            Search
          </button>
          {query ? (
            <Link href="/" className="rounded-md border px-4 py-2">
              Clear
            </Link>
          ) : null}
        </form>
        <NewRecipeButton />
      </aside>
      <div className="flex flex-col gap-4 col-start-1 row-start-1">
        <div className="flex items-start justify-between gap-4">
          <h1>Recipes</h1>
        </div>
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-600">
            {query ? `No recipes found for "${query}".` : "No recipes yet."}
          </p>
        ) : (
          <ul>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ul>
        )}
      </div>
      {/* <pre>{JSON.stringify(recipes, null, 2)}</pre> */}
    </>
  );
}

function RecipeCard({ recipe }: { recipe: HomeRecipe }) {
  return (
    <li key={recipe.id}>
      <Link
        href={`/recipes/${recipe.slug}`}
        className="block rounded-md px-4 py-3"
      >
        <h2>{recipe.title}</h2>
        {recipe.description ? (
          <div className="">{recipe.description}</div>
        ) : null}
        <div className="">By {recipe.ownerDisplayName ?? "Unknown cook"}</div>
        <div>Created: {new Date(recipe.createdAt).toLocaleDateString()}</div>
      </Link>
    </li>
  );
}

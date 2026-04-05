import { AppMenu } from "@/components/app-menu";
import { HomeActions } from "@/components/home-actions";
import Link from "next/link";

type HomeRecipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  ownerDisplayName: string | null;
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
      <AppMenu variant="home" />
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1>Recipes</h1>
          <HomeActions />
        </div>

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
      </div>
      {recipes.length === 0 ? (
        <p className="text-sm text-gray-600">
          {query ? `No recipes found for "${query}".` : "No recipes yet."}
        </p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link
                href={`/recipes/${recipe.slug}`}
                className="block rounded-md border px-4 py-3"
              >
                <h2>{recipe.title}</h2>
                {recipe.description && <p>{recipe.description}</p>}
                <div>
                  <div>{recipe.title}</div>
                  {recipe.description ? (
                    <div className="text-sm text-gray-600">
                      {recipe.description}
                    </div>
                  ) : null}
                  <div className="text-sm text-gray-600">
                    By {recipe.ownerDisplayName ?? "Unknown cook"}
                  </div>
                </div>
                <p></p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

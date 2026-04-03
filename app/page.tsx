import { getRecipes } from "@/actions/recipes";
import { AppMenu } from "@/components/app-menu";
import Link from "next/link";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const recipes = await getRecipes(query);

  return (
    <main>
      <AppMenu variant="home" newHref="/recipes/new" />
      <div className="flex flex-col gap-4">
        <h1 className="">Recipes</h1>

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
                  <div className="">{recipe.title}</div>
                  {recipe.description ? (
                    <div className="text-sm text-gray-600">
                      {recipe.description}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

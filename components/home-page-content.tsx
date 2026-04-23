import Image from "next/image";
import Link from "next/link";
import { formatStableDate } from "@/lib/utils";
import { NewRecipeButton } from "./ui/new-recipe-button";

type HomeRecipe = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  ownerDisplayName: string | null;
  createdAt: Date | string | number;
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
      <aside className="sm:col-start-2 sm:row-start-1">
        <form action="/" method="get" noValidate className="flex gap-2">
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
      <div className="flex flex-col gap-4 sm:col-start-1 sm:row-start-1">
        <div className="flex items-start justify-between gap-4">
          <h1>Recipes</h1>
        </div>
        {recipes.length === 0 ? (
          <p className="text-sm text-gray-600">
            {query ? `No recipes found for "${query}".` : "No recipes yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function RecipeCard({ recipe }: { recipe: HomeRecipe }) {
  return (
    <li key={recipe.id} className="rounded-md border border-white">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="block rounded-md px-4 py-3"
      >
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={`${recipe.title} photo`}
            width={1200}
            height={800}
            sizes="(max-width: 640px) 100vw, 720px"
            unoptimized
            loading="eager"
            className="mb-3 max-h-56 w-full rounded-md border object-cover"
          />
        ) : null}
        <h2>{recipe.title}</h2>
        {recipe.description ? (
          <div className="">{recipe.description}</div>
        ) : null}
        <div className="">By {recipe.ownerDisplayName ?? "Unknown cook"}</div>
        <div>Created: {formatStableDate(recipe.createdAt)}</div>
      </Link>
    </li>
  );
}

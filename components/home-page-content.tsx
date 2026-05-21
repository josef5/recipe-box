import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";
import { formatStableDate } from "@/lib/utils";
import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { NewRecipeButton } from "./ui/new-recipe-button";

export function HomePageContent({
  recipesPromise,
  query,
}: {
  recipesPromise: Promise<Recipe[]>;
  query: string;
}) {
  const recipes = use(recipesPromise);

  return (
    <>
      <div className="flex flex-col gap-4 sm:col-start-1 sm:row-start-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-bold">Recipes</h1>
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
      <aside className="sm:col-start-2 sm:row-start-1">
        <form action="/" method="get" noValidate className="flex gap-2">
          <label htmlFor="recipe-search" className="sr-only">
            Search recipes
          </label>
          <input
            id="recipe-search"
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
    </>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <li key={recipe.id} className="bg-surface rounded-md">
      <Link
        href={`/recipes/${recipe.slug}`}
        className="block rounded-md px-4 py-3"
      >
        <Image
          src={recipe.imageUrl ?? FALLBACK_RECIPE_IMAGE_SRC}
          alt={`${recipe.title} photo`}
          width={1200}
          height={800}
          sizes="(max-width: 640px) 100vw, 720px"
          loading="eager"
          className="mb-3 max-h-56 w-full rounded-md border object-cover"
        />
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

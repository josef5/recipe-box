import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";
import { formatStableDate } from "@/lib/utils";
import { Recipe } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import Header from "./header";
import Sidebar from "./sidebar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { NewRecipeButton } from "./ui/new-recipe-button";

// TODO: Improve search - live update, filter on query

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
      <Header
        title="Recipes"
        description="Browse your collection of recipes."
      />
      <div className="flex flex-col gap-4 sm:col-start-1 sm:row-start-2">
        {recipes.length === 0 ? (
          <p className="text-sm">
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
      <Sidebar>
        <form
          action="/"
          method="get"
          noValidate
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2 text-sm sm:flex-col">
            <Label htmlFor="recipe-search" className="sr-only">
              Search recipes
            </Label>
            <Input
              id="recipe-search"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search recipes"
              className="flex-1"
            />
            <div className="flex gap-2">
              <Button
                label="Search"
                type="submit"
                variant="primary"
                className="flex-1"
              />
              {query && (
                <Button
                  label="Clear"
                  href="/"
                  variant="secondary"
                  className="flex-1"
                />
              )}
            </div>
          </div>
        </form>
        <NewRecipeButton />
      </Sidebar>
    </>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <li key={recipe.id} className="bg-surface rounded-3xl drop-shadow-lg">
      <Link href={`/recipes/${recipe.slug}`} className="block p-4">
        <Image
          src={recipe.imageUrl ?? FALLBACK_RECIPE_IMAGE_SRC}
          alt={`${recipe.title} photo`}
          width={1200}
          height={800}
          sizes="(max-width: 640px) 100vw, 720px"
          loading="eager"
          className="mb-3 h-61 w-full rounded-lg border object-cover"
        />
        <div className="px-1">
          <h2 className="mb-2 font-bold">{recipe.title}</h2>
          {recipe.description ? (
            <div className="mb-4 text-xs">{recipe.description}</div>
          ) : null}
          <div className="text-foreground-muted mb-3 flex gap-4 text-xs">
            <p className="">By {recipe.ownerDisplayName ?? "Unknown cook"}</p>
            <p className="">Created: {formatStableDate(recipe.createdAt)}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

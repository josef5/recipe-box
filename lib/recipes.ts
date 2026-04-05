import { db } from "@/db";
import { recipes } from "@/db/schema";
import { desc, eq, ilike, or } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const RECIPE_PAGE_REVALIDATE_SECONDS = 300;

/* These functions use caching to avoid hitting the database too much, especially on the home page which lists all recipes. The cache is tagged with "recipes" so that when we create/update/delete a recipe, we can invalidate the cache and ensure fresh data is shown. */

/**
 * Gets all public recipes, optionally filtered by a search query. The search looks for matches in the title and description.
 * @param query Optional search query to filter recipes by title or description.
 * @returns A list of public recipes matching the search criteria, ordered by creation date.
 */
export const getPublicRecipes = unstable_cache(
  async (query?: string) => {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      return db.query.recipes.findMany({
        orderBy: desc(recipes.createdAt),
      });
    }

    return db.query.recipes.findMany({
      where: or(
        ilike(recipes.title, `%${trimmedQuery}%`),
        ilike(recipes.description, `%${trimmedQuery}%`),
      ),
      orderBy: desc(recipes.createdAt),
    });
  },
  ["public-recipes"],
  {
    tags: ["recipes"],
    revalidate: RECIPE_PAGE_REVALIDATE_SECONDS,
  },
);

/**
 * Gets a single public recipe by its slug, including its ingredients and steps. This is used on the recipe detail page.
 * @param slug The slug of the recipe to retrieve.
 * @returns The recipe matching the slug, or null if not found. Includes related ingredients and steps.
 */
export const getPublicRecipeBySlug = unstable_cache(
  async (slug: string) => {
    return db.query.recipes.findFirst({
      where: eq(recipes.slug, slug),
      with: {
        recipeIngredients: {
          with: { ingredient: true },
          orderBy: (ri, { asc }) => [asc(ri.sortOrder)],
        },
        steps: {
          orderBy: (step, { asc }) => [asc(step.stepNumber)],
        },
      },
    });
  },
  ["public-recipe-by-slug"],
  {
    tags: ["recipes"],
    revalidate: RECIPE_PAGE_REVALIDATE_SECONDS,
  },
);

/**
 * Gets all recipe slugs, ordered by creation date. This is used for static generation of recipe pages.
 * @returns A list of recipe slugs.
 */
export const getRecipeSlugs = unstable_cache(
  async () => {
    return db.query.recipes.findMany({
      columns: {
        slug: true,
      },
      orderBy: desc(recipes.createdAt),
    });
  },
  ["recipe-slugs"],
  {
    tags: ["recipes"],
    revalidate: RECIPE_PAGE_REVALIDATE_SECONDS,
  },
);

"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "./button";

/**
 * Passes the current servings query parameter to the print page for the given recipe slug.
 *
 * @param param0 - The component props.
 * @param param0.recipeSlug - The slug of the recipe to print.
 * @returns A React element that renders a button linking to the print page for the recipe.
 */
export function PrintButton({ recipeSlug }: { recipeSlug: string }) {
  const searchParams = useSearchParams();
  const params = new URLSearchParams();
  const servings = searchParams.get("servings");

  if (servings) {
    params.set("servings", servings);
  }

  const queryString = params.toString();
  const printUrl = queryString
    ? "/recipes/" + recipeSlug + "/print?" + queryString
    : "/recipes/" + recipeSlug + "/print";

  return (
    <Button
      variant="secondary"
      className="mb-3 w-full"
      href={printUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      Print recipe
    </Button>
  );
}

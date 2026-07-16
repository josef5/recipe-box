import { HomePageContent } from "@/components/home-page-content";
import { createFulfilledThenable } from "@/test/fulfilled-thenable";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";

type HomePageRecipes =
  Parameters<typeof HomePageContent>[0]["recipesPromise"] extends Promise<
    infer T
  >
    ? T
    : never;

function renderHomePageContent(recipes: HomePageRecipes, query: string) {
  return render(
    <HomePageContent
      recipesPromise={createFulfilledThenable(recipes)}
      query={query}
    />,
  );
}

describe("HomePageContent", () => {
  it("shows the empty-state message for a filtered search", () => {
    renderHomePageContent([], "pasta");

    expect(screen.getByRole("heading", { name: "Recipes" })).toBeVisible();
    expect(
      screen.getByRole("searchbox", { name: "Search recipes" }),
    ).toHaveValue("pasta");
    expect(screen.getByRole("link", { name: "Clear" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText('No recipes found for "pasta".')).toBeVisible();
  });

  it("has no accessibility violations", async () => {
    const renderResult = renderHomePageContent([], "pasta");
    const { container } = renderResult;

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders recipe links and the default empty query state", () => {
    renderHomePageContent(
      [
        {
          id: "recipe-1",
          slug: "tomato-soup",
          title: "Tomato Soup",
          description: "Rich and cozy.",
          imageUrl: "https://example.com/tomato-soup.jpg",
          ownerDisplayName: "Jamie Oliver",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-02T00:00:00.000Z"),
          userId: "user-1",
          recipeIngredients: [],
          steps: [],
        },
        {
          id: "recipe-2",
          slug: "toast",
          title: "Toast",
          description: null,
          imageUrl: null,
          ownerDisplayName: null,
          createdAt: new Date("2026-01-03T00:00:00.000Z"),
          updatedAt: new Date("2026-01-04T00:00:00.000Z"),
          userId: "user-2",
          recipeIngredients: [],
          steps: [],
        },
      ],
      "",
    );

    expect(
      screen.queryByRole("link", { name: "Clear" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Tomato Soup/i })).toHaveAttribute(
      "href",
      "/recipes/tomato-soup",
    );
    expect(screen.getByRole("link", { name: /Toast/i })).toHaveAttribute(
      "href",
      "/recipes/toast",
    );
    expect(screen.getByText("Rich and cozy.")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Tomato Soup photo" }),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: "Toast photo" })).toHaveAttribute(
      "src",
      FALLBACK_RECIPE_IMAGE_SRC,
    );
    expect(screen.getByText("By Jamie Oliver")).toBeVisible();
    expect(screen.getByText("By Unknown cook")).toBeVisible();
  });

  it("falls back to the placeholder when a remote image fails to load", () => {
    renderHomePageContent(
      [
        {
          id: "recipe-1",
          slug: "tomato-soup",
          title: "Tomato Soup",
          description: "Rich and cozy.",
          imageUrl: "https://example.com/tomato-soup.jpg",
          ownerDisplayName: "Jamie Oliver",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          updatedAt: new Date("2026-01-02T00:00:00.000Z"),
          userId: "user-1",
          recipeIngredients: [],
          steps: [],
        },
      ],
      "",
    );

    const image = screen.getByRole("img", { name: "Tomato Soup photo" });
    fireEvent.error(image);

    expect(image).toHaveAttribute("src", FALLBACK_RECIPE_IMAGE_SRC);
  });
});

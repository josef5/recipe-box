import { HomePageContent } from "@/components/home-page-content";
import { act, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Suspense } from "react";
import { describe, expect, it } from "vitest";

async function renderHomePageContent(
  recipesPromise: Promise<Parameters<typeof HomePageContent>[0]["recipesPromise"] extends Promise<infer T> ? T : never>,
  query: string,
) {
  let renderResult: ReturnType<typeof render> | null = null;

  await act(async () => {
    renderResult = render(
      <Suspense fallback={<div>Loading recipes...</div>}>
        <HomePageContent recipesPromise={recipesPromise} query={query} />
      </Suspense>,
    );
  });

  return renderResult;
}

describe("HomePageContent", () => {
  it("shows the empty-state message for a filtered search", async () => {
    await renderHomePageContent(Promise.resolve([]), "pasta");
    
    expect(await screen.findByRole("heading", { name: "Recipes" })).toBeVisible();
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
    const renderResult = await renderHomePageContent(Promise.resolve([]), "pasta");
    if (!renderResult) throw new Error("Render result is null");
    const { container } = renderResult;
    await screen.findByRole("heading", { name: "Recipes" });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders recipe links and the default empty query state", async () => {
    await renderHomePageContent(
      Promise.resolve([
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
      ]),
      "",
    );

    await screen.findByRole("link", { name: /Tomato Soup/i });

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
      "/placeholder-1024x768.jpg",
    );
    expect(screen.getByText("By Jamie Oliver")).toBeVisible();
    expect(screen.getByText("By Unknown cook")).toBeVisible();
  });
});

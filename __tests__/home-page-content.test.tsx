import { HomePageContent } from "@/components/home-page-content";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("HomePageContent", () => {
  it("shows the empty-state message for a filtered search", () => {
    render(<HomePageContent recipes={[]} query="pasta" />);
    expect(screen.getByRole("heading", { name: "Recipes" })).toBeVisible();
    expect(screen.getByRole("searchbox", { name: "" })).toHaveValue("pasta");
    expect(screen.getByRole("link", { name: "Clear" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText('No recipes found for "pasta".')).toBeVisible();
  });

  it("renders recipe links and the default empty query state", () => {
    render(
      <HomePageContent
        query=""
        recipes={[
          {
            id: "recipe-1",
            slug: "tomato-soup",
            title: "Tomato Soup",
            description: "Rich and cozy.",
            imageUrl: "https://example.com/tomato-soup.jpg",
            ownerDisplayName: "Jamie Oliver",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-02T00:00:00.000Z"),
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
          },
        ]}
      />,
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
    expect(screen.getByText("By Jamie Oliver")).toBeVisible();
    expect(screen.getByText("By Unknown cook")).toBeVisible();
  });
});

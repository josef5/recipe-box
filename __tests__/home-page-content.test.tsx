import { HomePageContent } from "@/components/home-page-content";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/app-menu", () => ({
  AppMenu: ({ variant }: { variant: string }) => (
    <div data-testid="app-menu">{variant}</div>
  ),
}));

vi.mock("@/components/home-actions", () => ({
  HomeActions: () => <div data-testid="home-actions">home actions</div>,
}));

describe("HomePageContent", () => {
  it("shows the empty-state message for a filtered search", () => {
    render(<HomePageContent recipes={[]} query="pasta" />);

    expect(screen.getByTestId("app-menu")).toHaveTextContent("home");
    expect(screen.getByTestId("home-actions")).toBeInTheDocument();
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
          },
          {
            id: "recipe-2",
            slug: "toast",
            title: "Toast",
            description: null,
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
    expect(screen.getAllByText("Rich and cozy.")).toHaveLength(2);
  });
});

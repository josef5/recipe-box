import { RecipeDetail } from "@/components/recipe-detail";
import { createFulfilledThenable } from "@/test/fulfilled-thenable";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/menu", () => ({
  Menu: ({ variant }: { variant: string }) => (
    <div data-testid="menu">{variant}</div>
  ),
}));

describe("RecipeDetail", () => {
  it("renders recipe metadata, ingredients, and steps", () => {
    render(
      <RecipeDetail
        recipePromise={createFulfilledThenable({
          id: "recipe-1",
          title: "Chocolate Cake",
          slug: "chocolate-cake",
          userId: "user-1",
          description: "A rich cake for celebrations.",
          imageUrl: "https://example.com/chocolate-cake.jpg",
          ownerDisplayName: "Grandma Rose",
          prepTimeMins: 25,
          cookTimeMins: 35,
          servings: 8,
          sourceName: "Grandma's Notes",
          sourceUrl: "https://example.com/chocolate-cake",
          createdAt: new Date(),
          updatedAt: new Date(),
          recipeIngredients: [
            {
              id: "ingredient-1",
              amount: "2",
              unit: "cups",
              notes: "sifted",
              ingredient: {
                name: "Flour",
              },
            },
            {
              id: "ingredient-2",
              amount: "1",
              unit: "cup",
              notes: null,
              ingredient: {
                name: "Sugar",
              },
            },
          ],
          steps: [
            {
              id: "step-1",
              instruction: "Mix the dry ingredients.",
              recipeId: "recipe-1",
              stepNumber: 1,
            },
            {
              id: "step-2",
              instruction: "Bake until set.",
              recipeId: "recipe-1",
              stepNumber: 2,
            },
          ],
        })}
      />,
    );

    // expect(screen.getByTestId("menu")).toHaveTextContent("recipe");
    expect(
      screen.getByRole("heading", { name: "Chocolate Cake" }),
    ).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Chocolate Cake photo" }),
    ).toBeVisible();
    // expect(screen.getByRole("button", { name: "Favorite" })).toBeVisible();
    expect(screen.getByText("A rich cake for celebrations.")).toBeVisible();
    expect(screen.getByText("By Grandma Rose")).toBeVisible();
    expect(screen.getByText("Prep: 25m")).toBeVisible();
    expect(screen.getByText("Cook: 35m")).toBeVisible();
    expect(screen.getByText("Serves: 8")).toBeVisible();
    expect(screen.getByLabelText("Servings")).toHaveValue("8");
    expect(
      screen.getByRole("link", { name: "Grandma's Notes" }),
    ).toHaveAttribute("href", "https://example.com/chocolate-cake");
    expect(screen.getByText("Flour")).toBeVisible();
    expect(screen.getByText("Sugar")).toBeVisible();
    expect(screen.getByText("(sifted)")).toBeVisible();
    expect(screen.getByText("Mix the dry ingredients.")).toBeVisible();
    expect(screen.getByText("Bake until set.")).toBeVisible();

    fireEvent.change(screen.getByLabelText("Servings"), {
      target: { value: "4" },
    });

    expect(
      screen.getByText((_, element) => {
        if (!element) {
          return false;
        }

        return (
          element.textContent?.replace(/\s+/g, " ").trim() ===
          "1 cups Flour (sifted)"
        );
      }),
    ).toBeVisible();
    expect(
      screen.getByText((_, element) => {
        if (!element) {
          return false;
        }

        return (
          element.textContent?.replace(/\s+/g, " ").trim() === "0.5 cup Sugar"
        );
      }),
    ).toBeVisible();
  });

  it("omits optional metadata when it is not provided", () => {
    render(
      <RecipeDetail
        recipePromise={createFulfilledThenable({
          id: "recipe-2",
          title: "Plain Rice",
          slug: "plain-rice",
          userId: null,
          description: null,
          imageUrl: null,
          ownerDisplayName: null,
          prepTimeMins: null,
          cookTimeMins: null,
          servings: null,
          sourceName: null,
          sourceUrl: null,
          recipeIngredients: [],
          steps: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        })}
      />,
    );

    expect(screen.queryByText(/^Prep:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Cook:/)).not.toBeInTheDocument();
    expect(screen.getByText("Serves: 4")).toBeVisible();
    expect(screen.getByLabelText("Servings")).toHaveValue("4");
    expect(screen.queryByText(/^Source:/)).not.toBeInTheDocument();
    expect(screen.getByText("By Unknown cook")).toBeVisible();
    expect(
      screen.getByRole("img", { name: "Plain Rice photo" }),
    ).toHaveAttribute("src", "/placeholder-1024x768.jpg");
  });
});

import { RecipeForm } from "@/components/recipe-form";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

describe("RecipeForm", () => {
  it("resets uncontrolled and controlled fields when remounted with a new key", () => {
    const action = vi.fn();

    const { rerender } = render(
      <RecipeForm
        key="recipe-1"
        action={action}
        ingredientSuggestions={[]}
        initialValues={{
          title: "Chocolate Cake",
          description: "Rich and fudgy",
          servings: 8,
          prepTimeMins: 20,
          cookTimeMins: 35,
          imageUrl: "https://example.com/cake.jpg",
          sourceUrl: "https://example.com/cake",
          sourceName: "Family Recipe",
          ingredients: [
            {
              name: "Flour",
              amount: "2",
              unit: "cups",
              notes: "sifted",
            },
          ],
          steps: [{ instruction: "Mix everything together." }],
        }}
      />,
    );

    const titleInput = screen.getByLabelText("Title");
    const stepInput = screen.getByDisplayValue("Mix everything together.");

    fireEvent.change(titleInput, { target: { value: "Edited Cake" } });
    fireEvent.change(stepInput, { target: { value: "Edited first step." } });

    expect(screen.getByLabelText("Title")).toHaveValue("Edited Cake");
    expect(screen.getByDisplayValue("Edited first step.")).toBeVisible();

    rerender(
      <RecipeForm
        key="recipe-2"
        action={action}
        ingredientSuggestions={[]}
        initialValues={{
          title: "Lemon Bars",
          description: "Bright and tart",
          servings: 12,
          prepTimeMins: 15,
          cookTimeMins: 30,
          imageUrl: "https://example.com/lemon-bars.jpg",
          sourceUrl: "https://example.com/lemon-bars",
          sourceName: "Bakery Notes",
          ingredients: [
            {
              name: "Lemon",
              amount: "3",
              unit: "whole",
              notes: "juiced",
            },
          ],
          steps: [{ instruction: "Whisk the filling." }],
        }}
      />,
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Lemon Bars");
    expect(screen.getByDisplayValue("Whisk the filling.")).toBeVisible();
    expect(screen.queryByDisplayValue("Edited first step.")).toBeNull();
  });
});

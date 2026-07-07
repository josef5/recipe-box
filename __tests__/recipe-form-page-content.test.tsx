import { RecipeFormPageContent } from "@/components/recipe-form-page-content";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

const recipeFormMock = vi.fn();

vi.mock("@/components/header", () => ({
  default: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  ),
}));

vi.mock("@/components/sidebar", () => ({
  default: ({ children }: { children: ReactNode }) => <aside>{children}</aside>,
}));

vi.mock("@/components/ui/back-button", () => ({
  BackButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/delete-recipe-button", () => ({
  DeleteRecipeButton: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

vi.mock("@/components/recipe-form", () => ({
  RecipeForm: ({
    onSubmittableChange,
    ingredientSuggestions,
  }: {
    onSubmittableChange?: (isSubmittable: boolean) => void;
    ingredientSuggestions?: {
      id: string;
      name: string;
      defaultUnit?: string | null;
    }[];
  }) => {
    recipeFormMock({ ingredientSuggestions });

    return (
      <div>
        <button onClick={() => onSubmittableChange?.(true)} type="button">
          Mock form valid
        </button>
        <button onClick={() => onSubmittableChange?.(false)} type="button">
          Mock form invalid
        </button>
      </div>
    );
  },
}));

describe("RecipeFormPageContent", () => {
  it("forwards ingredient suggestions into the form", () => {
    render(
      <RecipeFormPageContent
        title="Add recipe"
        description="Create a new recipe"
        ingredientSuggestions={[
          { id: "1", name: "Flour", defaultUnit: "g" },
          { id: "2", name: "Salt", defaultUnit: "tsp" },
        ]}
      />,
    );

    expect(recipeFormMock).toHaveBeenCalledWith({
      ingredientSuggestions: [
        { id: "1", name: "Flour", defaultUnit: "g" },
        { id: "2", name: "Salt", defaultUnit: "tsp" },
      ],
    });
  });

  it("disables save until form reports submittable and disables again when it becomes invalid", () => {
    render(
      <RecipeFormPageContent
        title="Edit recipe"
        description="Update details"
        initialValues={{
          title: "Chocolate Cake",
          description: "Rich and fudgy",
          servings: 8,
          prepTimeMins: 20,
          cookTimeMins: 35,
          imageUrl: "https://example.com/cake.jpg",
          ingredients: [
            {
              name: "Flour",
              amount: "2",
              unit: "cups",
              notes: "sifted",
            },
          ],
          steps: [{ instruction: "Mix everything together.", stepNumber: 1 }],
        }}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "Save recipe" });

    expect(saveButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Mock form valid" }));
    expect(saveButton).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Mock form invalid" }));
    expect(saveButton).toBeDisabled();
  });
});

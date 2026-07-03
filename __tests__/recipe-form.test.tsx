import { RecipeForm } from "@/components/recipe-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { user: null } }),
  },
}));

describe("RecipeForm", () => {
  it("keeps canSubmit false until create mode form is valid", async () => {
    const onSubmittableChange = vi.fn();

    render(<RecipeForm onSubmittableChange={onSubmittableChange} />);

    await waitFor(() => {
      expect(onSubmittableChange).toHaveBeenCalledWith(false);
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Tomato Soup" },
    });
    fireEvent.change(screen.getByLabelText("Ingredient"), {
      target: { value: "Tomato" },
    });
    fireEvent.change(screen.getByLabelText("Step 1"), {
      target: { value: "Simmer for 20 minutes." },
    });

    await waitFor(() => {
      expect(onSubmittableChange).toHaveBeenLastCalledWith(true);
    });
  });

  it("toggles canSubmit in edit mode when title is changed and undone", async () => {
    const onSubmittableChange = vi.fn();

    render(
      <RecipeForm
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
        onSubmittableChange={onSubmittableChange}
      />,
    );

    await waitFor(() => {
      expect(onSubmittableChange).toHaveBeenLastCalledWith(false);
    });

    const titleInput = screen.getByLabelText("Title");

    fireEvent.change(titleInput, { target: { value: "Chocolate Cake!" } });

    await waitFor(() => {
      expect(onSubmittableChange).toHaveBeenLastCalledWith(true);
    });

    fireEvent.change(titleInput, { target: { value: "Chocolate Cake" } });

    await waitFor(() => {
      expect(onSubmittableChange).toHaveBeenLastCalledWith(false);
    });
  });

  it("defaults servings to 4 for new recipes", () => {
    render(
      <RecipeForm
        initialValues={{
          title: "Chocolate Cake",
          description: "Rich and fudgy",
          servings: 4,
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
        onSubmittableChange={() => vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Servings")).toHaveValue(4);
  });

  it("resets uncontrolled and controlled fields when remounted with a new key", () => {
    const { rerender } = render(
      <RecipeForm
        key="recipe-1"
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

    const titleInput = screen.getByLabelText("Title");
    const stepInput = screen.getByDisplayValue("Mix everything together.");

    fireEvent.change(titleInput, { target: { value: "Edited Cake" } });
    fireEvent.change(stepInput, { target: { value: "Edited first step." } });

    expect(screen.getByLabelText("Title")).toHaveValue("Edited Cake");
    expect(screen.getByDisplayValue("Edited first step.")).toBeVisible();

    rerender(
      <RecipeForm
        key="recipe-2"
        initialValues={{
          title: "Lemon Bars",
          description: "Bright and tart",
          servings: 12,
          prepTimeMins: 15,
          cookTimeMins: 30,
          imageUrl: "https://example.com/lemon-bars.jpg",
          ingredients: [
            {
              name: "Lemon",
              amount: "3",
              unit: "whole",
              notes: "juiced",
            },
          ],
          steps: [{ instruction: "Whisk the filling.", stepNumber: 1 }],
        }}
      />,
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Lemon Bars");
    expect(screen.getByDisplayValue("Whisk the filling.")).toBeVisible();
    expect(screen.queryByDisplayValue("Edited first step.")).toBeNull();
  });
});

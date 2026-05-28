import { EditRecipeButton } from "@/components/ui/edit-recipe-button";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useSession } = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession,
  },
}));

describe("EditRecipeButton", () => {
  it("renders for recipe owner", () => {
    useSession.mockReturnValue({
      data: { user: { id: "owner-id", role: "user" } },
      isPending: false,
    });

    render(
      <EditRecipeButton
        recipeUserId="owner-id"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(screen.getByRole("link", { name: "Edit recipe" })).toHaveAttribute(
      "href",
      "/recipes/chocolate-cake/edit",
    );
  });

  it("renders for admin even when not owner", () => {
    useSession.mockReturnValue({
      data: { user: { id: "admin-id", role: "admin" } },
      isPending: false,
    });

    render(
      <EditRecipeButton
        recipeUserId="owner-id"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(screen.getByRole("link", { name: "Edit recipe" })).toBeVisible();
  });

  it("hides for non-owner non-admin", () => {
    useSession.mockReturnValue({
      data: { user: { id: "other-id", role: "user" } },
      isPending: false,
    });

    render(
      <EditRecipeButton
        recipeUserId="owner-id"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(screen.queryByRole("link", { name: "Edit Recipe" })).toBeNull();
  });
});

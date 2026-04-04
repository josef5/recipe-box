import { RecipeOwnerActions } from "@/components/recipe-owner-actions";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: authMocks.useSession,
  },
}));

describe("RecipeOwnerActions", () => {
  it("renders nothing for signed-out users", () => {
    authMocks.useSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    const { container } = render(
      <RecipeOwnerActions
        recipeUserId="user-1"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for non-owners", () => {
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          id: "user-2",
        },
      },
      isPending: false,
    });

    const { container } = render(
      <RecipeOwnerActions
        recipeUserId="user-1"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the edit link for the recipe owner", () => {
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      isPending: false,
    });

    render(
      <RecipeOwnerActions
        recipeUserId="user-1"
        editHref="/recipes/chocolate-cake/edit"
      />,
    );

    expect(screen.getByRole("link", { name: "Edit Recipe" })).toHaveAttribute(
      "href",
      "/recipes/chocolate-cake/edit",
    );
  });
});

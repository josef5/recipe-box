import { HomeActions } from "@/components/home-actions";
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

describe("HomeActions", () => {
  it("renders nothing while auth is pending", () => {
    authMocks.useSession.mockReturnValue({
      data: null,
      isPending: true,
    });

    const { container } = render(<HomeActions />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders the new recipe link for signed-in users", () => {
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      isPending: false,
    });

    render(<HomeActions />);

    expect(screen.getByRole("link", { name: "New Recipe" })).toHaveAttribute(
      "href",
      "/recipes/new",
    );
  });
});

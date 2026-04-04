import { AppMenu } from "@/components/app-menu";
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

vi.mock("@/components/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign Out</button>,
}));

describe("AppMenu", () => {
  it("shows sign-in navigation on the home variant when signed out", () => {
    authMocks.useSession.mockReturnValue({
      data: null,
      isPending: false,
    });

    render(<AppMenu variant="home" />);

    expect(screen.getByRole("link", { name: "Recipe Box" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute(
      "href",
      "/auth/sign-in",
    );
    expect(
      screen.queryByRole("link", { name: "Account" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign Out" }),
    ).not.toBeInTheDocument();
  });

  it("shows account and sign-out actions for signed-in users", () => {
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
        },
      },
      isPending: false,
    });

    render(<AppMenu variant="recipe" />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Account" })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeVisible();
  });
});

import { Menu } from "@/components/ui/menu";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  useSession: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
  usePathname: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: authMocks.useSession,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: navigationMocks.usePathname,
}));

vi.mock("@/components/sign-out-button", () => ({
  SignOutButton: () => <button type="button">Sign Out</button>,
}));

const mockUserName = "Test User";

describe("Menu", () => {
  it("shows sign-in navigation on the home variant when signed out", () => {
    authMocks.useSession.mockReturnValue({
      data: null,
      isPending: false,
    });
    navigationMocks.usePathname.mockReturnValue("/");

    render(<Menu />);

    expect(screen.getByRole("link", { name: "Recipe Box" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth/sign-in",
    );
    expect(
      screen.queryByRole("link", { name: mockUserName }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Sign out" }),
    ).not.toBeInTheDocument();
  });

  it("shows account and sign-out actions for signed-in users", () => {
    authMocks.useSession.mockReturnValue({
      data: {
        user: {
          id: "user-1",
          name: mockUserName,
        },
      },
      isPending: false,
    });
    navigationMocks.usePathname.mockReturnValue("/recipes/some-recipe");

    render(<Menu />);

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: mockUserName })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.getByRole("button", { name: "Sign out" })).toBeVisible();
  });
});

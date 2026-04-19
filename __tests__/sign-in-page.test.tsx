import SignInPage from "@/app/auth/sign-in/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  redirectTo: "/",
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: mocks.signInEmail,
    },
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(
      mocks.redirectTo === "/"
        ? ""
        : `redirectTo=${encodeURIComponent(mocks.redirectTo)}`,
    ),
}));

describe("sign-in page", () => {
  beforeEach(() => {
    mocks.signInEmail.mockReset();
    mocks.signInEmail.mockResolvedValue({ error: null });
    mocks.redirectTo = "/";
  });

  it("submits email sign-in credentials with default callback", async () => {
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  cook@example.com  " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: "cook@example.com",
        password: "secret-pass",
        callbackURL: "/",
      });
    });
  });

  it("uses redirectTo as callbackURL when provided", async () => {
    mocks.redirectTo = "/account";

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: "cook@example.com",
        password: "secret-pass",
        callbackURL: "/account",
      });
    });
  });

  it("ignores unsafe redirectTo values", async () => {
    mocks.redirectTo = "https://example.com/phish";

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith({
        email: "cook@example.com",
        password: "secret-pass",
        callbackURL: "/",
      });
    });
  });

  it("shows a friendly message when sign-in throws", async () => {
    mocks.signInEmail.mockRejectedValueOnce(
      new Error("Invalid email or password"),
    );

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-pass" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  it("shows a validation error for an invalid email", async () => {
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("shows a validation error when password is missing", async () => {
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    expect(
      await screen.findByText("Password is required."),
    ).toBeInTheDocument();
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });
});

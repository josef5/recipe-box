import SignInPage from "@/app/auth/sign-in/page";
import SignUpPage from "@/app/auth/sign-up/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  signInSocial: vi.fn(),
  signUpEmail: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: authMocks.signInEmail,
      social: authMocks.signInSocial,
    },
    signUp: {
      email: authMocks.signUpEmail,
    },
  },
}));

describe("auth pages", () => {
  beforeEach(() => {
    authMocks.signInEmail.mockReset();
    authMocks.signInSocial.mockReset();
    authMocks.signUpEmail.mockReset();
    authMocks.signInEmail.mockResolvedValue({ error: null });
    authMocks.signInSocial.mockResolvedValue({ error: null });
    authMocks.signUpEmail.mockResolvedValue({ error: null });
  });

  it("submits email sign-in credentials and links to sign-up", async () => {
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
      expect(authMocks.signInEmail).toHaveBeenCalledWith({
        email: "cook@example.com",
        password: "secret-pass",
        callbackURL: "/",
      });
    });

    expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
      "href",
      "/auth/sign-up",
    );
  });

  it("starts Google sign-in from the sign-in page", () => {
    render(<SignInPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(authMocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });

  it("shows a friendly message when sign-in throws", async () => {
    authMocks.signInEmail.mockRejectedValueOnce(
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

  it("submits sign-up credentials and links back to sign-in", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "  Jane Doe  " },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "  baker@example.com " },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Create account" }).closest("form")!,
    );

    await waitFor(() => {
      expect(authMocks.signUpEmail).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "baker@example.com",
        password: "secret-pass",
        callbackURL: "/",
      });
    });

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/auth/sign-in",
    );
  });

  it("starts Google sign-in from the sign-up page", () => {
    render(<SignUpPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(authMocks.signInSocial).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });
});

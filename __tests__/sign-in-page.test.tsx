import SignInPage from "@/app/(auth)/sign-in/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signInEmail: vi.fn(),
  redirectTo: "/",
  toastError: vi.fn(),
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

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
  },
}));

describe("sign-in page", () => {
  beforeEach(() => {
    mocks.signInEmail.mockReset();
    mocks.signInEmail.mockResolvedValue({ error: null });
    mocks.redirectTo = "/";
    mocks.toastError.mockReset();
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
        callbackURL: "/?toast=signed-in",
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
        callbackURL: "/account?toast=signed-in",
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
        callbackURL: "/?toast=signed-in",
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

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Invalid email or password",
        expect.any(Object),
      );
    });
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

  it("shows all client-side validation errors for an empty submit", async () => {
    render(<SignInPage />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Password is required."),
    ).toBeInTheDocument();
    expect(mocks.signInEmail).not.toHaveBeenCalled();
  });

  it("disables submit until the form is valid", () => {
    render(<SignInPage />);

    const submitButton = screen.getByRole("button", { name: "Sign in" });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret-pass" },
    });

    expect(submitButton).toBeEnabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SignInPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

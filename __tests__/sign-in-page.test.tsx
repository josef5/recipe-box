import SignInPage from "@/app/(auth)/sign-in/page";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  search: "",
  signInAction: vi.fn(),
  locationAssign: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signIn: {
      email: mocks.signInAction,
    },
  },
}));

vi.mock("@/actions/auth", () => ({
  signInAction: mocks.signInAction,
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.search),
}));

vi.mock("sonner", () => ({
  toast: {
    error: mocks.toastError,
  },
}));

describe("sign-in page", () => {
  beforeEach(() => {
    mocks.signInAction.mockReset();
    mocks.signInAction.mockResolvedValue({ ok: true });
    mocks.search = "";
    mocks.locationAssign.mockReset();
    mocks.toastError.mockReset();
    vi.restoreAllMocks();
    vi.stubGlobal("location", {
      assign: mocks.locationAssign,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
      expect(mocks.signInAction).toHaveBeenCalledWith({
        email: "cook@example.com",
        password: "secret-pass",
      });
    });

    expect(mocks.locationAssign).toHaveBeenCalledWith("/?toast=signed-in");
  });

  it("redirects to safe callback with toast after successful sign-in", async () => {
    mocks.search = "redirectTo=%2Frecipes%2Fnew%3Ffrom%3Dmenu";

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
      expect(mocks.locationAssign).toHaveBeenCalledWith(
        "/recipes/new?from=menu&toast=signed-in",
      );
    });
  });

  it("shows a friendly message when sign-in throws", async () => {
    mocks.signInAction.mockRejectedValueOnce(
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
      await screen.findByText("Invalid email address"),
    ).toBeInTheDocument();

    expect(mocks.signInAction).not.toHaveBeenCalled();
  });

  it("shows a validation error when password is missing", async () => {
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "cook@example.com" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign in" }).closest("form")!,
    );

    expect(await screen.findByText("Password is required")).toBeInTheDocument();

    expect(mocks.signInAction).not.toHaveBeenCalled();
  });

  it("prevents submit when form is empty (submit disabled)", () => {
    render(<SignInPage />);

    const submitButton = screen.getByRole("button", { name: "Sign in" });

    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);

    expect(mocks.signInAction).not.toHaveBeenCalled();
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

    waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<SignInPage />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

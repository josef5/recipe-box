import { ChangePasswordForm } from "@/components/change-password-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  changePasswordAction: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/actions/auth", () => ({
  changePasswordAction: mocks.changePasswordAction,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("change password form", () => {
  beforeEach(() => {
    mocks.changePasswordAction.mockReset();
    mocks.changePasswordAction.mockResolvedValue({ ok: true });
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it("submits matching passwords to auth client", async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Update password" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.changePasswordAction).toHaveBeenCalledWith({
        currentPassword: "old-pass-123",
        newPassword: "new-pass-123",
      });
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Password updated.",
        expect.any(Object),
      );
    });
  });

  it("shows auth errors from the API", async () => {
    const errorMessage = "Current password is incorrect";
    mocks.changePasswordAction.mockResolvedValueOnce({
      ok: false,
      error: errorMessage,
    });

    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "wrong-pass" },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Update password" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object),
      );
    });
  });

  it("shows a validation error when current password is missing", async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Update password" }).closest("form")!,
    );

    expect(
      await screen.findByText("Current password is required"),
    ).toBeInTheDocument();

    expect(mocks.changePasswordAction).not.toHaveBeenCalled();
  });

  it("shows a validation error when new password is too short", async () => {
    render(<ChangePasswordForm />);

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "short" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Update password" }).closest("form")!,
    );

    expect(
      await screen.findByText("New password must be at least 8 characters."),
    ).toBeInTheDocument();

    expect(mocks.changePasswordAction).not.toHaveBeenCalled();
  });

  it("shows all client-side validation errors for an empty submit", async () => {
    render(<ChangePasswordForm />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Update password" }).closest("form")!,
    );

    expect(
      await screen.findByText("Current password is required."),
    ).toBeInTheDocument();

    expect(
      await screen.findByText("New password must be at least 8 characters."),
    ).toBeInTheDocument();

    expect(mocks.changePasswordAction).not.toHaveBeenCalled();
  });

  it("disables submit until the form is valid", () => {
    render(<ChangePasswordForm />);

    const submitButton = screen.getByRole("button", {
      name: "Update password",
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Current password"), {
      target: { value: "old-pass-123" },
    });

    expect(submitButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("New password"), {
      target: { value: "new-pass-123" },
    });

    expect(submitButton).toBeEnabled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<ChangePasswordForm />);

    expect(await axe(container)).toHaveNoViolations();
  });
});

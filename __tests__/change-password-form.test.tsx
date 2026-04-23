import { ChangePasswordForm } from "@/components/change-password-form";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    changePassword: authMocks.changePassword,
  },
}));

describe("change password form", () => {
  beforeEach(() => {
    authMocks.changePassword.mockReset();
    authMocks.changePassword.mockResolvedValue({ error: null });
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
      expect(authMocks.changePassword).toHaveBeenCalledWith({
        currentPassword: "old-pass-123",
        newPassword: "new-pass-123",
        revokeOtherSessions: true,
      });
    });

    expect(await screen.findByText("Password updated.")).toBeInTheDocument();
  });

  it("shows auth errors from the API", async () => {
    authMocks.changePassword.mockResolvedValueOnce({
      error: { message: "Current password is incorrect" },
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

    expect(
      await screen.findByText("Current password is incorrect"),
    ).toBeInTheDocument();
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
      await screen.findByText("Current password is required."),
    ).toBeInTheDocument();
    expect(authMocks.changePassword).not.toHaveBeenCalled();
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
    expect(authMocks.changePassword).not.toHaveBeenCalled();
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
    expect(authMocks.changePassword).not.toHaveBeenCalled();
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
});

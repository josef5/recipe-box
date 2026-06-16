import { changePasswordAction } from "@/actions/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: mocks.getSession,
    changePassword: mocks.changePassword,
  },
}));

describe("changePasswordAction", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.changePassword.mockReset();
  });

  it("returns error when user is not authenticated", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: null } });

    const result = await changePasswordAction({
      currentPassword: "old-pass-123",
      newPassword: "new-pass-456",
    });

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toBe("Please sign in again.");
    }
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("returns validation errors when current password is missing", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const result = await changePasswordAction({
      currentPassword: "",
      newPassword: "new-pass-456",
    });

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.fieldErrors?.currentPassword).toBe(
        "Current password is required",
      );
      expect(result.error).toBeUndefined();
    }
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("returns validation error when new password is too short", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const result = await changePasswordAction({
      currentPassword: "old-pass-123",
      newPassword: "short",
    });

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.fieldErrors?.newPassword).toBe(
        "New password must be at least 8 characters",
      );
      expect(result.error).toBeUndefined();
    }
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("returns validation error when new password matches current password", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const result = await changePasswordAction({
      currentPassword: "same-pass-123",
      newPassword: "same-pass-123",
    });

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.fieldErrors?.newPassword).toBe(
        "New password must be different from current password",
      );
      expect(result.error).toBeUndefined();
    }
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("returns auth provider error when changePassword fails", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.changePassword.mockResolvedValue({
      error: { message: "Current password is incorrect" },
    });

    const result = await changePasswordAction({
      currentPassword: "wrong-pass",
      newPassword: "new-pass-456",
    });

    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toBe("Current password is incorrect");
      expect(result.fieldErrors).toBeUndefined();
    }
    expect(mocks.changePassword).toHaveBeenCalledWith({
      currentPassword: "wrong-pass",
      newPassword: "new-pass-456",
      revokeOtherSessions: true,
    });
  });

  it("returns success when password is changed", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.changePassword.mockResolvedValue({ error: null });

    const result = await changePasswordAction({
      currentPassword: "old-pass-123",
      newPassword: "new-pass-456",
    });

    expect(result.ok).toBe(true);
    expect(mocks.changePassword).toHaveBeenCalledWith({
      currentPassword: "old-pass-123",
      newPassword: "new-pass-456",
      revokeOtherSessions: true,
    });
  });
});

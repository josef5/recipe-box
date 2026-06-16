import { describe, expect, it } from "vitest";
import { changePasswordSchema } from "@/lib/schemas/auth";

describe("changePasswordSchema", () => {
  it("accepts valid input", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-pass-123",
      newPassword: "new-pass-456",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "new-pass-456",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === "currentPassword"),
      ).toBe(true);
    }
  });

  it("rejects missing new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-pass-123",
      newPassword: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "newPassword")).toBe(
        true,
      );
    }
  });

  it("rejects new password shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "old-pass-123",
      newPassword: "short",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "newPassword")).toBe(
        true,
      );
    }
  });

  it("rejects when new password matches current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "same-pass-123",
      newPassword: "same-pass-123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "newPassword")).toBe(
        true,
      );
      expect(
        result.error.issues.find((i) => i.path[0] === "newPassword")?.message,
      ).toBe("New password must be different from current password");
    }
  });
});

import { describe, expect, it } from "vitest";
import {
  CreateAdminUserSchema,
  DeleteAdminUserSchema,
} from "@/lib/validation/admin-users";

describe("admin user validation schemas", () => {
  it("normalizes and validates create payload", () => {
    const result = CreateAdminUserSchema.safeParse({
      name: "  Jane  ",
      email: "  JANE@EXAMPLE.COM  ",
      provisionalPassword: "password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Jane");
      expect(result.data.email).toBe("jane@example.com");
    }
  });

  it("rejects short provisional password", () => {
    const result = CreateAdminUserSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      provisionalPassword: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects blank delete user id", () => {
    const result = DeleteAdminUserSchema.safeParse({
      userId: "",
    });

    expect(result.success).toBe(false);
  });
});

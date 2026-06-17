import { updateAccountNameAction } from "@/actions/account";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  update: vi.fn(),
  set: vi.fn(),
  where: vi.fn(),
  eq: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: mocks.getSession,
  },
}));

vi.mock("@/db", () => ({
  db: {
    update: mocks.update,
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: mocks.eq,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

vi.mock("@/db/schema", () => ({
  recipes: {
    userId: "recipes.userId",
  },
}));

describe("updateAccountNameAction", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
    mocks.update.mockReset();
    mocks.set.mockReset();
    mocks.where.mockReset();
    mocks.eq.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.revalidateTag.mockReset();

    mocks.set.mockReturnValue({
      where: mocks.where,
    });
    mocks.where.mockResolvedValue(undefined);
    mocks.update.mockReturnValue({
      set: mocks.set,
    });
    mocks.eq.mockReturnValue({
      column: "recipes.userId",
      value: "user-1",
    });
  });

  it("returns an auth error when the user is not signed in", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: null } });

    const result = await updateAccountNameAction({ name: "Updated Name" });

    expect(result).toEqual({
      ok: false,
      error: "Please sign in again.",
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("returns a validation error when the name is empty", async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "cook@example.com",
          name: "Cook",
        },
      },
    });

    const result = await updateAccountNameAction({ name: "" });

    expect(result).toEqual({
      ok: false,
      error: "Name is required",
    });
    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });

  it("updates the owner's display name and revalidates cached pages", async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "cook@example.com",
          name: "Cook",
        },
      },
    });

    const result = await updateAccountNameAction({ name: " Updated Name " });

    expect(result).toEqual({
      ok: true,
      data: { name: "Updated Name" },
    });
    expect(mocks.update).toHaveBeenCalledWith(expect.any(Object));
    expect(mocks.set).toHaveBeenCalledWith({
      ownerDisplayName: "Updated Name",
    });
    expect(mocks.where).toHaveBeenCalledWith({
      column: "recipes.userId",
      value: "user-1",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/account");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidateTag).toHaveBeenCalledWith("recipes", "max");
  });

  it("returns a database error message when the write fails", async () => {
    mocks.getSession.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "cook@example.com",
          name: "Cook",
        },
      },
    });
    mocks.where.mockRejectedValueOnce(new Error("Database unavailable"));

    const result = await updateAccountNameAction({ name: "Updated Name" });

    expect(result).toEqual({
      ok: false,
      error: "Database unavailable",
    });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});

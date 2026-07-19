import { getCurrentUser } from "@/lib/auth/session";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("@/lib/auth/server", () => ({
  auth: {
    getSession: mocks.getSession,
  },
}));

describe("getCurrentUser", () => {
  beforeEach(() => {
    mocks.getSession.mockReset();
  });

  it("returns null when auth provider throws Unauthorized", async () => {
    mocks.getSession.mockRejectedValue(new Error("Unauthorized"));

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it("returns null when auth provider throws 401 status errors", async () => {
    const error = Object.assign(new Error("Session expired"), {
      statusCode: 401,
    });
    mocks.getSession.mockRejectedValue(error);

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it("returns null when auth provider attempts cookie mutation during render", async () => {
    mocks.getSession.mockRejectedValue(
      new Error(
        "Cookies can only be modified in a Server Action or Route Handler.",
      ),
    );

    const user = await getCurrentUser();

    expect(user).toBeNull();
  });

  it("rethrows unexpected auth provider errors", async () => {
    mocks.getSession.mockRejectedValue(new Error("Network down"));

    await expect(getCurrentUser()).rejects.toThrow("Network down");
  });
});

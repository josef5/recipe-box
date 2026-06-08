import { SignOutButton } from "@/components/ui/sign-out-button";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    signOut: mocks.signOut,
  },
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    mocks.signOut.mockReset();
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("calls signOut and redirects with a signed-out flash flag", async () => {
    const locationAssign = vi.fn();
    vi.stubGlobal("location", {
      ...window.location,
      assign: locationAssign,
    });

    render(<SignOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalledTimes(1);
      expect(locationAssign).toHaveBeenCalledWith("/?toast=signed-out");
    });
  });
});

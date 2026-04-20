import { AccountProfileSection } from "@/components/account-profile-section";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  useSession: vi.fn(),
  refetch: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    useSession: authMocks.useSession,
  },
}));

describe("account profile section", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authMocks.refetch.mockReset();
    authMocks.refetch.mockResolvedValue(undefined);
    authMocks.useSession.mockReturnValue({ refetch: authMocks.refetch });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: { name: "Updated Name" },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
  });

  it("renders current name and enters edit mode", () => {
    render(<AccountProfileSection initialName="Current Name" />);

    expect(screen.getByText("Current Name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByDisplayValue("Current Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("cancels editing without submitting", () => {
    render(<AccountProfileSection initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Unsaved Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Current Name")).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("submits updated name and shows success message", async () => {
    render(<AccountProfileSection initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/account/name",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Updated Name" }),
        }),
      );
    });

    expect(authMocks.refetch).toHaveBeenCalledWith({
      query: {
        disableCookieCache: true,
      },
    });

    expect(await screen.findByText("Name updated.")).toBeInTheDocument();
    expect(screen.getByText("Updated Name")).toBeInTheDocument();
  });

  it("shows action errors when update fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: false,
          error: "Unable to update your name.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(<AccountProfileSection initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    expect(
      await screen.findByText("Unable to update your name."),
    ).toBeInTheDocument();
  });
});

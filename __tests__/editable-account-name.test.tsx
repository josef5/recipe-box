import { EditableAccountName } from "@/components/ui/editable-account-name";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
}));

const navigationMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    updateUser: authMocks.updateUser,
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: navigationMocks.useRouter,
}));

const syncResponse = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("account profile section", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authMocks.updateUser.mockReset();
    authMocks.updateUser.mockResolvedValue({ error: null });
    navigationMocks.refresh.mockReset();
    navigationMocks.useRouter.mockReturnValue({
      refresh: navigationMocks.refresh,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      syncResponse({ ok: true, data: { name: "Updated Name" } }),
    );
  });

  it("renders current name and enters edit mode", () => {
    render(<EditableAccountName initialName="Current Name" />);

    expect(screen.getByText("Current Name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByDisplayValue("Current Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("cancels editing without submitting", () => {
    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Unsaved Name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByText("Current Name")).toBeInTheDocument();
    expect(authMocks.updateUser).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("calls authClient.updateUser then syncs DB and shows success", async () => {
    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() => {
      expect(authMocks.updateUser).toHaveBeenCalledWith({
        name: "Updated Name",
      });
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/account/name/sync",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Updated Name" }),
      }),
    );

    expect(await screen.findByText("Name updated.")).toBeInTheDocument();
    expect(screen.getByText("Updated Name")).toBeInTheDocument();
    expect(navigationMocks.refresh).toHaveBeenCalled();
  });

  it("shows auth error when authClient.updateUser fails", async () => {
    authMocks.updateUser.mockResolvedValueOnce({
      error: { message: "Auth update failed." },
    });

    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    expect(await screen.findByText("Auth update failed.")).toBeInTheDocument();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("shows sync error when DB sync fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      syncResponse({ ok: false, error: "Unable to update your name." }, 400),
    );

    render(<EditableAccountName initialName="Current Name" />);

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

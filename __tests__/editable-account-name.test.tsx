import { EditableAccountName } from "@/components/ui/editable-account-name";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  updateAccountNameAction: vi.fn(),
  refresh: vi.fn(),
  useRouter: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/auth/client", () => ({
  authClient: {
    updateUser: mocks.updateUser,
  },
}));

vi.mock("@/actions/account", () => ({
  updateAccountNameAction: mocks.updateAccountNameAction,
}));

vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("account profile section", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mocks.updateUser.mockReset();
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.updateAccountNameAction.mockReset();
    mocks.updateAccountNameAction.mockResolvedValue({
      ok: true,
      data: { name: "Updated Name" },
    });
    mocks.refresh.mockReset();
    mocks.useRouter.mockReturnValue({
      refresh: mocks.refresh,
    });
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
    expect(mocks.updateUser).not.toHaveBeenCalled();
    expect(mocks.updateAccountNameAction).not.toHaveBeenCalled();
  });

  it("calls authClient.updateUser then syncs the account name and shows success", async () => {
    const message1 = "Updated Name";
    const message2 = "Name updated.";

    mocks.updateAccountNameAction.mockResolvedValueOnce({
      ok: true,
      data: { name: message1 },
    });

    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: message1 },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.updateUser).toHaveBeenCalledWith({
        name: message1,
      });
    });

    expect(mocks.updateAccountNameAction).toHaveBeenCalledWith({
      name: message1,
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        message2,
        expect.any(Object),
      );
    });
    // expect(await screen.findByText(message2)).toBeInTheDocument();

    expect(screen.getByText(message1)).toBeInTheDocument();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("shows auth error when authClient.updateUser fails", async () => {
    const errorMessage = "Auth update failed.";

    mocks.updateUser.mockResolvedValueOnce({
      error: { message: errorMessage },
    });

    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object),
      );
    });
    expect(mocks.updateAccountNameAction).not.toHaveBeenCalled();
  });

  it("shows sync error when the server action fails", async () => {
    const errorMessage = "Unable to update your name.";

    mocks.updateAccountNameAction.mockResolvedValueOnce({
      ok: false,
      error: errorMessage,
    });

    render(<EditableAccountName initialName="Current Name" />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Name" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Save" }).closest("form")!,
    );

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object),
      );
    });
  });
});

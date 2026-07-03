import { AccountUsersSection } from "@/components/account-users-section";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  addUserAction: vi.fn(),
  deleteUserAction: vi.fn(),
  setUsers: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/actions/account", () => ({
  addUserAction: mocks.addUserAction,
  deleteUserAction: mocks.deleteUserAction,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

describe("admin users section", () => {
  beforeEach(() => {
    mocks.addUserAction.mockReset();
    mocks.toastSuccess.mockReset();
    mocks.toastError.mockReset();
  });

  it("creates a user and refreshes the table", async () => {
    mocks.addUserAction.mockResolvedValueOnce({
      ok: true,
    });

    mocks.setUsers.mockImplementationOnce((newUsers) => {
      expect(newUsers).toEqual([
        {
          id: "admin-1",
          name: "Admin",
          email: "admin@example.com",
        },
        {
          id: "user-2",
          name: "Family Member",
          email: "family@example.com",
        },
      ]);
    });

    render(
      <AccountUsersSection
        currentUserId="admin-1"
        initialUsers={[
          {
            id: "admin-1",
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
            createdAt: "2026-04-14T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create new user" }));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Family Member" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "family@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Provisional password"), {
      target: { value: "provisional-pass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(mocks.addUserAction).toHaveBeenCalledWith({
        name: "Family Member",
        email: "family@example.com",
        provisionalPassword: "provisional-pass",
      });
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Created user: family@example.com",
        expect.any(Object),
      );
    });
  });

  it("deletes a user from the table", async () => {
    mocks.deleteUserAction.mockResolvedValueOnce({ ok: true });

    render(
      <AccountUsersSection
        currentUserId="admin-1"
        initialUsers={[
          {
            id: "admin-1",
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
            createdAt: "2026-04-14T00:00:00.000Z",
          },
          {
            id: "user-2",
            name: "Family Member",
            email: "family@example.com",
            role: "user",
            createdAt: "2026-04-15T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(screen.queryByText("family@example.com")).not.toBeInTheDocument();
    });
  });

  it("shows API errors when create fails", async () => {
    const errorMessage = "Unable to create user.";

    mocks.addUserAction.mockResolvedValueOnce({
      ok: false,
      error: errorMessage,
    });

    render(
      <AccountUsersSection
        currentUserId="admin-1"
        initialUsers={[
          {
            id: "admin-1",
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
            createdAt: "2026-04-14T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create new user" }));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Family Member" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "family@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Provisional password"), {
      target: { value: "provisional-pass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        errorMessage,
        expect.any(Object),
      );
    });
  });

  it("shows list errors when refresh fails after create", async () => {
    mocks.addUserAction.mockResolvedValueOnce({
      ok: true,
      data: {
        id: "user-2",
        name: "Family Member",
        email: "family@example.com",
        role: "user",
        createdAt: "2026-04-15T00:00:00.000Z",
      },
    });

    mocks.addUserAction.mockResolvedValueOnce({
      ok: false,
      error: "Unable to list users.",
    });

    render(
      <AccountUsersSection
        currentUserId="admin-1"
        initialUsers={[
          {
            id: "admin-1",
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
            createdAt: "2026-04-14T00:00:00.000Z",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create new user" }));

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Family Member" },
    });

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "family@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Provisional password"), {
      target: { value: "provisional-pass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Create user" }));

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        "Created user: family@example.com",
        expect.any(Object),
      );
    });
  });
});

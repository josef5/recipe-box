import { AdminUsersSection } from "@/components/admin-users-section";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actionMocks = vi.hoisted(() => ({
  createManagedUserAction: vi.fn(),
  deleteManagedUserAction: vi.fn(),
  listManagedUsersAction: vi.fn(),
}));

vi.mock("@/actions/admin-users", () => ({
  createManagedUserAction: actionMocks.createManagedUserAction,
  deleteManagedUserAction: actionMocks.deleteManagedUserAction,
  listManagedUsersAction: actionMocks.listManagedUsersAction,
}));

describe("admin users section", () => {
  beforeEach(() => {
    actionMocks.createManagedUserAction.mockReset();
    actionMocks.deleteManagedUserAction.mockReset();
    actionMocks.listManagedUsersAction.mockReset();
    vi.restoreAllMocks();
  });

  it("creates a user and refreshes the table", async () => {
    actionMocks.createManagedUserAction.mockResolvedValue({
      ok: true,
      data: {
        id: "user-2",
        name: "Family Member",
        email: "family@example.com",
        role: "user",
        createdAt: "2026-04-15T00:00:00.000Z",
      },
    });
    actionMocks.listManagedUsersAction.mockResolvedValue({
      ok: true,
      data: [
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
      ],
    });

    render(
      <AdminUsersSection
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
      expect(actionMocks.createManagedUserAction).toHaveBeenCalledWith({
        name: "Family Member",
        email: "family@example.com",
        provisionalPassword: "provisional-pass",
      });
    });

    expect(
      await screen.findByText("Created user: family@example.com"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Family Member")).toBeInTheDocument();
  });

  it("deletes a user from the table", async () => {
    actionMocks.deleteManagedUserAction.mockResolvedValue({
      ok: true,
      data: { userId: "user-2" },
    });

    render(
      <AdminUsersSection
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

    await waitFor(() => {
      expect(actionMocks.deleteManagedUserAction).toHaveBeenCalledWith({
        userId: "user-2",
      });
    });

    expect(screen.queryByText("family@example.com")).not.toBeInTheDocument();
  });

  it("shows API errors when create fails", async () => {
    actionMocks.createManagedUserAction.mockResolvedValue({
      ok: false,
      error: "Unable to create user.",
    });

    render(
      <AdminUsersSection
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

    expect(
      await screen.findByText("Unable to create user."),
    ).toBeInTheDocument();
  });

  it("shows a client-side validation error and skips submit for invalid email", async () => {
    render(
      <AdminUsersSection
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
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Provisional password"), {
      target: { value: "provisional-pass" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Create user" }));

    expect(
      await screen.findByText("Valid email is required."),
    ).toBeInTheDocument();
    expect(actionMocks.createManagedUserAction).not.toHaveBeenCalled();
  });

  it("shows all client-side validation errors for an empty submit", async () => {
    render(
      <AdminUsersSection
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
    fireEvent.submit(screen.getByRole("button", { name: "Create user" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Valid email is required."),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Provisional password must be at least 8 characters.",
      ),
    ).toBeInTheDocument();
    expect(actionMocks.createManagedUserAction).not.toHaveBeenCalled();
  });

  it("falls back to API endpoints when server action transport fails", async () => {
    actionMocks.createManagedUserAction.mockRejectedValue(
      new Error("An unexpected response was received from the server."),
    );
    actionMocks.listManagedUsersAction.mockRejectedValue(
      new Error("An unexpected response was received from the server."),
    );

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            id: "user-2",
            name: "Family Member",
            email: "family@example.com",
            role: "user",
            createdAt: "2026-04-15T00:00:00.000Z",
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          ok: true,
          data: [
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
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    render(
      <AdminUsersSection
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

    expect(
      await screen.findByText("Created user: family@example.com"),
    ).toBeInTheDocument();
    expect(await screen.findByText("Family Member")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/admin-users",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin-users",
      expect.objectContaining({ method: "GET" }),
    );
  });
});

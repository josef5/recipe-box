import { AdminUsersSection } from "@/components/admin-users-section";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("admin users section", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a user and refreshes the table", async () => {
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

  it("deletes a user from the table", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: { userId: "user-2" },
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

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin-users/user-2",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("shows API errors when create fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: false,
          error: "Unable to create user.",
        }),
        {
          status: 500,
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
      await screen.findByText("Unable to create user."),
    ).toBeInTheDocument();
  });

  it("shows list errors when refresh fails after create", async () => {
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
          ok: false,
          error: "Unable to list users.",
        }),
        {
          status: 500,
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
    expect(
      await screen.findByText("Unable to list users."),
    ).toBeInTheDocument();

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

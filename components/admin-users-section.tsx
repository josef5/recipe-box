"use client";

import { type ManagedUser } from "@/actions/admin-users";
import { formatStableDate } from "@/lib/utils";
import { CreateAdminUserSchema } from "@/lib/validation/admin-users";
import { useEffect, useRef, useState } from "react";
import { Accordion } from "./ui/accordion";
import { Dialog } from "./ui/dialog";

type ClientActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function listManagedUsersApi(): Promise<
  ClientActionResult<ManagedUser[]>
> {
  try {
    const response = await fetch("/api/admin-users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as ClientActionResult<
      ManagedUser[]
    >;

    if (!response.ok) {
      return {
        ok: false,
        error:
          !payload || typeof payload !== "object" || !("error" in payload)
            ? "Unable to list users."
            : String(payload.error),
      };
    }

    return payload;
  } catch {
    return { ok: false, error: "Unable to list users." };
  }
}

async function createManagedUserApi(input: {
  name: string;
  email: string;
  provisionalPassword: string;
}): Promise<ClientActionResult<ManagedUser>> {
  try {
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as ClientActionResult<ManagedUser>;

    if (!response.ok) {
      return {
        ok: false,
        error:
          !payload || typeof payload !== "object" || !("error" in payload)
            ? "Unable to create user."
            : String(payload.error),
      };
    }

    return payload;
  } catch {
    return { ok: false, error: "Unable to create user." };
  }
}

async function deleteManagedUserApi(input: {
  userId: string;
}): Promise<ClientActionResult<{ userId: string }>> {
  try {
    const response = await fetch(`/api/admin-users/${input.userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const payload = (await response.json()) as ClientActionResult<{
      userId: string;
    }>;

    if (!response.ok) {
      return {
        ok: false,
        error:
          !payload || typeof payload !== "object" || !("error" in payload)
            ? "Unable to delete user."
            : String(payload.error),
      };
    }

    return payload;
  } catch {
    return { ok: false, error: "Unable to delete user." };
  }
}

type AdminUsersSectionProps = {
  initialUsers: ManagedUser[];
  currentUserId: string;
};

type CreateUserFieldErrors = Partial<
  Record<"name" | "email" | "provisionalPassword", string>
>;

export function AdminUsersSection({
  initialUsers,
  currentUserId,
}: AdminUsersSectionProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [provisionalPassword, setProvisionalPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [createUserFieldErrors, setCreateUserFieldErrors] =
    useState<CreateUserFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const accordionRef = useRef<{
    open: () => void;
    close: () => void;
  }>(null);
  const isCreateUserValid = CreateAdminUserSchema.safeParse({
    name,
    email,
    provisionalPassword,
  }).success;

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  async function refreshUsers() {
    const result = await listManagedUsersApi();

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setUsers(result.data);
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const result = await createManagedUserApi({
      name,
      email,
      provisionalPassword,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(`Created user: ${result.data.email}`);
    setName("");
    setEmail("");
    setProvisionalPassword("");
    accordionRef.current?.close();

    await refreshUsers();

    setIsCreating(false);
  }

  async function handleDeleteUser(userId: string) {
    setError(null);
    setSuccess(null);

    const result = await deleteManagedUserApi({ userId });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess("User deleted.");
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== result.data.userId),
    );
    setDeletingUserId(null);
    dialogRef.current?.close();
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Admin: Users</h2>
      <p className="mt-1 text-sm text-gray-600">
        Create users with provisional passwords and remove users when needed.
      </p>

      <Accordion
        headingNode={<h2 className="font-medium">Create new user</h2>}
        className="border-none px-0"
        ref={accordionRef}
      >
        <>
          <form
            onSubmit={handleCreateUser}
            noValidate
            className="mt-4 grid gap-4"
          >
            <div className="grid gap-1.5">
              <label htmlFor="adminUserName" className="text-sm font-medium">
                Name
              </label>
              <input
                id="adminUserName"
                name="name"
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setCreateUserFieldErrors((current) => ({
                    ...current,
                    name: undefined,
                  }));
                }}
                className="rounded-md border px-3 py-2 text-sm"
              />
              {createUserFieldErrors.name ? (
                <p className="text-sm text-red-600">
                  {createUserFieldErrors.name}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="adminUserEmail" className="text-sm font-medium">
                Email
              </label>
              <input
                id="adminUserEmail"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setCreateUserFieldErrors((current) => ({
                    ...current,
                    email: undefined,
                  }));
                }}
                className="rounded-md border px-3 py-2 text-sm"
              />
              {createUserFieldErrors.email ? (
                <p className="text-sm text-red-600">
                  {createUserFieldErrors.email}
                </p>
              ) : null}
            </div>

            <div className="grid gap-1.5">
              <label
                htmlFor="adminUserProvisionalPassword"
                className="text-sm font-medium"
              >
                Provisional password
              </label>
              <input
                id="adminUserProvisionalPassword"
                name="provisionalPassword"
                type="password"
                value={provisionalPassword}
                onChange={(event) => {
                  setProvisionalPassword(event.target.value);
                  setCreateUserFieldErrors((current) => ({
                    ...current,
                    provisionalPassword: undefined,
                  }));
                }}
                className="rounded-md border px-3 py-2 text-sm"
                autoComplete="new-password"
              />
              {createUserFieldErrors.provisionalPassword ? (
                <p className="text-sm text-red-600">
                  {createUserFieldErrors.provisionalPassword}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isCreating || !isCreateUserValid}
              className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:w-auto"
            >
              {isCreating ? "Creating..." : "Create user"}
            </button>
          </form>
        </>
      </Accordion>
      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {success ? (
        <p className="mt-4 text-sm text-green-700">{success}</p>
      ) : null}
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="xs:table-header-group hidden">
            <tr className="xs:table-row mb-4 block">
              <th className="px-2 py-2 text-left font-medium">Name</th>
              <th className="px-2 py-2 text-left font-medium">Email</th>
              <th className="px-2 py-2 text-left font-medium">Role</th>
              <th className="px-2 py-2 text-left font-medium">Created</th>
              <th className="px-2 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isDeleting = deletingUserId === user.id;

              return (
                <tr
                  key={user.id}
                  className="xs:table-row border-foreground/25 block border-b last:border-0"
                >
                  <td className="xs:table-cell flex justify-between px-2 py-2">
                    <span className="xs:hidden font-bold">Name</span>
                    {user.name}
                  </td>
                  <td className="xs:table-cell flex justify-between px-2 py-2 break-all">
                    <span className="xs:hidden font-bold">Email</span>
                    {user.email}
                  </td>
                  <td className="xs:table-cell flex justify-between px-2 py-2">
                    <span className="xs:hidden font-bold">Role</span>
                    {user.role ?? "user"}
                  </td>
                  <td className="xs:table-cell flex justify-between px-2 py-2 break-all">
                    <span className="xs:hidden font-bold">Created</span>
                    {formatStableDate(user.createdAt)}
                  </td>
                  <td className="xs:table-cell flex justify-between px-2 py-2">
                    <Button
                      type="button"
                      variant={
                        isCurrentUser || isDeleting
                          ? "secondary"
                          : "destructive-secondary"
                      }
                      size="sm"
                      disabled={isCurrentUser || isDeleting}
                      onClick={() => {
                        setDeletingUserId(user.id);
                        dialogRef.current?.showModal();
                      }}
                      className="rounded border px-2 py-1 text-xs disabled:opacity-50"
                    >
                      {isCurrentUser
                        ? "Current user"
                        : isDeleting
                          ? "Deleting..."
                          : "Delete"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Dialog
        title="Delete this user? This action cannot be undone."
        onConfirm={() => deletingUserId && handleDeleteUser(deletingUserId)}
        dialogRef={dialogRef}
      />
    </section>
  );
}

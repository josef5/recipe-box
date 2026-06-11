"use client";

import { type ManagedUser } from "@/actions/admin-users";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { formatStableDate } from "@/lib/utils";
import { CreateAdminUserSchema } from "@/lib/validation/admin-users";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Accordion } from "./ui/accordion";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
      toast.error(result.error, TOAST_OPTIONS.error);
      return;
    }

    setUsers(result.data);
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = await createManagedUserApi({
      name,
      email,
      provisionalPassword,
    });

    if (!result.ok) {
      toast.error(result.error, TOAST_OPTIONS.error);
      return;
    }

    toast.success(`Created user: ${result.data.email}`, TOAST_OPTIONS.success);
    setName("");
    setEmail("");
    setProvisionalPassword("");
    accordionRef.current?.close();

    await refreshUsers();

    setIsCreating(false);
  }

  async function handleDeleteUser(userId: string) {
    const result = await deleteManagedUserApi({ userId });

    if (!result.ok) {
      toast.error(result.error, TOAST_OPTIONS.error);
      return;
    }

    toast.success("User deleted.", TOAST_OPTIONS.success);
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== result.data.userId),
    );
    setDeletingUserId(null);
    dialogRef.current?.close();
  }

  return (
    <section className="bg-surface space-y-4 rounded-xl px-5 py-6 text-sm drop-shadow-lg">
      <h2 className="font-bold">Users</h2>
      <p className="text-sm">
        Create users with provisional passwords and remove users when needed.
      </p>
      <Accordion
        headingNode={<h2 className="font-medium">Create new user</h2>}
        ref={accordionRef}
      >
        <form
          onSubmit={handleCreateUser}
          noValidate
          className="mt-4 grid gap-4"
        >
          <div className="grid gap-1.5">
            <label htmlFor="adminUserName" className="text-sm font-medium">
              Name
            </label>
            <Input
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
            />
            {createUserFieldErrors.name ? (
              <p className="text-danger text-sm">
                {createUserFieldErrors.name}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="adminUserEmail">Email</Label>
            <Input
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
            />
            {createUserFieldErrors.email ? (
              <p className="text-danger text-sm">
                {createUserFieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="grid gap-1.5">
            <Label
              htmlFor="adminUserProvisionalPassword"
              className="text-sm font-medium"
            >
              Provisional password
            </Label>
            <Input
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
              autoComplete="new-password"
            />
            {createUserFieldErrors.provisionalPassword ? (
              <p className="text-danger text-sm">
                {createUserFieldErrors.provisionalPassword}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={isCreating || !isCreateUserValid}>
            {isCreating ? "Creating..." : "Create user"}
          </Button>
        </form>
      </Accordion>
      <table className="mb-0 w-full text-sm">
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
                  <span className="xs:hidden font-medium">Name</span>
                  {user.name}
                </td>
                <td className="xs:table-cell flex justify-between px-2 py-2 break-all">
                  <span className="xs:hidden font-medium">Email</span>
                  {user.email}
                </td>
                <td className="xs:table-cell flex justify-between px-2 py-2">
                  <span className="xs:hidden font-medium">Role</span>
                  {user.role ?? "user"}
                </td>
                <td className="xs:table-cell flex justify-between px-2 py-2 break-all">
                  <span className="xs:hidden font-medium">Created</span>
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
                    className="w-full"
                  >
                    {isCurrentUser
                      ? "Current user"
                      : isDeleting
                        ? "Deleting..."
                        : "Delete"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Dialog
        title="Delete this user? This action cannot be undone."
        onConfirm={() => deletingUserId && handleDeleteUser(deletingUserId)}
        onCancel={() => setDeletingUserId(null)}
        dialogRef={dialogRef}
      />
    </section>
  );
}

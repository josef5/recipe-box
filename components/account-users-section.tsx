"use client";

import { addUserAction, deleteUserAction } from "@/actions/account";
import type { ManagedUser } from "@/actions/admin-users";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import type { AddUserInput } from "@/lib/schemas/account";
import { formatStableDate } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "sonner";
import { AddUserForm } from "./add-user-form";
import { Accordion } from "./ui/accordion";
import { Button } from "./ui/button";
import { Dialog } from "./ui/dialog";

// TODO: Deal with autocompleted input values and canSubmit

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

export function AccountUsersSection({
  initialUsers,
  currentUserId,
}: {
  initialUsers: ManagedUser[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const accordionRef = useRef<{
    open: () => void;
    close: () => void;
  }>(null);

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

  async function handleCreateUser(
    {
      name,
      email,
      provisionalPassword,
    }: {
      name: string;
      email: string;
      provisionalPassword: string;
    },
    setError: UseFormSetError<AddUserInput>,
  ) {
    setIsCreating(true);

    try {
      const result = await addUserAction({
        name,
        email,
        provisionalPassword,
      });

      if (!result.ok) {
        if (result.fieldErrors?.name) {
          setError("name", {
            type: "server",
            message: result.fieldErrors.name,
          });
        }

        if (result.fieldErrors?.email) {
          setError("email", {
            type: "server",
            message: result.fieldErrors.email,
          });
        }

        if (result.fieldErrors?.provisionalPassword) {
          setError("provisionalPassword", {
            type: "server",
            message: result.fieldErrors.provisionalPassword,
          });
        }

        if (result.error) {
          toast.error(result.error, TOAST_OPTIONS.error);
        }

        return;
      }

      toast.success(`Created user: ${email}`, TOAST_OPTIONS.success);
      accordionRef.current?.close();

      await refreshUsers();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to create user.",
        TOAST_OPTIONS.error,
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    setIsDeleting(true);

    try {
      const result = await deleteUserAction({ userId });

      if (!result.ok) {
        toast.error(result.error, TOAST_OPTIONS.error);
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId),
      );

      toast.success("User deleted.", TOAST_OPTIONS.success);
      setDeletingUserId(null);
      dialogRef.current?.close();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete user.",
        TOAST_OPTIONS.error,
      );
    } finally {
      setIsDeleting(false);
    }
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
        <AddUserForm
          onSubmit={(data, setError) => handleCreateUser(data, setError)}
          isCreating={isCreating}
        />
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
            const isBeingDeleted = isDeleting && deletingUserId === user.id;

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
                      isCurrentUser || isBeingDeleted
                        ? "secondary"
                        : "destructive-secondary"
                    }
                    size="sm"
                    disabled={isCurrentUser || isBeingDeleted}
                    onClick={() => {
                      setDeletingUserId(user.id);
                      dialogRef.current?.showModal();
                    }}
                    className="w-full"
                  >
                    {isCurrentUser
                      ? "Current user"
                      : isBeingDeleted
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

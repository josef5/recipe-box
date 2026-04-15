"use client";

import {
  createManagedUserAction,
  deleteManagedUserAction,
  listManagedUsersAction,
  type ManagedUser,
} from "@/actions/admin-users";
import { formatStableDate } from "@/lib/utils";
import { useState } from "react";

type AdminUsersSectionProps = {
  initialUsers: ManagedUser[];
  currentUserId: string;
};

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function refreshUsers() {
    const result = await listManagedUsersAction();

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
    setIsCreating(true);

    try {
      const result = await createManagedUserAction({
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
      await refreshUsers();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create user.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    setError(null);
    setSuccess(null);
    setDeletingUserId(userId);

    try {
      const result = await deleteManagedUserAction({ userId });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess("User deleted.");
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== result.data.userId),
      );
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to delete user.",
      );
    } finally {
      setDeletingUserId(null);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Admin: Users</h2>
      <p className="mt-1 text-sm text-gray-600">
        Create users with provisional passwords and remove users when needed.
      </p>

      <form onSubmit={handleCreateUser} className="mt-4 grid gap-4">
        <div className="grid gap-1.5">
          <label htmlFor="adminUserName" className="text-sm font-medium">
            Name
          </label>
          <input
            id="adminUserName"
            name="name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="adminUserEmail" className="text-sm font-medium">
            Email
          </label>
          <input
            id="adminUserEmail"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
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
            required
            minLength={8}
            value={provisionalPassword}
            onChange={(event) => setProvisionalPassword(event.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:w-auto"
        >
          {isCreating ? "Creating..." : "Create user"}
        </button>
      </form>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}
      {success ? (
        <p className="mt-4 text-sm text-green-700">{success}</p>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-2 py-2 font-medium">Name</th>
              <th className="px-2 py-2 font-medium">Email</th>
              <th className="px-2 py-2 font-medium">Role</th>
              <th className="px-2 py-2 font-medium">Created</th>
              <th className="px-2 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isDeleting = deletingUserId === user.id;

              return (
                <tr key={user.id} className="border-b">
                  <td className="px-2 py-2">{user.name}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">{user.role ?? "user"}</td>
                  <td className="px-2 py-2">
                    {formatStableDate(user.createdAt)}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      disabled={isCurrentUser || isDeleting}
                      onClick={() => void handleDeleteUser(user.id)}
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
    </section>
  );
}

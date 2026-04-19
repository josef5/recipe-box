"use client";

import { authClient } from "@/lib/auth/client";
import { validateChangePasswordFormData } from "@/lib/validation/auth";
import { useState } from "react";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    const validated = validateChangePasswordFormData(formData);

    if (!validated.success) {
      setError(validated.error);
      setSuccess(null);
      return;
    }

    const { currentPassword, newPassword } = validated.data;

    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        setError(result.error.message ?? "Unable to update password.");
        return;
      }

      setSuccess("Password updated.");

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update password.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} noValidate className="mt-4 grid gap-4">
      <div className="grid gap-1.5">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          className="rounded-md border px-3 py-2 text-sm"
          autoComplete="current-password"
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          className="rounded-md border px-3 py-2 text-sm"
          autoComplete="new-password"
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}
      {success ? <p className="text-sm text-green-700">{success}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

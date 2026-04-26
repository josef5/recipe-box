"use client";

import { authClient } from "@/lib/auth/client";
import {
  ChangePasswordSchema,
  type ChangePasswordFieldErrors,
  validateChangePasswordFormData,
} from "@/lib/validation/auth";
import { useState } from "react";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const isFormValid = ChangePasswordSchema.safeParse({
    currentPassword,
    newPassword,
  }).success;

  async function handleSubmit(formData: FormData) {
    const validated = validateChangePasswordFormData(formData);

    if (!validated.success) {
      setFieldErrors(validated.errors);
      setError(null);
      setSuccess(null);
      return;
    }

    const { currentPassword, newPassword } = validated.data;

    setFieldErrors({});
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
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            setFieldErrors((current) => ({
              ...current,
              currentPassword: undefined,
            }));
          }}
          aria-describedby={
            fieldErrors.currentPassword ? "current-password-error" : undefined
          }
          aria-invalid={fieldErrors.currentPassword ? true : undefined}
          className="rounded-md border px-3 py-2 text-sm"
          autoComplete="current-password"
        />
        {fieldErrors.currentPassword ? (
          <p id="current-password-error" className="text-sm text-red-600">
            {fieldErrors.currentPassword}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New password
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setFieldErrors((current) => ({
              ...current,
              newPassword: undefined,
            }));
          }}
          aria-describedby={
            fieldErrors.newPassword ? "new-password-error" : undefined
          }
          aria-invalid={fieldErrors.newPassword ? true : undefined}
          className="rounded-md border px-3 py-2 text-sm"
          autoComplete="new-password"
        />
        {fieldErrors.newPassword ? (
          <p id="new-password-error" className="text-sm text-red-600">
            {fieldErrors.newPassword}
          </p>
        ) : null}
      </div>

      <div aria-live="polite" className="grid gap-2">
        {error ? (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="text-sm text-green-700">
            {success}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending || !isFormValid}
        className="w-full rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50 sm:w-auto"
      >
        {isPending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

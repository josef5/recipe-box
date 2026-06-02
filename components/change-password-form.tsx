"use client";

import { authClient } from "@/lib/auth/client";
import {
  ChangePasswordSchema,
  type ChangePasswordFieldErrors,
  validateChangePasswordFormData,
} from "@/lib/validation/auth";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
        <Input
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
          autoComplete="current-password"
        />
        {fieldErrors.currentPassword ? (
          <p id="current-password-error" className="text-danger text-sm">
            {fieldErrors.currentPassword}
          </p>
        ) : null}
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="newPassword" className="text-sm font-medium">
          New password
        </label>
        <Input
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
          autoComplete="new-password"
        />
        {fieldErrors.newPassword ? (
          <p id="new-password-error" className="text-danger text-sm">
            {fieldErrors.newPassword}
          </p>
        ) : null}
      </div>

      {error ? (
        <div aria-live="polite" className="grid gap-2">
          <p role="alert" className="text-danger text-sm">
            {error}
          </p>
        </div>
      ) : null}
      {success ? (
        <div aria-live="polite" className="grid gap-2">
          <p role="status" className="text-success text-sm">
            {success}
          </p>
        </div>
      ) : null}
      <Button
        type="submit"
        disabled={isPending || !isFormValid}
        className="mt-2"
      >
        {isPending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

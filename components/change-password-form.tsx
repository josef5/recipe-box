"use client";

import { TOAST_OPTIONS } from "@/constants/toast-options";
import { authClient } from "@/lib/auth/client";
import {
  ChangePasswordSchema,
  validateChangePasswordFormData,
  type ChangePasswordFieldErrors,
} from "@/lib/validation/auth";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [isPending, setIsPending] = useState(false);
  const isFormValid = ChangePasswordSchema.safeParse({
    currentPassword,
    newPassword,
  }).success;

  async function handleSubmit(formData: FormData) {
    const validated = validateChangePasswordFormData(formData);

    if (!validated.success) {
      setFieldErrors(validated.errors);
      return;
    }

    const { currentPassword, newPassword } = validated.data;

    setFieldErrors({});
    setIsPending(true);

    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        toast.error(
          result.error.message ?? "Unable to update password.",
          TOAST_OPTIONS.error,
        );
        return;
      }

      toast.success("Password updated.", TOAST_OPTIONS.success);

      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update password.",
        TOAST_OPTIONS.error,
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

"use client";

import { changePasswordAction } from "@/actions/auth";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { ChangePasswordInput, changePasswordSchema } from "@/lib/schemas/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FieldErrorMessage } from "./ui/field-error-mesage";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ChangePasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const canSubmit =
    Boolean(dirtyFields.currentPassword) &&
    Boolean(dirtyFields.newPassword) &&
    !errors.currentPassword &&
    !errors.newPassword;

  async function onSubmit({
    currentPassword,
    newPassword,
  }: ChangePasswordInput) {
    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        if (result.fieldErrors?.currentPassword) {
          setError("currentPassword", {
            type: "server",
            message: result.fieldErrors.currentPassword,
          });
        }

        if (result.fieldErrors?.newPassword) {
          setError("newPassword", {
            type: "server",
            message: result.fieldErrors.newPassword,
          });
        }

        const message = result.error ?? result.fieldErrors?.newPassword;

        if (message) {
          toast.error(message, TOAST_OPTIONS.error);
        }
        return;
      }

      toast.success("Password updated.", TOAST_OPTIONS.success);
      reset();
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update password.",
        TOAST_OPTIONS.error,
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="mt-4 grid gap-4"
    >
      <div className="grid gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register("currentPassword")}
          aria-describedby={
            errors.currentPassword ? "current-password-error" : undefined
          }
          aria-invalid={errors.currentPassword ? true : undefined}
          autoComplete="current-password"
        />
        <FieldErrorMessage text={errors.currentPassword?.message} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          {...register("newPassword")}
          aria-describedby={
            errors.newPassword ? "new-password-error" : undefined
          }
          aria-invalid={errors.newPassword ? true : undefined}
          autoComplete="new-password"
        />
        <FieldErrorMessage text={errors.newPassword?.message} />
      </div>
      <Button
        type="submit"
        disabled={isSubmitting || !canSubmit}
        className="mt-2"
      >
        {isSubmitting ? "..." : "Update password"}
      </Button>
    </form>
  );
}

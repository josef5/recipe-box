"use client";

import { TOAST_OPTIONS } from "@/constants/toast-options";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  accountNameSchema,
  type AccountNameInput,
} from "@/lib/schemas/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FieldErrorMessage } from "./field-error-mesage";
import { updateAccountNameAction } from "@/actions/account";

export function EditableAccountName({
  initialName,
}: {
  initialName: string | null;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<AccountNameInput>({
    resolver: zodResolver(accountNameSchema),
    mode: "onChange",
    defaultValues: {
      name: initialName ?? "",
    },
  });
  const [currentName, setCurrentName] = useState<string | null>(initialName);
  const [isEditing, setIsEditing] = useState(false);

  async function onSubmit({ name }: AccountNameInput) {
    try {
      // Calling authClient.updateUser() from the client is required because
      // it hits the /update-user path which triggers Better Auth's session
      // atom listeners, causing useSession() consumers (like Menu) to
      // automatically receive the refreshed user data. A server-side
      // auth.updateUser() call or manual refetchSession() does not do this.
      const authResult = await authClient.updateUser({ name });

      if (authResult.error) {
        toast.error(
          authResult.error.message ?? "Unable to update your name.",
          TOAST_OPTIONS.error,
        );
        return;
      }

      const result = await updateAccountNameAction({ name });

      if (!result.ok) {
        setError("name", {
          type: "server",
          message: result.error,
        });

        if (result.error) {
          toast.error(result.error, TOAST_OPTIONS.error);
        }

        return;
      }

      setCurrentName(result.data.name);
      setIsEditing(false);
      reset({ name: result.data.name });
      toast.success("Name updated.", TOAST_OPTIONS.success);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update your name.",
        TOAST_OPTIONS.error,
      );
    }
  }

  const canSubmit = Boolean(dirtyFields.name) && !errors.name && !isSubmitting;

  return (
    <div className="col-span-2 grid grid-cols-subgrid items-baseline gap-3">
      <dt className="font-medium">Name</dt>
      <dd className="col-start-2 space-y-2">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Label htmlFor="name" className="sr-only">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  {...register("name")}
                  autoComplete="name"
                  required
                  className="min-w-36 flex-1"
                />
                <div className="flex min-h-9 gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!canSubmit}
                    className="min-h-full min-w-14"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    // disabled={!canSubmit}
                    onClick={() => {
                      reset();
                      setIsEditing(false);
                    }}
                    className="min-h-full min-w-14"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <FieldErrorMessage text={errors.name?.message} />
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span>{currentName ?? "Not set"}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </Button>
          </div>
        )}
      </dd>
    </div>
  );
}

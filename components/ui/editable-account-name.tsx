"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";

const MAX_NAME_LENGTH = 100;

type AccountProfileSectionProps = {
  initialName: string | null;
};

export function EditableAccountName({
  initialName,
}: AccountProfileSectionProps) {
  const router = useRouter();
  const [currentName, setCurrentName] = useState<string | null>(initialName);
  const [draftName, setDraftName] = useState(initialName ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function beginEditing() {
    setDraftName(currentName ?? "");
    setError(null);
    setSuccess(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraftName(currentName ?? "");
    setError(null);
    setSuccess(null);
    setIsEditing(false);
  }

  async function handleSubmit(formData: FormData) {
    const submittedName = formData.get("name");

    if (typeof submittedName !== "string") {
      setError("Invalid form submission.");
      setSuccess(null);
      return;
    }

    if (submittedName.length > MAX_NAME_LENGTH) {
      setError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      setSuccess(null);
      return;
    }

    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      // Calling authClient.updateUser() from the client is required because
      // it hits the /update-user path which triggers Better Auth's session
      // atom listeners, causing useSession() consumers (like Menu) to
      // automatically receive the refreshed user data. A server-side
      // auth.updateUser() call or manual refetchSession() does not do this.
      const authResult = await authClient.updateUser({ name: submittedName });

      if (authResult.error) {
        setError(authResult.error.message ?? "Unable to update your name.");
        return;
      }

      // Separately sync recipes.ownerDisplayName in the DB and revalidate
      // Next.js caches. This call intentionally does not re-run auth.updateUser.
      const response = await fetch("/api/account/name/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: submittedName }),
      });

      const result = (await response.json()) as
        | { ok: true; data: { name: string } }
        | { ok: false; error: string };

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setCurrentName(result.data.name);
      setDraftName(result.data.name);
      setIsEditing(false);
      setSuccess("Name updated.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update your name.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="col-span-2 items-baseline gap-3 sm:grid sm:grid-cols-[140px_1fr]">
      <dt className="font-medium">Name</dt>
      <dd className="col-start-2 space-y-2">
        {isEditing ? (
          <form
            action={handleSubmit}
            className="flex flex-wrap items-center justify-end gap-2"
          >
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.currentTarget.value)}
              autoComplete="name"
              required
              maxLength={100}
              className="min-w-8 flex-1"
            />
            <div className="flex min-h-9 gap-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isPending}
                className="min-h-full min-w-14"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending}
                onClick={cancelEditing}
                className="min-h-full min-w-14"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span>{currentName ?? "Not set"}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={beginEditing}
              // className="min-h-9 min-w-14"
            >
              Edit
            </Button>
          </div>
        )}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}
      </dd>
    </div>
  );
}

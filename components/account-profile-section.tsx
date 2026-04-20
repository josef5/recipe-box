"use client";

import { authClient } from "@/lib/auth/client";
import { useState } from "react";

type AccountProfileSectionProps = {
  initialName: string | null;
};

export function AccountProfileSection({
  initialName,
}: AccountProfileSectionProps) {
  const { refetch: refetchSession } = authClient.useSession();
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

    setError(null);
    setSuccess(null);
    setIsPending(true);

    try {
      const response = await fetch("/api/account/name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      await refetchSession({
        query: {
          disableCookieCache: true,
        },
      });

      setSuccess("Name updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update your name.",
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <dt className="font-medium">Name</dt>
      <dd className="space-y-2">
        {isEditing ? (
          <form
            action={handleSubmit}
            className="flex flex-wrap items-center gap-2"
          >
            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.currentTarget.value)}
              className="min-w-52 rounded-md border px-3 py-2 text-sm"
              autoComplete="name"
              required
              maxLength={100}
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={cancelEditing}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span>{currentName ?? "Not set"}</span>
            <button
              type="button"
              onClick={beginEditing}
              className="rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-gray-100"
            >
              Edit
            </button>
          </div>
        )}

        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}
      </dd>
    </>
  );
}

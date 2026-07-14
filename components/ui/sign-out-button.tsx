"use client";

import { authClient } from "@/lib/auth/client";
import { useState } from "react";

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await authClient.signOut();
      window.location.assign("/?toast=signed-out");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="cursor-pointer disabled:opacity-70"
    >
      {isPending ? "..." : "Sign out"}
    </button>
  );
}

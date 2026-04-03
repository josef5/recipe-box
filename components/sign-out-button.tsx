"use client";

import { authClient } from "@/lib/auth/client";
import { useState } from "react";

export function SignOutButton() {
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    setIsPending(true);

    try {
      await authClient.signOut();
      window.location.href = "/";
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className="disabled:opacity-70"
    >
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}

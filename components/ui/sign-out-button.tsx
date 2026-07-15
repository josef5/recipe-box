"use client";

import { authClient } from "@/lib/auth/client";
import { useState } from "react";
import { Button } from "./button";

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
    <Button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      showSpinner={isPending}
      variant="secondary"
      size="sm"
      className="cursor-pointer font-bold disabled:opacity-70"
    >
      Sign out
    </Button>
  );
}

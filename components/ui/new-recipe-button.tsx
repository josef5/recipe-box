"use client";

import { authClient } from "@/lib/auth/client";
import { useSyncExternalStore } from "react";
import { Button } from "./button";

function useIsHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function NewRecipeButton() {
  const isHydrated = useIsHydrated();
  const { data: session, isPending } = authClient.useSession();

  // Keep server and first client render identical, then show auth-gated UI.
  if (!isHydrated || isPending || !session?.user?.id) {
    return null;
  }

  return <Button label="New recipe" href="/recipes/new" variant="secondary" />;
}

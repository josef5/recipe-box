"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "./button";

export function NewRecipeButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user?.id) {
    return null;
  }

  return <Button label="New Recipe" href="/recipes/new" variant="secondary" />;
}

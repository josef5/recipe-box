"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";

export function NewRecipeButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user?.id) {
    return null;
  }

  return (
    <Link
      href="/recipes/new"
      className="flex items-center justify-center gap-3 rounded-md border px-8 py-2 text-sm font-medium"
    >
      New Recipe
    </Link>
  );
}

"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";

export function NewRecipeButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user?.id) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/recipes/new"
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        New Recipe
      </Link>
    </div>
  );
}

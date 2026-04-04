"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";

export function RecipeOwnerActions({
  recipeUserId,
  editHref,
}: {
  recipeUserId: string | null;
  editHref: string;
}) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !recipeUserId || session?.user?.id !== recipeUserId) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={editHref}
        scroll={false} // prevent scroll to top on navigation since the form is above the fold
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        Edit Recipe
      </Link>
    </div>
  );
}

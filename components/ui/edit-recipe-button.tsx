"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";

function userHasAdminRole(user: unknown) {
  if (!user || typeof user !== "object") {
    return false;
  }

  const role = (user as { role?: string | string[] | null }).role;

  if (Array.isArray(role)) {
    return role.includes("admin");
  }

  return role === "admin";
}

export function EditRecipeButton({
  recipeUserId,
  editHref,
}: {
  recipeUserId: string | null;
  editHref: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isOwner = !!recipeUserId && session?.user?.id === recipeUserId;
  const isAdmin = userHasAdminRole(session?.user);

  if (isPending || (!isOwner && !isAdmin)) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={editHref}
        className="rounded-md border px-4 py-2 text-sm font-medium"
      >
        Edit Recipe
      </Link>
    </div>
  );
}

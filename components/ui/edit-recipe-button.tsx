"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "./button";

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
  className,
  ...props
}: {
  recipeUserId: string | null;
  editHref: string;
} & Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "href" | "children" | "variant"
>) {
  const { data: session, isPending } = authClient.useSession();
  const isOwner = !!recipeUserId && session?.user?.id === recipeUserId;
  const isAdmin = userHasAdminRole(session?.user);

  if (isPending || (!isOwner && !isAdmin)) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      href={editHref}
      className={className}
      {...props}
    >
      Edit recipe
    </Button>
  );
}

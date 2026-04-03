"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function AppMenu({
  variant,
  backHref = "/",
  editHref,
  editOwnerUserId,
  newHref,
}: {
  variant: "home" | "recipe";
  backHref?: string;
  editHref?: string;
  editOwnerUserId?: string | null;
  newHref?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const showNewRecipe = isPending ? Boolean(newHref) : isSignedIn;
  const showSignIn = isPending ? false : !isSignedIn;
  const showLiveSignOut = isPending ? false : isSignedIn;
  const canShowEdit =
    Boolean(editHref) &&
    (editOwnerUserId ? session?.user?.id === editOwnerUserId : true);

  if (variant === "home") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <div className="flex items-center space-x-4">
          {showNewRecipe && (
            <Link href={newHref ?? "/recipes/new"}>New Recipe</Link>
          )}
          {showSignIn && <Link href="/auth/sign-in">Sign In</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      </div>
    );
  } else if (variant === "recipe") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <div className="flex items-center space-x-4">
          <Link href={backHref}>Back</Link>
          {canShowEdit && editHref && <Link href={editHref}>Edit</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      </div>
    );
  }

  return null;
}

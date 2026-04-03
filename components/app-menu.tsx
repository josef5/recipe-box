"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function AppMenu({
  variant,
  backHref = "/",
  editHref,
  newHref,
  authHref,
  authLabel,
  showSignOut,
}: {
  variant: "home" | "recipe";
  backHref?: string;
  editHref?: string;
  newHref?: string;
  authHref?: string;
  authLabel?: string;
  showSignOut?: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const showNewRecipe = isPending ? Boolean(newHref) : isSignedIn;
  const showSignIn = isPending ? Boolean(authHref && authLabel) : !isSignedIn;
  const showLiveSignOut = isPending ? Boolean(showSignOut) : isSignedIn;

  if (variant === "home") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <div className="flex items-center space-x-4">
          {showNewRecipe && (
            <Link href={newHref ?? "/recipes/new"}>New Recipe</Link>
          )}
          {showSignIn && authLabel && (
            <Link href={authHref ?? "/auth/sign-in"}>{authLabel}</Link>
          )}
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
          {editHref && <Link href={editHref}>Edit</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      </div>
    );
  }

  return null;
}

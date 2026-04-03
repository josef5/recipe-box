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
  variant: "home" | "recipe" | "account" | "modal";
  backHref?: string;
  editHref?: string;
  editOwnerUserId?: string | null;
  newHref?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  // const accountLabel =
  //   session?.user?.name?.trim() || session?.user?.email || "Account";
  const showNewRecipe = isPending ? Boolean(newHref) : isSignedIn;
  const showSignIn = isPending ? false : !isSignedIn;
  const showLiveSignOut = isPending ? false : isSignedIn;
  const canShowEdit =
    Boolean(editHref) &&
    (editOwnerUserId ? session?.user?.id === editOwnerUserId : true);

  return (
    <div className="flex items-center justify-between mb-8">
      <Link href={"/"}>
        <h1>Recipe Box</h1>
      </Link>
      {variant === "home" ? (
        <div className="flex items-center space-x-4">
          {showNewRecipe && (
            <Link href={newHref ?? "/recipes/new"}>New Recipe</Link>
          )}
          {showLiveSignOut && <Link href="/account">Account</Link>}
          {showSignIn && <Link href="/auth/sign-in">Sign In</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      ) : variant === "recipe" ? (
        <div className="flex items-center space-x-4">
          <Link href={"/"}>Home</Link>
          {canShowEdit && editHref && <Link href={editHref}>Edit</Link>}
          {showLiveSignOut && <Link href="/account">Account</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      ) : variant === "account" ? (
        <div className="flex items-center space-x-4">
          <Link href={"/"}>Home</Link>
          {showLiveSignOut && <SignOutButton />}
        </div>
      ) : variant === "modal" ? (
        <div className="flex items-center space-x-4">
          <Link href={backHref}>Back</Link>
        </div>
      ) : null}
    </div>
  );
}

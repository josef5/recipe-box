import Link from "next/link";
import React from "react";
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
  if (variant === "home") {
    return (
      <div className="flex items-center justify-between mb-8">
        <h1>Recipe Box</h1>
        <div className="flex items-center space-x-4">
          {newHref && <Link href={newHref}>New Recipe</Link>}
          {authHref && authLabel && <Link href={authHref}>{authLabel}</Link>}
          {showSignOut && <SignOutButton />}
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
          {showSignOut && <SignOutButton />}
        </div>
      </div>
    );
  }

  return null;
}

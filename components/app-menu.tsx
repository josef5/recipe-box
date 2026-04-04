"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function AppMenu({
  variant,
  backHref = "/",
}: {
  variant: "home" | "recipe" | "account" | "modal";
  backHref?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const showSignIn = isPending ? false : !isSignedIn;
  const showLiveSignOut = isPending ? false : isSignedIn;

  return (
    <div className="flex items-center justify-between mb-8">
      <Link href={"/"}>
        <h1>Recipe Box</h1>
      </Link>
      {variant === "home" ? (
        <div className="flex items-center space-x-4">
          {showLiveSignOut && <Link href="/account">Account</Link>}
          {showSignIn && <Link href="/auth/sign-in">Sign In</Link>}
          {showLiveSignOut && <SignOutButton />}
        </div>
      ) : variant === "recipe" ? (
        <div className="flex items-center space-x-4">
          <Link href={"/"}>Home</Link>
          {showLiveSignOut && <Link href="/account">Account</Link>}
          {showSignIn && <Link href="/auth/sign-in">Sign In</Link>}
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

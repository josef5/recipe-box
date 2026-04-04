"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export function AppMenu({
  variant,
}: {
  variant: "home" | "recipe" | "account";
}) {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <div className="flex items-center justify-between mb-8">
      <Link href={"/"}>
        <h1>Recipe Box</h1>
      </Link>
      <div className="flex items-center space-x-4">
        {(variant === "recipe" || variant === "account") && (
          <Link href="/">Home</Link>
        )}
        {isSignedIn && !isPending ? (
          <>
            {(variant === "home" || variant === "recipe") && (
              <Link href="/account">Account</Link>
            )}
            <SignOutButton />
          </>
        ) : (
          <Link href="/auth/sign-in">Sign In</Link>
        )}
      </div>
    </div>
  );
}

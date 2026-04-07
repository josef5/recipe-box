"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { usePathname } from "next/navigation";

export function Menu() {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const pathname = usePathname();

  const variant: "home" | "recipe" | "account" =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/recipes/")
        ? "recipe"
        : pathname.startsWith("/account")
          ? "account"
          : "home";

  return (
    <nav className="flex items-center justify-between mb-8">
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
    </nav>
  );
}

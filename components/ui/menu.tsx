"use client";

import { authClient } from "@/lib/auth/client";
import Link from "next/link";
import { SignOutButton } from "@/components/ui/sign-out-button";
import { usePathname } from "next/navigation";

export function Menu() {
  const { data: session, isPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.user?.id);
  const pathname = usePathname();

  const variant: "home" | "recipe" | "account" | "auth" =
    pathname === "/"
      ? "home"
      : pathname.startsWith("/recipes/")
        ? "recipe"
        : pathname.startsWith("/account")
          ? "account"
          : pathname.startsWith("/auth/")
            ? "auth"
            : "home";

  return (
    <nav
      aria-label="Primary"
      className="my-6 flex items-center justify-between font-bold"
      data-testid="menu"
    >
      <Link href={"/"}>
        <h1 className="text-2xl">Recipe Box</h1>
      </Link>
      {variant !== "auth" && (
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
            <Link href="/auth/sign-in">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}

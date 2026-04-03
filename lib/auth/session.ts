import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

/**
 * Retrieves the current signed-in user from Neon Auth.
 * @returns The current user or null if no session exists.
 */
export async function getCurrentUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

/**
 * Retrieves the current signed-in user's ID.
 * @returns The user ID or null if no session exists.
 */
export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Ensures a user is signed in and returns their ID.
 * Redirects to sign-in if no session exists.
 * @returns The current signed-in user's ID.
 */
export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/auth/sign-in");
  }

  return userId;
}

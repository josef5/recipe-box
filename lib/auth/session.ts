import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

type GetSessionOptions = Parameters<typeof auth.getSession>[0];
type UserDisplaySource = {
  name?: string | null;
  email?: string | null;
};

const freshSessionOptions = {
  query: {
    disableCookieCache: "true",
  },
} as GetSessionOptions;

/**
 * Retrieves the current signed-in user from Neon Auth.
 * @returns The current user or null if no session exists.
 */
export async function getCurrentUser() {
  const { data: session } = await auth.getSession(freshSessionOptions);
  return session?.user ?? null;
}

/**
 * Derives a friendly display name for a user.
 * @param user The auth user or partial user data.
 * @returns A stable display label suitable for recipe ownership UI.
 */
export function getUserDisplayName(user: UserDisplaySource | null | undefined) {
  const trimmedName = user?.name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  const trimmedEmail = user?.email?.trim();

  if (trimmedEmail) {
    return trimmedEmail;
  }

  return "Unknown cook";
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
 * Ensures a user is signed in and returns the user object.
 * Redirects to sign-in if no session exists.
 * @returns The current signed-in user.
 */
export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return user;
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

import { auth } from "@/lib/auth/server";
import { forbidden } from "next/navigation";
import { redirect } from "next/navigation";

type GetSessionOptions = Parameters<typeof auth.getSession>[0];
type UserDisplaySource = {
  name?: string | null;
  email?: string | null;
};
type RequireUserOptions = {
  redirectTo?: string;
};

const freshSessionOptions = {
  query: {
    disableCookieCache: "true",
  },
} as GetSessionOptions;

function toSignInPath(redirectTo?: string) {
  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return "/auth/sign-in";
  }

  return `/auth/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`;
}

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
export async function requireCurrentUser(options?: RequireUserOptions) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(toSignInPath(options?.redirectTo));
  }

  return user;
}

/**
 * Ensures a user is signed in and returns their ID.
 * Redirects to sign-in if no session exists.
 * @returns The current signed-in user's ID.
 */
export async function requireCurrentUserId(options?: RequireUserOptions) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect(toSignInPath(options?.redirectTo));
  }

  return userId;
}

/**
 * Returns true when the user has an admin role.
 * Supports role values represented as either a string or a string array.
 * @param user The auth user or partial user data.
 */
export function userHasAdminRole(user: unknown) {
  if (!user || typeof user !== "object") {
    return false;
  }

  const role = (user as { role?: string | string[] | null }).role;

  if (Array.isArray(role)) {
    return role.includes("admin");
  }

  return role === "admin";
}

/**
 * Ensures the current signed-in user has admin privileges.
 * Throws a 403 if the user is signed in but not an admin.
 * @returns The current admin user.
 */
export async function requireCurrentAdmin() {
  const user = await requireCurrentUser();

  if (!userHasAdminRole(user)) {
    forbidden();
  }

  return user;
}

import { auth } from "@/lib/auth/server";
import type { User } from "@/types";
import { forbidden, redirect } from "next/navigation";

type RequireUserOptions = {
  redirectTo?: string;
};

// Utility function to detect if an error is related to unauthorized session access.
function isUnauthorizedSessionError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    message?: unknown;
    status?: unknown;
    statusCode?: unknown;
  };

  if (maybeError.status === 401 || maybeError.statusCode === 401) {
    return true;
  }

  if (typeof maybeError.message === "string") {
    return maybeError.message.toLowerCase().includes("unauthorized");
  }

  return false;
}

// Utility function to detect if an error is related to cookie mutation during render.
function isCookieMutationRenderError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    message?: unknown;
  };

  if (typeof maybeError.message !== "string") {
    return false;
  }

  const normalizedMessage = maybeError.message.toLowerCase();

  return (
    normalizedMessage.includes("cookies can only be modified") &&
    normalizedMessage.includes("server action")
  );
}

function normalizeUserRole(role: unknown): string | string[] | undefined {
  if (typeof role === "string") {
    return role;
  }

  if (Array.isArray(role)) {
    return role.filter((value): value is string => typeof value === "string");
  }

  return undefined;
}

function toSignInPath(redirectTo?: string) {
  const params = new URLSearchParams({
    toast: "reauth-required",
  });

  if (
    !redirectTo ||
    !redirectTo.startsWith("/") ||
    redirectTo.startsWith("//")
  ) {
    return `/sign-in?${params.toString()}`;
  }

  params.set("redirectTo", redirectTo);

  return `/sign-in?${params.toString()}`;
}

/**
 * Retrieves the current signed-in user from Neon Auth.
 * @returns The current user or null if no session exists.
 */
export async function getCurrentUser(): Promise<User | null> {
  let session: { user?: User | null } | null = null;

  try {
    const result = await auth.getSession({
      query: {
        disableCookieCache: true,
        disableRefresh: true,
      },
    });
    session = result.data;
  } catch (error) {
    if (
      isUnauthorizedSessionError(error) ||
      isCookieMutationRenderError(error)
    ) {
      return null;
    }

    throw error;
  }

  if (!session?.user) {
    return null;
  }

  return {
    ...session.user,
    role: normalizeUserRole(session.user.role),
  };
}

/**
 * Derives a friendly display name for a user.
 * @param user The auth user or partial user data.
 * @returns A stable display label suitable for recipe ownership UI.
 */
export function getUserDisplayName(user: User | null | undefined) {
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
export function userHasAdminRole(user: User | null | undefined) {
  if (!user || typeof user !== "object" || !("role" in user)) {
    return false;
  }

  // Support both string and array role formats for flexibility.
  const { role } = user as { role?: unknown };

  if (typeof role === "string") {
    return role === "admin";
  }

  if (Array.isArray(role)) {
    return role.includes("admin");
  }

  return false;
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

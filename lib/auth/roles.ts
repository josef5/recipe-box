import type { User } from "@/types";

/**
 * Derives a display-friendly role list from a User.
 * Pure function — safe to use in client components.
 * @param user The user object.
 * @returns An array of role strings.
 */
export function getRoles(user: User): string[] {
  const role = (user as { role?: unknown }).role;

  if (Array.isArray(role)) {
    const roles = role.filter(
      (r): r is string => typeof r === "string" && r.trim().length > 0,
    );
    return roles.length > 0 ? roles : ["user"];
  }

  if (typeof role === "string" && role.trim().length > 0) {
    return [role];
  }

  return ["user"];
}

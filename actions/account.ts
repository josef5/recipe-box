"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getAdminClient } from "@/lib/auth/admin-client";
import { auth } from "@/lib/auth/server";
import { getUserDisplayName } from "@/lib/auth/session";
import {
  accountNameSchema,
  addUserSchema,
  deleteUserSchema,
} from "@/lib/schemas/account";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireCurrentAdmin } from "@/lib/auth/session";
import type { ManagedUser } from "@/types";

// Create
export async function addUserAction(input: {
  name: string;
  email: string;
  provisionalPassword: string;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: {
        name?: string;
        email?: string;
        provisionalPassword?: string;
      };
    }
> {
  try {
    const { data: session } = await auth.getSession();
    const adminClient = getAdminClient();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }

    const parsed = addUserSchema.safeParse(input);

    // If the input is invalid, return the field errors
    if (!parsed.success) {
      const fieldErrors: Record<string, string | undefined> = {};

      // Populate fieldErrors with the first error message for each field
      for (const issue of parsed.error.issues) {
        if (issue.path.length > 0) {
          const fieldName = issue.path[0] as string;

          if (!fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message;
          }
        }
      }

      return {
        ok: false,
        fieldErrors: {
          name: fieldErrors.name,
          email: fieldErrors.email,
          provisionalPassword: fieldErrors.provisionalPassword,
        },
      };
    }

    const { name, email, provisionalPassword } = parsed.data;

    const result = await adminClient.createUser({
      name,
      email,
      password: provisionalPassword,
      role: "user",
    });

    const normalized = normalizeAdminResult<{
      user?: ManagedUser;
      id?: string;
      name?: string;
      email?: string;
      role?: string | string[] | null;
      createdAt?: Date | string | number;
    }>(result);

    if (normalized.errorMessage) {
      return { ok: false, error: normalized.errorMessage };
    }

    // TODO: Is it necessary to normalize the user object here? The AdminClient should return a consistent shape for the user object.
    const user = normalized.data?.user
      ? normalized.data.user
      : normalized.data &&
          typeof normalized.data === "object" &&
          "id" in normalized.data &&
          "email" in normalized.data
        ? (normalized.data as ManagedUser)
        : null;

    if (!user) {
      return { ok: false, error: "Unable to create user." };
    }

    revalidatePath("/account");
    revalidateTag("recipes", "max");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to create user.",
    };
  }
}

// Helper function to extract error message from unknown error
function extractErrorMessage(error: unknown): string | null {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return null;
}

// Helper function to normalize the result from the AdminClient
function normalizeAdminResult<T>(result: unknown): {
  data: T | null;
  errorMessage: string | null;
} {
  if (!result || typeof result !== "object") {
    return { data: null, errorMessage: null };
  }

  const shaped = result as {
    data?: unknown;
    error?: unknown;
  };

  if ("data" in shaped || "error" in shaped) {
    return {
      data: (shaped.data as T | undefined) ?? null,
      errorMessage: extractErrorMessage(shaped.error),
    };
  }

  return { data: result as T, errorMessage: null };
}

// Read
export async function getManagedUsersAction(): Promise<
  { ok: true; data: ManagedUser[] } | { ok: false; error: string }
> {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }

    const adminClient = getAdminClient();
    const result = await adminClient.listUsers({
      query: { limit: 100, sortBy: "name", sortDirection: "asc" },
    });

    const normalized = normalizeAdminResult<{
      users?: ManagedUser[];
    }>(result);

    if (normalized.errorMessage) {
      return { ok: false, error: normalized.errorMessage };
    }

    const users = normalized.data?.users ?? [];

    return { ok: true, data: users };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to retrieve managed users.",
    };
  }
}

// Update
export async function updateAccountNameAction(input: {
  name: string;
}): Promise<
  { ok: true; data: { name: string } } | { ok: false; error: string }
> {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }

    const parsed = accountNameSchema.safeParse(input);

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const { name } = parsed.data;

    const ownerDisplayName = getUserDisplayName({
      id: session.user.id,
      name,
      email: session.user.email,
    });

    // Update the user's display name in the recipes table
    await db
      .update(recipes)
      .set({ ownerDisplayName })
      .where(eq(recipes.userId, session.user.id));

    revalidatePath("/account");
    revalidatePath("/");
    revalidateTag("recipes", "max");

    return { ok: true, data: { name: ownerDisplayName } };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to update your name.",
    };
  }
}

// Delete
export async function deleteUserAction(input: {
  userId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const currentUser = await requireCurrentAdmin();

  if (input.userId === currentUser.id) {
    return { ok: false, error: "You cannot delete your own admin user." };
  }

  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }

    const parsed = deleteUserSchema.safeParse(input);

    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0].message };
    }

    const { userId } = parsed.data;
    const adminClient = getAdminClient();
    const result = await adminClient.removeUser({ userId });

    const normalized = normalizeAdminResult<{
      userId?: string;
      id?: string;
    }>(result);

    if (normalized.errorMessage) {
      return { ok: false, error: normalized.errorMessage };
    }

    revalidatePath("/account");
    revalidatePath("/");
    revalidateTag("recipes", "max");

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to delete account.",
    };
  }
}

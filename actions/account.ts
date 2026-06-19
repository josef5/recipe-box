"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getAdminClient } from "@/lib/auth/admin-client";
import { auth } from "@/lib/auth/server";
import { getUserDisplayName } from "@/lib/auth/session";
import { accountNameSchema, addUserSchema } from "@/lib/schemas/account";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

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
      user?: User;
      id?: string;
      name?: string;
      email?: string;
      role?: string | string[] | null;
      createdAt?: Date | string | number;
    }>(result);

    if (normalized.errorMessage) {
      return { ok: false, error: normalized.errorMessage };
    }

    const user = normalized.data?.user
      ? normalized.data.user
      : normalized.data &&
          typeof normalized.data === "object" &&
          "id" in normalized.data &&
          "email" in normalized.data
        ? (normalized.data as User)
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

type User = {
  id: string;
  name: string;
  email: string;
  role?: string | string[] | null;
  createdAt?: Date | string | number;
};

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

"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getAdminClient } from "@/lib/auth/admin-client";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { eq } from "drizzle-orm";

const USER_LIST_LIMIT = 200;

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
};

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function toActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    if (error.message.includes("NEXT_HTTP_ERROR_FALLBACK;403")) {
      return "You are not allowed to perform this action.";
    }

    return error.message;
  }

  return fallback;
}

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string | number;
};

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

function toManagedUser(user: {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string | number;
}): ManagedUser {
  const createdAtDate =
    user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role ?? null,
    createdAt: Number.isNaN(createdAtDate.getTime())
      ? new Date(0).toISOString()
      : createdAtDate.toISOString(),
  };
}

async function fetchManagedUsers() {
  const adminClient = getAdminClient();
  const result = await adminClient.listUsers({
    query: {
      limit: USER_LIST_LIMIT,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });
  const normalized = normalizeAdminResult<{
    users?: AdminUserRecord[];
  }>(result);

  if (normalized.errorMessage) {
    throw new Error(normalized.errorMessage);
  }

  if (!normalized.data?.users) {
    return [];
  }

  return normalized.data.users.map((user: AdminUserRecord) =>
    toManagedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role ?? null,
      createdAt: user.createdAt,
    }),
  );
}

export async function listManagedUsersAction(): Promise<
  ActionResult<ManagedUser[]>
> {
  try {
    await requireCurrentAdmin();

    const users = await fetchManagedUsers();
    return { ok: true, data: users };
  } catch (error) {
    return {
      ok: false,
      error: toActionErrorMessage(error, "Unable to list users."),
    };
  }
}

export async function createManagedUserAction(input: {
  name: string;
  email: string;
  provisionalPassword: string;
}): Promise<ActionResult<ManagedUser>> {
  try {
    await requireCurrentAdmin();

    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const provisionalPassword = input.provisionalPassword;

    if (!name) {
      return { ok: false, error: "Name is required." };
    }

    if (!email.includes("@")) {
      return { ok: false, error: "Valid email is required." };
    }

    if (provisionalPassword.length < 8) {
      return {
        ok: false,
        error: "Provisional password must be at least 8 characters.",
      };
    }

    const adminClient = getAdminClient();
    const result = await adminClient.createUser({
      name,
      email,
      password: provisionalPassword,
      role: "user",
    });
    const normalized = normalizeAdminResult<{
      user?: AdminUserRecord;
      id?: string;
      name?: string;
      email?: string;
      role?: string | null;
      createdAt?: Date | string | number;
    }>(result);

    if (normalized.errorMessage) {
      return {
        ok: false,
        error: normalized.errorMessage,
      };
    }

    const createdUser = normalized.data?.user
      ? normalized.data.user
      : normalized.data &&
          typeof normalized.data === "object" &&
          "id" in normalized.data &&
          "email" in normalized.data
        ? (normalized.data as AdminUserRecord)
        : null;

    if (!createdUser) {
      return {
        ok: false,
        error: "Unable to create user.",
      };
    }

    const user = toManagedUser({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role ?? null,
      createdAt: createdUser.createdAt,
    });

    return { ok: true, data: user };
  } catch (error) {
    return {
      ok: false,
      error: toActionErrorMessage(error, "Unable to create user."),
    };
  }
}

export async function deleteManagedUserAction(input: {
  userId: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    const currentUser = await requireCurrentAdmin();
    const userId = input.userId;

    if (!userId) {
      return { ok: false, error: "User ID is required." };
    }

    if (userId === currentUser.id) {
      return { ok: false, error: "You cannot delete your own admin user." };
    }

    const adminClient = getAdminClient();
    const result = await adminClient.removeUser({ userId });
    const normalized = normalizeAdminResult<{ success?: boolean }>(result);

    if (normalized.errorMessage) {
      return {
        ok: false,
        error: normalized.errorMessage,
      };
    }

    if (normalized.data && normalized.data.success === false) {
      return {
        ok: false,
        error: "Unable to delete user.",
      };
    }

    await db
      .update(recipes)
      .set({ userId: null })
      .where(eq(recipes.userId, userId));

    return { ok: true, data: { userId } };
  } catch (error) {
    return {
      ok: false,
      error: toActionErrorMessage(error, "Unable to delete user."),
    };
  }
}

export async function getManagedUsersForAccountPage() {
  await requireCurrentAdmin();
  return fetchManagedUsers();
}

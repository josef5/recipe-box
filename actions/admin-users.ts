"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { auth } from "@/lib/auth/server";
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

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string | number;
};

type AdminClient = {
  listUsers: (input: {
    query: {
      limit: number;
      sortBy: string;
      sortDirection: "asc" | "desc";
    };
  }) => Promise<{
    data?: { users?: AdminUserRecord[] };
    error?: { message?: string } | null;
  }>;
  createUser: (input: {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
  }) => Promise<{
    data?: { user?: AdminUserRecord };
    error?: { message?: string } | null;
  }>;
  removeUser: (input: { userId: string }) => Promise<{
    data?: { success: boolean };
    error?: { message?: string } | null;
  }>;
};

const authAdmin = auth as unknown as { admin: AdminClient };

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
  const result = await authAdmin.admin.listUsers({
    query: {
      limit: USER_LIST_LIMIT,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
  });

  if (result.error) {
    throw new Error(result.error.message ?? "Unable to list users.");
  }

  if (!result.data?.users) {
    return [];
  }

  return result.data.users.map((user: AdminUserRecord) =>
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
  await requireCurrentAdmin();

  try {
    const users = await fetchManagedUsers();
    return { ok: true, data: users };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to list users.",
    };
  }
}

export async function createManagedUserAction(input: {
  name: string;
  email: string;
  provisionalPassword: string;
}): Promise<ActionResult<ManagedUser>> {
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

  const result = await authAdmin.admin.createUser({
    name,
    email,
    password: provisionalPassword,
    role: "user",
  });

  if (result.error || !result.data?.user) {
    return {
      ok: false,
      error: result.error?.message ?? "Unable to create user.",
    };
  }

  const user = toManagedUser({
    id: result.data.user.id,
    name: result.data.user.name,
    email: result.data.user.email,
    role: result.data.user.role ?? null,
    createdAt: result.data.user.createdAt,
  });

  return { ok: true, data: user };
}

export async function deleteManagedUserAction(input: {
  userId: string;
}): Promise<ActionResult<{ userId: string }>> {
  const currentUser = await requireCurrentAdmin();
  const userId = input.userId;

  if (!userId) {
    return { ok: false, error: "User ID is required." };
  }

  if (userId === currentUser.id) {
    return { ok: false, error: "You cannot delete your own admin user." };
  }

  const result = await authAdmin.admin.removeUser({ userId });

  if (result.error) {
    return {
      ok: false,
      error: result.error.message ?? "Unable to delete user.",
    };
  }

  await db
    .update(recipes)
    .set({ userId: null })
    .where(eq(recipes.userId, userId));

  return { ok: true, data: { userId } };
}

export async function getManagedUsersForAccountPage() {
  await requireCurrentAdmin();
  return fetchManagedUsers();
}

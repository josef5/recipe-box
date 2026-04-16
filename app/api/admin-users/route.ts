import { getAdminClient } from "@/lib/auth/admin-client";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
};

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const USER_LIST_LIMIT = 200;

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

export async function GET(): Promise<
  NextResponse<ActionResult<ManagedUser[]>>
> {
  try {
    await requireCurrentAdmin();
    const adminClient = getAdminClient();

    const result = await adminClient.listUsers({
      query: {
        limit: USER_LIST_LIMIT,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    const normalized = normalizeAdminResult<{
      users?: Array<{
        id: string;
        name: string;
        email: string;
        role?: string | string[] | null;
        createdAt: Date | string | number;
      }>;
    }>(result);

    if (normalized.errorMessage) {
      return NextResponse.json(
        { ok: false, error: normalized.errorMessage },
        { status: 400 },
      );
    }

    const users = (normalized.data?.users ?? []).map((user) =>
      toManagedUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: Array.isArray(user.role) ? (user.role[0] ?? null) : user.role,
        createdAt: user.createdAt,
      }),
    );

    return NextResponse.json({ ok: true, data: users });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to list users.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ActionResult<ManagedUser>>> {
  try {
    await requireCurrentAdmin();
    const adminClient = getAdminClient();

    const body = (await request.json()) as {
      name?: string;
      email?: string;
      provisionalPassword?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const provisionalPassword = body.provisionalPassword ?? "";

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Name is required." },
        { status: 400 },
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Valid email is required." },
        { status: 400 },
      );
    }

    if (provisionalPassword.length < 8) {
      return NextResponse.json(
        {
          ok: false,
          error: "Provisional password must be at least 8 characters.",
        },
        { status: 400 },
      );
    }

    const result = await adminClient.createUser({
      name,
      email,
      password: provisionalPassword,
      role: "user",
    });

    const normalized = normalizeAdminResult<{
      user?: {
        id: string;
        name: string;
        email: string;
        role?: string | string[] | null;
        createdAt: Date | string | number;
      };
      id?: string;
      name?: string;
      email?: string;
      role?: string | string[] | null;
      createdAt?: Date | string | number;
    }>(result);

    if (normalized.errorMessage) {
      return NextResponse.json(
        { ok: false, error: normalized.errorMessage },
        { status: 400 },
      );
    }

    const user = normalized.data?.user
      ? normalized.data.user
      : normalized.data &&
          typeof normalized.data === "object" &&
          "id" in normalized.data &&
          "email" in normalized.data
        ? {
            id: String(normalized.data.id),
            name: String(normalized.data.name ?? ""),
            email: String(normalized.data.email),
            role:
              "role" in normalized.data
                ? (normalized.data.role as string | string[] | null | undefined)
                : null,
            createdAt:
              "createdAt" in normalized.data
                ? (normalized.data.createdAt as Date | string | number)
                : new Date().toISOString(),
          }
        : null;

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Unable to create user." },
        { status: 400 },
      );
    }

    const managedUser = toManagedUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: Array.isArray(user.role) ? (user.role[0] ?? null) : user.role,
      createdAt: user.createdAt,
    });

    return NextResponse.json({ ok: true, data: managedUser });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to create user.",
      },
      { status: 500 },
    );
  }
}

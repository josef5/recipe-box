import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getAdminClient } from "@/lib/auth/admin-client";
import { requireCurrentAdmin } from "@/lib/auth/session";
import { DeleteAdminUserSchema } from "@/lib/validation/admin-users";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

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

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
): Promise<NextResponse<ActionResult<{ userId: string }>>> {
  try {
    const currentUser = await requireCurrentAdmin();
    const adminClient = getAdminClient();
    const { userId: rawUserId } = await context.params;

    const parsed = DeleteAdminUserSchema.safeParse({ userId: rawUserId });
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input.",
        },
        { status: 400 },
      );
    }

    const { userId } = parsed.data;

    if (userId === currentUser.id) {
      return NextResponse.json(
        { ok: false, error: "You cannot delete your own admin user." },
        { status: 400 },
      );
    }

    const result = await adminClient.removeUser({ userId });
    const normalized = normalizeAdminResult<{ success?: boolean }>(result);

    if (normalized.errorMessage) {
      return NextResponse.json(
        { ok: false, error: normalized.errorMessage },
        { status: 400 },
      );
    }

    if (normalized.data && normalized.data.success === false) {
      return NextResponse.json(
        { ok: false, error: "Unable to delete user." },
        { status: 400 },
      );
    }

    await db
      .update(recipes)
      .set({ userId: null })
      .where(eq(recipes.userId, userId));

    return NextResponse.json({ ok: true, data: { userId } });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Unable to delete user.",
      },
      { status: 500 },
    );
  }
}

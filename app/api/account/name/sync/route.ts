import { db } from "@/db";
import { recipes } from "@/db/schema";
import { getUserDisplayName, requireCurrentUser } from "@/lib/auth/session";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const MAX_NAME_LENGTH = 100;

type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ActionResult<{ name: string }>>> {
  try {
    const user = await requireCurrentUser({ redirectTo: "/account" });
    const body = (await request.json()) as { name?: string };
    const name = body.name?.trim() ?? "";

    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Name is required." },
        { status: 400 },
      );
    }

    if (name.length > MAX_NAME_LENGTH) {
      return NextResponse.json(
        {
          ok: false,
          error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    const ownerDisplayName = getUserDisplayName({
      id: user.id,
      name,
      email: user.email,
    });

    await db
      .update(recipes)
      .set({ ownerDisplayName })
      .where(eq(recipes.userId, user.id));

    revalidatePath("/account");
    revalidatePath("/");
    revalidateTag("recipes", "max");

    return NextResponse.json({
      ok: true,
      data: { name: ownerDisplayName },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update your name.",
      },
      { status: 500 },
    );
  }
}

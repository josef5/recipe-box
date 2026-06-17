"use server";

import { db } from "@/db";
import { recipes } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { getUserDisplayName } from "@/lib/auth/session";
import { accountNameSchema } from "@/lib/schemas/account";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

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

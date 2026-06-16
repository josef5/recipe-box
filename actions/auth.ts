"use server";

import { auth } from "@/lib/auth/server";
import { changePasswordSchema } from "@/lib/schemas/auth";

type Result =
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: {
        currentPassword?: string;
        newPassword?: string;
      };
    };

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<Result> {
  try {
    // Avoid redirect-throwing helpers in server actions
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }
    // await requireCurrentUser({ redirectTo: "/account" });

    const parsed = changePasswordSchema.safeParse(input);

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
          currentPassword: fieldErrors.currentPassword,
          newPassword: fieldErrors.newPassword,
        },
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    const result = await auth.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Unable to update password.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Unable to update password.",
    };
  }
}

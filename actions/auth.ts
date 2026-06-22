"use server";

import { auth } from "@/lib/auth/server";
import { changePasswordSchema, signInSchema } from "@/lib/schemas/auth";

export async function signInAction(input: {
  email: string;
  password: string;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: { email?: string; password?: string };
    }
> {
  try {
    const parsed = signInSchema.safeParse(input);

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
          email: fieldErrors.email,
          password: fieldErrors.password,
        },
      };
    }

    const { email, password } = parsed.data;

    const result = await auth.signIn.email({
      email,
      password,
    });

    if (result.error) {
      return {
        ok: false,
        error: result.error.message ?? "Unable to sign in.",
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unable to sign in.",
    };
  }
}

export async function changePasswordAction(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<
  | { ok: true }
  | {
      ok: false;
      error?: string;
      fieldErrors?: {
        currentPassword?: string;
        newPassword?: string;
      };
    }
> {
  try {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
      return { ok: false, error: "Please sign in again." };
    }

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

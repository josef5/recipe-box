import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

const formString = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string(),
);

const emailField = formString
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
  );

const requiredPasswordField = formString.pipe(
  z.string().min(1, "Password is required."),
);

const currentPasswordField = formString.pipe(
  z.string().min(1, "Current password is required."),
);

const newPasswordField = formString.pipe(
  z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    ),
);

export const SignInSchema = z.object({
  email: emailField,
  password: requiredPasswordField,
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: newPasswordField,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

function getFirstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Invalid form submission.";
}

export function validateSignInFormData(
  formData: FormData,
): { success: true; data: SignInInput } | { success: false; error: string } {
  const result = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { success: false, error: getFirstError(result.error) };
  }

  return { success: true, data: result.data };
}

export function validateChangePasswordFormData(
  formData: FormData,
):
  | { success: true; data: ChangePasswordInput }
  | { success: false; error: string } {
  const result = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!result.success) {
    return { success: false, error: getFirstError(result.error) };
  }

  return { success: true, data: result.data };
}

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
export type SignInFieldErrors = Partial<Record<keyof SignInInput, string>>;

export const ChangePasswordSchema = z.object({
  currentPassword: currentPasswordField,
  newPassword: newPasswordField,
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type ChangePasswordFieldErrors = Partial<
  Record<keyof ChangePasswordInput, string>
>;

function getSignInFieldErrors(
  error: z.ZodError<SignInInput>,
): SignInFieldErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return {
    email: fieldErrors.email?.[0],
    password: fieldErrors.password?.[0],
  };
}

function getChangePasswordFieldErrors(
  error: z.ZodError<ChangePasswordInput>,
): ChangePasswordFieldErrors {
  const fieldErrors = error.flatten().fieldErrors;

  return {
    currentPassword: fieldErrors.currentPassword?.[0],
    newPassword: fieldErrors.newPassword?.[0],
  };
}

export function validateSignInFormData(
  formData: FormData,
):
  | { success: true; data: SignInInput }
  | { success: false; errors: SignInFieldErrors } {
  const result = SignInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { success: false, errors: getSignInFieldErrors(result.error) };
  }

  return { success: true, data: result.data };
}

export function validateChangePasswordFormData(
  formData: FormData,
):
  | { success: true; data: ChangePasswordInput }
  | { success: false; errors: ChangePasswordFieldErrors } {
  const result = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!result.success) {
    return {
      success: false,
      errors: getChangePasswordFieldErrors(result.error),
    };
  }

  return { success: true, data: result.data };
}

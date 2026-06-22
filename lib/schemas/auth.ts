import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

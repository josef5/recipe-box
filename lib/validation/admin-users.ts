import { z } from "zod";

// ---------------------------------------------------------------------------
// Create user
// ---------------------------------------------------------------------------

export const CreateAdminUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  email: z.string().trim().toLowerCase().email("Valid email is required."),
  provisionalPassword: z
    .string()
    .min(8, "Provisional password must be at least 8 characters."),
});

export type CreateAdminUserInput = z.infer<typeof CreateAdminUserSchema>;

// ---------------------------------------------------------------------------
// Delete user
// ---------------------------------------------------------------------------

export const DeleteAdminUserSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

export type DeleteAdminUserInput = z.infer<typeof DeleteAdminUserSchema>;

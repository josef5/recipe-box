import { z } from "zod";

export const accountNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(25, "Name must be 25 characters or fewer"),
});

export type AccountNameInput = z.infer<typeof accountNameSchema>;

export const addUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(25, "Name must be 25 characters or fewer"),
  email: z.email("Invalid email address"),
  provisionalPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be 20 characters or fewer"),
});

export type AddUserInput = z.infer<typeof addUserSchema>;

export const deleteUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

import { z } from "zod";

export const accountNameSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(25, "Name must be 25 characters or fewer"),
});

export type AccountNameInput = z.infer<typeof accountNameSchema>;

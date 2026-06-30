import { z } from "zod";

export const recipeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z
    .string()
    .max(100, "Description is too long.")
    .trim()
    .optional(),
  servings: z.coerce
    .number()
    .int("Servings must be a whole number.")
    .optional(),
  prepTimeMins: z.coerce
    .number()
    .int()
    .min(0, "Prep time must be 0 or more.")
    .optional(),
  cookTimeMins: z.coerce
    .number()
    .int()
    .min(0, "Cook time must be 0 or more.")
    .optional(),
  imageUrl: z.url("Invalid URL").or(z.literal("")).optional(),
  ingredients: z
    .array(
      z.object({
        name: z.string().trim().min(1, "Ingredient name is required."),
        amount: z.string().trim().optional(),
        unit: z.string().trim().optional(),
        notes: z.string().trim().optional(),
      }),
    )
    .min(1, "At least one ingredient is required."),
  steps: z
    .array(
      z.object({
        instruction: z.string().trim().min(1, "Step cannot be empty."),
        stepNumber: z
          .number()
          .int()
          .positive("Step number must be a positive integer."),
      }),
    )
    .min(1, "At least one step is required."),
});

// TODO: Refine to strictly necessary types
export type RecipeInput = z.input<typeof recipeSchema>;
export type RecipeOutput = z.output<typeof recipeSchema>;
export type RecipeInfer = z.infer<typeof recipeSchema>;

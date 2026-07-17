import { z } from "zod";

// Preprocess functions to handle empty string inputs for optional integer fields
// Better than z.coerce because it allows for empty string inputs to be treated as undefined, which is more user-friendly in forms.
const optionalIntFromInput = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.number().int().optional(),
);

// Preprocess function to handle empty string inputs for optional non-negative integer fields
const optionalNonNegativeIntFromInput = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.number().int().min(0).optional(),
);

export const recipeSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z
    .string()
    .max(100, "Description is too long.")
    .trim()
    .optional(),
  notes: z.string().trim().optional(),
  servings: optionalIntFromInput,
  prepTimeMins: optionalNonNegativeIntFromInput,
  cookTimeMins: optionalNonNegativeIntFromInput,
  imageUrl: z.url("Invalid URL").or(z.literal("")).optional(),
  imagePublicId: z.string().optional(),
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

export type RecipeInput = z.input<typeof recipeSchema>;
export type RecipeOutput = z.output<typeof recipeSchema>;

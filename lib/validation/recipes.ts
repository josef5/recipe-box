import { z } from "zod";
import {
  optionalNonNegativeInt,
  optionalPositiveInt,
  optionalString,
  optionalUrl,
} from "./common";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const RecipeRawInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: optionalString,
  notes: optionalString,
  servings: optionalPositiveInt,
  prepTimeMins: optionalNonNegativeInt,
  cookTimeMins: optionalNonNegativeInt,
  imageUrl: optionalUrl,
});

export type RecipeRawInput = z.infer<typeof RecipeRawInputSchema>;

// ---------------------------------------------------------------------------
// Action error / state shape
// ---------------------------------------------------------------------------

export type RecipeFormErrors = Partial<
  Record<keyof RecipeRawInput | "_form", string>
>;

export type RecipeFormState = { errors: RecipeFormErrors } | null;

// ---------------------------------------------------------------------------
// Helper: extract + validate (no DB side effects)
// ---------------------------------------------------------------------------

export function validateRecipeFormData(
  formData: FormData,
):
  | { success: true; data: RecipeRawInput }
  | { success: false; errors: RecipeFormErrors } {
  const result = RecipeRawInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    notes: formData.get("notes"),
    servings: formData.get("servings"),
    prepTimeMins: formData.get("prepTimeMins"),
    cookTimeMins: formData.get("cookTimeMins"),
    imageUrl: formData.get("imageUrl"),
  });

  if (!result.success) {
    const errors: RecipeFormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof RecipeRawInput;
      if (key && !errors[key]) {
        errors[key] = issue.message;
      }
    }
    return { success: false, errors };
  }

  return { success: true, data: result.data };
}

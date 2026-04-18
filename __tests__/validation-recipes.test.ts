import { describe, expect, it } from "vitest";
import { validateRecipeFormData } from "@/lib/validation/recipes";

describe("validateRecipeFormData", () => {
  it("returns title required error", () => {
    const formData = new FormData();
    formData.set("title", "   ");

    const result = validateRecipeFormData(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.title).toBe("Title is required.");
    }
  });

  it("validates URL fields", () => {
    const formData = new FormData();
    formData.set("title", "Cake");
    formData.set("sourceUrl", "not-a-url");

    const result = validateRecipeFormData(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.sourceUrl).toBe(
        "Must be a valid URL (e.g. https://example.com).",
      );
    }
  });

  it("coerces optional numeric fields", () => {
    const formData = new FormData();
    formData.set("title", "Cake");
    formData.set("servings", "8");
    formData.set("prepTimeMins", "0");

    const result = validateRecipeFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.servings).toBe(8);
      expect(result.data.prepTimeMins).toBe(0);
    }
  });
});

import { z } from "zod";

/**
 * Coerces empty string / null / undefined → undefined, then validates as a
 * positive whole number (> 0).  Accepts numeric strings from <input type="number">.
 */
export const optionalPositiveInt = z.preprocess(
  (val) => (val === "" || val == null ? undefined : Number(val)),
  z.number().int().positive("Must be a positive whole number.").optional(),
);

/**
 * Coerces empty string / null / undefined → undefined, then validates as a
 * non-negative whole number (≥ 0).  Used for time fields where 0 is valid.
 */
export const optionalNonNegativeInt = z.preprocess(
  (val) => (val === "" || val == null ? undefined : Number(val)),
  z.number().int().min(0, "Must be 0 or more.").optional(),
);

/**
 * Coerces empty string / null / undefined → undefined, then validates the
 * value is a well-formed URL.
 */
export const optionalUrl = z.preprocess(
  (val) => (val === "" || val == null ? undefined : val),
  z.string().url("Must be a valid URL (e.g. https://example.com).").optional(),
);

/**
 * Trims the input and coerces empty string / null / undefined → undefined.
 */
export const optionalString = z.preprocess(
  (val) => (typeof val === "string" ? val.trim() || undefined : undefined),
  z.string().optional(),
);

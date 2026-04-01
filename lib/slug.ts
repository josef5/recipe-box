import slugify from "slugify";
import { db } from "@/db";

export async function generateSlug(title: string): Promise<string> {
  const base = slugify(title, { lower: true, strict: true });

  const existing = await db.query.recipes.findFirst({
    where: (recipes, { eq }) => eq(recipes.slug, base),
  });

  if (!existing) return base;

  // Append a random 4-char suffix if slug already exists
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

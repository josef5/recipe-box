ALTER TABLE "recipes" ADD COLUMN "slug" text;

UPDATE "recipes"
SET "slug" = lower(regexp_replace(trim("title"), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

UPDATE "recipes"
SET "slug" = trim(both '-' from "slug")
WHERE "slug" IS NOT NULL;

UPDATE "recipes"
SET "slug" = 'recipe-' || substring("id"::text, 1, 8)
WHERE "slug" IS NULL OR "slug" = '';

WITH duplicates AS (
  SELECT
    id,
    slug,
    row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
  FROM recipes
)
UPDATE recipes
SET slug = recipes.slug || '-' || substring(recipes.id::text, 1, 4)
FROM duplicates
WHERE recipes.id = duplicates.id
  AND duplicates.rn > 1;

ALTER TABLE "recipes" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_slug_unique" UNIQUE("slug");

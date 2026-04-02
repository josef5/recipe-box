# Recipe Box — Progress Notes

## Stack

- **Framework:** Next.js 16 (app router, TypeScript)
- **Database:** Neon (serverless Postgres)
- **ORM:** Drizzle
- **Auth:** Neon Auth (Better Auth)
- **Hosting:** Vercel (planned)
- **Package manager:** pnpm

---

## Completed

### Database & schema

- Four tables: `recipes`, `ingredients`, `recipe_ingredients` (join), `steps`
- `recipes` has a `slug` column — unique, non-null, derived from title
- `recipe_ingredients` stores per-recipe amount, unit, notes, sort_order
- `steps` ordered by `step_number`
- Migrations in `/drizzle`; run with `pnpm db:migrate`

### Slug migration

- Added `slug` to schema (`db/schema.ts`)
- Migration `0001_recipe_slug.sql` backfills existing rows using title → slug transformation, handles duplicates, then enforces `NOT NULL` + `UNIQUE`
- Seed script (`scripts/seed.ts`) generates slugs via `generateSlug()` on insert

### Slug helper (`lib/slug.ts`)

- Uses `slugify` for base slug from title
- Appends a random 4-char suffix if slug already taken

### Server actions (`actions/recipes.ts`)

- `getRecipes()` — all recipes ordered by created date
- `getRecipe(id)` — single recipe by id (used internally by writes)
- `getRecipeBySlug(slug)` — single recipe by slug with ingredients and steps
- `getIngredients()` — all global ingredients ordered alphabetically
- `createRecipe(data)` — inserts recipe + ingredients + steps; generates slug
- `createRecipeFromForm(formData)` — parses FormData, calls createRecipe, redirects to slug page
- `updateRecipe(id, data)` — updates recipe; regenerates slug if title changes; deletes and re-inserts ingredients and steps
- `updateRecipeFromForm(id, formData)` — parses FormData, calls updateRecipe, redirects to slug page
- `deleteRecipe(id)` — deletes recipe

### Routing

- `app/page.tsx` — recipe list (server component)
- `app/recipes/[slug]/page.tsx` — recipe detail
- `app/recipes/[slug]/edit/page.tsx` — edit recipe form
- `app/recipes/new/page.tsx` — new recipe form
- `app/auth/sign-in/page.tsx` — sign in (email/password + Google OAuth)
- `app/api/auth/[...path]/route.ts` — auth handler proxy
- Old `[id]` route removed; no backward compatibility redirect

### Auth (`lib/auth/`)

- `server.ts` — `createNeonAuth()` with `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`
- `client.ts` — `createAuthClient()`
- `proxy.ts` (project root) — protects routes via `auth.middleware()`, redirects to `/auth/sign-in`
- Google OAuth works with Neon shared credentials in dev; needs custom credentials in prod
- Email/password sign-in implemented

### UI components

- `components/app-menu.tsx` — shared nav bar with `variant="home"` and `variant="recipe"` modes; supports `backHref`, `editHref`, `newHref` props
- `components/recipe-form.tsx` — shared add/edit form; static fields are uncontrolled, dynamic ingredient/step lists are controlled via `useState`; ingredient autocomplete via `<datalist>`; delete action now lives beside save/cancel on the edit screen only

### Forms

- New and edit pages share `RecipeForm`
- Submit calls `createRecipeFromForm` or `updateRecipeFromForm` (via `.bind`) as server actions
- `parseRecipeFormData` handles FormData → `RecipeFormData` conversion including `getOrCreateIngredient` for unknown ingredient names

### Delete recipe

- `deleteRecipeFromForm(id)` server action — calls `deleteRecipe(id)` then redirects to `/`
- Delete action is available from the edit page only and is rendered alongside Save / Cancel in `RecipeForm`

---

## Todo

### Next up

- [ ] **Search** — filter on the list page (search params + server-side query)

### Remaining backlog

- [ ] **Styling pass** — consistent layout, typography, spacing across all pages
- [ ] **Image uploads** — Vercel Blob integration, image field on recipe form
- [ ] **Expanded auth** — confirm email/password + Google OAuth work end-to-end in prod
- [ ] **Deployment** — Vercel, production environment variables, custom Google OAuth credentials

---

## Environment variables required

```
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
```

## Package scripts

```
pnpm dev            # start dev server
pnpm build          # production build
pnpm lint           # eslint
pnpm db:generate    # generate Drizzle migration from schema diff
pnpm db:migrate     # apply migrations to database
pnpm db:studio      # open Drizzle Studio
pnpm db:seed        # seed database with placeholder recipes
```

---

## Notes / decisions

- Writes use UUID `id` internally; all user-facing navigation uses `slug`
- No legacy `/recipes/:id` redirect — old ID links will 404
- `RecipeForm` uses a hybrid controlled/uncontrolled approach: static fields use `defaultValue` (uncontrolled), dynamic ingredient and step lists use `useState` (controlled). This is intentional — server actions receive `FormData` natively so uncontrolled is the natural fit for stable fields, but dynamic list rows need React state to add/remove entries
- Unknown ingredient names typed into the form are automatically created as global ingredients on submit
- `generateSlug` only generates a new slug on `updateRecipe` when the title has changed, to preserve stable URLs

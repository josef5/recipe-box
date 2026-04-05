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
- `recipes` has an optional `userId` owner field for authorization
- `recipes` stores optional `ownerDisplayName` for public owner display without auth lookups
- `recipe_ingredients` stores per-recipe amount, unit, notes, sort_order
- `steps` ordered by `step_number`
- Migrations in `/drizzle`; run with `pnpm db:migrate`

### Slug migration

- Added `slug` to schema (`db/schema.ts`)
- Migration `0001_recipe_slug.sql` backfills existing rows using title → slug transformation, handles duplicates, then enforces `NOT NULL` + `UNIQUE`
- Seed script (`scripts/seed.ts`) generates slugs via `generateSlug()` on insert
- Seed script supports optional `SEED_USER_ID` to assign ownership to dummy recipes without deleting them

### Slug helper (`lib/slug.ts`)

- Uses `slugify` for base slug from title
- Appends a random 4-char suffix if slug already taken

### Search

- Home page supports basic search via `q` query param
- Search filters recipes by `title` and `description`

### Server actions (`actions/recipes.ts`)

- `getRecipes()` — all recipes ordered by created date
- `getRecipe(id)` — single recipe by id (used internally by writes)
- `getRecipeBySlug(slug)` — single recipe by slug with ingredients and steps
- `getIngredients()` — all global ingredients ordered alphabetically
- `createRecipe(data)` — requires sign-in; inserts recipe + ingredients + steps; generates slug; stores owner
- `createRecipeFromForm(formData)` — parses FormData, calls createRecipe, redirects to slug page
- `updateRecipe(id, data)` — only owner can update; regenerates slug if title changes; deletes and re-inserts ingredients and steps
- `updateRecipeFromForm(id, formData)` — parses FormData, calls updateRecipe, redirects to slug page
- `deleteRecipe(id)` — only owner can delete

### Public recipe reads (`lib/recipes.ts`)

- `getPublicRecipes(query?)` — cached public recipe list for the home page
- `getPublicRecipeBySlug(slug)` — cached public recipe detail for recipe pages
- `getRecipeSlugs()` — cached slug list used by `generateStaticParams()`
- Public recipe reads are tagged with `recipes` and revalidated after create/update/delete

### Routing

- `app/page.tsx` — recipe list (server component)
- `app/account/page.tsx` — protected account page with profile summary and basic account actions
- `app/recipes/[slug]/page.tsx` — recipe detail; static/SSG with `generateStaticParams()` and revalidation
- `app/recipes/[slug]/edit/page.tsx` — edit recipe route; owner only; renders as a modal-style overlay over the recipe page
- `app/recipes/new/page.tsx` — new recipe route; sign-in required; renders as a modal-style overlay over the home page
- `app/auth/sign-in/page.tsx` — sign in (email/password + Google OAuth)
- `app/auth/sign-up/page.tsx` — sign up (name, email/password + Google OAuth)
- `app/api/auth/[...path]/route.ts` — auth handler proxy
- Old `[id]` route removed; no backward compatibility redirect

### Auth (`lib/auth/`)

- `server.ts` — `createNeonAuth()` with `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`
- `client.ts` — `createAuthClient()`
- `session.ts` — helpers to read the current signed-in user in server components and actions
- `proxy.ts` (project root) — protects routes via `auth.middleware()`, redirects to `/auth/sign-in`
- Google OAuth works with Neon shared credentials in dev; needs custom credentials in prod
- Email/password sign-in/sign-up implemented
- Current signed-in user is used to gate create/edit/delete access and menu links
- Recipe owner names are denormalized onto recipes for public cached/static display
- Signed-in users have a protected `/account` page for profile details and sign-out

### UI components

- `components/app-menu.tsx` — shared nav bar for global navigation/account actions only; contextual `New Recipe` and `Edit Recipe` actions were moved closer to page content
- `components/recipe-form.tsx` — shared add/edit form; static fields are uncontrolled, dynamic ingredient/step lists are controlled via `useState`; ingredient autocomplete via `<datalist>`; delete action now lives beside save/cancel on the edit screen only
- `components/home-actions.tsx` — contextual client-side `New Recipe` trigger for signed-in users
- `components/recipe-owner-actions.tsx` — contextual client-side `Edit Recipe` trigger for the recipe owner only
- `components/home-page-content.tsx` — shared home page content used by `/` and the new-recipe modal route
- `components/recipe-detail.tsx` — shared recipe detail content used by the detail page and the edit modal route
- `components/modal-shell.tsx` — reusable modal overlay shell
- `components/history-back-button.tsx` — close/cancel helper with back-or-fallback navigation behavior

### Forms

- New and edit pages share `RecipeForm`
- Submit calls `createRecipeFromForm` or `updateRecipeFromForm` (via `.bind`) as server actions
- `parseRecipeFormData` handles FormData → `RecipeFormData` conversion including `getOrCreateIngredient` for unknown ingredient names

### Delete recipe

- `deleteRecipeFromForm(id)` server action — calls `deleteRecipe(id)` then redirects to `/`
- Delete action is available from the edit page only and is rendered alongside Save / Cancel in `RecipeForm`

### Ownership & authorization

- Recipes are publicly viewable
- New recipe creation requires a signed-in user
- Only the recipe owner can edit or delete a recipe
- Home page only shows contextual `New Recipe` when a current user is present
- Detail page only shows contextual `Edit Recipe` for the owner
- Existing older recipes may remain unowned until recreated or backfilled
- Live database schema was repaired to ensure `recipes.user_id` exists after migration drift

### Static pages + modal behavior

- Public recipe detail pages are now static/SSG with revalidation
- `New Recipe` and `Edit Recipe` use dedicated routes that render as modal-style overlays
- Modal close/cancel uses browser back when appropriate and falls back to the canonical page URL
- Modal triggers use client navigation with `scroll={false}` for a smoother overlay experience

---

## Todo

### Next up

- [ ] **Auth/ownership verification** — verify sign-in/sign-up flows and confirm create/edit/delete ownership behavior end-to-end, including modal entry/close flows

### Remaining backlog

- [ ] **Styling pass** — consistent layout, typography, spacing across all pages
- [ ] **Modal polish** — refine overlay spacing, backdrop, focus management, and transitions
- [ ] **Image uploads** — Vercel Blob integration, image field on recipe form
- [ ] **Expanded auth** — confirm email/password + Google OAuth work end-to-end in prod
- [ ] **Account UX polish** — refine the account page layout and decide which settings should be promoted into first-class app flows
- [ ] **Deployment** — Vercel, production environment variables, custom Google OAuth credentials

---

## Environment variables required

```
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
SEED_USER_ID=    # optional, used only when seeding owned dummy recipes
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
- Recipes are publicly viewable; only signed-in users can create recipes, and only the owner can edit or delete them
- The menu handles only global navigation; contextual recipe actions live near page content in client components
- No legacy `/recipes/:id` redirect — old ID links will 404
- `RecipeForm` uses a hybrid controlled/uncontrolled approach: static fields use `defaultValue` (uncontrolled), dynamic ingredient and step lists use `useState` (controlled). This is intentional — server actions receive `FormData` natively so uncontrolled is the natural fit for stable fields, but dynamic list rows need React state to add/remove entries
- Unknown ingredient names typed into the form are automatically created as global ingredients on submit
- `generateSlug` only generates a new slug on `updateRecipe` when the title has changed, to preserve stable URLs
- Recipe detail pages use cached public reads and static regeneration; create/edit remain dynamic authenticated routes
- New/edit are implemented as always-modal route presentations rather than Next intercepted-route modals

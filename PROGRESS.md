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
- `recipes` stores optional `imagePublicId` for Cloudinary asset lifecycle management
- `recipe_ingredients` stores per-recipe amount, unit, notes, sort_order
- `steps` ordered by `step_number`
- Migrations in `/drizzle`; run with `pnpm db:migrate`

### Slug migration

- Added `slug` to schema (`db/schema.ts`)
- Migration `0001_recipe_slug.sql` backfills existing rows using title → slug transformation, handles duplicates, then enforces `NOT NULL` + `UNIQUE`
- Seed script (`scripts/seed.ts`) generates slugs via `generateSlug()` on insert
- Seed script supports optional `SEED_USER_ID` to assign ownership to dummy recipes without deleting them

### Cloudinary image integration

- Added signed upload endpoint at `app/api/cloudinary/signature/route.ts`
- Added Cloudinary helpers in `lib/cloudinary.ts` for upload signing and asset deletion
- Recipe form supports Cloudinary upload + preview while still allowing manual external image URLs
- Public recipe list and detail pages render images via `next/image`
- Recipe updates/deletes clean up prior Cloudinary assets when `imagePublicId` changes or recipe is removed
- Migration `0004_conscious_the_professor.sql` adds `recipes.image_public_id`

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
- `app/account/page.tsx` — protected account page with profile summary, password change flow, and admin-only user management section
- `app/api/admin-users/route.ts` — admin-only JSON API for listing and creating managed users
- `app/api/admin-users/[userId]/route.ts` — admin-only JSON API for deleting managed users
- `app/recipes/[slug]/page.tsx` — recipe detail; static/SSG with `generateStaticParams()` and revalidation
- `app/recipes/[slug]/edit/page.tsx` — edit recipe route; owner only; dedicated full-page route
- `app/recipes/new/page.tsx` — new recipe route; sign-in required; dedicated full-page route
- `app/auth/sign-in/page.tsx` — sign in (email/password)
- `app/api/auth/[...path]/route.ts` — auth handler proxy
- Old `[id]` route removed; no backward compatibility redirect

### Auth (`lib/auth/`)

- `server.ts` — `createNeonAuth()` with `NEON_AUTH_BASE_URL` and `NEON_AUTH_COOKIE_SECRET`
- `client.ts` — `createAuthClient()`
- `session.ts` — helpers to read the current signed-in user in server components and actions, including admin-role checks and optional `redirectTo` support in auth guards
- `proxy.ts` (project root) — protects routes via `auth.middleware()`, redirects to `/auth/sign-in`, and appends `redirectTo` for protected-route return navigation
- Email/password sign-in implemented
- Current signed-in user is used to gate create/edit/delete access and menu links
- Recipe owner names are denormalized onto recipes for public cached/static display
- Signed-in users have a protected `/account` page for profile details and password changes
- Admin-role users have an account admin section for user listing, creation (provisional passwords), and deletion
- The account page server-renders the initial admin user list, while the client admin users section performs mutations and list refreshes through JSON API routes
- Deleting an auth user keeps recipe records and nulls `recipes.userId`
- Users redirected from protected routes are returned to the original path after successful sign-in

### Testing

- Sign-in coverage is consolidated in `__tests__/sign-in-page.test.tsx`
- Sign-in tests cover default callbacks, `redirectTo` callbacks, unsafe redirect fallback, and error handling
- `__tests__/admin-users-section.test.tsx` covers API-driven create, delete, create-failure, and refresh-failure flows for the admin users client section
- Image rendering and form behavior are covered in `__tests__/home-page-content.test.tsx`, `__tests__/recipe-detail.test.tsx`, and `__tests__/recipe-form.test.tsx`

### UI components

- `components/recipe-form.tsx` — shared add/edit form; static fields are uncontrolled, dynamic ingredient/step lists are controlled via `useState`; ingredient autocomplete via `<datalist>`; includes signed Cloudinary upload and image preview
- `components/home-page-content.tsx` — shared home page content used by `/`, including recipe image thumbnails
- `components/recipe-detail.tsx` — shared recipe detail content used by the detail page, including recipe image display
- `components/change-password-form.tsx` — account password update form (current + new + confirm)
- `components/admin-users-section.tsx` — admin-only account section for user management; receives server-rendered initial users and uses `/api/admin-users` for client-side create/delete/refresh

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

### Static and dynamic route behavior

- Public recipe detail pages are now static/SSG with revalidation
- `New Recipe` and `Edit Recipe` are dedicated full-page routes (not modal overlays)

---

## Todo

### Next up

- [ ] **Auth/ownership verification** — verify sign-in redirect return behavior and confirm create/edit/delete ownership behavior end-to-end
- [ ] **Cloudinary smoke test** — verify upload, replace, remove, and delete flows against real Cloudinary credentials

### Remaining backlog

- [ ] **Styling pass** — consistent layout, typography, spacing across all pages
- [ ] **Expanded auth** — decide whether to add sign-up and/or social providers, then validate end-to-end in prod
- [ ] **Account UX polish** — refine the account page layout and decide which settings should be promoted into first-class app flows
- [ ] **Deployment** — Vercel, production environment variables, custom Google OAuth credentials

---

## Environment variables required

```
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
SEED_USER_ID=    # optional, used only when seeding owned dummy recipes
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Package scripts

```
pnpm dev            # start dev server
pnpm build          # production build
pnpm lint           # eslint
pnpm test           # run Vitest suite
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
- Cloudinary integration is hybrid by design: direct signed browser uploads for image files and optional manual external URL input for compatibility
- Dates rendered in client/SSR UI should use stable formatting (`formatStableDate` in `lib/utils.ts`) to avoid hydration mismatches
- Admin user management is split intentionally: initial data is fetched on the server for the account page, while interactive client updates use API routes instead of direct server action transport

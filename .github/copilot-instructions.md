# Copilot instructions for Recipe Box

## Stack and architecture

- This app uses Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Neon Postgres, and Neon Auth. Treat Next 16 APIs as authoritative; read `node_modules/next/dist/docs/` before changing framework-level behavior.
- Public cached reads live in `lib/recipes.ts`; writes, authenticated mutations, and uncached data-fetching for authenticated pages (`getRecipes`, `getRecipe`, `getRecipeBySlug`, `getIngredients`) live in `actions/recipes.ts` as server actions.
- Route structure is intentional: `/` renders the recipe list, `/recipes/[slug]` is the canonical detail page, and `/recipes/new` plus `/recipes/[slug]/edit` are dedicated standalone full-page routes (not intercepted routes, not modal-style with a blurred background).
- The create/edit pages render `RecipeForm` directly inside a `<main>` wrapper — there is no `ModalShell` component.

## Data model and ownership

- `db/schema.ts` defines four tables: `recipes`, `ingredients`, `recipe_ingredients`, and `steps`.
- User-facing navigation uses `recipes.slug`; UUID `id` is internal only. Do not introduce new `/recipes/[id]` links.
- Ownership is split intentionally: `recipes.userId` is for authorization checks, while `recipes.ownerDisplayName` is denormalized for public UI display.
- Ingredient names typed into the form can create global ingredients on submit via `getOrCreateIngredientId()` in `actions/recipes.ts`.
- `updateRecipe()` only regenerates the slug when the title changes; preserve this behavior so existing URLs stay stable.

## Auth and route protection

- Auth helpers are in `lib/auth/session.ts`. Use `requireCurrentUser()` / `requireCurrentUserId()` for authenticated routes and writes.
- `proxy.ts` currently protects `/account` only. Create/edit access is enforced inside route code and server actions, not globally in middleware.
- When you need a public owner label, use `getUserDisplayName()` and persist it onto `recipes.ownerDisplayName` rather than querying auth at render time.
- Admin user management is split intentionally: the `/account` page server-renders the initial managed user list with `getManagedUsersForAccountPage()`, while the client admin users section performs create/delete/refresh through `/api/admin-users` JSON routes. Do not call `fetchManagedUsers()` from client code.

## UI and form conventions

- `components/recipe-form.tsx` is a hybrid form by design: stable scalar fields use uncontrolled inputs with `defaultValue`, while dynamic ingredient and step lists use client state.
- `RecipeForm` accepts an `ingredientSuggestions` prop (array of `{ name, defaultUnit }` from `getIngredients()`) for autocomplete. Ingredient fields are free-text name inputs; `getOrCreateIngredientId()` resolves names to IDs server-side on submit.
- Cancel behavior is handled inside `RecipeForm` via `HistoryBackButton` using the `cancelHref` prop passed from the page. There is no `ModalShell` wrapper.

## Caching and rendering

- `lib/recipes.ts` uses `unstable_cache` for public recipe list/detail/slug reads with the `recipes` tag.
- Any write that changes public recipe data should continue to call `revalidatePath()` and `revalidateTag("recipes", "max")` as in `actions/recipes.ts`.
- Recipe detail pages are intentionally static (`app/recipes/[slug]/page.tsx` uses `dynamic = "force-static"`, `generateStaticParams()`, and `revalidate = 300`), while create/edit routes use `dynamic = "force-dynamic"`.

## Workflows

- Use `pnpm dev`, `pnpm test`, `pnpm lint`, `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:seed`.
- Drizzle loads `.env.local` through `drizzle.config.ts`; schema changes are not complete until the matching SQL migration has been applied to the same `DATABASE_URL`.
- If you change schema fields used in reads, verify both the migration files in `drizzle/` and the live database state.

## Testing patterns

- Tests use Vitest + Testing Library in jsdom. See `vitest.config.mts` and `test/setup.ts`.
- `next/link` is mocked globally in `test/setup.ts`; component tests should assert on rendered anchors, not Next internals.
- Favor component-level tests in `__tests__/` that match the existing style (simple render + visible text/attributes assertions).

## Additional project context

- For current project status, known gaps, and pending work, consult `PROGRESS.md`.
- Treat `PROGRESS.md` as informational context only. If it conflicts with this file, follow this file.
- Prefer nullish coalescing `??` over logical OR `||` when falling back on `null` or `undefined`. Use `||` only when intentionally treating falsy values (e.g. `0`, `""`) as fallbacks.

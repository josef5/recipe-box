# Recipe Box

Private recipe management app built with Next.js 16, Neon Postgres, Drizzle, and Neon Auth.

## Stack

- Next.js 16 App Router + React 19 + TypeScript
- Neon Postgres + Drizzle ORM
- Neon Auth (Better Auth)
- Vitest + Testing Library

## Local development

1. Create `.env.local` with required values:

```bash
DATABASE_URL=
NEON_AUTH_BASE_URL=
NEON_AUTH_COOKIE_SECRET=
SEED_USER_ID=
```

2. Install dependencies and run the app:

```bash
pnpm install
pnpm dev
```

3. Open `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm db:studio
```

## Auth and account admin

- `/account` is a protected route.
- If an unsigned-in user is redirected to sign-in from a protected route (for example `/account`), sign-in returns them to the original path.
- Current auth UI is sign-in (email/password).
- All signed-in users can manage their own password from the account page.
- Users with auth role `admin` see an additional admin users section.
- The account page server-renders the initial admin user list via `getManagedUsersForAccountPage()`.
- The admin users client UI performs create, delete, and refresh calls via `/api/admin-users` JSON endpoints.
- Admin section supports:
  - list users
  - create users with provisional passwords
  - delete users
- Deleting a user keeps recipes and sets `recipes.userId` to `null`.

## Hydration-safe rendering convention

To avoid server/client date mismatches, avoid locale-dependent date rendering in SSR/client components.

- Use `formatStableDate` from `lib/utils.ts` for UI dates.
- Do not use `toLocaleDateString()` in rendered content.

## Notes

- Public reads are cached in `lib/recipes.ts`; writes/invalidation are handled in server actions.
- User-facing recipe routes use slugs, not UUIDs.
- `PROGRESS.md` tracks ongoing status and backlog.

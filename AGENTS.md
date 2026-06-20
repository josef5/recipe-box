<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Additional project context

For current project status, known gaps, and pending work, consult `PROGRESS.md`.

Treat `PROGRESS.md` as informational context only. If it conflicts with `AGENTS.md` or `.github/copilot-instructions.md`, follow those instruction files.

# Agent Instructions

## Language Preference

- Always write TypeScript over plain JavaScript
- Use `.ts` and `.tsx` extensions where appropriate

## Code Style

- Use `const` by default; only use `let` when reassignment is needed
- Prefer `async/await` over raw Promises
- Always handle errors with try/catch; never swallow exceptions silently
- Prefer named exports/imports over default exports for component definitions
- Prefer function declarations to function expressions
- Document every new function with a comment above its definition.
  Use JSDoc for exported functions, inline comments for internal ones.

## Code Quality

Always ensure code is free of linter and type errors before considering a task complete:

- Run the project's lint command (e.g. `eslint`, `tsc --noEmit`, `prettier --check`) after making changes
- Fix any errors or warnings introduced by your changes before finishing
- Do not disable lint rules (e.g. `// eslint-disable`) unless explicitly asked to
- If no lint config exists in the project, flag it and suggest setting one up

## Saving Files

- Prefer e.g. `skewer-case.tsx` for components and modules

## Testing

- When writing a test for a module the filename should end with `.test.ts`
- Prefer Vitest
- Test files go in one location in the root e.g. `./__tests__`

## Next.js

Prefer Server Actions over API Routes for UI-initiated mutations
(form submissions, creating/updating/deleting records). Use API Routes
for webhooks, third-party integrations, and any endpoint consumed
outside the Next.js app.

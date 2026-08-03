# Phase 02 Deferred Items

## 02-01 npm audit advisories

- `npm audit --json` reports 5 moderate advisories after installing the exact Phase 02 package set.
- `next` / bundled `postcss` advisories are inherited from the existing Next.js 16.2.9 stack.
- `prisma` / `@prisma/dev` / `@hono/node-server` advisories come through the required `prisma@7.8.0` CLI path.
- `npm audit` only offers fixes that would downgrade or otherwise violate the exact version constraints in `02-01-PLAN.md`, so this was not auto-fixed during plan execution.

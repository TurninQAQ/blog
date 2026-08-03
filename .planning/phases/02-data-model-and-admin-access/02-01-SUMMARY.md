---
phase: 02-data-model-and-admin-access
plan: "01"
subsystem: database-auth-foundation
tags: [prisma, postgresql, argon2, single-admin, generated-client]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Verified Next.js 16 public shell, Playwright setup, and module/layout conventions
provides:
  - Exact Prisma/PostgreSQL/Argon2 package setup with ESM mode and local scripts
  - Prisma schema for content taxonomy, publication status, and single-admin sessions
  - Generated Prisma 7 client under src/generated/prisma
  - Server-side Prisma helper, auth env parser, password hash helper, and admin bootstrap tooling
  - Applied PostgreSQL migration plus verified single-admin bootstrap evidence
affects: [phase-02-admin-login, phase-02-mutation-guards, phase-03-authoring-workflow]

tech-stack:
  added: [@prisma/client@7.8.0, @prisma/adapter-pg@7.8.0, pg@8.22.0, zod@4.4.3, @node-rs/argon2@2.0.2, prisma@7.8.0, @types/pg@8.20.0, tsx@4.22.4]
  patterns:
    - Prisma 7 config file plus prisma-client generator output to src/generated/prisma
    - Custom single-admin AdminUser/AdminSession models instead of NextAuth/Auth.js adapter models
    - Local-only .env.local secret flow with fail-closed zod parsing
    - TDD contract test for data/auth foundation invariants

key-files:
  created:
    - .env.example
    - prisma.config.ts
    - prisma/schema.prisma
    - scripts/bootstrap-admin.ts
    - scripts/generate-admin-password-hash.ts
    - src/generated/prisma/
    - src/lib/auth/env.ts
    - src/lib/auth/password.ts
    - src/lib/db/prisma.ts
    - src/tests/e2e/data-model-foundation.spec.ts
    - .planning/phases/02-data-model-and-admin-access/deferred-items.md
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Preserved D-17 by adding no next-auth or @auth/prisma-adapter package and modeling AdminUser/AdminSession directly."
  - "Kept .env.example blank-valued so DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET, and PLAYWRIGHT_ADMIN_PASSWORD stay local-only."
  - "Used named numeric Argon2 option constants because @node-rs/argon2 exposes ambient const enums that cannot be referenced under isolatedModules."
  - "Created a local PostgreSQL dev database and ignored .env.local to complete migration/admin bootstrap verification."

patterns-established:
  - "Prisma client imports use @/generated/prisma/client rather than @prisma/client."
  - "Admin bootstrap upserts only ADMIN_EMAIL and deletes any non-allowlisted AdminUser rows."
  - "Password hash generation prints an Argon2id hash for local .env.local use and does not write plaintext or hash secrets to tracked files."

requirements-completed: [AUTH-01, AUTH-04]

coverage:
  - id: D1
    description: Prisma/PostgreSQL schema and generated client exist for posts, tags, categories, series, publication status, AdminUser, and AdminSession.
    requirement: AUTH-04
    verification:
      - kind: other
        ref: "npm run db:validate"
        status: pass
      - kind: other
        ref: "npm run db:generate"
        status: pass
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/data-model-foundation.spec.ts --project=desktop"
        status: pass
    human_judgment: false
  - id: D2
    description: Exact package/script setup is in ESM mode and excludes next-auth plus @auth/prisma-adapter.
    requirement: AUTH-04
    verification:
      - kind: other
        ref: "Task 2 package scan node --input-type=module"
        status: pass
      - kind: other
        ref: "rg forbidden dependency/import scan"
        status: pass
    human_judgment: false
  - id: D3
    description: Local admin hash/bootstrap tooling exists and real bootstrap leaves exactly one ADMIN_EMAIL admin row.
    requirement: AUTH-01
    verification:
      - kind: other
        ref: "npm run admin:hash-password -- phase-2-smoke-password"
        status: pass
      - kind: integration
        ref: "npm run db:migrate -- --name init_content_admin && npm run admin:bootstrap twice"
        status: pass
      - kind: integration
        ref: "AdminUser count check for ADMIN_EMAIL and total admins"
        status: pass
    human_judgment: false
    rationale: "A local PostgreSQL database and ignored .env.local were created after the initial fallback, then migration, double bootstrap, and count checks passed."

duration: 13min
completed: 2026-07-03
status: complete
---

# Phase 02 Plan 01: Data Model and Admin Access Foundation Summary

**Prisma/PostgreSQL content and single-admin schema with generated client, Argon2 password tooling, applied migration, and verified local admin bootstrap.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-07-03T01:43:32Z
- **Completed:** 2026-07-03T01:56:50Z
- **Tasks:** 3
- **Files modified:** 27 implementation/test/config files plus 1 phase deferred-items file

## Accomplishments

- Installed the exact approved Prisma/PostgreSQL/Zod/Argon2/tsx package set and enabled explicit ESM mode.
- Added Prisma 7 config, content taxonomy models, publication status, AdminUser, and token-hash AdminSession persistence.
- Generated Prisma Client to `src/generated/prisma` and added a PrismaPg-backed helper importing from `@/generated/prisma/client`.
- Added fail-closed auth/database env parsing, Argon2id hash/verify helpers, local hash generation, and idempotent single-admin bootstrap script.
- Added a Playwright contract test that proves package pins, forbidden dependency exclusions, schema shape, and secret-boundary files.
- Applied the initial PostgreSQL migration against a local dev database and verified the bootstrap script leaves exactly one `ADMIN_EMAIL` admin row.

## Task Commits

Each task with file changes was committed atomically:

1. **Task 1: Verify package metadata before install** - no implementation commit; user approved checkpoint before this continuation.
2. **Task 2 RED: Data foundation contract test** - `d0181c6` (test)
3. **Task 2 GREEN: Prisma/admin data foundation** - `a790f6d` (feat)
4. **Task 3: Apply schema/generate/bootstrap gate** - migration file added after local PostgreSQL/.env setup; `npm run db:migrate`, `npm run db:generate`, double `npm run admin:bootstrap`, and AdminUser count check passed.

## Files Created/Modified

- `package.json` - Adds `"type": "module"`, exact dependency pins, and database/admin scripts.
- `package-lock.json` - Locks the exact approved install set.
- `prisma.config.ts` - Prisma 7 config for schema path, migration path, and PostgreSQL datasource URL.
- `prisma/schema.prisma` - Defines `PublicationStatus`, `AdminUser`, `AdminSession`, `Post`, `Tag`, `Category`, `Series`, and `PostTag`.
- `src/generated/prisma/` - Generated Prisma 7 client output.
- `src/lib/db/prisma.ts` - PrismaPg-backed singleton using the generated client import boundary.
- `src/lib/auth/env.ts` - zod-based fail-closed parser for database/admin env.
- `src/lib/auth/password.ts` - Argon2id hash and verify helpers.
- `scripts/generate-admin-password-hash.ts` - Prints a local admin password hash.
- `scripts/bootstrap-admin.ts` - Upserts the `ADMIN_EMAIL` AdminUser and removes non-allowlisted admin rows.
- `.env.example` - Lists required local env keys with blank values only.
- `src/tests/e2e/data-model-foundation.spec.ts` - TDD contract coverage for the data/auth foundation.
- `.planning/phases/02-data-model-and-admin-access/deferred-items.md` - Records npm audit advisories that could not be auto-fixed without violating exact version constraints.
- `prisma/migrations/20260703020348_init_content_admin/migration.sql` - Initial PostgreSQL migration for the Phase 2 schema.
- `prisma/migrations/migration_lock.toml` - Prisma migration provider lock.

## Verification

- `npx playwright test src/tests/e2e/data-model-foundation.spec.ts --project=desktop` - RED failed before implementation, then passed 3/3 after implementation.
- `npm run lint` - passed.
- `npm run build` - passed.
- `npm run db:validate` - passed; `.env.local` was absent, Prisma used config fallback for schema validation.
- `npm run db:generate` - passed and generated Prisma Client 7.8.0 under `src/generated/prisma`.
- `npm run admin:hash-password -- "phase-2-smoke-password"` - passed and printed an Argon2id hash.
- `npx playwright test src/tests/e2e/public-shell.spec.ts --project=desktop` - passed 11/11.
- Forbidden dependency scan for `next-auth` and `@auth/prisma-adapter` - passed.
- `npm run db:migrate -- --name init_content_admin` - passed after local PostgreSQL setup and created `prisma/migrations/20260703020348_init_content_admin/migration.sql`.
- `npm run admin:bootstrap` twice - passed and returned `removedExtraAdmins: 0`.
- AdminUser count check - passed with `{"email":"zhdydkdh@163.com","byEmail":1,"total":1}`.

## Decisions Made

- Used the custom Prisma-backed AdminUser/AdminSession foundation required by D-17 instead of adding Auth.js/NextAuth packages.
- Stored only session token hashes in `AdminSession`; plaintext session tokens are not modeled.
- Kept admin password hash as an env secret parsed by `getAuthEnv()` rather than writing any hash value into tracked files.
- Preserved exact package versions even though npm audit recommends fixes that would violate the plan's pinned version set.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Argon2 isolatedModules build failure**
- **Found during:** Task 2 full verification
- **Issue:** `next build` failed because `@node-rs/argon2` exposes ambient const enums, and this project has `isolatedModules` enabled.
- **Fix:** Replaced direct enum-member references with named numeric constants typed through `Options`.
- **Files modified:** `src/lib/auth/password.ts`
- **Verification:** Re-ran the full Task 2 verification string successfully.
- **Committed in:** `a790f6d`

---

**Total deviations:** 1 auto-fixed (Rule 1 bug).
**Impact on plan:** The fix was required for TypeScript/Next.js compatibility and did not change the selected Argon2id algorithm or package set.

## Issues Encountered

- **Initial PostgreSQL/admin bootstrap blocker resolved:** `.env.local` and PostgreSQL were absent during the first executor pass. A local PostgreSQL 16 database, local-only ignored `.env.local`, and generated admin secrets were added afterward; migration, generation, double bootstrap, and AdminUser count checks now pass.
- **npm audit advisories:** `npm audit --json` reports 5 moderate advisories. Existing `next`/bundled `postcss` advisories predate this plan; `prisma`/`@prisma/dev`/`@hono/node-server` advisories come from the exact required Prisma 7.8.0 CLI path. No auto-fix was applied because the available fixes would violate pinned-version constraints.
- **Generated Next route types:** `next-env.d.ts` remained modified by Next dev/build tooling (`.next/types` to `.next/dev/types`) and was intentionally not staged or committed.

## User Setup Required

Local PostgreSQL and admin secrets are available in ignored `.env.local` for development verification:

- `DATABASE_URL` in `.env.local`
- `ADMIN_EMAIL` in `.env.local`
- `ADMIN_PASSWORD_HASH` generated with `npm run admin:hash-password -- <password>` and stored in `.env.local`
- `ADMIN_SESSION_SECRET` in `.env.local`
- `PLAYWRIGHT_ADMIN_PASSWORD` in `.env.local` for later browser auth tests

The real migration/bootstrap sequence has been run against the local dev database, so Plan 02-02 can verify the database-backed login flow locally.

## Known Stubs

None. `.env.example` intentionally contains blank local-secret values and does not flow to UI rendering. The Prisma config fallback URL is only a non-secret validation fallback for absent local env.

## Threat Flags

None beyond the plan threat model. New package registry, local secret, and PostgreSQL trust boundaries were already covered by T-02-01-SC through T-02-01-04.

## Deferred Issues

- `npm audit --json` moderate advisories are recorded in `.planning/phases/02-data-model-and-admin-access/deferred-items.md` because automatic fixes would violate exact version constraints.

## Self-Check: PASSED

- Confirmed all key created/modified files exist.
- Confirmed task commits `d0181c6` and `a790f6d` exist in git history.
- Confirmed `src/generated/prisma/client.ts` exists after Prisma generate.
- Confirmed `prisma/migrations/20260703020348_init_content_admin/migration.sql` exists after real migration.
- Confirmed final verification passed for lint, build, Prisma validate/generate, data foundation Playwright contract, forbidden dependency scan, migration, double admin bootstrap, and AdminUser count check.

## Next Phase Readiness

Plan 02-02 can build against the generated Prisma client and schema contracts, and the local dev database now has the initial migration plus one bootstrapped admin row for `ADMIN_EMAIL`.

---
*Phase: 02-data-model-and-admin-access*
*Completed: 2026-07-03*

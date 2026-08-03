---
phase: 01-visual-foundation-and-public-shell
plan: 03
subsystem: skeleton
tags: [nextjs, app-router, route-handler, playwright, runtime-cache]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Next.js/Tailwind/Playwright scaffold and RED skeleton browser proof from Plan 01-02
provides:
  - Isolated `/__skeleton` browser page for local walking-skeleton verification
  - Node runtime `/api/skeleton-probe` route with GET/POST probe state contract
  - Tiny local `.next/cache/skeleton-probe.json` read/write store with no durable schema
  - GREEN Playwright proof for browser UI to API to local runtime state
affects: [phase-01-walking-skeleton, browser-verification, nextjs-dev-server]

tech-stack:
  added: []
  patterns:
    - App Router route handlers export `runtime = "nodejs"` for local filesystem access
    - Local runtime probe state is stored under `.next/cache` and kept outside durable content/auth scope
    - URL segments beginning with underscores use an encoded route wrapper because underscore app folders are private

key-files:
  created:
    - src/app/__skeleton/page.tsx
    - src/app/%5F%5Fskeleton/page.tsx
    - src/app/api/skeleton-probe/route.ts
    - src/components/skeleton/SkeletonProbeClient.tsx
    - src/lib/skeleton/probe-store.ts
  modified:
    - next.config.ts

key-decisions:
  - "Kept the walking-skeleton proof isolated from public navigation and later content/auth/admin/search/database scope."
  - "Used `.next/cache/skeleton-probe.json` for local runtime state; no schema push or migration is required."
  - "Added a `%5F%5Fskeleton` App Router wrapper so the URL `/__skeleton` works while preserving the planned private implementation file."

patterns-established:
  - "Skeleton probe API pattern: route handler returns only `status`, `count`, and `updatedAt`, with no request body, cookies, headers, env reads, or user content."
  - "Skeleton probe UI pattern: client-only control fetches the isolated API and renders the observable result in a status region."

requirements-completed: [QUAL-02, QUAL-03]

coverage:
  - id: D1
    description: Isolated walking-skeleton probe round-trips browser UI through the API into local runtime state.
    requirement: QUAL-03
    verification:
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/skeleton.spec.ts --project=desktop"
        status: pass
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: The skeleton probe introduces no Prisma schema, migrations, auth, admin, CMS, article, or search implementation.
    requirement: QUAL-02
    verification:
      - kind: other
        ref: "test ! -f prisma/schema.prisma && test ! -d prisma/migrations"
        status: pass
      - kind: other
        ref: "forbidden-scope scan across skeleton implementation files"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 03: Isolated Walking Skeleton Probe Summary

**Local Next.js walking-skeleton proof from `/__skeleton` browser UI through `/api/skeleton-probe` into a tiny runtime cache file.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-30T09:55:51Z
- **Completed:** 2026-06-30T10:02:07Z
- **Tasks:** 1
- **Files modified:** 6 implementation/config files

## Accomplishments

- Implemented `/api/skeleton-probe` with `GET` and `POST`, `runtime = "nodejs"`, and no body parsing or secret/config reads.
- Added a tiny local runtime store at `.next/cache/skeleton-probe.json` that persists only `count` and `updatedAt`.
- Added the unlisted `/__skeleton` browser probe with a single `Write probe` button and visible status result.
- Turned the Plan 01-02 RED Playwright proof GREEN without adding Prisma, migrations, auth, admin, CMS, article, or search scope.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement isolated skeleton probe** - `5b2a27a` (feat)

## Files Created/Modified

- `src/lib/skeleton/probe-store.ts` - Reads and writes the tiny local probe state under `.next/cache`.
- `src/app/api/skeleton-probe/route.ts` - Exposes isolated `GET` and `POST` handlers returning `status`, `count`, and `updatedAt`.
- `src/components/skeleton/SkeletonProbeClient.tsx` - Provides the client button and status region used by the browser proof.
- `src/app/__skeleton/page.tsx` - Holds the unlisted skeleton probe page implementation.
- `src/app/%5F%5Fskeleton/page.tsx` - Encoded App Router segment wrapper that publishes `/__skeleton`.
- `next.config.ts` - Allows `127.0.0.1` as a dev origin so Playwright can hydrate client resources.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed; route table includes `/__skeleton` and `/api/skeleton-probe`.
- `npx playwright test src/tests/e2e/skeleton.spec.ts --project=desktop` - passed, 2/2 tests.
- `test ! -f prisma/schema.prisma && test ! -d prisma/migrations` - passed.
- API export check for `GET` and `POST` in `src/app/api/skeleton-probe/route.ts` - passed.
- Public shell scan for `__skeleton`, `skeleton-probe`, and `Skeleton Probe` links/copy - passed with no matches.
- Forbidden-scope scan across skeleton implementation files for schema/auth/admin/CMS/article/search behavior - passed with no matches.

## Decisions Made

- Kept the skeleton probe unlisted; no public nav, homepage, route strip, or footer file links to it.
- Used local runtime cache storage only. No schema push, migration, Prisma client, database setup, or durable content model is required for this plan.
- Preserved the planned `src/app/__skeleton/page.tsx` source path but added the encoded `%5F%5Fskeleton` route wrapper required by Next.js for a URL segment that starts with underscores.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added encoded route wrapper for `/__skeleton`**
- **Found during:** Task 1 verification
- **Issue:** Next.js App Router treats folders beginning with `_` as private folders, so `src/app/__skeleton/page.tsx` did not appear in the build route table.
- **Fix:** Added `src/app/%5F%5Fskeleton/page.tsx` as a tiny wrapper that re-exports the planned page implementation and publishes the URL `/__skeleton`.
- **Files modified:** `src/app/%5F%5Fskeleton/page.tsx`
- **Verification:** `npm run build` route table includes `/__skeleton`; Playwright skeleton proof passed.
- **Committed in:** `5b2a27a`

**2. [Rule 3 - Blocking] Allowed Playwright dev origin for client hydration**
- **Found during:** Task 1 browser verification
- **Issue:** The API test passed, but the browser result stayed at pre-hydration text because Next dev blocked client resources from `127.0.0.1`, matching the existing Playwright base URL.
- **Fix:** Added `allowedDevOrigins: ["127.0.0.1"]` to `next.config.ts`.
- **Files modified:** `next.config.ts`
- **Verification:** `npx playwright test src/tests/e2e/skeleton.spec.ts --project=desktop` passed 2/2 tests.
- **Committed in:** `5b2a27a`

---

**Total deviations:** 2 auto-fixed (Rule 3 blocking issues).
**Impact on plan:** Both fixes were necessary to satisfy the existing RED browser proof. No product scope beyond the isolated skeleton probe was added.

## Issues Encountered

- Running `next dev` through Playwright flips tracked `next-env.d.ts` from build route types to dev route types. The generated churn was restored before staging and was not committed.
- Playwright still prints harmless `NO_COLOR` / `FORCE_COLOR` warnings from the runtime environment; they do not affect verification.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - the default probe state is real runtime fallback data for the isolated skeleton store, not a placeholder for public content.

## Threat Flags

None - the new API route and local file access are both covered by the plan threat model. The route returns only `status`, `count`, and `updatedAt`, and the store overwrites one tiny JSON object under `.next/cache`.

## Self-Check: PASSED

- Confirmed all created/modified implementation and config files exist.
- Confirmed task commit `5b2a27a` exists in git history.
- Confirmed `npm run lint` still passes after summary creation.
- Confirmed no Prisma schema or migration directory exists.

## Next Phase Readiness

Plan 01-04 can build the public shell, route config, header, mobile navigation, and footer on top of the verified Next.js scaffold. The skeleton probe remains available for local full-stack smoke checks but is not linked from public surfaces.

---
*Phase: 01-visual-foundation-and-public-shell*
*Completed: 2026-06-30*

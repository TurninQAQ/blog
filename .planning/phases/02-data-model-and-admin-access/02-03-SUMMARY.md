---
phase: 02-data-model-and-admin-access
plan: "03"
subsystem: admin-auth
tags: [nextjs, route-handlers, prisma, playwright, single-admin]

requires:
  - phase: 02-data-model-and-admin-access
    provides: Plan 02-02 custom Prisma-backed AdminSession DAL, `UnauthorizedAdminError`, and `requireAdmin()`
provides:
  - Guard-first admin post mutation dispatcher for create, edit, delete, publish, and unpublish
  - Dynamic `/api/admin/posts/[operation]` POST route that rejects unauthenticated direct mutation calls
  - Playwright coverage for unauthenticated, invalid-operation, authenticated-boundary, and executable-order behavior
affects: [phase-03-markdown-authoring-workflow, phase-04-public-content-library]

tech-stack:
  added: []
  patterns:
    - Route handlers validate only route params, then delegate to guarded server utilities
    - Mutation dispatcher begins with `const adminSession = await requireAdmin()` before validation, body parsing, or writes
    - Direct backend mutation tests use Playwright `request.post()` with submitted bodies to prove UI hiding is not the security boundary

key-files:
  created:
    - src/tests/e2e/admin-mutations.spec.ts
    - src/lib/admin/post-mutations.ts
    - src/app/api/admin/posts/[operation]/route.ts
  modified:
    - src/tests/e2e/admin-mutations.spec.ts

key-decisions:
  - "Reused the Plan 02-02 `UnauthorizedAdminError` and `requireAdmin()` exports without modifying `src/lib/auth/admin.ts`, matching the dispatch instruction to avoid duplicate admin guards."
  - "Kept the mutation dispatcher as an authorization boundary stub only; no request-body parsing, `prisma.post` writes, public controls, roles, registration, reset, OAuth, Magic Link, Credentials, or JWT behavior were introduced."
  - "Returned plain-text 401 responses for unauthorized mutation calls so the response body exactly matches the UI-SPEC copy."

patterns-established:
  - "Guarded mutation services must call `requireAdmin()` as the first executable statement."
  - "Admin mutation route handlers may validate path params before dispatch but must not parse request bodies or touch Prisma content models directly."
  - "Phase 3 CMS writes can attach to `runGuardedPostMutation()` after the shared guard, preserving this backend trust boundary."

requirements-completed: [AUTH-02, AUTH-03, AUTH-04]

coverage:
  - id: D1
    description: Direct unauthenticated create, edit, delete, publish, and unpublish POST requests return 401 with the exact UI-SPEC unauthorized copy.
    requirement: AUTH-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#rejects unauthenticated create/edit/delete/publish/unpublish requests before trusting submitted data"
        status: pass
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
    human_judgment: false
  - id: D2
    description: `runGuardedPostMutation()` awaits `requireAdmin()` before operation behavior, body parsing, validation, or Prisma writes.
    requirement: AUTH-03
    verification:
      - kind: other
        ref: "node --input-type=module executable-order check from 02-03-PLAN.md"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#keeps the mutation dispatcher guard-first and the route body-free"
        status: pass
    human_judgment: false
  - id: D3
    description: Dynamic admin post operation route accepts only create, edit, delete, publish, and unpublish, returns 404 for unknown operations, and delegates without request-body parsing.
    requirement: AUTH-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#returns 404 for unknown admin post operations"
        status: pass
      - kind: other
        ref: "route source scan for runGuardedPostMutation delegation and no request.json/formData/prisma.post access"
        status: pass
    human_judgment: false
  - id: D4
    description: Authenticated admin calls pass the shared guard and receive an operation-specific boundary response while single-admin scope remains intact.
    requirement: AUTH-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#returns an operation boundary response for authenticated admin calls"
        status: pass
      - kind: other
        ref: "source scan found no roles, registration, invite, reset, OAuth, Magic Link, Credentials, or JWT additions"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-07-03
status: complete
---

# Phase 02 Plan 03: Mutation Guard Boundary Summary

**Guard-first admin post mutation boundary with direct unauthenticated rejection tests for create, edit, delete, publish, and unpublish.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-07-03T02:33:18Z
- **Completed:** 2026-07-03T02:39:25Z
- **Tasks:** 2
- **Files modified:** 3 source/test files plus this summary

## Accomplishments

- Added RED Playwright coverage for direct unauthenticated `/api/admin/posts/create`, `/edit`, `/delete`, `/publish`, and `/unpublish` calls, each with submitted data and exact 401 response-copy assertions.
- Implemented `src/lib/admin/post-mutations.ts` with `AdminPostOperation`, `adminPostOperations`, and `runGuardedPostMutation()` using `requireAdmin()` as the first executable statement.
- Added `src/app/api/admin/posts/[operation]/route.ts` with a node runtime, operation-param validation, 404 for unknown operations, unauthorized-error mapping, and delegation without body parsing or direct `prisma.post` access.
- Extended the mutation contract to prove authenticated admin calls pass the guard and receive operation-specific boundary responses while preserving single-admin scope.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add RED unauthenticated mutation rejection tests** - `b83a41d` (test)
2. **Task 2: Implement reusable guard and guarded mutation boundaries** - `d4a4c92` (feat)

## Files Created/Modified

- `src/tests/e2e/admin-mutations.spec.ts` - Direct mutation rejection contract, executable-order assertions, invalid-operation 404 check, and authenticated boundary-response check.
- `src/lib/admin/post-mutations.ts` - Guard-first admin post mutation dispatcher and operation union.
- `src/app/api/admin/posts/[operation]/route.ts` - Dynamic route handler for direct admin post operation calls.
- `src/lib/auth/admin.ts` - Reused unchanged; Plan 02-02 already provided `UnauthorizedAdminError` and `requireAdmin()`.

## Verification

- `npm run lint` - passed during RED and GREEN verification.
- `npm run build` - passed during RED and GREEN verification.
- RED proof: `npx playwright test src/tests/e2e/admin-mutations.spec.ts --project=desktop` failed as expected after lint/build because all five operation URLs returned 404 and `src/lib/admin/post-mutations.ts` did not exist yet.
- GREEN/overall: `npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - passed with 53 passed and 3 skipped reduced-motion-only checks in non-reduced projects.
- Executable-order check from `02-03-PLAN.md` - passed; `runGuardedPostMutation()` begins with `const adminSession = await requireAdmin()`, and the route handler delegates without `request.json`, `formData`, or `prisma.post`.
- Single-admin source scan - passed; no role, registration, reset, OAuth, Magic Link, stock Credentials, or JWT code was introduced.

## Decisions Made

- Reused the existing Plan 02-02 admin guard exports rather than editing `src/lib/auth/admin.ts`; this avoids duplicate auth primitives and follows the dispatch instruction.
- Kept the POST route focused on route-param validation and error mapping only; operation behavior lives behind `runGuardedPostMutation()`.
- Returned the unauthorized response as plain text so direct callers receive exactly `Unauthorized admin request. Sign in and try again.`

## Deviations from Plan

None - plan executed exactly as written, with the user-provided current-state adjustment that `UnauthorizedAdminError` and `requireAdmin()` already existed from Plan 02-02 and should be reused.

**Total deviations:** 0 auto-fixed.
**Impact on plan:** No scope expansion; the added invalid-operation and authenticated-boundary tests directly cover Task 2 behavior.

## Issues Encountered

- `next build` rewrote `next-env.d.ts` from `.next/types` to `.next/dev/types`; this generated change was reverted and not committed.
- `ctx7` was unavailable for documentation lookup fallback, so route-handler behavior was cross-checked against official Next.js docs and verified by local `next build`.

## User Setup Required

None - no external service configuration required. Existing ignored `.env.local` values were used for authenticated Playwright login and were not staged.

## Known Stubs

- `src/lib/admin/post-mutations.ts:31` returns the intentional boundary response `${operation} mutation boundary authorized.` without performing content writes. This is the planned Phase 2 guard surface; Phase 3 will attach real Markdown article mutation behavior after the shared guard.

## Threat Flags

None - the new `/api/admin/posts/[operation]` backend route, auth guard boundary, direct mutation rejection behavior, and single-admin scope were all included in the plan threat model.

## Self-Check: PASSED

- Confirmed `src/tests/e2e/admin-mutations.spec.ts`, `src/lib/admin/post-mutations.ts`, `src/app/api/admin/posts/[operation]/route.ts`, and `src/lib/auth/admin.ts` exist on disk.
- Confirmed task commits `b83a41d` and `d4a4c92` exist in git history.
- Confirmed automated verification passed for lint, build, four-project admin auth/mutation Playwright coverage, executable-order checks, and forbidden-scope source scans.

## Next Phase Readiness

Phase 3 can attach real Markdown article create/edit/delete/publish/unpublish behavior behind `runGuardedPostMutation()` while preserving the guard-first backend boundary established here.

---
*Phase: 02-data-model-and-admin-access*
*Completed: 2026-07-03*

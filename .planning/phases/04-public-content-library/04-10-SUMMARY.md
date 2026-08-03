---
phase: 04-public-content-library
plan: "10"
subsystem: public-content
tags: [nextjs, prisma, public-routes, taxonomy, archive, series, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-02 shared published-only public query boundary"
  - phase: 04-public-content-library
    provides: "04-04 organization display components and RED browser coverage"
  - phase: 04-public-content-library
    provides: "04-09 public article detail route and public note DTOs"
provides:
  - "Published-only public organization query helpers for tags, categories, archive groups, series index, and series detail"
  - "Live /tags/[slug], /categories/[slug], /archive, /series, and /series/[slug] routes wired to organization components"
  - "Dynamic rendering on database-backed public content routes so fixture/live data is read from PostgreSQL per request"
affects: [public-content-library, public-routes, taxonomy, archive, series, phase-4-verification]

tech-stack:
  added: []
  patterns:
    - "Public organization routes call src/lib/public/content-queries.ts helpers and do not query Prisma directly."
    - "Public helper functions reuse the shared publishedPostWhere predicate with PublicationStatus.PUBLISHED and non-null publishedAt."
    - "Database-backed public content pages export dynamic = force-dynamic to preserve live public visibility semantics."

key-files:
  created:
    - src/app/(public)/tags/[slug]/page.tsx
    - src/app/(public)/categories/[slug]/page.tsx
    - src/app/(public)/series/[slug]/page.tsx
    - .planning/phases/04-public-content-library/04-10-SUMMARY.md
  modified:
    - src/lib/public/content-queries.ts
    - src/app/(public)/archive/page.tsx
    - src/app/(public)/series/page.tsx
    - src/app/(public)/notes/page.tsx
    - src/app/(public)/notes/[slug]/page.tsx
    - src/components/public/content/ArchiveTimeline.tsx

key-decisions:
  - "Kept route files as server components that call public content helpers only; Prisma remains isolated in src/lib/public/content-queries.ts."
  - "Used the 04-04 committed organization Playwright coverage as the RED gate for 04-10, per plan instruction."
  - "Forced dynamic rendering for database-backed public content routes after verification showed static caching could violate live published visibility."

patterns-established:
  - "Dynamic taxonomy routes return notFound() when helper data is null, making private-only and nonexistent slugs indistinguishable."
  - "Archive helper returns year/month groups from publishedAt while ArchiveTimeline keeps its existing props-only fallback grouping behavior."
  - "Series index helper returns only title, slug, and description; series detail helper sorts published posts by seriesOrder."

requirements-completed: [ORG-01, ORG-02, ORG-03, ORG-04, TAX-05]

coverage:
  - id: D1
    description: "Published-only organization helpers exist for tag, category, archive, series index, and series detail"
    requirement: TAX-05
    verification:
      - kind: other
        ref: "rg -n \"publishedPostWhere|getPublishedPostsByTag|getPublishedPostsByCategory|getPublishedArchiveGroups|getPublishedSeriesIndex|getPublishedSeriesBySlug|publishedAt: \\{|not: null|seriesOrder\" src/lib/public/content-queries.ts"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "/tags/[slug] and /categories/[slug] render separate semantic published-only routes"
    requirement: ORG-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#lists tag and category routes with published posts only"
        status: pass
    human_judgment: false
  - id: D3
    description: "/archive groups published posts by year and month without draft leakage"
    requirement: ORG-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#groups archive by year and month without draft leakage"
        status: pass
    human_judgment: false
  - id: D4
    description: "/series and /series/[slug] render public series entries and ordered published series posts"
    requirement: ORG-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders series index entries without counts or latest-update metadata"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#orders series detail posts by seriesOrder and hides drafts"
        status: pass
    human_judgment: false
  - id: D5
    description: "Private-only taxonomy and series slugs return the same 404 behavior as nonexistent public content"
    requirement: TAX-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#returns 404 for private-only taxonomy and series slugs"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 10: Organization Route Wiring Summary

**Published-only tag, category, archive, and series browsing routes backed by shared public query helpers**

## Performance

- **Duration:** 10min
- **Started:** 2026-07-07T03:57:49Z
- **Completed:** 2026-07-07T04:08:04Z
- **Tasks:** 2
- **Files modified:** 10 production/summary files

## Accomplishments

- Added public helper functions for tag, category, archive, series index, and series detail using the shared published-only predicate.
- Wired `/tags/[slug]`, `/categories/[slug]`, `/archive`, `/series`, and `/series/[slug]` to the Plan 04-04 organization components.
- Preserved private-only slug non-disclosure through `notFound()` and dynamic live database reads for public content pages.

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement organization query helpers** - `aa08ec2` (feat)
2. **Task 2: Implement organization routes** - `c112faa` (feat)
3. **Task 2 auto-fix: Force live public content routes** - `40f4a39` (fix)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/lib/public/content-queries.ts` - Adds published-only organization helpers, archive grouping, series index/detail data, and seriesOrder in public summaries.
- `src/app/(public)/tags/[slug]/page.tsx` - Adds published-only tag route with `notFound()` for empty/private slugs.
- `src/app/(public)/categories/[slug]/page.tsx` - Adds published-only category route with `notFound()` for empty/private slugs.
- `src/app/(public)/archive/page.tsx` - Replaces placeholder with live archive timeline data.
- `src/app/(public)/series/page.tsx` - Replaces placeholder with live series index data.
- `src/app/(public)/series/[slug]/page.tsx` - Adds ordered published series detail route.
- `src/components/public/content/ArchiveTimeline.tsx` - Accepts pre-grouped archive data while preserving props-only grouping fallback.
- `src/app/(public)/notes/page.tsx` - Forces dynamic rendering for live published visibility.
- `src/app/(public)/notes/[slug]/page.tsx` - Forces dynamic rendering for live published visibility.

## Verification Results

| Command | Result |
|---------|--------|
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --grep "lists tag and category routes"` during RED | EXPECTED RED before implementation: failed on missing tag route H1 `第四阶段组织标签`. |
| `npm run lint` | PASS |
| `npm run build` | PASS; route manifest shows `/notes`, `/archive`, `/series`, `/tags/[slug]`, `/categories/[slug]`, and `/series/[slug]` as dynamic. |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --project=mobile --project=min-mobile` | PASS - 45/45 tests passed. |
| `rg -n "prisma\\.|findMany|findFirst|findUnique|server-only" src/app/(public)/tags/[slug]/page.tsx src/app/(public)/categories/[slug]/page.tsx src/app/(public)/archive/page.tsx src/app/(public)/series/page.tsx src/app/(public)/series/[slug]/page.tsx` | PASS - no route-local Prisma/query imports found. |

## Decisions Made

- Kept Prisma access centralized in `content-queries.ts`; public route files only call helper functions and render components.
- Reused the committed 04-04 RED Playwright coverage instead of adding duplicate route tests in 04-10.
- Added `dynamic = "force-dynamic"` to database-backed public content pages to satisfy Phase 4 D-24 live-read behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Forced live rendering for database-backed public pages**
- **Found during:** Task 2 (full Playwright verification)
- **Issue:** Next treated several Prisma-backed public pages as static, which allowed stale fixture data or stale 404 responses across multi-project Playwright runs. This violated D-24 and could make published visibility checks read cached data.
- **Fix:** Added `export const dynamic = "force-dynamic";` to `/notes`, `/notes/[slug]`, `/archive`, `/series`, `/tags/[slug]`, `/categories/[slug]`, and `/series/[slug]`.
- **Files modified:** `src/app/(public)/notes/page.tsx`, `src/app/(public)/notes/[slug]/page.tsx`, `src/app/(public)/archive/page.tsx`, `src/app/(public)/series/page.tsx`, `src/app/(public)/tags/[slug]/page.tsx`, `src/app/(public)/categories/[slug]/page.tsx`, `src/app/(public)/series/[slug]/page.tsx`
- **Verification:** `npm run build` route manifest switched those public data routes to dynamic; full Playwright desktop/mobile/min-mobile passed 45/45.
- **Committed in:** `40f4a39`

---

**Total deviations:** 1 auto-fixed (1 Rule 2 missing critical live-read behavior)
**Impact on plan:** No product scope expansion. The fix enforces the Phase 4 live database read requirement and prevents draft/published visibility checks from using stale route output.

## Issues Encountered

- An initial `npm run build` attempt was blocked by a stale project `next dev` process holding `.next/dev/lock`; stopping that old local dev server allowed build verification to proceed.
- A full post-commit Playwright run exposed a min-mobile stale 404 on the category route. The root cause was static route output for database-backed public pages, fixed by forcing dynamic rendering as documented in the deviation above.

## TDD Gate Compliance

PASS with inherited RED gate. Plan 04-10 explicitly instructed using the expected RED organization browser coverage from Plan 04-04:

- RED: `f0a2a74` `test(04-04): add failing organization browsing coverage`
- GREEN helpers: `aa08ec2` `feat(04-10): add organization query helpers`
- GREEN routes: `c112faa` `feat(04-10): wire organization routes`
- Blocking fix: `40f4a39` `fix(04-10): force live public content routes`

No separate `test(04-10)` commit was added because the already-committed 04-04 route tests were the planned RED source for this execution.

## Authentication Gates

None.

## Known Stubs

None. Stub scan matched required Chinese empty-state copy and an `ArchiveTimeline` optional `posts = []` fallback kept for props-only component compatibility; neither blocks the plan goal.

## Threat Flags

None. The new taxonomy/archive/series trust boundaries were already covered by the plan threat model, and no unplanned network, auth, file, or schema surface was introduced.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plans 04-05 and 04-07 can now link to organization paths without also implementing organization routes. Phase 4 can continue to remaining search, related article, homepage, and publish/unpublish visibility plans.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-10-SUMMARY.md` exists on disk.
- Verified created route files exist: `tags/[slug]/page.tsx`, `categories/[slug]/page.tsx`, and `series/[slug]/page.tsx`.
- Verified modified public route/helper files exist: `content-queries.ts`, `archive/page.tsx`, and `series/page.tsx`.
- Verified task commits exist in git history: `aa08ec2`, `c112faa`, and `40f4a39`.
- Verified coverage frontmatter classifies successfully with 5/5 auto-covered deliverables.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

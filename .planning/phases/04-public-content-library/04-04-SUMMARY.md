---
phase: 04-public-content-library
plan: "04"
subsystem: public-content
tags: [nextjs, public-routes, taxonomy, archive, series, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-03 public /notes list components and Chinese empty state"
  - phase: 04-public-content-library
    provides: "04-09 public article detail route for note links"
provides:
  - "RED organization route coverage for tag, category, archive, series index, series detail, and private-only slugs"
  - "TaxonomyPageHeader, ArchiveTimeline, SeriesIndex, and SeriesDetailList display components"
  - "Component contract coverage for props-only organization components and Chinese public copy"
affects: [public-content-library, public-routes, phase-4-tests, 04-10-route-wiring]

tech-stack:
  added: []
  patterns:
    - "Organization display components are props-only and do not query data."
    - "Route-level organization Playwright coverage remains RED until Plan 04-10 wires routes and public query helpers."
    - "Series index components render names and descriptions only, with no counts or latest-update metadata."

key-files:
  created:
    - src/components/public/content/TaxonomyPageHeader.tsx
    - src/components/public/content/ArchiveTimeline.tsx
    - src/components/public/content/SeriesIndex.tsx
    - src/components/public/content/SeriesDetailList.tsx
    - .planning/phases/04-public-content-library/04-04-SUMMARY.md
  modified:
    - src/tests/e2e/public-content-library.spec.ts

key-decisions:
  - "Kept organization components pure display components; route/query wiring remains Plan 04-10 scope."
  - "Recorded organization route tests as expected RED coverage instead of claiming route behavior passes."
  - "Kept the existing PublicNoteList and PublicEmptyState unchanged because they already satisfied the list and Chinese no-admin empty-state contracts."

patterns-established:
  - "ArchiveTimeline groups supplied public posts by UTC publish year and month before rendering PublicNoteList sections."
  - "SeriesDetailList sorts supplied posts by seriesOrder and renders stable visible sequence markers."
  - "Organization tests use phase-4- fixtures with shared published/draft taxonomy and private-only slugs."

requirements-completed: []
requirements-traced: [ORG-01, ORG-02, ORG-03, ORG-04, TAX-05]

coverage:
  - id: D1
    description: "RED route coverage exists for /tags/[slug], /categories/[slug], /archive, /series, /series/[slug], and private-only organization slugs"
    requirement: ORG-01
    verification:
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop"
        status: fail
      - kind: other
        ref: "rg -n \"/tags/|/categories/|/archive|/series/|private-only\" src/tests/e2e/public-content-library.spec.ts"
        status: pass
    human_judgment: true
    rationale: "The failing route tests are intentional RED coverage; Plan 04-10 owns the route and query wiring that will make them pass."
  - id: D2
    description: "Organization display components exist and do not query data"
    requirement: ORG-01
    verification:
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --grep \"defines organization display components\""
        status: pass
      - kind: other
        ref: "! rg -n \"prisma\\.|findMany|findFirst|getPublishedPost|server-only\" src/components/public/content/{TaxonomyPageHeader,ArchiveTimeline,SeriesIndex,SeriesDetailList}.tsx"
        status: pass
    human_judgment: false
  - id: D3
    description: "Series index renders names and descriptions only, without counts or latest-update metadata"
    requirement: ORG-04
    verification:
      - kind: other
        ref: "! rg -n \"postCount|latestUpdatedAt|最新|更新于|最近|\\bcount\\b\" src/components/public/content/SeriesIndex.tsx"
        status: pass
    human_judgment: false
  - id: D4
    description: "Organization empty states and components use Chinese reader-facing copy with no admin links or workflow instructions"
    requirement: TAX-05
    verification:
      - kind: other
        ref: "! rg -n \"/admin|后台|草稿|发布流程\" src/components/public/content/{TaxonomyPageHeader,ArchiveTimeline,SeriesIndex,SeriesDetailList,PublicEmptyState}.tsx"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 04: Organization Display Components Summary

**Organization route RED coverage plus props-only tag/category/archive/series display components for Plan 04-10 wiring**

## Performance

- **Duration:** 8min
- **Started:** 2026-07-07T03:43:13Z
- **Completed:** 2026-07-07T03:51:13Z
- **Tasks:** 2
- **Files modified:** 6 production/test/summary files

## Accomplishments

- Added Phase 4 organization fixtures and RED Playwright coverage for tag, category, archive, series index, series detail, and private-only organization slug behavior.
- Added `TaxonomyPageHeader`, `ArchiveTimeline`, `SeriesIndex`, and `SeriesDetailList` as props-only public display components.
- Verified component contracts for Chinese copy, no admin workflow leakage, no component data queries, and series index without counts/latest-update metadata.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add organization browsing coverage** - `f0a2a74` (test)
2. **Task 2 GREEN: Add organization display components** - `fd84801` (feat)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/tests/e2e/public-content-library.spec.ts` - Adds organization fixtures, RED route coverage, private-only slug checks, and component contract coverage.
- `src/components/public/content/TaxonomyPageHeader.tsx` - Shared tag/category header with Chinese semantic label and description.
- `src/components/public/content/ArchiveTimeline.tsx` - Groups supplied public posts by publish year and month, then reuses `PublicNoteList`.
- `src/components/public/content/SeriesIndex.tsx` - Series entry list with title and description only, no counts/latest metadata.
- `src/components/public/content/SeriesDetailList.tsx` - Ordered series post list with visible sequence markers and public note metadata.
- `.planning/phases/04-public-content-library/04-04-SUMMARY.md` - Plan execution summary.

## Verification Results

| Command | Result |
|---------|--------|
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` during RED | PASS for lint/build, expected Playwright failure: `/tags/[slug]` route did not render the tag H1 before route wiring. |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --grep "defines organization display components"` | PASS - component contract coverage passes after Task 2. |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` | EXPECTED RED - 9 passed, 1 failed, 5 skipped because serial execution stopped at the first new organization route test. Failure: tag route H1 `第四阶段组织标签` not found. Route wiring is intentionally deferred to Plan 04-10. |
| `! rg -n "prisma\\.|findMany|findFirst|getPublishedPost|server-only" src/components/public/content/{TaxonomyPageHeader,ArchiveTimeline,SeriesIndex,SeriesDetailList}.tsx` | PASS - no component data queries found. |
| `! rg -n "postCount|latestUpdatedAt|最新|更新于|最近|\\bcount\\b" src/components/public/content/SeriesIndex.tsx` | PASS - no series count/latest metadata fields found. |
| `! rg -n "/admin|后台|草稿|发布流程" src/components/public/content/{TaxonomyPageHeader,ArchiveTimeline,SeriesIndex,SeriesDetailList,PublicEmptyState}.tsx` | PASS - no admin links or workflow instructions found. |

## Decisions Made

- Kept organization route/query wiring out of this plan. The route tests are committed as RED coverage for Plan 04-10.
- Did not modify `PublicNoteList` or `PublicEmptyState`; existing components already satisfied the display and Chinese no-admin empty-state contracts needed here.
- Used source-level component contract coverage for organization components because direct Playwright worker imports of Next `Link` components hit Node ESM package resolution rather than browser route behavior.
- Left ORG-01 through ORG-04 and TAX-05 pending in `REQUIREMENTS.md` because this plan supplies RED coverage/components, while Plan 04-10 owns live route/query behavior.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Reworked component RED coverage away from direct Next component imports**
- **Found during:** Task 2 (component GREEN verification)
- **Issue:** The first component test dynamically imported components and failed on `next/link` Node ESM resolution in the Playwright worker (`Did you mean to import "next/link.js"?`). This was a test-environment issue, not a component contract failure.
- **Fix:** Replaced runtime component imports with source-level contract checks for file existence, test IDs, grouping/sorting logic, no component queries, no series count/latest metadata, and no admin workflow copy.
- **Files modified:** `src/tests/e2e/public-content-library.spec.ts`
- **Verification:** `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --grep "defines organization display components"` passed.
- **Committed in:** `fd84801`

---

**Total deviations:** 1 auto-fixed (1 Rule 1 test bug)
**Impact on plan:** No product scope change. Route wiring remains deferred, and component contracts are still covered without importing Next runtime components directly.

## Issues Encountered

- The final Playwright command is intentionally RED for organization routes because `/tags/[slug]`, `/categories/[slug]`, `/series/[slug]`, and live archive/series wiring are Plan 04-10 scope.
- The component contract test initially used runtime imports, which were unsuitable for Next components inside the Playwright Node worker. It was adjusted before the GREEN commit.
- `requirements.mark-complete` initially marked ORG-01 through ORG-04 and TAX-05 complete from the plan frontmatter; this was reverted because live route behavior remains expected RED until 04-10.

## Expected RED Coverage

The committed route tests are expected to fail until Plan 04-10 wires public organization helpers and routes. Do not treat the following as passing route behavior yet:

- `/tags/[slug]` lists only published posts for a tag.
- `/categories/[slug]` lists only published posts for a category.
- `/archive` groups published posts by year and month.
- `/series` renders series entries from live data.
- `/series/[slug]` orders posts by `seriesOrder`.
- Private-only taxonomy and series slugs do not expose unpublished content.

## TDD Gate Compliance

PASS - Plan 04-04 has RED and GREEN commits in order:

- RED: `f0a2a74` `test(04-04): add failing organization browsing coverage`
- GREEN: `fd84801` `feat(04-04): add organization display components`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None. Stub scan matched intentional Chinese empty states and excerpt fallback copy (`暂时没有...`, `暂无摘要。`) that are required public UI states, not unimplemented data wiring inside the components.

## Threat Flags

None. The only new database surface is Playwright fixture setup inside the planned test file; production components introduce no new endpoint, auth path, file access, or route-local data query.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-10 can now wire the public organization query helpers and routes to these components. It should use the committed RED coverage as its route-level acceptance suite and turn the expected failures green.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-04-SUMMARY.md` exists on disk.
- Verified created component files exist: `TaxonomyPageHeader.tsx`, `ArchiveTimeline.tsx`, `SeriesIndex.tsx`, and `SeriesDetailList.tsx`.
- Verified modified test file exists: `src/tests/e2e/public-content-library.spec.ts`.
- Verified task commits exist in git history: `f0a2a74` and `fd84801`.
- Verified coverage frontmatter classifies successfully; D1 remains human/next-plan routed because route tests are intentionally RED.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

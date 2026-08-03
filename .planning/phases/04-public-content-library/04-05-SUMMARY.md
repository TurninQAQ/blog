---
phase: 04-public-content-library
plan: "05"
subsystem: public-content
tags: [nextjs, prisma, public-routes, series-navigation, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-09 public article detail route and ArticlePage shell"
  - phase: 04-public-content-library
    provides: "04-10 published-only series routes and seriesOrder ordering patterns"
provides:
  - "Published-only previous/next series navigation helper for article detail pages"
  - "Article-flow SeriesNavigation component with Chinese labels, 44px targets, and focusable links"
  - "Browser coverage for published-only neighbors, first/last boundaries, draft exclusion, focus, target size, and mobile flow placement"
affects: [public-content-library, public-routes, article-detail, phase-4-verification]

tech-stack:
  added: []
  patterns:
    - "Article detail pages call getSeriesNavigation(post.id) after the published-only post lookup succeeds."
    - "Series navigation computes neighbors from PublicationStatus.PUBLISHED plus non-null publishedAt records in the same series."
    - "ArticlePage keeps mobile series navigation in the document flow after the Markdown body, before future related-article content."

key-files:
  created:
    - src/components/public/content/SeriesNavigation.tsx
    - .planning/phases/04-public-content-library/04-05-SUMMARY.md
  modified:
    - src/tests/e2e/public-content-library.spec.ts
    - src/lib/public/content-queries.ts
    - src/app/(public)/notes/[slug]/page.tsx
    - src/components/public/content/ArticlePage.tsx

key-decisions:
  - "Kept series navigation inside the existing public content query boundary instead of adding route-local Prisma queries."
  - "Returned no SeriesNavigation markup when a published article has no published previous or next series neighbor."
  - "Rendered series navigation after the article body in the main article column so Plan 04-08/04-11 can add related content afterward."

patterns-established:
  - "SeriesNavigation accepts a typed PublicSeriesNavigation DTO and renders no section for empty previous/next data."
  - "Series neighbor tests use a three-post published fixture with a same-series draft between published orders to prove draft exclusion."

requirements-completed: [ORG-05]

coverage:
  - id: D1
    description: "Article detail pages compute previous and next links only from published posts in the same series ordered by seriesOrder"
    requirement: ORG-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders article series navigation with published previous and next neighbors only"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders only applicable series neighbors at published series boundaries"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "SeriesNavigation uses Chinese previous/next copy, stable 44px link targets, visible focus, and no section when no neighbor exists"
    requirement: ORG-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders article series navigation with published previous and next neighbors only"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#defines organization display components with Chinese public copy"
        status: pass
    human_judgment: false
  - id: D3
    description: "Mobile article layout places series navigation after article content in document flow without horizontal overflow"
    requirement: ORG-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#places mobile series navigation after article content in document flow"
        status: pass
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
    human_judgment: false

duration: 38min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 05: Article Series Navigation Summary

**Published-only previous/next navigation inside article detail pages, ordered by seriesOrder and verified across desktop/mobile layouts**

## Performance

- **Duration:** 38min
- **Started:** 2026-07-07T05:19:00Z
- **Completed:** 2026-07-07T05:56:48Z
- **Tasks:** 2
- **Files modified:** 5 production/test files plus this summary

## Accomplishments

- Added RED Playwright coverage for article-detail series navigation using a three-post published series plus a same-series draft.
- Added `getSeriesNavigation(postId)` to compute previous/next neighbors from published posts only, ordered by `seriesOrder`.
- Added `SeriesNavigation` with Chinese heading/copy, 44px minimum link targets, focusable previous/next links, and a null render path when no neighbor exists.
- Wired `/notes/[slug]` and `ArticlePage` so series navigation appears after the Markdown article body in the main document flow.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add series navigation browser coverage** - `1d93d8f` (test)
2. **Task 2 GREEN: Wire published-only article series navigation** - `509f493` (feat)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/tests/e2e/public-content-library.spec.ts` - Adds series navigation fixtures and browser/source assertions for neighbors, boundaries, draft exclusion, focus, target size, and mobile flow placement.
- `src/lib/public/content-queries.ts` - Adds `PublicSeriesNavigation` DTOs and `getSeriesNavigation(postId)` using the shared published-only predicate.
- `src/app/(public)/notes/[slug]/page.tsx` - Fetches series navigation after the published article lookup succeeds.
- `src/components/public/content/ArticlePage.tsx` - Renders series navigation after the article body.
- `src/components/public/content/SeriesNavigation.tsx` - New Chinese previous/next navigation component.

## Verification Results

| Command | Result |
|---------|--------|
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --project=mobile` during RED | PASS for lint/build, expected Playwright failure: `series-navigation` heading `系列导航` not found before implementation |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --grep "defines organization display components"` during RED refinement | Expected failure: `SeriesNavigation.tsx` did not exist yet |
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` after GREEN | PASS - 72 tests |
| `npm run lint` final | PASS |
| `npm run build` final | PASS |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` final | PASS - 72 tests |

## Decisions Made

- Kept all database reads for series navigation in `src/lib/public/content-queries.ts`; article route files still do not query Prisma directly.
- Used the existing `publishedPostWhere` predicate for both current article validation and same-series neighbor selection.
- Kept `SeriesNavigation` props-only and route-agnostic so later related-article work can compose around it without changing query ownership.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `next build` and Playwright dev-server runs repeatedly changed generated `next-env.d.ts` from `.next/types` to `.next/dev/types`; this was restored each time and not committed.
- One ad-hoc threat scan command needed quote correction because a shell pattern contained a backtick; the scan was rerun with simpler patterns.

## TDD Gate Compliance

PASS - Plan 04-05 has RED and GREEN commits in order:

- RED: `1d93d8f` `test(04-05): add failing series navigation coverage`
- GREEN: `509f493` `feat(04-05): implement article series navigation`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None. Stub scan only matched a test-local `const pageTexts: string[] = []`, which is not a UI/data-source stub.

## Threat Flags

None. The new database-to-navigation and browser-link surfaces were already covered by the plan threat model and mitigated with published-only filtering, typed helper DTOs, stored slugs, and draft-exclusion browser coverage.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-08/04-11 can add related articles after the existing article body and series navigation without also implementing ORG-05. Article detail navigation now preserves the public query boundary and published-only visibility behavior.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-05-SUMMARY.md` exists on disk.
- Verified created component exists: `src/components/public/content/SeriesNavigation.tsx`.
- Verified modified public query file exists: `src/lib/public/content-queries.ts`.
- Verified task commits exist in git history: `1d93d8f` and `509f493`.
- Verified coverage frontmatter classifies successfully with 3/3 auto-covered deliverables.
- Verified final required commands passed and are recorded above.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

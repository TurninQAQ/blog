---
phase: 04-public-content-library
plan: "03"
subsystem: public-content
tags: [nextjs, public-routes, prisma, playwright, responsive-ui]

requires:
  - phase: 04-public-content-library
    provides: "04-02 published-only public query helper and Phase 4 fixture coverage"
provides:
  - "Published-only /notes route backed by getPublishedPostList()"
  - "Dense public note list rows with title, excerpt, category, tags, publish date, reading time, and visual treatment"
  - "Cover image and CSS technical-lab fallback visual component"
  - "Chinese public empty state with no admin links or publishing instructions"
affects: [public-content-library, public-routes, phase-4-tests]

tech-stack:
  added: []
  patterns:
    - "Public route pages consume src/lib/public/content-queries.ts helpers instead of direct Prisma queries."
    - "Public list rows use stable visual dimensions and Playwright viewport overflow checks."

key-files:
  created:
    - src/components/public/content/PostVisualBlock.tsx
    - src/components/public/content/PublicEmptyState.tsx
    - src/components/public/content/PublicNoteCard.tsx
    - src/components/public/content/PublicNoteList.tsx
    - .planning/phases/04-public-content-library/04-03-SUMMARY.md
  modified:
    - src/app/(public)/notes/page.tsx
    - src/tests/e2e/public-content-library.spec.ts
    - src/tests/e2e/public-shell.spec.ts

key-decisions:
  - "Kept /notes as a server component that calls getPublishedPostList() and adds no route-local Prisma query."
  - "Used a plain public CSS visual fallback for posts without covers, preserving the technical-lab identity without adding dependencies."
  - "Kept /notes empty-state copy Chinese and reader-facing, with no /admin links or publishing workflow instructions."

patterns-established:
  - "PublicNoteList/PublicNoteCard render published post DTOs from the shared public query boundary."
  - "PostVisualBlock owns cover-or-fallback dimensions via a single data-testid-covered visual wrapper."
  - "Phase 4 browser tests assert draft absence, fallback visuals, metadata, and no horizontal overflow across responsive projects."

requirements-completed: [READ-01]

coverage:
  - id: D1
    description: "Visitor can browse /notes with published rows showing title, excerpt, date, visual treatment, tags, category, and reading time"
    requirement: READ-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders /notes as a dense published-only list with metadata and visual treatments"
        status: pass
      - kind: other
        ref: "rg -n \"getPublishedPostList|prisma|findMany|findFirst\" src/app/'(public)'/notes/page.tsx"
        status: pass
    human_judgment: false
  - id: D2
    description: "Draft fixtures and missing-publishedAt fixtures do not appear on public /notes"
    requirement: READ-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#returns only published posts with reading metadata from the public query boundary"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders /notes as a dense published-only list with metadata and visual treatments"
        status: pass
    human_judgment: false
  - id: D3
    description: "Empty /notes state uses Chinese public copy without admin links or publishing instructions"
    requirement: READ-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#shows a Chinese /notes empty state without admin links or publishing instructions"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders Chinese-first empty states for public content routes"
        status: pass
    human_judgment: false
  - id: D4
    description: "Public content source remains free of raw HTML execution paths"
    verification:
      - kind: other
        ref: "! rg \"dangerouslySetInnerHTML|rehype-raw\" src/lib/markdown src/components/public src/app/'(public)'"
        status: pass
    human_judgment: false

duration: 8min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 03: Public Notes List Summary

**Published-only /notes list with dense metadata rows, cover-or-lab visuals, Chinese empty state, and draft non-disclosure coverage**

## Performance

- **Duration:** 8min
- **Started:** 2026-07-07T03:15:50Z
- **Completed:** 2026-07-07T03:24:09Z
- **Tasks:** 2
- **Files modified:** 8 production/test/summary files

## Accomplishments

- Added RED browser coverage for `/notes` published metadata, draft absence, cover visuals, fallback lab visuals, responsive dimensions, and Chinese empty-state copy.
- Replaced the inactive `/notes` placeholder with a server-rendered route that calls `getPublishedPostList()`.
- Added dense public note rows showing title, excerpt, category, tags, publish date, estimated reading time, and cover-or-CSS technical-lab visual treatment.
- Added a reusable Chinese `PublicEmptyState` with no `/admin` link or publishing workflow instructions.

## Task Commits

1. **Task 1 RED: Add public notes list browser coverage** - `c61eeae` (test)
2. **Task 2 GREEN: Implement notes list route and dense list components** - `5f86d5c` (feat)

**Plan metadata:** committed separately after STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/tests/e2e/public-content-library.spec.ts` - Adds `/notes` browser coverage for published rows, draft exclusion, cover/fallback visuals, responsive dimensions, and empty state copy.
- `src/tests/e2e/public-shell.spec.ts` - Updates `/notes` public-route expectations from placeholder copy to the real route and uses the shell banner role where page headers now exist.
- `src/app/(public)/notes/page.tsx` - Server component that calls `getPublishedPostList()` and renders list or empty state.
- `src/components/public/content/PostVisualBlock.tsx` - Stable cover image or CSS technical-lab fallback visual block.
- `src/components/public/content/PublicEmptyState.tsx` - Reusable Chinese public empty state with homepage return link.
- `src/components/public/content/PublicNoteCard.tsx` - Dense published note row with metadata chips and visual block.
- `src/components/public/content/PublicNoteList.tsx` - List wrapper for published note rows.
- `.planning/phases/04-public-content-library/04-03-SUMMARY.md` - Plan execution summary.

## Verification Results

| Command | Result |
|---------|--------|
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` during RED | PASS for lint/build, expected Playwright failure: `public-note-list` not found |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts src/tests/e2e/public-shell.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` | PASS - 64 tests |
| `! rg "dangerouslySetInnerHTML\|rehype-raw" src/lib/markdown src/components/public src/app/'(public)'` | PASS |
| `rg -n "getPublishedPostList\|prisma\|findMany\|findFirst" src/app/'(public)'/notes/page.tsx` | PASS - only `getPublishedPostList` import and call found |

## Decisions Made

- Kept `/notes` server-rendered and data-backed through the shared public query helper rather than adding a new route-local query.
- Used `next/image` with `unoptimized` for arbitrary cover URLs while preserving a CSS fallback for no-cover posts.
- Used role-based `banner` targeting in the public shell test because `/notes` now correctly has an internal page header in addition to the site header.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated public-shell header assertion for semantic page headers**
- **Found during:** Task 2 (full Playwright verification)
- **Issue:** The existing shell test used `page.locator("header")`, which became ambiguous after `/notes` gained a semantic page header.
- **Fix:** Changed that assertion to `page.getByRole("banner")` so it checks the site shell header without forbidding page-level headers.
- **Files modified:** `src/tests/e2e/public-shell.spec.ts`
- **Verification:** Full Playwright matrix passed: 64 tests across desktop, mobile, min-mobile, and reduced-motion.
- **Committed in:** `5f86d5c`

---

**Total deviations:** 1 auto-fixed (Rule 3 blocking test issue)
**Impact on plan:** No product scope change. The fix keeps the planned semantic `/notes` page structure and makes the existing shell test precise.

## Issues Encountered

- RED verification failed for the intended reason: `/notes` had no `public-note-list` before implementation.
- The first full GREEN matrix exposed the shell test's broad `header` locator. It was fixed before final verification and commit.

## TDD Gate Compliance

PASS - Plan 04-03 has RED and GREEN commits in order:

- RED: `c61eeae` `test(04-03): add failing public notes list coverage`
- GREEN: `5f86d5c` `feat(04-03): implement public notes list`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None.

## Threat Flags

None. The public database-to-route boundary was covered by the plan threat model and mitigated by using `getPublishedPostList()` plus draft absence tests.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-09 can build `/notes/[slug]` on top of the existing public DTO/query foundation while `/notes` remains owned by this plan.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-03-SUMMARY.md` exists on disk.
- Verified created files exist: `src/components/public/content/PostVisualBlock.tsx`, `src/components/public/content/PublicEmptyState.tsx`, `src/components/public/content/PublicNoteCard.tsx`, and `src/components/public/content/PublicNoteList.tsx`.
- Verified modified files exist: `src/app/(public)/notes/page.tsx`, `src/tests/e2e/public-content-library.spec.ts`, and `src/tests/e2e/public-shell.spec.ts`.
- Verified task commits exist in git history: `c61eeae` and `5f86d5c`.
- Verified final plan verification commands passed and are recorded above.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

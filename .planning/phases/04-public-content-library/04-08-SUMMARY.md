---
phase: 04-public-content-library
plan: "08"
subsystem: public-content
tags: [nextjs, prisma, search, homepage, featured-posts, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-06 Post.featured schema field and generated Prisma support"
  - phase: 04-public-content-library
    provides: "04-07 guarded publication/featured mutations and public revalidation"
provides:
  - "Server-rendered `/search` route using GET query params and Prisma published-only filters"
  - "Search result UI with Chinese no-query/no-result states and metadata-rich published results"
  - "Homepage featured module backed by explicit `Post.featured` state and live public statistics"
affects: [public-content-library, public-routes, homepage, search, phase-4-verification]

tech-stack:
  added: []
  patterns:
    - "Public search remains server-rendered and calls searchPublishedPosts(query) from the shared public query layer."
    - "Homepage featured content and statistics are computed from getHomepagePublicContent() using the same published-only boundary."
    - "Search/homepage browser fixtures use direct Prisma phase-4 data with matching draft rows to prove no draft leakage."

key-files:
  created:
    - src/components/public/content/SearchForm.tsx
    - src/components/public/content/SearchResults.tsx
    - src/components/public/content/FeaturedNotesModule.tsx
    - .planning/phases/04-public-content-library/04-08-SUMMARY.md
  modified:
    - src/tests/e2e/public-content-library.spec.ts
    - src/tests/e2e/public-shell.spec.ts
    - src/lib/public/content-queries.ts
    - src/app/(public)/page.tsx
    - src/app/(public)/search/page.tsx

key-decisions:
  - "Kept `/search` as a server component using GET query handling and Prisma `contains` filters instead of adding Fuse, a client index, or a dedicated search engine."
  - "Computed homepage featured posts from explicit `featured` state only; latest published posts are not relabeled as featured."
  - "Trimmed and bounded public search query text to 120 characters before building parameterized Prisma filters."

patterns-established:
  - "SearchForm and SearchResults are props-only public components with Chinese visible copy and no client-side search dependency."
  - "FeaturedNotesModule composes PublicNoteList and public statistics from one homepage helper DTO."
  - "Public shell tests now assert the real dynamic search/homepage modules instead of Phase 1 placeholder copy."

requirements-completed: [SRCH-01, SRCH-02, SRCH-03, QUAL-04]

coverage:
  - id: D1
    description: "`/search` performs database-side published-only search over title, excerpt, body, category, and tags"
    requirement: SRCH-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders /search with contextual published results and no draft leakage"
        status: pass
      - kind: other
        ref: "rg source checks for searchPublishedPosts, Prisma filters, and no public route-local Prisma queries"
        status: pass
    human_judgment: false
  - id: D2
    description: "Search results show title, excerpt, publish date, category, tags, reading time, and polished Chinese empty states"
    requirement: SRCH-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders /search with contextual published results and no draft leakage"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders Chinese no-query and no-result search states without admin instructions"
        status: pass
    human_judgment: false
  - id: D3
    description: "Matching drafts are absent from public search and homepage featured modules"
    requirement: SRCH-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders /search with contextual published results and no draft leakage"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders homepage featured posts from explicit flags and real public statistics"
        status: pass
    human_judgment: false
  - id: D4
    description: "Homepage uses explicit featured state and live published-content statistics"
    requirement: QUAL-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders homepage featured posts from explicit flags and real public statistics"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders lab-index route strip and public content modules"
        status: pass
    human_judgment: false

duration: 17min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 08: Public Search and Homepage Featured Modules Summary

**Prisma-backed published-only public search and homepage featured/stat modules using explicit featured state**

## Performance

- **Duration:** 17min
- **Started:** 2026-07-07T06:21:54Z
- **Completed:** 2026-07-07T06:39:13Z
- **Tasks:** 2
- **Files modified:** 8 production/test files plus this summary

## Accomplishments

- Added RED browser coverage for `/search` published-result metadata, matching draft exclusion, Chinese no-query/no-result states, homepage featured posts, and real public statistics.
- Added `searchPublishedPosts(query)` with server-side Prisma filters over title, excerpt, bodyMarkdown, category name, and tag name behind the shared published-only predicate.
- Added `getHomepagePublicContent()` to return explicit featured posts plus live published public statistics for posts, featured posts, categories, tags, and series.
- Replaced `/search` placeholder copy with a server-rendered GET form and results page; replaced homepage placeholder module cards with `FeaturedNotesModule`.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add search and homepage visibility coverage** - `5d973ee` (test)
2. **Task 2 GREEN: Implement database search and homepage featured modules** - `1bc66e1` (feat)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/tests/e2e/public-content-library.spec.ts` - Adds phase-4 search/homepage fixtures and browser/source assertions for search results, no-query/no-result states, featured content, stats, and draft absence.
- `src/tests/e2e/public-shell.spec.ts` - Updates public shell expectations from placeholder search/homepage copy to real dynamic modules.
- `src/lib/public/content-queries.ts` - Adds `featured` to public post DTOs plus `searchPublishedPosts()` and `getHomepagePublicContent()`.
- `src/app/(public)/search/page.tsx` - Server-rendered GET query page using `SearchForm`, `SearchResults`, and public query helpers.
- `src/app/(public)/page.tsx` - Fetches homepage public content and renders `FeaturedNotesModule`.
- `src/components/public/content/SearchForm.tsx` - New accessible GET search form with Chinese label and stable button/input dimensions.
- `src/components/public/content/SearchResults.tsx` - New published-result list with metadata and Chinese empty states.
- `src/components/public/content/FeaturedNotesModule.tsx` - New homepage module for explicit featured posts and live public statistics.

## Verification Results

| Command | Result |
|---------|--------|
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` during RED | PASS for lint/build, expected Playwright failure: `搜索公开笔记` form was not found before implementation |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` after GREEN | PASS - 21/21 tests |
| `npx playwright test src/tests/e2e/public-shell.spec.ts --project=desktop` after public-shell update | PASS - 11/11 tests |
| `npm run lint` final | PASS |
| `npm run build` final | PASS |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts src/tests/e2e/public-shell.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` final | PASS - 232/232 tests |
| `! rg "dangerouslySetInnerHTML|rehype-raw" src/lib/markdown src/components/public src/app/'(public)'` final | PASS |
| Source scans for public route-local Prisma queries and production Fuse/client-index dependencies | PASS |

## Decisions Made

- Kept search server-rendered through GET query params and the shared public query helper; no client search index, Fuse dependency, or dedicated search service was added.
- Used Prisma `contains` filters with `mode: "insensitive"` and a 120-character normalized search query boundary.
- Kept homepage featured posts tied to `Post.featured` and `PUBLISHED` plus non-null `publishedAt`, not latest-post ordering.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Fixture Bug] Fixed duplicate series order in RED fixture**
- **Found during:** Task 1 RED verification
- **Issue:** The initial featured draft fixture reused `seriesOrder: 1`, violating the existing `seriesId, seriesOrder` unique constraint before the intended RED failure.
- **Fix:** Assigned a series order only to the published featured fixture so the draft can still prove featured draft absence without violating schema constraints.
- **Files modified:** `src/tests/e2e/public-content-library.spec.ts`
- **Verification:** Re-ran RED command; lint/build passed and Playwright failed for the expected missing search form.
- **Committed in:** `5d973ee`

**2. [Rule 1 - Test Compatibility] Updated stale public-shell placeholder assertions**
- **Found during:** Task 2 GREEN verification
- **Issue:** `public-shell.spec.ts` still expected placeholder search/homepage text and no button on `/search`, conflicting with the plan-required real GET search form and dynamic homepage module.
- **Fix:** Updated the shell test to assert real `/search` empty copy, the search submit button, and the real homepage featured/stat module.
- **Files modified:** `src/tests/e2e/public-shell.spec.ts`
- **Verification:** `npx playwright test src/tests/e2e/public-shell.spec.ts --project=desktop` passed, then the full required Playwright matrix passed.
- **Committed in:** `1bc66e1`

**3. [Rule 3 - Metadata Sync] Corrected STATE progress after GSD handler mismatch**
- **Found during:** Metadata update self-check
- **Issue:** `state.update-progress` returned 23/24 completed plans and 96%, but `STATE.md` persisted an inconsistent frontmatter `percent: 60` and body progress of 92%.
- **Fix:** Corrected the two persisted progress values to match the handler output and disk summary count.
- **Files modified:** `.planning/STATE.md`
- **Verification:** Re-read STATE/ROADMAP/REQUIREMENTS after update; ROADMAP shows Phase 4 at 10/11 and REQUIREMENTS marks SRCH-01/02/03 complete.
- **Committed in:** metadata commit

---

**Total deviations:** 3 auto-fixed (2 Rule 1 bugs, 1 Rule 3 metadata sync correction)  
**Impact on plan:** Fixes were directly required to prove the planned behavior and record execution state. No architecture, dependency, or scope expansion occurred.

## Issues Encountered

- A trial `server-only` import in `content-queries.ts` made Node-side Playwright direct imports fail with `Cannot find package 'server-only'`; it was removed before the GREEN commit to preserve the project’s existing direct query-helper test pattern.
- `next build` changed generated `next-env.d.ts` from `.next/types` to `.next/dev/types`; this generated local side effect was restored before commits.
- Public-shell locator assertions initially matched both the module heading and empty-state heading/body; the assertions were narrowed before final verification.
- `state.update-progress` reported the correct 96% progress but left persisted STATE progress inconsistent; the persisted values were corrected before the metadata commit.

## TDD Gate Compliance

PASS - Plan 04-08 has RED and GREEN commits in order:

- RED: `5d973ee` `test(04-08): add failing search homepage coverage`
- GREEN: `1bc66e1` `feat(04-08): implement public search and homepage modules`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None. Stub scan matched only test negative assertions against removed placeholder copy and a real search input `placeholder` attribute; no UI-blocking or unwired data-source stubs were introduced.

## Threat Flags

None. The new `/search` and homepage public read surfaces were explicitly covered by the plan threat model and mitigated with Prisma parameterized filters, bounded query text, and the shared published-only predicate.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-11 can add related articles and final cross-surface draft leakage checks without also implementing search or homepage featured modules. Search and homepage now use live database reads and the same public visibility boundary as notes, taxonomy, archive, and series.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-08-SUMMARY.md` exists on disk.
- Verified created components exist: `SearchForm.tsx`, `SearchResults.tsx`, and `FeaturedNotesModule.tsx`.
- Verified modified route/query files exist: `src/lib/public/content-queries.ts`, `src/app/(public)/search/page.tsx`, and `src/app/(public)/page.tsx`.
- Verified task commits exist in git history: `5d973ee` and `1bc66e1`.
- Verified coverage frontmatter classifies successfully with 4/4 auto-covered deliverables.
- Verified final required commands passed and are recorded above.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

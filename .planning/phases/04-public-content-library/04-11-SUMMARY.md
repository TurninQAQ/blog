---
phase: 04-public-content-library
plan: "11"
subsystem: public-content
tags: [nextjs, prisma, related-articles, public-visibility, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-05 article series navigation in article flow"
  - phase: 04-public-content-library
    provides: "04-07 real publish/unpublish/featured visibility behavior and public revalidation"
  - phase: 04-public-content-library
    provides: "04-08 public search and homepage featured modules"
provides:
  - "Published-only related article helper ranked by same series, shared tags, then shared category"
  - "RelatedArticlesRail component rendered below desktop TOC and in mobile article flow"
  - "Final public/admin Playwright matrix covering public content, shell, admin mutations, and admin authoring"
affects: [public-content-library, article-detail, related-articles, phase-4-verification]

tech-stack:
  added: []
  patterns:
    - "Article detail pages fetch getRelatedPublishedPosts(post) through src/lib/public/content-queries.ts after the published-only post lookup succeeds."
    - "Related articles reuse PublicPostSummary DTOs and shared publishedPostWhere filtering instead of route-local Prisma queries."
    - "RelatedArticlesRail is props-only and switches desktop/mobile placement by variant-specific test ids and responsive classes."

key-files:
  created:
    - src/components/public/content/RelatedArticlesRail.tsx
    - .planning/phases/04-public-content-library/04-11-SUMMARY.md
  modified:
    - src/tests/e2e/public-content-library.spec.ts
    - src/lib/public/content-queries.ts
    - src/app/(public)/notes/[slug]/page.tsx
    - src/components/public/content/ArticlePage.tsx

key-decisions:
  - "Kept related articles inside the shared public content query layer so every candidate uses PublicationStatus.PUBLISHED plus non-null publishedAt."
  - "Ranked related posts by first matching priority: same series, then any shared tag, then same category; ties fall back to newest publishedAt."
  - "Did not edit globals.css because existing lab tokens and Tailwind classes satisfied the rail/flow layout contract without new global CSS."

patterns-established:
  - "Related article tests seed current, same-series, shared-tag, shared-category, draft, and missing-publishedAt fixtures to prove ordering and non-leakage."
  - "Final public freshness coverage revisits notes, detail, taxonomy, archive, series, search, related, and homepage surfaces after a live publication-state change."

requirements-completed: [ORG-06, QUAL-04]

coverage:
  - id: D1
    description: "Related article helper excludes the current article and unpublished posts, then ranks same series before shared tags before shared category"
    requirement: ORG-06
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#ranks related articles by series, shared tags, then category without draft leakage"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Article detail pages render related articles below the desktop TOC and after series navigation in mobile document flow"
    requirement: ORG-06
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#places related articles below desktop TOC and after series navigation on mobile"
        status: pass
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop"
        status: pass
    human_judgment: false
  - id: D3
    description: "Final public visibility checks keep drafts absent and live publication changes fresh across Phase 4 public surfaces"
    requirement: QUAL-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#keeps final public surfaces fresh and free of drafts across notes, taxonomy, archive, series, search, related, and homepage"
        status: pass
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/public-content-library.spec.ts src/tests/e2e/public-shell.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
    human_judgment: false
  - id: D4
    description: "Public Markdown/source safety remains free of dangerouslySetInnerHTML and rehype-raw in public Markdown, public components, and public routes"
    verification:
      - kind: other
        ref: "! rg \"dangerouslySetInnerHTML|rehype-raw\" src/lib/markdown src/components/public src/app/'(public)'"
        status: pass
    human_judgment: false

duration: 13min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 11: Related Articles and Final Visibility Summary

**Published-only related articles ranked by series/tag/category, plus final cross-surface public/admin visibility verification**

## Performance

- **Duration:** 13min
- **Started:** 2026-07-07T06:48:19Z
- **Completed:** 2026-07-07T07:01:53Z
- **Tasks:** 2
- **Files modified:** 5 source/test files plus this summary

## Accomplishments

- Added RED coverage for related article helper export, series/tag/category ordering, draft exclusion, desktop rail placement, mobile flow placement, and final public freshness.
- Added `getRelatedPublishedPosts(post)` using the existing published-only public query boundary and priority ranking.
- Added `RelatedArticlesRail` with Chinese copy, 44px links, metadata, and responsive desktop/mobile placement.
- Wired article detail pages to fetch and render related articles below the desktop TOC and after series navigation in mobile flow.
- Ran the final public/admin Playwright matrix across desktop, mobile, min-mobile, and reduced-motion.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Add related-article and final visibility coverage** - `b75dd25` (test)
2. **Task 2 GREEN: Implement related article rail and final verification** - `e4eac57` (feat)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/components/public/content/RelatedArticlesRail.tsx` - New related articles component for desktop rail and mobile flow rendering.
- `src/lib/public/content-queries.ts` - Adds related DTO/type, ranking helpers, and `getRelatedPublishedPosts(post)`.
- `src/app/(public)/notes/[slug]/page.tsx` - Fetches related posts alongside series navigation after the published article lookup.
- `src/components/public/content/ArticlePage.tsx` - Renders related articles in the desktop rail and mobile article flow.
- `src/tests/e2e/public-content-library.spec.ts` - Adds related fixtures, ordering/layout assertions, final cross-surface visibility coverage, and component source checks.

## Verification Results

| Command | Result |
|---------|--------|
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` during RED | PASS for lint/build, expected Playwright failure: `getRelatedPublishedPosts` was not exported before implementation |
| `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` after GREEN | PASS - 24/24 tests |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts src/tests/e2e/public-shell.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` | PASS - 244/244 tests |
| `npm run lint` final | PASS |
| `npm run build` final | PASS |
| `! rg "dangerouslySetInnerHTML\|rehype-raw" src/lib/markdown src/components/public src/app/'(public)'` final | PASS |

## Decisions Made

- Kept all related article database reads in `src/lib/public/content-queries.ts`; public route files still do not query Prisma directly.
- Used a first-match priority ranking instead of additive scoring so "same series" always outranks shared tags and category.
- Limited related output to three posts after sorting, keeping the right rail compact.
- Reused local Tailwind utility classes instead of adding global CSS because the existing lab design tokens already covered spacing, borders, and responsive visibility.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Compatibility] Made related region assertions viewport-aware**
- **Found during:** Task 2 GREEN implementation
- **Issue:** The RED test always looked at `related-articles-mobile`, which conflicts with the desktop requirement that related articles live in the right rail.
- **Fix:** Updated assertions to choose `related-articles-desktop` or `related-articles-mobile` based on the active Playwright viewport.
- **Files modified:** `src/tests/e2e/public-content-library.spec.ts`
- **Verification:** Targeted desktop public-content run passed 24/24; full matrix passed 244/244.
- **Committed in:** `e4eac57`

**2. [Rule 1 - Test Compatibility] Loosened source assertion for dynamic related test ids**
- **Found during:** Task 2 GREEN verification
- **Issue:** The source-level test expected a literal `data-testid="related-articles` string, but the component correctly derives the test id from its desktop/mobile variant.
- **Fix:** Checked for the actual `related-articles-desktop` and `related-articles-mobile` strings instead.
- **Files modified:** `src/tests/e2e/public-content-library.spec.ts`
- **Verification:** Re-ran `npm run lint && npm run build && npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop`; it passed 24/24.
- **Committed in:** `e4eac57`

**3. [Rule 3 - Metadata Sync] Corrected STATE progress after GSD handler mismatch**
- **Found during:** Metadata update after Task 2
- **Issue:** `state.update-progress` returned 24/24 completed plans and 100%, but persisted `percent: 80` and left the body progress at 96%.
- **Fix:** Corrected STATE frontmatter/body progress to 100% and updated the current position copy to mark Phase 4 complete.
- **Files modified:** `.planning/STATE.md`, `.planning/phases/04-public-content-library/04-11-SUMMARY.md`
- **Verification:** Re-read STATE diff and confirmed progress fields reflect the handler output and disk summary count.
- **Committed in:** Plan metadata commit.

---

**Total deviations:** 3 auto-fixed (2 Rule 1 test compatibility fixes, 1 Rule 3 metadata sync correction)  
**Impact on plan:** The test fixes kept RED coverage aligned with the planned desktop/mobile layout contract, and the metadata correction kept STATE consistent with disk summaries. No product scope, dependency, or architecture expansion occurred.

## Issues Encountered

- Playwright emitted repeated `NO_COLOR`/`FORCE_COLOR` warnings and one existing `pg` deprecation warning during the full matrix; they did not affect results.
- The GSD progress handler returned the correct 24/24 count but persisted inconsistent STATE progress; metadata was corrected before the final commit.

## TDD Gate Compliance

PASS - Plan 04-11 has RED and GREEN commits in order:

- RED: `b75dd25` `test(04-11): add failing related article coverage`
- GREEN: `e4eac57` `feat(04-11): implement related article rail`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None. Stub scan only matched a test-local `const pageTexts: string[] = []`, which does not feed UI rendering or production data.

## Threat Flags

None. The new public related helper surface was explicitly covered by the plan threat model and mitigated with `PublicationStatus.PUBLISHED`, non-null `publishedAt`, current-article exclusion, and draft/missing-publishedAt tests.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 4 public content library is complete and ready for Phase 5 interaction polish and release verification. Related articles, search, homepage featured modules, taxonomy, archive, series, article detail, and admin publication behavior are covered together by the final Playwright matrix.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-11-SUMMARY.md` exists on disk.
- Verified created component exists: `src/components/public/content/RelatedArticlesRail.tsx`.
- Verified modified route/query/component/test files exist and are committed in task history.
- Verified task commits exist in git history: `b75dd25` and `e4eac57`.
- Verified coverage frontmatter classifies successfully with 4/4 auto-covered deliverables.
- Verified final required commands passed and are recorded above.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

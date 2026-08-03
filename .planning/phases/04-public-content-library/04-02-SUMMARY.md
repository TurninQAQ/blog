---
phase: 04-public-content-library
plan: "02"
subsystem: public-content
tags: [markdown, shiki, prisma, public-queries, seo, testing]

requires:
  - phase: 04-public-content-library
    provides: "04-01 supply-chain approval for exact shiki@4.3.0 before install"
  - phase: 03-markdown-authoring-workflow
    provides: "Safe Markdown preview policy and admin post query patterns"
provides:
  - "Exact runtime pins for shiki@4.3.0, reading-time@1.5.0, and hast-util-to-jsx-runtime@2.3.6"
  - "Published-only public post list/detail query helpers with reading time DTOs"
  - "Safe public Markdown renderer with Shiki HAST-to-JSX code highlighting and TOC heading data"
  - "Article metadata helper derived from public post DTO fields"
  - "Phase 4 direct Prisma fixture helpers and coverage for public leakage checks"
affects: [public-content-library, markdown-rendering, public-routes, seo, phase-4-tests]

tech-stack:
  added: [shiki@4.3.0, reading-time@1.5.0, hast-util-to-jsx-runtime@2.3.6]
  patterns:
    - "Public content reads go through a central Prisma helper that requires PUBLISHED status and non-null publishedAt."
    - "Public Markdown rendering strips raw HTML and renders Shiki HAST through JSX runtime rather than raw HTML strings."

key-files:
  created:
    - src/lib/public/content-queries.ts
    - src/lib/markdown/public-render.tsx
    - src/lib/seo/article-metadata.ts
    - src/tests/e2e/public-content-library.spec.ts
    - .planning/phases/04-public-content-library/04-02-SUMMARY.md
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "Installed only the 04-01 approved exact pins: shiki@4.3.0, reading-time@1.5.0, and hast-util-to-jsx-runtime@2.3.6."
  - "Centralized public post visibility around PublicationStatus.PUBLISHED plus non-null publishedAt before downstream routes consume content."
  - "Kept public Markdown raw HTML disabled by stripping raw HTML outside code fences before sanitized React rendering."

patterns-established:
  - "PublicPostSummary/PublicPostDetail DTOs include category, tags, series, publishedAt, and readingTime for shared public surfaces."
  - "Phase 4 e2e fixtures use phase-4- slugs and Chinese taxonomy names with cleanup before/after tests."
  - "Shiki public code rendering uses codeToHast and hast-util-to-jsx-runtime, with no rehype-raw or dangerouslySetInnerHTML source path."

requirements-completed: [READ-02, READ-03, READ-04, READ-05, READ-06, READ-07]

coverage:
  - id: D1
    description: "Exact approved public rendering dependencies installed and pinned"
    requirement: READ-04
    verification:
      - kind: other
        ref: "node -e dependency pin script"
        status: pass
      - kind: other
        ref: "node -e package-lock exact pin check"
        status: pass
      - kind: other
        ref: "node -e banned dependency check"
        status: pass
    human_judgment: false
  - id: D2
    description: "Published-only public list/detail query boundary with reading time DTOs"
    requirement: READ-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#returns only published posts with reading metadata from the public query boundary"
        status: pass
    human_judgment: false
  - id: D3
    description: "Safe public Markdown renderer with Shiki code highlighting and TOC heading data"
    requirement: READ-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders public Markdown with Shiki, table wrappers, generated TOC, and no raw HTML"
        status: pass
      - kind: other
        ref: "! rg \"dangerouslySetInnerHTML|rehype-raw\" src/lib/markdown src/lib/public src/components/markdown"
        status: pass
    human_judgment: false
  - id: D4
    description: "Generated TOC headings and server-side syntax highlighting support"
    requirement: READ-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#renders public Markdown with Shiki, table wrappers, generated TOC, and no raw HTML"
        status: pass
    human_judgment: false
  - id: D5
    description: "Article metadata helper derives SEO/share metadata from public DTO fields"
    requirement: READ-07
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-content-library.spec.ts#derives article metadata from the public post DTO"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 02: Public Content Foundation Summary

**Published-only public content helpers with safe Shiki Markdown rendering, reading time, SEO metadata, and isolated Phase 4 fixtures**

## Performance

- **Duration:** 9min
- **Started:** 2026-07-07T03:01:00Z
- **Completed:** 2026-07-07T03:10:23Z
- **Tasks:** 2
- **Files modified:** 6 production/test files

## Accomplishments

- Installed the approved exact public rendering dependencies and verified package/lock pins.
- Added `getPublishedPostList()` and `getPublishedPostBySlug(slug)` public helpers that only expose `PUBLISHED` posts with non-null `publishedAt`.
- Added safe server Markdown rendering with Shiki `codeToHast`, HAST-to-JSX output, table wrappers, raw-HTML stripping, and generated heading data for TOC.
- Added article metadata derivation from title, excerpt, cover, category, series, and tags.
- Added Phase 4 fixture-backed tests using `phase-4-` slugs/taxonomy names with cleanup.

## Task Commits

1. **Task 1: Install exact public rendering dependencies after Shiki approval** - `7fc34fb` (chore)
2. **Task 2 RED: Create published query, safe Markdown, metadata, and fixture foundation** - `1566466` (test)
3. **Task 2 GREEN: Create published query, safe Markdown, metadata, and fixture foundation** - `3938291` (feat)

**Plan metadata:** committed separately after STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `package.json` - Adds exact direct runtime pins for Shiki, reading-time, and HAST-to-JSX rendering.
- `package-lock.json` - Resolves the exact approved dependency versions.
- `src/lib/public/content-queries.ts` - Public post DTOs and published-only list/detail helpers with reading time.
- `src/lib/markdown/public-render.tsx` - Public Markdown renderer with GFM, sanitization, raw HTML stripping, Shiki HAST output, and TOC headings.
- `src/lib/seo/article-metadata.ts` - Metadata helper for public article detail routes.
- `src/tests/e2e/public-content-library.spec.ts` - Phase 4 fixtures and coverage for query, Markdown, and metadata behavior.

## Verification Results

| Command | Result |
|---------|--------|
| `node -e 'const pkg=require("./package.json"); const expected={shiki:"4.3.0","reading-time":"1.5.0","hast-util-to-jsx-runtime":"2.3.6"}; for (const name of Object.keys(expected)) { const version=expected[name]; if ((pkg.dependencies || {})[name] !== version) throw new Error(name + " not pinned to " + version); }'` | PASS |
| `node -e package-lock exact pin check` | PASS |
| `node -e banned search/MDX/raw HTML dependency check` | PASS |
| `npx playwright test src/tests/e2e/public-content-library.spec.ts --project=desktop` | PASS - 3 tests |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `! rg "dangerouslySetInnerHTML\|rehype-raw" src/lib/markdown src/lib/public src/components/markdown` | PASS |

## Decisions Made

- Installed only the exact pins approved by Plan 04-01; no Fuse, dedicated search package, MDX package, `rehype-raw`, or broad raw-HTML Markdown dependency was added.
- Public post helpers expose `status: PUBLISHED` in DTOs for testable boundary proof but still require non-null `publishedAt` before mapping.
- Public Markdown removes raw HTML outside fenced code blocks before sanitized rendering so raw tag contents do not appear or execute in public article output.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first RED run failed because the new test did not load ignored `.env.local`; the test helper was fixed to load Next env config, then RED failed for the intended missing public query module before the RED commit.
- Playwright's direct TSX import path surfaced React rendering issues for async code components; the renderer now pre-highlights fenced code and returns synchronous React nodes.
- Context7 CLI was unavailable (`ctx7 not found`), so Shiki/HAST API usage was verified from the installed package type definitions.

## TDD Gate Compliance

PASS - Task 2 has the required RED and GREEN commits in order:

- RED: `1566466` `test(04-02): add failing public content foundation coverage`
- GREEN: `3938291` `feat(04-02): add public content rendering foundation`
- REFACTOR: not needed

## Authentication Gates

None.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plan 04-03 can build `/notes` and `/notes/[slug]` against `src/lib/public/content-queries.ts`, `src/lib/markdown/public-render.tsx`, and `src/lib/seo/article-metadata.ts` without creating new query or Markdown safety boundaries.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-02-SUMMARY.md` exists on disk.
- Verified created files exist: `src/lib/public/content-queries.ts`, `src/lib/markdown/public-render.tsx`, `src/lib/seo/article-metadata.ts`, and `src/tests/e2e/public-content-library.spec.ts`.
- Verified modified dependency files exist: `package.json` and `package-lock.json`.
- Verified task commits exist in git history: `7fc34fb`, `1566466`, and `3938291`.
- Verified final plan verification commands passed and are recorded above.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

---
phase: 04-public-content-library
plan: "07"
subsystem: admin-publication
tags: [nextjs, prisma, admin, publishing, revalidation, featured-posts, playwright]

requires:
  - phase: 04-public-content-library
    provides: "04-06 Post.featured schema field and generated Prisma support"
  - phase: 04-public-content-library
    provides: "04-10 published-only public taxonomy/archive/series routes"
provides:
  - "Guarded publish and unpublish mutations that change real public visibility"
  - "Protected admin controls for publishing, unpublishing, setting featured, and unsetting featured"
  - "Public path revalidation helper covering home, notes, detail, taxonomy, archive, series, and search paths"
affects: [public-content-library, admin-authoring, homepage-featured-posts, public-cache-freshness]

tech-stack:
  added: []
  patterns:
    - "Admin post mutation dispatcher remains guard-first: requireAdmin() runs before request JSON parsing, zod parsing, or Prisma writes."
    - "Public freshness is centralized in src/lib/public/revalidate.ts and called from successful admin content mutations."
    - "Admin publication controls are a client component that posts to existing protected mutation routes; authorization remains server-side."

key-files:
  created:
    - src/components/admin/AdminPublishControls.tsx
    - src/lib/public/revalidate.ts
    - .planning/phases/04-public-content-library/04-07-SUMMARY.md
  modified:
    - src/tests/e2e/admin-authoring.spec.ts
    - src/tests/e2e/admin-mutations.spec.ts
    - src/lib/admin/post-input.ts
    - src/lib/admin/post-queries.ts
    - src/lib/admin/post-mutations.ts
    - src/components/admin/PostEditorShell.tsx
    - src/components/admin/AdminPostList.tsx

key-decisions:
  - "Implemented feature/unfeature as explicit protected admin post operations so both editor and list controls can mutate featured state without duplicating full edit payloads."
  - "Kept unpublish as status DRAFT while preserving publishedAt history; public visibility is removed by the published-only query boundary."
  - "Used a shared revalidation helper instead of route-local revalidation calls so old and new public path snapshots stay consistent."

patterns-established:
  - "Publish reads current state and only fills publishedAt when it is null."
  - "Editing a published post preserves PUBLISHED status and first publishedAt while updating content and featured state."
  - "Admin list and editor share AdminPublishControls for publish/unpublish/featured actions."

requirements-completed: [CMS-05, CMS-06, QUAL-04]

coverage:
  - id: D1
    description: "Publish, repeat publish, edit published, and unpublish change durable post visibility correctly"
    requirement: CMS-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#publishes drafts, preserves first publishedAt on repeat publish, and unpublishes from public visibility"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#edits a published post through the protected route while keeping it public and featured"
        status: pass
    human_judgment: false
  - id: D2
    description: "Protected admin editor and list controls can set and unset featured state"
    requirement: CMS-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#sets and unsets featured state from protected editor and list controls"
        status: pass
    human_judgment: false
  - id: D3
    description: "Admin mutations revalidate affected public paths and keep guard-first ordering"
    requirement: QUAL-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#keeps mutation-driven public revalidation wired to all affected public paths"
        status: pass
      - kind: other
        ref: "node --input-type=module -e <guard-order source check>"
        status: pass
    human_judgment: false

duration: 14min
completed: 2026-07-07
status: complete
---

# Phase 04 Plan 07: Admin Publication Controls Summary

**Guarded admin publishing, unpublishing, featured controls, and public revalidation for live content visibility**

## Performance

- **Duration:** 14min
- **Started:** 2026-07-07T06:01:50Z
- **Completed:** 2026-07-07T06:15:56Z
- **Tasks:** 2
- **Files modified:** 10 source/test/summary files

## Accomplishments

- Added RED coverage for real publication transitions, published edit freshness, protected featured controls, revalidation path coverage, and guard-first ordering.
- Replaced publish/unpublish boundary stubs with guarded Prisma mutations that preserve first `publishedAt`, unpublish to `DRAFT`, and keep published edits public.
- Added `AdminPublishControls` to the editor and list, supporting `发布文章`, `取消发布`, `设为精选`, and `取消精选`.
- Added `src/lib/public/revalidate.ts` to compute old/new affected public paths and call `revalidatePath()`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add RED admin publication and revalidation coverage** - `7a27dff` (test)
2. **Task 2: Implement guarded publication mutations, featured controls, and public revalidation** - `8bb40f9` (feat)

**Plan metadata:** committed separately after SUMMARY/STATE/ROADMAP/REQUIREMENTS updates.

## Files Created/Modified

- `src/components/admin/AdminPublishControls.tsx` - Shared protected admin publish/unpublish/featured action controls.
- `src/lib/public/revalidate.ts` - Computes and revalidates affected public paths from previous and next post snapshots.
- `src/lib/admin/post-input.ts` - Adds `featured` validation and `{ id }` parsers for publish/unpublish/feature/unfeature.
- `src/lib/admin/post-queries.ts` - Adds `featured` to admin summary/editor DTOs.
- `src/lib/admin/post-mutations.ts` - Implements real guarded publish, unpublish, feature, unfeature, published-edit preservation, and revalidation calls.
- `src/components/admin/PostEditorShell.tsx` - Carries featured state through editor save payloads and renders publication controls.
- `src/components/admin/AdminPostList.tsx` - Shows featured state and renders publication controls on each row.
- `src/tests/e2e/admin-authoring.spec.ts` - Adds featured UI coverage and updates obsolete authenticated publish no-op assertion.
- `src/tests/e2e/admin-mutations.spec.ts` - Adds publication/revalidation/featured mutation coverage.

## Verification Results

| Command | Result |
|---------|--------|
| `npx playwright test src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop` during RED | EXPECTED RED - failed on missing `发布文章` button and missing `feature` operation. |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npx playwright test src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop` | PASS - 26/26 tests passed. |
| `node --input-type=module -e <guard-order source check>` | PASS - `runGuardedPostMutation()` first executable statement is `const adminSession = await requireAdmin();`; no request parsing, zod, or Prisma work occurs before it. |
| `rg` source checks for `featured`, publish/unpublish parsers, and revalidation paths | PASS - required admin DTO/input/UI/revalidation tokens found. |

## Decisions Made

- Added `feature` and `unfeature` as explicit protected operations so list controls can change featured state without carrying full editor form data.
- Preserved `publishedAt` when unpublishing; public visibility is still removed because public queries require `PublicationStatus.PUBLISHED`.
- Revalidated public paths after successful writes outside the transaction, using previous and next snapshots to include old/new slugs and taxonomy paths.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Metadata Bug] Corrected STATE progress after SDK write inconsistency**
- **Found during:** Metadata update after Task 2
- **Issue:** `state.update-progress` returned 92% but wrote `percent: 60` in STATE frontmatter and left the body progress bar at 88%.
- **Fix:** Corrected STATE progress fields to 22/24 completed plans and 92% before committing metadata.
- **Files modified:** `.planning/STATE.md`, `.planning/phases/04-public-content-library/04-07-SUMMARY.md`
- **Verification:** Re-read STATE diff and confirmed progress fields reflect 22 completed of 24 total plans.
- **Committed in:** Plan metadata commit.

---

**Total deviations:** 1 auto-fixed (1 Rule 1 metadata bug)
**Impact on plan:** Metadata-only correction; production code, tests, and verification results were unaffected.

## Issues Encountered

- The first GREEN Playwright run exposed two over-broad test assertions from the new RED coverage: `精选` matched title/summary/button text, and a source assertion assumed each publication function called revalidation directly. These were tightened to exact badge matching and shared-helper matching.
- Existing Phase 3 authoring coverage still expected an authenticated publish call for a nonexistent post to return OK as a boundary no-op. Because Plan 04-07 intentionally made publish a real `{ id }` mutation, the assertion now expects the correct `400` validation error.
- The GSD `state.update-progress` command returned 92% but wrote `percent: 60` and left the body progress bar stale. The STATE progress fields were corrected to 22/24 and 92% before committing metadata.

## TDD Gate Compliance

PASS:

- RED: `7a27dff` `test(04-07): add failing admin publication coverage`
- GREEN: `8bb40f9` `feat(04-07): implement admin publication controls`
- REFACTOR: not needed; no separate cleanup commit was required after GREEN verification.

## Authentication Gates

None.

## Known Stubs

None. Stub scan matches were null/empty checks, placeholder attributes in real form inputs, and test fixture defaults; no UI-blocking or data-source stubs were introduced.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: auth-surface | `src/lib/admin/post-mutations.ts` | Added `feature` and `unfeature` admin operations under the existing protected mutation route. Mitigated by unchanged route-level origin rejection and guard-first `requireAdmin()`. |

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Plans 04-08 and 04-11 can now rely on real publish/unpublish visibility, durable featured state, and mutation-triggered public path revalidation for homepage/search/related surfaces.

## Self-Check: PASSED

- Verified `.planning/phases/04-public-content-library/04-07-SUMMARY.md` exists on disk.
- Verified created files exist: `src/components/admin/AdminPublishControls.tsx` and `src/lib/public/revalidate.ts`.
- Verified modified source/test files exist and contain the expected featured, parser, revalidation, and guard-order coverage.
- Verified task commits exist in git history: `7a27dff` and `8bb40f9`.

---
*Phase: 04-public-content-library*
*Completed: 2026-07-07*

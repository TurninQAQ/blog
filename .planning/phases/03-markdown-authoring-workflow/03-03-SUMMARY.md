---
phase: 03-markdown-authoring-workflow
plan: "03"
subsystem: cms
tags: [nextjs, prisma, taxonomy, series, playwright, admin]
requires:
  - phase: 03-markdown-authoring-workflow
    provides: Protected Markdown draft editor, safe preview, and guard-first draft save flow
provides:
  - Inline category, tag, and series assignment inside the article editor
  - Inline taxonomy creation with duplicate slug validation
  - Optional series order with duplicate order validation
  - Transactional draft save for post metadata and PostTag replacement
  - Dashboard/list organization metadata display
  - Browser coverage proving no standalone taxonomy management routes were added
affects: [03-markdown-authoring-workflow, admin, cms, taxonomy, public-content-library]
tech-stack:
  added: []
  patterns:
    - Taxonomy creation is only reachable through the existing guarded post save mutation
    - Draft save resolves taxonomy and replaces PostTag rows inside one Prisma transaction
    - Inline editor controls create taxonomy records without standalone management pages
key-files:
  created:
    - src/components/admin/TaxonomyPicker.tsx
    - src/components/admin/SeriesOrderInput.tsx
  modified:
    - src/tests/e2e/admin-authoring.spec.ts
    - src/lib/admin/post-input.ts
    - src/lib/admin/post-queries.ts
    - src/lib/admin/post-mutations.ts
    - src/components/admin/PostEditorShell.tsx
    - src/components/admin/AdminDashboard.tsx
    - src/components/admin/AdminPostList.tsx
    - src/app/admin/(protected)/posts/new/page.tsx
    - src/app/admin/(protected)/posts/[postId]/page.tsx
key-decisions:
  - "Kept taxonomy management inline inside the article editor; no /admin/categories, /admin/tags, or /admin/series route was added."
  - "Duplicate inline taxonomy creation returns field-level errors instead of silently connecting existing records."
  - "Series order remains optional, but when present it must be a positive integer and unique within the selected series."
patterns-established:
  - "Editor routes fetch selectable category/tag/series options with getAdminPostEditorData()."
  - "PostTag assignments are replaced on edit so removed tags do not accumulate stale joins."
  - "Dashboard/list metadata uses category label, tag count, and series title plus optional #order."
requirements-completed: [CMS-01, CMS-07, TAX-01, TAX-02, TAX-03, TAX-04]
coverage:
  - id: D1
    description: "Admin can create inline category, tags, series, and series order while saving a draft."
    requirement: TAX-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#creates and persists inline taxonomy and series metadata"
        status: pass
    human_judgment: false
  - id: D2
    description: "Reopening a draft shows persisted category, tags, selected series, and series order."
    requirement: CMS-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#creates and persists inline taxonomy and series metadata"
        status: pass
    human_judgment: false
  - id: D3
    description: "Duplicate taxonomy creation and duplicate series order return inline errors without erasing editor body."
    requirement: CMS-07
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#shows duplicate taxonomy and series order errors without erasing the body"
        status: pass
    human_judgment: false
  - id: D4
    description: "Taxonomy mutation remains behind the existing guard-first post save dispatcher."
    requirement: CMS-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#keeps the mutation dispatcher guard-first and the route body-free"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#keeps draft mutation input lazy and guard-first"
        status: pass
    human_judgment: false
  - id: D5
    description: "No standalone taxonomy management routes or admin taxonomy pages exist in Phase 3."
    requirement: TAX-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#does not add standalone taxonomy management routes"
        status: pass
      - kind: other
        ref: "! rg \"/admin/(categories|tags|series)|admin/categories|admin/tags|admin/series\" src/app src/components"
        status: pass
    human_judgment: false
duration: 15min
completed: 2026-07-06
status: complete
---

# Phase 3 Plan 03 Summary

**Inline taxonomy and series organization inside the protected Markdown authoring workflow**

## Performance

- **Duration:** 15 min
- **Started:** 2026-07-06T14:10:00+08:00
- **Completed:** 2026-07-06T14:25:00+08:00
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Added category, tag, series, and series order controls to the editor metadata rail.
- Extended draft input validation and Prisma mutations to resolve/create taxonomy records inside guarded transactions.
- Added duplicate taxonomy and duplicate series order errors with field-level feedback while preserving the Markdown body.
- Updated dashboard and article list rows to show category, tag count, and series order metadata.
- Verified Phase 3 remains scoped to inline taxonomy authoring with no standalone taxonomy management routes.

## Task Commits

1. **Task 1: Add RED taxonomy and series authoring coverage** - `949f0a0` (test)
2. **Tasks 2-3: Add taxonomy persistence, UI, and metadata display** - `a1c350c` (feat)

## Files Created/Modified

- `src/components/admin/TaxonomyPicker.tsx` - Category, tag, and series picker UI with inline creation inputs.
- `src/components/admin/SeriesOrderInput.tsx` - Conditional numeric series order control.
- `src/components/admin/PostEditorShell.tsx` - Metadata state, validation, payload serialization, and taxonomy controls.
- `src/lib/admin/post-input.ts` - Taxonomy schemas, name normalization, and series order validation.
- `src/lib/admin/post-mutations.ts` - Transactional taxonomy resolution, post save, tag replacement, and duplicate conflict handling.
- `src/lib/admin/post-queries.ts` - Editor taxonomy option queries and series order metadata mapping.
- `src/components/admin/AdminDashboard.tsx` and `src/components/admin/AdminPostList.tsx` - Organization metadata display.
- `src/app/admin/(protected)/posts/new/page.tsx` and `src/app/admin/(protected)/posts/[postId]/page.tsx` - Server data wiring for editor options.
- `src/tests/e2e/admin-authoring.spec.ts` - Taxonomy persistence, duplicate conflict, and no-standalone-route coverage.

## Decisions Made

- Inline creation attempts that duplicate an existing taxonomy slug fail with "Select it instead" instead of auto-connecting, so accidental duplicate names remain visible to the admin.
- Series order is only shown when a series is selected or being created; blank order is allowed, but duplicate numeric order in the same series is rejected.
- Tags are replaced on edit through `PostTag` deletion and recreation, preventing stale tag joins.

## Deviations from Plan

### Auto-fixed Issues

**1. Test locator precision**
- **Found during:** Task 3 desktop verification
- **Issue:** `Category` and `Series` labels also matched `New category` and `New series`; dashboard/list metadata appeared in both visible badges and accessibility helper text.
- **Fix:** Tightened Playwright locators with exact labels and `.first()` where duplicated accessible text is intentional.
- **Files modified:** `src/tests/e2e/admin-authoring.spec.ts`
- **Verification:** Desktop and full browser matrices passed.
- **Committed in:** `a1c350c`

**2. Combined persistence and UI implementation**
- **Found during:** Execution
- **Issue:** Server query shape, editor props, payload serialization, and picker UI were tightly coupled, making a separate green server-only commit noisy without a usable route.
- **Fix:** Kept the RED test commit separate, then implemented Task 2 and Task 3 together in one feature commit while preserving all planned verification gates.
- **Files modified:** server helpers, editor UI, route pages, dashboard/list, tests
- **Verification:** `npm run lint`, `npm run build`, desktop admin tests, and full browser matrix passed.
- **Committed in:** `a1c350c`

**3. Inline sequential execution**
- **Found during:** Execution setup
- **Issue:** This Codex session cannot spawn the planned GSD subagents automatically.
- **Fix:** Executed the plan sequentially inline while keeping task commits and verification gates.
- **Files modified:** none
- **Verification:** All planned checks passed.
- **Committed in:** n/a

**Total deviations:** 3 auto-fixed
**Impact on plan:** No scope expansion; deviations were limited to test precision, commit grouping, and execution-environment constraints.

## Issues Encountered

- The initial RED test correctly failed on the missing `New category` control.
- After implementation, the first two desktop reruns exposed Playwright strict-mode locator ambiguity, not product failures; the selectors were tightened and the same workflows passed.

## Verification

- `npm run lint` - pass
- `npm run build` - pass
- `npx playwright test src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop` - pass: 20 passed
- `npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts src/tests/e2e/public-shell.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - pass: 173 passed, 15 skipped
- `! rg "/admin/(categories|tags|series)|admin/categories|admin/tags|admin/series" src/app src/components` - pass
- `rg "@uiw/react-md-editor|rehype-raw|dangerouslySetInnerHTML" src || true` - pass: no unsafe Markdown renderer/source matches; UIW import remains isolated to admin editor wrapper plus test scan

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Phase 3 is complete. Phase 4 can now build public published-content routes on top of draft authoring, taxonomy, series order, and the safe Markdown preview policy. Publishing/unpublishing behavior is still only an authorization boundary and must become real in Phase 4.

---
*Phase: 03-markdown-authoring-workflow*
*Completed: 2026-07-06*

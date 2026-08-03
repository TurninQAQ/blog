---
phase: 03-markdown-authoring-workflow
plan: "01"
subsystem: cms
tags: [nextjs, prisma, playwright, admin, drafts]
requires:
  - phase: 02-data-model-and-admin-access
    provides: Prisma content models, protected admin layout, and guard-first admin mutation boundary
provides:
  - Protected admin dashboard, article list, draft editor shell, and delete dialog
  - Guard-first create/edit/delete draft mutations with zod validation and duplicate slug handling
  - Playwright coverage for admin draft CRUD, validation, and mutation source-order safety
affects: [03-markdown-authoring-workflow, admin, cms, markdown-authoring]
tech-stack:
  added: []
  patterns:
    - Lazy request body reader passed into guarded mutation dispatcher
    - Server-only admin query helpers returning serialized view data
    - Client editor shell using same-origin JSON admin mutation APIs
key-files:
  created:
    - src/tests/e2e/admin-authoring.spec.ts
    - src/lib/admin/post-input.ts
    - src/lib/admin/post-queries.ts
    - src/app/admin/(protected)/posts/page.tsx
    - src/app/admin/(protected)/posts/new/page.tsx
    - src/app/admin/(protected)/posts/[postId]/page.tsx
    - src/components/admin/AdminDashboard.tsx
    - src/components/admin/AdminPostList.tsx
    - src/components/admin/DeletePostDialog.tsx
    - src/components/admin/PostEditorShell.tsx
  modified:
    - src/lib/admin/post-mutations.ts
    - src/app/api/admin/posts/[operation]/route.ts
    - src/app/admin/(protected)/page.tsx
    - src/tests/e2e/admin-auth.spec.ts
    - src/tests/e2e/admin-mutations.spec.ts
key-decisions:
  - "Kept publish/unpublish as guarded compatibility responses; create/edit/delete are the only real Phase 3 writes."
  - "Kept the first editor slice as a plain Markdown textarea with lightweight preview; package-backed editor remains 03-02."
  - "Preserved route-level CSRF checks and moved JSON parsing behind requireAdmin via a lazy read callback."
patterns-established:
  - "Admin write APIs accept untrusted JSON only after requireAdmin() succeeds inside runGuardedPostMutation()."
  - "Admin pages fetch server data in protected route pages and pass serialized props to focused UI components."
  - "Draft UI labels use explicit htmlFor/id pairs so validation copy does not pollute accessible names."
requirements-completed: [CMS-01, CMS-02, CMS-03, CMS-04, CMS-07]
coverage:
  - id: D1
    description: "Authenticated admin can create, edit, list, and hard-delete a draft post."
    requirement: CMS-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#creates, edits, lists, and hard-deletes a draft"
        status: pass
    human_judgment: false
  - id: D2
    description: "Draft save validates required title/body, invalid slug, and duplicate slug conflicts with exact UI copy."
    requirement: CMS-07
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#shows validation and duplicate slug errors"
        status: pass
    human_judgment: false
  - id: D3
    description: "Create/edit/delete admin mutations remain guard-first and route body parsing stays lazy."
    requirement: CMS-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-mutations.spec.ts#keeps the mutation dispatcher guard-first and the route body-free"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#keeps draft mutation input lazy and guard-first"
        status: pass
    human_judgment: false
  - id: D4
    description: "Protected dashboard/list/editor surfaces render across desktop, mobile, min-mobile, and reduced-motion projects."
    verification:
      - kind: automated_ui
        ref: "npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
    human_judgment: false
duration: 30min
completed: 2026-07-06
status: complete
---

# Phase 3 Plan 01 Summary

**Protected draft authoring loop with dashboard, list, editor shell, hard delete, and guard-first Prisma mutations**

## Performance

- **Duration:** 30 min
- **Started:** 2026-07-06T10:18:00+08:00
- **Completed:** 2026-07-06T10:47:40+08:00
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments

- Added RED Playwright coverage for admin authoring before implementation, then brought it green.
- Implemented zod draft input parsing, slug normalization, duplicate slug errors, and real Prisma create/edit/delete behind `requireAdmin()`.
- Replaced the Phase 2 admin placeholder with a dashboard, draft list, editor shell, and title-bearing hard delete dialog.
- Preserved the Phase 2 security boundary: the API route delegates `() => request.json()` lazily and does not parse request bodies before the guarded dispatcher.

## Task Commits

1. **Task 1: Add RED minimal draft CRUD Playwright coverage** - `9c3098f` (test)
2. **Task 2: Implement guard-first draft inputs, queries, and mutations** - `f8e0d3a` (feat)
3. **Task 3: Build dashboard, list, editor shell, and hard delete UI** - `5ebaf2b` (feat)

## Files Created/Modified

- `src/tests/e2e/admin-authoring.spec.ts` - Draft CRUD, validation, duplicate slug, and source-order coverage.
- `src/lib/admin/post-input.ts` - Slug helpers, zod schemas, and validation error type.
- `src/lib/admin/post-queries.ts` - Server-only dashboard, list, and editor query helpers.
- `src/lib/admin/post-mutations.ts` - Guard-first create/edit/delete dispatcher with draft-only writes.
- `src/app/api/admin/posts/[operation]/route.ts` - Lazy JSON reader delegation and validation error responses.
- `src/app/admin/(protected)/page.tsx` - Dashboard route wired to real data.
- `src/app/admin/(protected)/posts/*` - Protected list, new draft, and edit draft routes.
- `src/components/admin/AdminDashboard.tsx` - Writing Console dashboard and metrics.
- `src/components/admin/AdminPostList.tsx` - Sortable-by-query admin list surface.
- `src/components/admin/PostEditorShell.tsx` - Plain Markdown draft editor shell with save flow.
- `src/components/admin/DeletePostDialog.tsx` - Exact-title hard delete confirmation.
- `src/tests/e2e/admin-auth.spec.ts` and `src/tests/e2e/admin-mutations.spec.ts` - Updated stale Phase 2 assertions and route body-free source scan.

## Decisions Made

- No new dependencies were added in 03-01.
- Publish/unpublish remain authorization boundary checks only; no public visibility or revalidation behavior was introduced.
- The editor uses a plain textarea in this slice so 03-02 can introduce the approved Markdown editor package behind a package checkpoint.

## Deviations from Plan

### Auto-fixed Issues

**1. TypeScript zod flatten typing**
- **Found during:** Task 2 verification
- **Issue:** `Object.entries(error.flatten().fieldErrors)` lost array typing.
- **Fix:** Guarded with `Array.isArray(messages)` before reading the first error.
- **Files modified:** `src/lib/admin/post-input.ts`
- **Verification:** `npm run build` passed.
- **Committed in:** `f8e0d3a`

**2. Source scan and default callback shape**
- **Found during:** Task 2 verification
- **Issue:** The source scanner found the first `{` inside a default arrow callback in the function signature.
- **Fix:** Moved the default empty reader to a named helper so the dispatcher body begins with `const adminSession = await requireAdmin();`.
- **Files modified:** `src/lib/admin/post-mutations.ts`
- **Verification:** `admin-mutations.spec.ts` source-order test passed.
- **Committed in:** `f8e0d3a`

**3. Accessibility label pollution**
- **Found during:** Task 3 verification
- **Issue:** Wrapped labels included validation text, making `getByLabel("Slug")` ambiguous.
- **Fix:** Switched editor fields to explicit `htmlFor`/`id` labels with errors outside labels.
- **Files modified:** `src/components/admin/PostEditorShell.tsx`
- **Verification:** `admin-authoring.spec.ts` passed on desktop/mobile/min-mobile/reduced-motion.
- **Committed in:** `5ebaf2b`

**4. Inline sequential execution**
- **Found during:** Execution setup
- **Issue:** This Codex session cannot spawn the planned GSD subagents automatically.
- **Fix:** Executed the plan sequentially inline while keeping task commits and verification gates.
- **Files modified:** none
- **Verification:** All planned checks passed.
- **Committed in:** n/a

**Total deviations:** 4 auto-fixed
**Impact on plan:** No scope expansion; fixes were needed for type safety, source-order verification, accessibility, and execution-environment limits.

## Issues Encountered

- Dashboard empty-state copy initially collided with short text locators in Playwright strict mode. Copy was adjusted to avoid duplicate accessible text while preserving the required headings.
- The first run of the authoring flow showed a transient navigation wait failure, but direct reproduction and rerun confirmed the route and link behavior were correct.

## Verification

- `npm run lint` - pass
- `npm run build` - pass
- `npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop` - pass: 29 passed, 1 skipped
- `npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - pass: 105 passed, 15 skipped

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

03-02 can now add the approved Markdown editor and safe preview packages on top of a working draft CRUD loop. It must start with the package metadata checkpoint and ask for install approval before modifying dependencies.

---
*Phase: 03-markdown-authoring-workflow*
*Completed: 2026-07-06*

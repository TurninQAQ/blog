---
phase: 03-markdown-authoring-workflow
plan: "02"
subsystem: cms
tags: [nextjs, markdown, admin, react-markdown, uiw, playwright]
requires:
  - phase: 03-markdown-authoring-workflow
    provides: Protected draft CRUD editor shell and guard-first post mutations
provides:
  - Approved exact Markdown editor and preview package set
  - Admin-only Markdown editor client wrapper
  - Safe shared Markdown preview renderer with raw HTML disabled
  - Article-like preview typography, code, and table overflow styling
  - Playwright and source-scan coverage for preview safety and public editor isolation
affects: [03-markdown-authoring-workflow, admin, markdown, cms, public-rendering]
tech-stack:
  added:
    - "@uiw/react-md-editor@4.1.1"
    - "react-markdown@10.1.0"
    - "remark-gfm@4.0.1"
    - "rehype-slug@6.0.0"
    - "rehype-sanitize@6.0.0"
  patterns:
    - Admin editor package is dynamically imported from one protected client wrapper
    - Shared Markdown preview uses react-markdown with skipHtml, rehype-sanitize, and no raw HTML pipeline
    - Browser tests include source scans for public dependency isolation
key-files:
  created:
    - src/components/admin/MarkdownEditorClient.tsx
    - src/components/markdown/MarkdownPreview.tsx
    - src/lib/markdown/markdown-policy.ts
  modified:
    - package.json
    - package-lock.json
    - src/tests/e2e/admin-authoring.spec.ts
    - src/components/admin/PostEditorShell.tsx
    - src/app/globals.css
key-decisions:
  - "Installed the approved Markdown package set as exact direct dependency pins after npm initially wrote caret ranges."
  - "Kept live preview on the project-owned react-markdown pipeline instead of relying on UIW's preview path."
  - "Disabled UIW's default toolbar in this slice to avoid accessible-name collisions with existing editor controls."
  - "Did not add Shiki, MDX, dedicated search, or any direct rehype-raw dependency in 03-02."
patterns-established:
  - "Only src/components/admin/MarkdownEditorClient.tsx may import @uiw/react-md-editor."
  - "Markdown preview safety is enforced by skipHtml plus rehype-sanitize, with no dangerouslySetInnerHTML in src."
  - "Long code blocks and tables must scroll inside their preview containers instead of expanding the mobile viewport."
requirements-completed: [CMS-01, CMS-07, EDIT-01, EDIT-02, EDIT-03, EDIT-04, QUAL-01]
coverage:
  - id: D1
    description: "Approved Markdown/editor dependencies are installed as exact direct pins."
    requirement: EDIT-01
    verification:
      - kind: manual_procedural
        ref: "User approved package checkpoint before install; package.json exact direct dependency scan"
        status: pass
    human_judgment: false
  - id: D2
    description: "Safe Markdown preview renders headings, links, lists, code, and tables without executing raw HTML."
    requirement: EDIT-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#renders safe Markdown preview without raw HTML execution or page overflow"
        status: pass
      - kind: other
        ref: "rg \"rehype-raw|dangerouslySetInnerHTML\" src || true"
        status: pass
    human_judgment: false
  - id: D3
    description: "Admin editor uses UIW Markdown input and updates the project preview before saving."
    requirement: EDIT-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#uses the admin Markdown editor and updates preview before saving"
        status: pass
    human_judgment: false
  - id: D4
    description: "Public routes and shared public components do not import the admin editor package."
    requirement: QUAL-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-authoring.spec.ts#keeps the UIW Markdown editor import isolated to the admin editor client"
        status: pass
      - kind: other
        ref: "rg \"@uiw/react-md-editor|@uiw/react-md-editor/.*\\.css\" 'src/app/(public)' src/components/public src/components/markdown || true"
        status: pass
    human_judgment: false
  - id: D5
    description: "Existing draft save validation and public shell behavior still pass after editor integration."
    requirement: CMS-07
    verification:
      - kind: automated_ui
        ref: "npx playwright test src/tests/e2e/admin-authoring.spec.ts src/tests/e2e/public-shell.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
    human_judgment: false
duration: 45min
completed: 2026-07-06
status: complete
---

# Phase 3 Plan 02 Summary

**Admin Markdown editor with a project-owned safe live preview and public dependency isolation**

## Performance

- **Duration:** 45 min
- **Started:** 2026-07-06T13:24:00+08:00
- **Completed:** 2026-07-06T14:09:00+08:00
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Installed the approved Markdown authoring package set as exact direct pins.
- Added `MarkdownPreview` using `react-markdown`, `remark-gfm`, `rehype-slug`, and `rehype-sanitize`, with raw HTML disabled and mobile-safe code/table overflow.
- Replaced the draft body textarea with an admin-only UIW editor wrapper while keeping desktop split panes and mobile edit/preview tabs.
- Added Playwright coverage for preview safety, editor-to-preview updates, validation continuity, and public-source editor isolation.

## Task Commits

1. **Task 1: Verify and install Markdown package set** - `07c2392` (chore)
2. **Task 2 RED: Add Markdown preview safety coverage** - `c123e12` (test)
3. **Task 2 GREEN: Add safe Markdown preview** - `31fca76` (feat)
4. **Task 3 RED: Add admin editor isolation coverage** - `ee7cd91` (test)
5. **Task 3 GREEN: Integrate admin Markdown editor** - `b307c99` (feat)

## Files Created/Modified

- `package.json` and `package-lock.json` - Exact direct Markdown/editor dependency pins and npm lock updates.
- `src/components/admin/MarkdownEditorClient.tsx` - Admin-only client wrapper around the dynamically imported UIW editor.
- `src/components/admin/PostEditorShell.tsx` - Draft body editor now uses the UIW wrapper and project preview.
- `src/components/markdown/MarkdownPreview.tsx` - Shared safe Markdown preview renderer.
- `src/lib/markdown/markdown-policy.ts` - Preview allowlist and raw HTML policy constants.
- `src/app/globals.css` - Lab Markdown preview typography, code, and table styles.
- `src/tests/e2e/admin-authoring.spec.ts` - Preview safety, editor update, and source isolation tests.

## Decisions Made

- UIW is used only for protected admin text input; the preview remains project-owned so raw HTML policy is explicit.
- UIW default toolbar is disabled for this slice because its built-in buttons expose names like "Title" and "Preview" that collide with existing accessible controls and strict Playwright locators.
- Shiki remains deferred; Phase 3 uses CSS code styling in the live preview to avoid heavy highlighting on every keystroke.

## Deviations from Plan

### Auto-fixed Issues

**1. Exact dependency pinning**
- **Found during:** Task 1 package install
- **Issue:** `npm install` initially wrote caret ranges for the approved packages.
- **Fix:** Re-ran installation with exact pins so `package.json` matches the checkpoint intent.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** Direct dependency scan confirmed exact versions.
- **Committed in:** `07c2392`

**2. Transitive `rehype-raw` in UIW dependency tree**
- **Found during:** Task 1 package review
- **Issue:** `@uiw/react-md-editor` brings `rehype-raw` transitively through UIW's own preview package, even though 03-02 did not add it directly.
- **Fix:** Do not import or use UIW preview as the trusted renderer; source scans enforce no `rehype-raw` import and no `dangerouslySetInnerHTML` in `src`.
- **Files modified:** `src/components/markdown/MarkdownPreview.tsx`, `src/lib/markdown/markdown-policy.ts`, `src/tests/e2e/admin-authoring.spec.ts`
- **Verification:** `rg "rehype-raw|dangerouslySetInnerHTML" src || true` returned no source matches; raw HTML fixture test passed.
- **Committed in:** `31fca76`

**3. UIW toolbar accessible-name collisions**
- **Found during:** Task 3 full browser matrix
- **Issue:** UIW default toolbar buttons named "Insert title" and "Preview code" made existing `Title` and `Preview` locators ambiguous on mobile and reduced-motion projects.
- **Fix:** Disabled `commands` and `extraCommands` in the UIW wrapper for this slice; the editor still handles Markdown input and the project preview remains live.
- **Files modified:** `src/components/admin/MarkdownEditorClient.tsx`
- **Verification:** Full desktop/mobile/min-mobile/reduced-motion Playwright matrix passed.
- **Committed in:** `b307c99`

**4. Inline sequential execution**
- **Found during:** Execution setup
- **Issue:** This Codex session cannot spawn the planned GSD subagents automatically.
- **Fix:** Executed the plan sequentially inline while keeping task commits and verification gates.
- **Files modified:** none
- **Verification:** All planned checks passed.
- **Committed in:** n/a

**Total deviations:** 4 auto-fixed
**Impact on plan:** No scope expansion; fixes preserved exact dependency trust, preview safety, accessibility, and execution-environment constraints.

## Issues Encountered

- `npm audit --json` reports 5 moderate advisories in the current dependency graph: Next/PostCSS and Prisma/@hono chains. The report does not point to the newly installed Markdown editor packages. No dependency upgrade was made in this plan because suggested fixes cross major-version boundaries or outside-scope framework/tooling maintenance.
- npm emitted existing ESLint peer range warnings for the Next ESLint plugin and ESLint 10; lint and build still passed.

## Verification

- `npm run lint` - pass
- `npm run build` - pass
- `npx playwright test src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=min-mobile` - pass
- `npx playwright test src/tests/e2e/admin-authoring.spec.ts src/tests/e2e/public-shell.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - pass: 72 passed
- `rg "@uiw/react-md-editor" src || true` - pass: only test source and `src/components/admin/MarkdownEditorClient.tsx`
- `rg "@uiw/react-md-editor|@uiw/react-md-editor/.*\\.css" 'src/app/(public)' src/components/public src/components/markdown || true` - pass: no matches
- `rg "rehype-raw|dangerouslySetInnerHTML" src || true` - pass: no matches
- `npm audit --json` - reports 5 moderate advisories in Next/PostCSS and Prisma/@hono chains

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

03-03 can now add taxonomy and series fields on top of a working protected Markdown authoring surface. It should preserve the 03-02 preview safety policy and keep taxonomy creation inline inside the editor rather than adding standalone taxonomy management pages.

---
*Phase: 03-markdown-authoring-workflow*
*Completed: 2026-07-06*

---
phase: quick-admin-visual-security-hardening
reviewed: 2026-07-11T07:21:34Z
depth: deep
iteration: 3
files_reviewed: 53
files_reviewed_list:
  - docs/security/public-exposure-audit-2026-07-11.md
  - next.config.ts
  - scripts/security-production-smoke.mjs
  - scripts/security-source-scan.mjs
  - src/app/admin/admin.css
  - src/app/admin/layout.tsx
  - src/app/admin/login/page.tsx
  - src/app/admin/logout/route.ts
  - src/components/admin/AdminNav.tsx
  - src/components/admin/AdminPostList.tsx
  - src/components/admin/AdminShell.tsx
  - src/components/admin/DeletePostDialog.tsx
  - src/components/admin/PostEditorShell.tsx
  - src/components/admin/SeriesOrderInput.tsx
  - src/components/admin/TaxonomyPicker.tsx
  - src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx
  - src/components/admin/wysiwyg/WysiwygToolbar.tsx
  - src/lib/admin/guarded-query.test.ts
  - src/lib/admin/guarded-query.ts
  - src/lib/admin/post-input.ts
  - src/lib/admin/post-queries.ts
  - src/lib/security/url-policy.test.ts
  - src/lib/security/url-policy.ts
  - src/lib/skeleton/probe-gate.ts
  - src/tests/e2e/admin-ui.spec.ts
  - src/tests/e2e/security-hardening.spec.ts
  - src/tests/e2e/skeleton.spec.ts
  - src/app/admin/login/actions.ts
  - src/app/api/admin/posts/[operation]/route.ts
  - src/app/api/skeleton-probe/route.ts
  - src/lib/admin/post-mutations.ts
  - src/lib/auth/admin.ts
  - src/lib/auth/csrf.ts
  - src/lib/auth/env.ts
  - src/lib/auth/login-attempts.ts
  - src/lib/auth/password.ts
  - src/lib/auth/session.ts
  - src/lib/markdown/public-render.tsx
  - src/lib/public/content-queries.ts
  - src/lib/skeleton/probe-store.ts
  - src/app/globals.css
  - src/app/admin/(protected)/layout.tsx
  - src/app/admin/(protected)/posts/[postId]/page.tsx
  - src/app/(public)/notes/[slug]/page.tsx
  - src/app/%5F%5Fskeleton/page.tsx
  - src/app/__skeleton/page.tsx
  - src/components/admin/AdminPublishControls.tsx
  - playwright.config.ts
  - prisma/schema.prisma
  - package.json
  - package-lock.json
  - src/lib/auth/csrf.test.ts
  - .planning/quick/260711-fwf-admin-visual-security-hardening/260711-fwf-REVIEW-FIX.md
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Quick 260711-fwf: Final Code Re-review Report

**Reviewed:** 2026-07-11T07:21:34Z  
**Depth:** deep  
**Iteration:** 3 of 3  
**Files Reviewed:** 53  
**Status:** issues_found

## Summary

One current warning remains in editor mutation coordination. The scanner now detects both encrypted and unencrypted PKCS#8 headers, its self-test preserves clean/finding/tool-error semantics, and the full current tree scan is reproducibly clean. Focused review found no regression in the CommonMark image gate, strict Origin handling, focus indicator, delete guard, toolbar navigation, or hidden-field error path.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Slow-save reconciliation and publication serialization are still incomplete

**Files:** `src/components/admin/PostEditorShell.tsx:347-385`, `src/components/admin/PostEditorShell.tsx:411-453`, `src/components/admin/PostEditorShell.tsx:492-519`, `src/components/admin/AdminPublishControls.tsx:44-69`, `src/components/admin/AdminPublishControls.tsx:77-127`, `src/tests/e2e/admin-ui.spec.ts:697-769`

**Issue:** The new guard closes only the save-first direction. `PostEditorShell` passes its own save/refresh state down to `AdminPublishControls`, but publication pending state remains local to the child and is never reported back. If the administrator starts publish/unpublish/feature first, the parent Save button remains enabled and can start an edit request against the same post. The child's successful `router.refresh()` is likewise not represented by the parent's `isRefreshing`. This retains the last-writer publication race and permits the save response to replace `publicationState` with stale status/featured values.

The slow-save merge is also all-or-nothing. If any one field differs from `submittedForm`, `setForm` returns the entire current form and skips all server canonicalization. For example, submit a new category/tag/series, then change only the title while the response is delayed: the server creates the taxonomy and returns its ID, but the UI keeps the submitted `new*Name` and empty ID. The next Save attempts to create the same taxonomy again and returns a duplicate error. The current regression submits no new taxonomy and tests only a changed title plus selection of an existing tag, so it cannot expose this failure.

**Minimal fix:** lift a shared mutation-busy state into `PostEditorShell` (or add a synchronous `onPendingChange` contract) so publication pending/refresh disables Save and save pending disables publication in both directions. Reconcile the save response per field or per dependent group: preserve only fields changed since submission while still applying canonical IDs/clearing submitted one-shot taxonomy names whose own group is unchanged. Add two delayed-success tests: publication-first then Save must send no edit request, and submitted new category/tag/series plus a later scalar edit must preserve that edit while applying returned IDs and clearing only the saved one-shot names.

## Focused verification

- `npm run test:unit -- src/lib/security/url-policy.test.ts src/lib/auth/csrf.test.ts`: 2 files, 60/60 passed.
- `node scripts/security-source-scan.mjs --self-test`: passed encrypted/unencrypted private-key findings, assignment finding, clean, Git failure, and read failure fixtures.
- `node scripts/security-source-scan.mjs`: passed across 264 text files with 35 NUL-containing binaries skipped.
- `git diff --check a6f54e3..166c8e4`: passed.
- Commit path audit: the three iteration-2 remediation commits touch only the five declared editor/test/scanner/audit paths; protected dirty public files remain outside the commits.
- The long full Playwright suite was intentionally not run.

---

_Reviewed: 2026-07-11T07:21:34Z_  
_Reviewer: the agent (gsd-code-reviewer)_  
_Depth: deep_

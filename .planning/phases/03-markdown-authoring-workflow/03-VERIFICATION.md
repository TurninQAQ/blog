---
phase: 03-markdown-authoring-workflow
verified: 2026-07-11T11:51:30Z
status: passed
score: "14/14 requirements verified"
behavior_unverified: 0
overrides_applied: 0
re_verification: true
editor_architecture: "Tiptap Markdown-backed WYSIWYG canvas"
---

# Phase 3: Markdown Authoring Workflow Verification Report

**Phase Goal:** As a site administrator, I want to write and manage technical notes in a protected Markdown backend with a rendered WYSIWYG authoring canvas, so that I can reliably draft, edit, organize, and publish technical notes.
**Verified:** 2026-07-11T11:51:30Z
**Status:** passed
**Re-verification:** Yes - current release verification after the accepted WYSIWYG cutover

## Accepted Editor Cutover

Plan 03-02 originally shipped an admin-only UIW Markdown source/preview path. That implementation is historical and was intentionally superseded on 2026-07-09 by the accepted Tiptap Markdown-backed WYSIWYG cutover recorded in `PROJECT.md`, `STATE.md`, and `03-UAT.md`.

The current Phase 3 contract is therefore verified against the active architecture:

- `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` owns the rendered Tiptap article canvas and emits Markdown with `getMarkdown()`.
- `src/components/admin/PostEditorShell.tsx` persists that Markdown through the existing protected create/edit flow and blocks incompatible legacy Markdown before lossy editing.
- `src/lib/admin/wysiwyg/markdown-adapter.ts` and its unit tests cover supported Markdown round trips.
- No project source imports the legacy UIW editor. Public route, component, and shared Markdown/public source graphs additionally reject every `@tiptap/*` import.

This cutover is an accepted implementation change, not an unresolved Phase 3 discrepancy. The historical 03-02 UIW source/preview evidence is not used to justify the current pass.

## Fresh Verification Gates

All mandatory commands were run against the current Tiptap implementation before this artifact was created.

| Command | Fresh result | Status |
| --- | --- | --- |
| `xvfb-run -a npx playwright test src/tests/e2e/admin-authoring.spec.ts --project=desktop --headed` | 18 passed, 0 skipped, 0 failed; 45.7s | PASS |
| `npm run verify:ci` | ESLint passed; Vitest 5 files and 106/106 tests passed; Prisma validate/generate passed; Next.js production build passed; source scan passed for 276 text files with 35 binaries skipped; both high-threshold audits exited 0 | PASS |
| `xvfb-run -a npm run test:e2e -- --headed` | 488 collected; 465 passed; 23 conditional project skips; 0 failed; 8.3m | PASS |
| `xvfb-run -a npm run security:smoke` | Public/admin 200; protected redirects non-disclosing; skeleton GET/POST 404; headed login/logout POSTs; zero CSP violations; 2 expected guarded-query log entries | PASS |

The audit output still contains the five previously accepted moderate dependency nodes. Both required `--audit-level=high` gates passed with no high or critical advisory.

## Goal Achievement

### Observable Truths

| # | Truth | Evidence | Status |
| --- | --- | --- | --- |
| 1 | Administrator can create, edit, list, and hard-delete drafts with required metadata. | `admin-authoring.spec.ts` creates and edits the same persisted post, verifies exact title, slug, excerpt, cover, Markdown, and status, then hard-deletes it and verifies the database row is absent. | VERIFIED |
| 2 | The active editor is a rendered article canvas with code, table, and image URL controls while Markdown remains the persisted format. | Tiptap canvas/toolbar tests pass; code fences, image Markdown, and a GFM table containing `alpha` are queried from PostgreSQL; the table post is reopened and rendered with the saved cell. | VERIFIED |
| 3 | Required fields, slug format/conflicts, taxonomy conflicts, series order, image policy, and incompatible Markdown fail safely. | Browser validation tests, direct mutation image-policy tests, compatibility unit tests, and the complete four-project matrix pass. | VERIFIED |
| 4 | Category, tags, optional series, and series order persist and reopen inside the editor. | The inline taxonomy test queries category/tags/series/order after save, reopens the same draft, and verifies dashboard/list metadata. | VERIFIED |
| 5 | Public code remains isolated from admin editors and unsafe raw HTML. | Current source-graph test rejects UIW and Tiptap imports from public routes/components/Markdown/public libraries; incompatible raw HTML is blocked in admin and the public renderer remains sanitized. | VERIFIED |

**Score:** 14/14 Phase 3 requirements verified with current code and fresh command evidence.

## Required Artifacts

| Artifact | Current responsibility | Status |
| --- | --- | --- |
| `src/components/admin/PostEditorShell.tsx` | Title/slug automation, metadata state, compatibility gate, protected draft save payload, publication controls | VERIFIED |
| `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` | Active rendered Tiptap canvas and Markdown change boundary | VERIFIED |
| `src/components/admin/wysiwyg/WysiwygToolbar.tsx` | Heading, quote, list, code, table, and allowed image URL controls | VERIFIED |
| `src/lib/admin/wysiwyg/compatibility.ts` | Rejects unsupported/lossy Markdown before the visual editor opens | VERIFIED |
| `src/lib/admin/wysiwyg/markdown-adapter.ts` | Markdown/document conversion and table round-trip normalization | VERIFIED |
| `src/lib/admin/post-input.ts` | Server-side metadata, slug, taxonomy, series-order, cover, and Markdown image validation | VERIFIED |
| `src/lib/admin/post-mutations.ts` | Guard-first create/edit/delete and transactional taxonomy persistence | VERIFIED |
| `src/tests/e2e/admin-authoring.spec.ts` | Current browser and persisted-database authoring evidence | VERIFIED |
| `src/lib/markdown/public-render.tsx` | Server-rendered public Markdown, raw HTML stripping, sanitizer, and Shiki path | VERIFIED |

## Key Link Verification

| From | To | Via | Evidence | Status |
| --- | --- | --- | --- | --- |
| Title control | URL path control | `updateTitle()` until `slugManuallyEdited` becomes true | Browser test proves automatic derivation and manual-override stop condition through visible controls. | WIRED |
| Tiptap canvas | Draft form state | `onMarkdownChange(currentEditor.getMarkdown())` | Code, table, image, and ordinary Markdown saves are found in persisted `bodyMarkdown`. | WIRED |
| Draft form state | PostgreSQL `Post` | protected JSON create/edit -> `runGuardedPostMutation()` -> Prisma transaction | Exact excerpt values, cover, status, slug, and Markdown are queried after create/edit. | WIRED |
| Table node | Markdown persistence | Tiptap `getMarkdown()` -> saved `bodyMarkdown` -> reopen | Saved text contains a GFM separator row and `alpha`; the reopened canvas renders `alpha` in a table. | WIRED |
| Taxonomy controls | Category/Tag/Series/PostTag records | guarded save transaction | Persisted relations and series order are queried and re-rendered after reopen. | WIRED |
| Compatibility scanner | Editor availability | `scanMarkdownCompatibility()` | Raw HTML fixture shows the incompatibility notice and disables save/canvas. | WIRED |
| Public source graph | Admin editor packages | recursive source scan in `admin-authoring.spec.ts` | Public routes/components/shared Markdown/public libraries contain neither UIW nor `@tiptap/*` imports. | ISOLATED |

## Requirements Coverage

| Requirement | Current evidence | Status |
| --- | --- | --- |
| CMS-01 | Create persists title, slug, exact excerpt, Markdown body, cover, category, tags, optional series/order, draft status, and featured state. | SATISFIED |
| CMS-02 | Edit persists changed title, slug, exact excerpt, and Markdown on the same post. | SATISFIED |
| CMS-03 | Title-bearing confirmation precedes hard delete; the persisted row is then absent. | SATISFIED |
| CMS-04 | Draft save remains behind `requireAdmin()` and persists `DRAFT`. | SATISFIED |
| CMS-07 | Required title/body, invalid slug, duplicate slug, taxonomy conflicts, and series-order errors retain useful inline feedback. | SATISFIED |
| EDIT-01 | Active Tiptap editor is Markdown-backed and saves `bodyMarkdown`. | SATISFIED |
| EDIT-02 | Compatible posts open in one rendered `正文画布`; the historical split source/preview editor is absent. | SATISFIED |
| EDIT-03 | Canvas, toolbar, code nodes, table nodes, image insertion, minimum control sizes, and desktop width pass browser checks. | SATISFIED |
| EDIT-04 | Incompatible raw HTML is blocked before visual editing; public Markdown uses the safe server renderer without raw HTML execution. | SATISFIED |
| TAX-01 | Inline tags persist, reopen, and appear in admin metadata. | SATISFIED |
| TAX-02 | Inline category persists, reopens, and appears in admin metadata. | SATISFIED |
| TAX-03 | Optional series persists and reopens. | SATISFIED |
| TAX-04 | Positive, unique series order persists and duplicate order returns an inline error. | SATISFIED |
| QUAL-01 | Public routes/components/shared Markdown/public libraries contain no active admin editor import. | SATISFIED |

## Issues and Deviations

- The first new GFM persistence assertion expected exactly three separator dashes, while the active serializer validly emitted `| ----- | --- |`. The assertion was corrected to accept the GFM minimum of three or more dashes; the persisted structure and reopen behavior then passed. No editor implementation change was required.
- Expected unauthenticated App Router guard errors remain visible in development server logs during redirect tests. The browser contract passes and the production smoke confirms protected redirects are non-disclosing.
- No new dependency, route, editor feature, product behavior, or visual redesign was introduced during this re-verification.

## Human Verification Required

None for Phase 3 behavior. The current authoring, persistence, validation, taxonomy, Markdown safety, and package-isolation contracts are asserted by fresh automated evidence.

## Gaps Summary

No unresolved Phase 3 behavior gap remains. The UIW-to-Tiptap change is reconciled explicitly, every Phase 3 requirement maps to current implementation evidence, and all mandatory release gates passed before this report was written.

---

_Verified: 2026-07-11T11:51:30Z_  
_Verifier: Phase 05 Plan 02 release re-verification_

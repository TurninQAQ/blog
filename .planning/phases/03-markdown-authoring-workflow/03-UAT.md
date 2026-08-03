---
status: complete
phase: 03-markdown-authoring-workflow
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 2026-07-09-wysiwyg-editor-cutover
started: 2026-07-07T09:27:29Z
updated: 2026-07-09T15:47:37+08:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 24
name: Final Phase 3 and WYSIWYG Regression
expected: |
  Phase 3 admin authoring remains complete after the Tiptap WYSIWYG cutover: drafts can be created/edited/deleted, taxonomy persists, unsupported Markdown is blocked before lossy editing, public routes do not import admin editor code, and unit/lint/build verification passes on master.
result: pass

## Tests

### 1. Admin Markdown Draft Flow
expected: Open `/admin/posts/new` as the administrator, fill title/slug/Markdown body through the WYSIWYG canvas, save the draft, and see it available for later editing.
result: pass

### 2. WYSIWYG Canvas and Markdown Safety
expected: Type headings, lists, code, tables, and image URLs in the editor; the rendered canvas stays article-like, code/table overflow stays contained, and raw HTML/unsupported Markdown is blocked from WYSIWYG editing.
result: pass

### 3. Taxonomy and Series Organization
expected: Create or select category, tags, series, and optional series order while editing a draft; after save and reopen, the metadata persists and appears in admin surfaces.
result: pass

### 4. Validation and Conflict Feedback
expected: Missing required fields, invalid or duplicate slugs, duplicate taxonomy creation, and duplicate series order show inline errors without erasing the Markdown body.
result: pass

### 5. Phase 3 and WYSIWYG Scope Coverage Confirmation
expected: Automated checks cover draft CRUD, guard-first mutation safety, WYSIWYG dependency isolation, responsive admin surfaces, safe Markdown rendering, taxonomy persistence, and no standalone taxonomy management routes; this matches the intended current Phase 3 scope.
result: pass

### 6. Authenticated admin can create, edit, list, and hard-delete a draft post.
expected: Authenticated admin can create, edit, list, and hard-delete a draft post.
result: pass
source: automated
coverage_id: 03-01-D1

### 7. Draft save validates required title/body, invalid slug, and duplicate slug conflicts with exact UI copy.
expected: Draft save validates required title/body, invalid slug, and duplicate slug conflicts with exact UI copy.
result: pass
source: automated
coverage_id: 03-01-D2

### 8. Create/edit/delete admin mutations remain guard-first and route body parsing stays lazy.
expected: Create/edit/delete admin mutations remain guard-first and route body parsing stays lazy.
result: pass
source: automated
coverage_id: 03-01-D3

### 9. Protected dashboard/list/editor surfaces render across desktop, mobile, min-mobile, and reduced-motion projects.
expected: Protected dashboard/list/editor surfaces render across desktop, mobile, min-mobile, and reduced-motion projects.
result: pass
source: automated
coverage_id: 03-01-D4

### 10. Approved Markdown/editor dependencies are installed as exact direct pins.
expected: Approved Markdown/editor dependencies are installed as exact direct pins; the current WYSIWYG editor additionally uses exact Tiptap 3.27.3 packages.
result: pass
source: automated
coverage_id: 03-02-D1

### 11. Safe Markdown rendering handles headings, links, lists, code, and tables without executing raw HTML.
expected: Safe Markdown rendering handles headings, links, lists, code, and tables without executing raw HTML.
result: pass
source: automated
coverage_id: 03-02-D2

### 12. Admin editor uses Tiptap WYSIWYG input and persists Markdown before saving.
expected: Admin editor uses a Tiptap WYSIWYG article canvas, does not render the legacy Markdown source/preview split, and saves Markdown to `bodyMarkdown`.
result: pass
source: automated
coverage_id: 03-02-D3-superseded-by-wysiwyg

### 13. Public routes and shared public components do not import admin editor packages.
expected: Public routes and shared public components do not import Tiptap editor packages, legacy UIW editor packages, or admin editor CSS.
result: pass
source: automated
coverage_id: 03-02-D4

### 14. Existing draft save validation and public shell behavior still pass after WYSIWYG editor integration.
expected: Existing draft save validation and public shell behavior still pass after WYSIWYG editor integration.
result: pass
source: automated
coverage_id: 03-02-D5

### 15. Admin can create inline category, tags, series, and series order while saving a draft.
expected: Admin can create inline category, tags, series, and series order while saving a draft.
result: pass
source: automated
coverage_id: 03-03-D1

### 16. Reopening a draft shows persisted category, tags, selected series, and series order.
expected: Reopening a draft shows persisted category, tags, selected series, and series order.
result: pass
source: automated
coverage_id: 03-03-D2

### 17. Duplicate taxonomy creation and duplicate series order return inline errors without erasing editor body.
expected: Duplicate taxonomy creation and duplicate series order return inline errors without erasing editor body.
result: pass
source: automated
coverage_id: 03-03-D3

### 18. Taxonomy mutation remains behind the existing guard-first post save dispatcher.
expected: Taxonomy mutation remains behind the existing guard-first post save dispatcher.
result: pass
source: automated
coverage_id: 03-03-D4

### 19. No standalone taxonomy management routes or admin taxonomy pages exist in Phase 3.
expected: No standalone taxonomy management routes or admin taxonomy pages exist in Phase 3.
result: pass
source: automated
coverage_id: 03-03-D5

### 20. WYSIWYG Markdown adapter round-trips supported grammar.
expected: Headings, inline code, bold/italic, links, blockquotes, bullet/ordered lists, images, fenced code blocks, and supported tables round-trip through the Tiptap Markdown adapter without dropping structure.
result: pass
source: automated
coverage_id: wysiwyg-adapter

### 21. WYSIWYG compatibility scanner blocks unsupported or lossy Markdown.
expected: Raw HTML, task lists, footnotes, definition lists, MDX-like syntax, unsupported marks/nodes, deep headings, hard breaks, and lossy round-trips are reported before the visual editor opens.
result: pass
source: automated
coverage_id: wysiwyg-compatibility

### 22. New/edit admin pages use a single WYSIWYG canvas for compatible content.
expected: Compatible posts open in a single `正文画布` region with toolbar controls and no legacy source/preview split.
result: pass
source: automated
coverage_id: wysiwyg-admin-flow

### 23. Code block, table, and image URL insertion are reachable from the toolbar and persist Markdown.
expected: Toolbar controls insert code blocks, tables, and image URLs; saved posts contain Markdown code fences, table syntax, and image syntax.
result: pass
source: automated
coverage_id: wysiwyg-toolbar

### 24. Final Phase 3 and WYSIWYG regression passes on master.
expected: Unit tests, lint, and production build pass after merging the WYSIWYG cutover. Browser regression for the same commit chain covered the admin WYSIWYG and public Markdown flows before merge.
result: pass
source: automated
coverage_id: final-regression

## Summary

total: 24
passed: 24
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

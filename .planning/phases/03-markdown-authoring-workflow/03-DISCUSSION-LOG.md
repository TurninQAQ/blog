# Phase 3: Markdown Authoring Workflow - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06T01:40:57Z
**Phase:** 3-Markdown Authoring Workflow
**Areas discussed:** Admin writing workspace, Article form and save flow, Markdown editor and live preview, Tags/categories/series management, Security and phase boundaries

---

## Admin Writing Workspace

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| What should the administrator see first after opening `/admin`? | Article list first; Dashboard first; Minimal entry screen; Other | Dashboard first |
| What should the dashboard emphasize? | Recently edited posts plus draft queue; Content statistics; Publication readiness checklist; Other | Recently edited posts plus draft queue |
| How should the article list be sorted by default? | Recently updated first; Drafts first then updated time; Published time first; Other | Recently updated first |
| How should deleting an article work? | Archive/soft delete first; Hard delete after explicit confirmation; Hard delete drafts and archive published posts; Other | Hard delete after explicit confirmation |

**Notes:** The dashboard is writing-oriented, not analytics-first. Article deletion is intentionally destructive after confirmation.

---

## Article Form and Save Flow

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should slugs be handled when creating or editing an article? | Generate from title and allow manual editing; Require manual slug entry; Generate automatically and make slug read-only; Other | Generate from title and allow manual editing |
| How should save actions be presented? | Save draft only; Save draft plus publish; Autosave plus manual save; Other | Save draft only |
| Which fields are required to save a draft? | Title plus Markdown body; Title plus slug plus body; Title plus slug plus excerpt plus body plus category; Other | Title plus Markdown body |
| How should the cover image field work in Phase 3? | URL input field only; Local image upload; Hide cover field; Other | URL input field only |

**Notes:** Phase 3 optimizes for low-friction drafting. Publication readiness can be stricter later when Phase 4 connects public surfaces.

---

## Markdown Editor and Live Preview

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should the Markdown editor and preview be laid out on desktop? | Side-by-side split view; Single-column editor with preview tab; Editor-first layout with optional preview drawer; Other | Side-by-side split view |
| How should preview work on mobile? | Editor/preview tabs; Editor only; Stack editor and preview vertically; Other | Editor/preview tabs |
| How close should preview styling be to the public article page? | Close to eventual public article page; Simple Markdown preview; Fully reuse public article rendering components; Other | Close to eventual public article page |
| How should raw HTML inside Markdown be handled? | Disable raw HTML; Allow a small sanitized HTML whitelist; Allow in admin preview but filter on public pages; Other | Disable raw HTML |

**Notes:** Preview should be trustworthy enough for writing decisions, but raw HTML remains disabled for safety and consistency.

---

## Tags, Categories, and Series Management

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should category selection work in the article form? | One category with inline creation; Only choose existing categories; Category may be empty until publication readiness; Other | One category with inline creation |
| How should tags work in the article form? | Multiple tags with inline creation; Only choose existing tags; Free-text tags auto-created on save; Other | Multiple tags with inline creation |
| How should series order be controlled? | Manual `seriesOrder` input; Automatically append to end; Drag-and-drop ordering; Other | Manual `seriesOrder` input |
| Should Phase 3 include standalone management pages for categories, tags, or series? | No standalone taxonomy pages; Add simple management pages; Add only a standalone series page; Other | No standalone taxonomy pages |

**Notes:** Taxonomy should support the writing form without expanding into a full taxonomy management subsystem.

---

## Security and Phase Boundaries

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should publishing be handled in Phase 3? | Only save drafts; Allow PUBLISHED status even though public pages do not show it; Show a publish button that only explains Phase 4 behavior; Other | Only save drafts |
| How should backend article mutations connect to the existing auth boundary? | Continue using Phase 2 guard-first API boundary; Switch primarily to Server Actions; API plus Server Actions wrapper; Other | Continue using Phase 2 guard-first API boundary |
| How should Markdown editor dependencies be isolated? | Dynamically load editor dependencies only on protected admin editor routes; Load editor dependencies across admin; Share one Markdown component stack across public and admin; Other | Dynamically load editor dependencies only on protected admin editor routes |
| How should hard delete confirmation work? | Confirmation dialog with explicit article title; Require typing the article slug; Second-click confirmation; Other | Confirmation dialog with explicit article title |

**Notes:** Phase 3 must not blur into Phase 4 publishing. The existing mutation and auth boundaries stay authoritative.

## The Agent's Discretion

- Exact route names under the protected admin route group.
- Exact admin form layout, labels, empty states, and validation message phrasing.
- Exact slug-generation normalization rules and conflict-resolution copy.
- Exact Markdown editor package and utility split, guided by stack research and bundle isolation requirements.

## Deferred Ideas

- Publish button, public visibility, and public revalidation.
- Local image upload and media management.
- Autosave.
- Standalone taxonomy management pages.
- Drag-and-drop series ordering.
- Sanitized raw HTML support.

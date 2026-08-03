# Phase 3: Markdown Authoring Workflow - Context

**Gathered:** 2026-07-06T01:40:57Z
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers the protected single-admin writing workflow for technical notes: an admin dashboard, article list, article create/edit/delete flow, draft saving, Markdown-backed authoring, required validation for draft saves, and inline taxonomy/series assignment. The current editor implementation is the 2026-07-09 Tiptap WYSIWYG cutover: one rendered article canvas that persists Markdown.

This phase does not deliver public article pages, public search, public archive/taxonomy/series pages, public publish visibility, cache revalidation for public content, comments, MDX interactive demos, external sync, image upload/storage, multi-author roles, or standalone taxonomy management pages. Those remain later-phase or v2 scope.

</domain>

<decisions>
## Implementation Decisions

### Admin Writing Workspace
- **D-01:** `/admin` should open to a dashboard-first admin experience, not directly to the full article list.
- **D-02:** The dashboard should emphasize recently edited posts, a draft queue, draft counts, and a prominent "new article" action. Content statistics may be secondary, but the main job is getting back into writing quickly.
- **D-03:** Article lists should sort by `updatedAt` descending by default so the most recently worked-on drafts and notes appear first.
- **D-04:** Article deletion should be a hard delete after explicit confirmation. Do not default to `ARCHIVED` or soft-delete behavior in Phase 3.

### Article Form and Save Flow
- **D-05:** Slugs should be generated automatically from the title and remain manually editable.
- **D-06:** Phase 3 should present a single primary save action: "Save draft". Do not make publish the primary workflow in this phase.
- **D-07:** Saving a draft requires only a title and Markdown body. Other metadata may be incomplete while the note is still a draft.
- **D-08:** The cover image field should be a URL input in Phase 3. Do not implement local uploads, storage buckets, image processing, or media management in this phase.

### Markdown-Backed WYSIWYG Editor
- **D-09:** Current desktop authoring uses a single rendered WYSIWYG article canvas, not a left Markdown source/right preview split.
- **D-10:** Current mobile authoring uses the same single writing canvas with stacked metadata; there are no edit/preview tabs.
- **D-11:** Editor canvas styling should be close to the eventual public article page: stable technical-note typography, code block styling, tables, links, and readable long-form layout.
- **D-12:** Raw HTML and unsupported Markdown syntax are disabled for v1. Do not support arbitrary HTML, iframe embeds, script tags, MDX component syntax, or lossy Markdown round-trips in the WYSIWYG editor.

### Tags, Categories, and Series
- **D-13:** Each article may have one category, and the article form should allow inline category creation when no existing category fits.
- **D-14:** Each article may have multiple tags, and the article form should allow inline tag creation.
- **D-15:** Series assignment is optional. When a series is selected, the form should expose a manual `seriesOrder` input.
- **D-16:** Do not build standalone category, tag, or series management pages in Phase 3. Taxonomy and series creation/selection happens inline in the article form.

### Security and Phase Boundaries
- **D-17:** Do not show or implement a publish button in Phase 3. Public publishing, public visibility, and public content revalidation are Phase 4 concerns.
- **D-18:** Continue using the Phase 2 guard-first mutation boundary. Real create/edit/delete draft logic must attach only after `requireAdmin()` has succeeded.
- **D-19:** Markdown editor dependencies must be isolated to protected admin editor routes and loaded dynamically where appropriate. Public bundles must not load admin-only editor code. The active editor package path is Tiptap under `src/components/admin/wysiwyg/`.
- **D-20:** Hard delete confirmation should show the article title explicitly before deleting the record.

### The Agent's Discretion
- Choose exact route names under the protected admin route group, as long as `/admin` remains the dashboard and article editing stays protected.
- Choose exact form layout, labels, and empty-state copy, as long as it follows the technical-lab admin visual language established in Phase 2.
- Choose exact slug-generation rules, validation messages, and inline taxonomy creation UI patterns, as long as duplicate slug/name conflicts are handled clearly.
- Keep the current Tiptap editor package set and Markdown adapter unless a later phase explicitly reopens the authoring model.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Requirements
- `.planning/PROJECT.md` — Defines the personal technical blog, Markdown-first writing workflow, single-admin backend, and v1/v2 scope boundaries.
- `.planning/REQUIREMENTS.md` — Defines CMS-01 through CMS-04, CMS-07, EDIT-01 through EDIT-04, TAX-01 through TAX-04, and QUAL-01 for Phase 3.
- `.planning/ROADMAP.md` — Defines Phase 3 goal, MVP mode, success criteria, and planned plan split.
- `.planning/STATE.md` — Current project state and carry-forward decisions from earlier phases.

### Prior Phase Context
- `.planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md` — Public-shell visual language, reading-surface direction, and public route boundaries.
- `.planning/phases/02-data-model-and-admin-access/02-CONTEXT.md` — Single-admin auth, Prisma/PostgreSQL model skeleton, guard-first mutation boundary, and protected admin routing decisions.

### Research and Architecture
- `.planning/research/STACK.md` — Current stack notes, including Tiptap WYSIWYG authoring, controlled public Markdown rendering, Shiki, zod, custom auth, and public/admin bundle separation guidance.
- `.planning/research/ARCHITECTURE.md` — Architecture guidance for Next.js App Router, Prisma data access, admin auth checks, and content/admin boundaries.
- `.planning/research/PITFALLS.md` — Pitfalls around unsafe Markdown, hidden-only admin UI, visual performance, and public bundle bloat.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/admin/(protected)/layout.tsx` — Protected route-group layout already calls `requireAdminPage()` before rendering admin children. Phase 3 admin pages should live under this boundary.
- `src/components/admin/AdminShell.tsx` — Existing admin shell, header, sign-out action, and technical-lab admin visual treatment. Replace or extend the current placeholder content with dashboard/list/editor surfaces.
- `src/lib/admin/post-mutations.ts` — Existing `runGuardedPostMutation()` stub is guard-first and currently handles create/edit/delete/publish/unpublish operation names. Phase 3 should attach real draft create/edit/delete logic after `requireAdmin()`.
- `src/app/api/admin/posts/[operation]/route.ts` — Existing CSRF-checked mutation route delegates to the guarded dispatcher and deliberately avoids body parsing before the shared guard.
- `prisma/schema.prisma` — Existing `Post`, `Tag`, `Category`, `Series`, and `PostTag` models already cover Phase 3 fields: title, slug, excerpt, Markdown body, cover URL, status, category, tags, optional series, and series order.
- `src/components/public/ArticlePreviewShell.tsx` and `.lab-reading-surface` styles in `src/app/globals.css` — Existing reading surface direction can guide the admin WYSIWYG canvas typography without importing admin editor code into public pages.
- `src/tests/e2e/admin-auth.spec.ts` and `src/tests/e2e/admin-mutations.spec.ts` — Existing Playwright patterns cover protected admin routes, login, logout, CSRF, and guard-first mutation structure.

### Established Patterns
- Next.js App Router is used throughout. Public routes live in `(public)` and admin content belongs under `/admin`.
- Admin routes are server-protected, not client-only hidden.
- CSRF checks must run on admin mutation routes, and the shared authorization guard must run before request data is trusted.
- The visual system uses Tailwind CSS v4 tokens, 8px `rounded-lab`, restrained dark technical-lab surfaces, lucide icons, and reduced-motion-aware effects.
- Public visual effect code is isolated; Phase 3 should preserve that boundary and similarly isolate editor-only code from public bundles.

### Integration Points
- Add protected dashboard/list/editor routes under `src/app/admin/(protected)/...`.
- Replace or evolve `AdminEmptyState` / `AdminStatusPanel` into a real dashboard and content workflow, or create new admin components that keep the existing shell.
- Add validation helpers for slugs, draft fields, taxonomy creation, and series order.
- Keep Markdown rendering utilities shared by public reading routes separate from admin editor UI packages.
- Add focused Playwright coverage for dashboard access, article draft create/edit/delete, WYSIWYG editing, validation failures, taxonomy assignment, unsupported Markdown blocking, image URL insertion, and public bundle isolation checks.

</code_context>

<specifics>
## Specific Ideas

- `/admin` should feel like a writing dashboard: recent edits, draft queue, and a clear "new article" action.
- The article editor should feel efficient for a programmer writing technical notes: a single Typora-like rendered canvas on desktop and mobile, with Markdown preserved as storage.
- Metadata should support real content organization but should not block early drafting. Title and body are enough to save a draft.
- Inline taxonomy creation is preferred over separate management pages because Phase 3 should preserve writing flow.

</specifics>

<deferred>
## Deferred Ideas

- Publish button, public article visibility, public page revalidation, and removal from public surfaces belong to Phase 4.
- Local cover image upload, storage integration, image processing, and media management are deferred beyond Phase 3.
- Autosave is not selected for Phase 3; a manual save draft flow is enough for the MVP authoring workflow.
- Standalone category/tag/series management pages are deferred.
- Drag-and-drop series ordering is deferred; Phase 3 uses manual `seriesOrder`.
- Allowing sanitized raw HTML in Markdown is deferred; v1 disables raw HTML.

</deferred>

---

*Phase: 3-Markdown Authoring Workflow*
*Context gathered: 2026-07-06T01:40:57Z*

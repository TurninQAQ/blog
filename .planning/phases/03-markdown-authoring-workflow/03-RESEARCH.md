# Phase 3: Markdown Authoring Workflow - Research

**Researched:** 2026-07-06
**Status:** Ready for planning
**Mode:** Inline fallback for `gsd-phase-researcher` because automatic typed subagent dispatch is unavailable in this Codex session.

## Research Question

What must be known to plan Phase 3 well: protected admin draft CRUD, Markdown editing with safe preview, validation, taxonomy/series assignment, and public bundle isolation.

## Codebase Findings

### Existing Foundation

- `prisma/schema.prisma` already contains the Phase 3 data model: `Post`, `Tag`, `Category`, `Series`, `PostTag`, and `PublicationStatus`.
- `Post.slug`, `Tag.slug`, `Category.slug`, and `Series.slug` are unique, so duplicate handling should be implemented as validation plus Prisma conflict handling, not schema work.
- `Post.seriesId` and `Post.seriesOrder` have `@@unique([seriesId, seriesOrder])`; the admin workflow must validate duplicate order inside a selected series before save and surface a clear error.
- `src/app/admin/(protected)/layout.tsx` already calls `requireAdminPage()` before rendering protected admin children. New dashboard/list/editor pages should live under this route group.
- `src/lib/admin/post-mutations.ts` currently proves the guard-first dispatcher boundary. Real create/edit/delete behavior must preserve `await requireAdmin()` as the first executable statement.
- `src/app/api/admin/posts/[operation]/route.ts` currently avoids request body parsing and delegates to `runGuardedPostMutation()`. Phase 3 should preserve this property by passing a lazy parser callback into the guarded dispatcher instead of parsing the request in the route.
- `src/tests/e2e/admin-mutations.spec.ts` statically scans the dispatcher and route to fail if body parsing, zod validation, or `prisma.post` access occurs before `requireAdmin()`.
- `src/components/admin/AdminShell.tsx` provides the current dark technical-lab admin shell and placeholder admin content.
- `src/components/public/ArticlePreviewShell.tsx` and `.lab-reading-surface` in `src/app/globals.css` provide the closest existing reading-surface visual pattern for live preview styling.

### Current Dependency State

Already installed runtime dependencies include Next.js, React, Prisma, PostgreSQL adapter, lucide icons, motion, and zod. Phase 3 likely needs the Markdown/editor packages from stack research:

| Package | Pin | Purpose | npm metadata checked 2026-07-06 |
|---------|-----|---------|----------------------------------|
| `@uiw/react-md-editor` | `4.1.1` | Protected admin Markdown editor | repository `git+https://github.com/uiwjs/react-md-editor.git`; modified `2026-05-21`; no `scripts.postinstall` field shown |
| `react-markdown` | `10.1.0` | Controlled Markdown-to-React renderer | repository `git+https://github.com/remarkjs/react-markdown.git`; modified `2025-03-07`; no `scripts.postinstall` field shown |
| `remark-gfm` | `4.0.1` | Tables, task lists, strikethrough | repository `git+https://github.com/remarkjs/remark-gfm.git`; modified `2025-02-10`; no `scripts.postinstall` field shown |
| `rehype-slug` | `6.0.0` | Heading ids for preview/public renderer | repository `git+https://github.com/rehypejs/rehype-slug.git`; modified `2023-11-20`; no `scripts.postinstall` field shown |
| `rehype-sanitize` | `6.0.0` | Defense-in-depth sanitizer if HTML enters a pipeline | repository `git+https://github.com/rehypejs/rehype-sanitize.git`; modified `2023-11-20`; no `scripts.postinstall` field shown |
| `shiki` | `4.3.0` | Code highlighting utility | repository `git+https://github.com/shikijs/shiki.git`; modified `2026-07-03`; no `scripts.postinstall` field shown |

## Recommended Architecture

### Protected Admin Routes

Use these protected routes:

- `/admin` dashboard, replacing the Phase 2 placeholder.
- `/admin/posts` article list.
- `/admin/posts/new` new draft editor.
- `/admin/posts/[postId]` edit draft editor.

These route names keep `/admin` dashboard-first and keep the writing workflow under the existing protected admin layout.

### Query and Mutation Split

Use server-only admin query helpers and a guarded mutation dispatcher:

- `src/lib/admin/post-queries.ts`
  - `getAdminDashboardData()`
  - `getAdminPostList()`
  - `getAdminPostEditorData(postId?: string)`
- `src/lib/admin/post-input.ts`
  - slug normalization
  - zod schemas for create/edit/delete payloads
  - helpers for taxonomy inputs and series order validation
- `src/lib/admin/post-mutations.ts`
  - preserve `requireAdmin()` as the first executable statement
  - accept `operation` plus a lazy input reader callback
  - parse and validate only after authorization
  - write posts/taxonomy through Prisma transactions

Recommended dispatcher shape:

```ts
export async function runGuardedPostMutation(
  operation: AdminPostOperation,
  readInput: () => Promise<unknown>,
) {
  const adminSession = await requireAdmin();
  const input = await readInput();
  // validate and write after this point
}
```

The API route can then delegate without body parsing:

```ts
return NextResponse.json(
  await runGuardedPostMutation(operation, () => request.json()),
);
```

This keeps route body parsing behind the shared guard and should satisfy the existing source-order tests.

### Draft Save Rules

Phase 3 has one primary mutation path: save draft. The implementation should:

- require `title` and `bodyMarkdown`;
- auto-generate `slug` from title until the slug field is manually edited;
- validate slug format as lowercase letters, numbers, and hyphens;
- save `status: DRAFT`;
- accept optional `excerpt`, `coverImage`, category, tags, series, and `seriesOrder`;
- not expose publish/unpublish controls;
- keep existing `publish`/`unpublish` operation names only as guarded boundary compatibility from Phase 2 unless a later phase implements them.

### Markdown Rendering and Safety

Use `@uiw/react-md-editor` only in a client component under the protected admin editor route. Do not import it from public routes or shared renderer modules.

Use `react-markdown` plus `remark-gfm` for preview rendering. Do not add `rehype-raw` in v1. React Markdown escapes raw HTML by default when raw HTML is not enabled, which matches D-12 and EDIT-04. `rehype-sanitize` can remain a defense-in-depth package if the renderer later needs to allow a limited HTML subset, but Phase 3 should not create a permissive raw HTML path.

Use Shiki carefully. For Phase 3, avoid client-side Shiki work inside every keystroke. Prefer one of these:

1. Start with styled `<pre><code>` blocks in live preview and keep Shiki for later public rendering, or
2. add a server/utility highlighting function but do not run it on each client keystroke.

Because EDIT-03 asks for code styling close enough to the public article page, styled code blocks are sufficient for Phase 3 if Playwright proves long code lines scroll inside the code surface.

### Taxonomy and Series

Inline creation should normalize names into slugs using the same slug helper, then handle duplicates with a clear inline error. For v1 simplicity:

- category: optional single selection plus inline create;
- tags: multiple selection plus inline create;
- series: optional single selection plus inline create;
- `seriesOrder`: numeric input shown only when series is selected.

Use a transaction for post save so post fields and `PostTag` rows stay consistent. On edit, replace the post's tag assignments by deleting existing `PostTag` rows for that post and creating the submitted set.

### Public Bundle Isolation

Add a static source scan and a behavior-oriented Playwright check:

- source scan: public route/component files under `src/app/(public)` and `src/components/public` must not contain `@uiw/react-md-editor`, `@uiw/react-md-editor/markdown-editor.css`, or `@uiw/react-md-editor/markdown-preview.css`;
- build/lint: `npm run lint && npm run build`;
- admin e2e: editor route renders only after login;
- public smoke: homepage still renders without editor package imports in public sources.

## Key Pitfalls

1. **Guard-first regression:** parsing JSON or running zod in the route before `requireAdmin()` breaks the Phase 2 security contract and existing tests.
2. **Raw HTML preview:** adding `rehype-raw`, `dangerouslySetInnerHTML`, or trusting editor preview HTML would violate EDIT-04.
3. **Public bundle bloat:** importing `@uiw/react-md-editor` from shared Markdown components can leak the editor into public bundles.
4. **Series order conflicts:** `@@unique([seriesId, seriesOrder])` can throw on duplicate orders; validate this before save and catch Prisma unique errors.
5. **Draft metadata over-validation:** D-07 requires only title and Markdown body for draft save; category/tags/series/cover/excerpt cannot block drafts.
6. **Publish scope creep:** Phase 3 must not implement a publish button or public visibility/revalidation behavior.
7. **Mobile editor overflow:** split panes must collapse to edit/preview tabs; long slugs, URLs, tables, and code blocks must not expand page width.

## Planning Recommendations

Create three vertical MVP plans matching the roadmap split:

1. `03-01` - dashboard/list/editor skeleton plus authenticated draft create/edit/delete using real Prisma writes.
2. `03-02` - Markdown editor package install, client-only editor, live preview, Markdown safety tests, and public bundle source scan.
3. `03-03` - inline category/tag/series creation and assignment, series order validation, and final responsive admin workflow checks.

Each plan should keep a working user path:

- after `03-01`, admin can create, edit, list, and delete a minimal draft;
- after `03-02`, admin can write Markdown and trust the live preview safety/styling;
- after `03-03`, admin can organize drafts with taxonomy and series metadata.

## Verification Strategy

Use focused Playwright tests because Phase 3 is a browser workflow:

- authenticated admin can reach dashboard/list/editor;
- unauthenticated calls to create/edit/delete still return 401 before body trust;
- create draft requires title and Markdown body;
- duplicate/invalid slug errors are visible;
- draft save persists to Postgres and appears in dashboard/list sorted by `updatedAt` desc;
- edit updates the existing draft;
- delete confirmation includes the exact title and hard-deletes the row;
- Markdown preview handles headings, lists, tables, inline code, fenced code, and raw HTML fixtures safely;
- mobile editor uses `Edit`/`Preview` tabs without horizontal overflow at 320px and 390px;
- taxonomy assignment and inline creation persist;
- duplicate taxonomy names/slugs and duplicate series order surface clear errors;
- public source scan blocks editor dependency imports outside admin/editor components.

## RESEARCH COMPLETE


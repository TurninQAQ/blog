# Phase 3: Markdown Authoring Workflow - Pattern Map

**Generated:** 2026-07-06
**Status:** Ready for planning
**Mode:** Inline fallback for `gsd-pattern-mapper` because automatic typed subagent dispatch is unavailable in this Codex session.

## Purpose

Map Phase 3 planned files to existing code patterns so execution can extend the app without introducing a second architecture.

## Route and Layout Patterns

| Planned File | Role | Closest Existing Analog | Pattern to Reuse |
|--------------|------|-------------------------|------------------|
| `src/app/admin/(protected)/page.tsx` | Dashboard route | `src/app/admin/(protected)/page.tsx` current placeholder | Server component under protected layout; no client-only auth gate. |
| `src/app/admin/(protected)/posts/page.tsx` | Admin post list | `src/app/(public)/notes/page.tsx` and current admin page | App Router server page imports a focused component and passes server-fetched data. |
| `src/app/admin/(protected)/posts/new/page.tsx` | New draft editor route | `src/app/admin/(protected)/page.tsx` | Server page under `requireAdminPage()` layout; render editor shell with empty draft data. |
| `src/app/admin/(protected)/posts/[postId]/page.tsx` | Edit draft route | `src/app/admin/(protected)/layout.tsx` | Use server-side lookup and `notFound()` or protected redirect behavior before client editor mounts. |

Pattern notes:

- Protected admin pages should rely on `src/app/admin/(protected)/layout.tsx`, which calls `requireAdminPage()` once and wraps children with `AdminShell`.
- Do not move `/admin/login` under the protected route group.
- Admin route pages can be server components even when they render client editor components below them.

## Admin Shell and Visual Patterns

| Planned File | Role | Closest Existing Analog | Pattern to Reuse |
|--------------|------|-------------------------|------------------|
| `src/components/admin/AdminDashboard.tsx` | Dashboard surface | `src/components/admin/AdminShell.tsx` | Dark `bg-lab-surface`, `rounded-lab`, hairline borders, restrained accent. |
| `src/components/admin/AdminPostList.tsx` | Dense list/table | `src/components/admin/AdminShell.tsx` status cards | Stable cards/rows, `min-w-0`, 44px actions, lucide icons. |
| `src/components/admin/PostEditorShell.tsx` | Editor layout | `src/components/public/ArticlePreviewShell.tsx` plus UI-SPEC | Use lab surfaces and max-width expansion only for editor route. |
| `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` | Article-like WYSIWYG canvas | `.lab-reading-surface` direction and existing editor tokens | Code blocks use internal `overflow-x-auto`; canvas text stays stable on mobile. |

Pattern notes:

- Keep cards at `rounded-lab` (`8px`) and avoid card-inside-card layouts.
- Admin Phase 3 should be quieter than the public homepage; use glow sparingly.
- Existing reduced-motion CSS already disables or simplifies global transitions; new tabs/dialogs must not depend on motion.

## Auth and Mutation Patterns

| Planned File | Role | Closest Existing Analog | Pattern to Reuse |
|--------------|------|-------------------------|------------------|
| `src/lib/admin/post-mutations.ts` | Guarded write dispatcher | Existing `runGuardedPostMutation()` | First executable statement awaits `requireAdmin()`. Parse/validate/write only after that. |
| `src/app/api/admin/posts/[operation]/route.ts` | API mutation route | Existing route file | CSRF check, route param validation, delegate to guarded dispatcher, map `UnauthorizedAdminError`. |
| `src/lib/admin/post-input.ts` | zod schemas and normalization | `src/lib/auth/env.ts`, `src/lib/auth/login-attempts.ts` | Server-side zod validation with explicit, stable error messages. |
| `src/lib/admin/post-queries.ts` | Server query helpers | `src/lib/db/prisma.ts` and admin auth helpers | `server-only`, generated Prisma client through singleton, typed return data for components. |

Critical code-order pattern:

```ts
export async function runGuardedPostMutation(operation: AdminPostOperation) {
  const adminSession = await requireAdmin();
  // validation, request parsing, and Prisma writes happen only after this line
}
```

For Phase 3 real writes, preserve that first executable statement by making input reading lazy:

```ts
export async function runGuardedPostMutation(
  operation: AdminPostOperation,
  readInput: () => Promise<unknown>,
) {
  const adminSession = await requireAdmin();
  const input = await readInput();
  // operation dispatch
}
```

## Prisma Data Patterns

| Planned Behavior | Existing Model Support | Implementation Pattern |
|------------------|------------------------|------------------------|
| Draft create/edit | `Post` with `status`, `bodyMarkdown`, `coverImage`, `categoryId`, `seriesId`, `seriesOrder` | Use `status: "DRAFT"` in Phase 3 save paths. |
| Hard delete | `PostTag` relation has `onDelete: Cascade`; category/series relation `SetNull` | `prisma.post.delete({ where: { id } })` after confirmation and auth. |
| Tags | `PostTag` composite id | On edit, replace current `PostTag` rows for the post inside a transaction. |
| Category | `Post.categoryId` optional | Connect optional category or leave null. |
| Series order | `@@unique([seriesId, seriesOrder])` | Validate duplicate order inside selected series and catch unique constraint failures. |

Pattern notes:

- No Phase 3 Prisma schema change is expected.
- Use explicit `include`/`select` shapes for list/editor data so UI components do not know Prisma internals.
- Keep publish/unpublish public visibility and revalidation for Phase 4.

## Markdown and Bundle Patterns

| Planned File | Role | Pattern to Reuse |
|--------------|------|------------------|
| `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` | Client-only Tiptap editor wrapper | Put `"use client"` at top; keep Tiptap imports inside protected admin editor components. |
| `src/lib/admin/wysiwyg/markdown-adapter.ts` | Markdown/document conversion | Round-trip supported Markdown through Tiptap and normalize only known-safe grammar. |
| `src/lib/admin/wysiwyg/compatibility.ts` | Unsupported Markdown gate | Reject raw HTML, MDX-like syntax, task lists, footnotes, unsupported marks/nodes, and lossy round-trips before opening the editor. |
| `src/components/markdown/MarkdownPreview.tsx` | Shared safe public/admin rendering utility where used | Import `react-markdown` and `remark-gfm`; do not import admin editor packages. |
| `src/lib/markdown/rendering.ts` | Optional markdown helpers | Keep raw HTML disabled; avoid `rehype-raw` and `dangerouslySetInnerHTML`. |
| `src/tests/e2e/admin-authoring.spec.ts` | Workflow, WYSIWYG, compatibility, and source scans | Follow `admin-mutations.spec.ts` source-scan style for forbidden imports. |

Forbidden public-source import pattern:

```text
@uiw/react-md-editor
@uiw/react-md-editor/markdown-editor.css
@uiw/react-md-editor/markdown-preview.css
@tiptap/
```

The source scan should check public routes/components and shared Markdown renderer files that public pages may import.

## Playwright Test Patterns

Existing tests provide useful helpers:

- `admin-auth.spec.ts` loads `.env.local` through `@next/env`.
- `admin-auth.spec.ts` signs in by filling `Email`, `Password`, and clicking `Sign in to Admin`.
- `admin-mutations.spec.ts` uses direct `request.post()` calls for backend boundary checks.
- `public-shell.spec.ts` and visual tests already use desktop/mobile/min-mobile/reduced-motion projects.

Recommended Phase 3 test file:

- `src/tests/e2e/admin-authoring.spec.ts`
  - seed and clean Post/Tag/Category/Series rows with Prisma;
  - sign in using the existing login flow;
  - test dashboard/list/editor/create/edit/delete;
  - test validation and duplicate slug/order cases;
  - test WYSIWYG editing, Markdown persistence, raw HTML fixture, and unsupported Markdown notice;
  - test mobile canvas layout and no horizontal overflow;
  - source-scan public files for editor dependency imports.

## PATTERN MAPPING COMPLETE

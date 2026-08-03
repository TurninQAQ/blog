# Phase 04: Public Content Library - Research

**Researched:** 2026-07-06  
**Domain:** Next.js App Router public content library, Prisma/PostgreSQL publishing visibility, safe Markdown rendering, server-side syntax highlighting, public search, taxonomy, archive, and series navigation  
**Confidence:** MEDIUM - codebase and package state are directly verified, official docs were checked through web fallback rather than Context7, and `shiki` is package-gate flagged as `SUS` because the latest npm publish is very recent. [VERIFIED: codebase][VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam][CITED: https://shiki.style/packages/next]

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Publish Visibility
- **D-01:** Publishing a post sets `publishedAt` only on the first transition to `PUBLISHED`. Re-publishing or editing an already-published post must not overwrite the original publish timestamp.
- **D-02:** Public detail routes must return 404 for draft, archived, unpublished, and nonexistent posts. Do not reveal whether an unpublished slug exists.
- **D-03:** `ARCHIVED` remains a reserved enum in v1 public behavior. Phase 4 should handle `DRAFT` and `PUBLISHED`; unpublish returns the post to `DRAFT`.
- **D-04:** Editing an already-published article updates the public content immediately. Do not add separate draft/published versions in v1.

### Article List and Detail
- **D-05:** `/notes` should use an information-dense article list, showing title, excerpt, tags, category, publish date, and reading time.
- **D-06:** Article detail pages should use a desktop right-side sticky TOC and a mobile TOC folded into the content flow before the article body.
- **D-07:** Code blocks should be highlighted server-side with Shiki and allow horizontal scrolling inside the code block.
- **D-08:** Cover images are optional. If a post has no cover image, use a technical-lab CSS visual block rather than requiring an image or omitting the visual treatment entirely.

### Tags, Categories, Archive, and Series
- **D-09:** Tags and categories should use independent semantic routes: `/tags/[slug]` and `/categories/[slug]`.
- **D-10:** `/archive` should group published posts by year and month.
- **D-11:** `/series` should show only series names and descriptions at the entry level. Do not show per-series post counts or latest-update metadata there.
- **D-12:** Series detail pages should order posts by `seriesOrder` ascending. Article detail pages should show previous/next series navigation when applicable.

### Search and Related Articles
- **D-13:** `/search` should use database-side simple search over title, excerpt, body, tags, and category, returning only published posts. Do not build a client-side Fuse index or dedicated search engine in Phase 4.
- **D-14:** Search results should show title, excerpt, publish date, category, tags, and reading time.
- **D-15:** Related articles should be selected by series first, then shared tags, then shared category.
- **D-16:** Related articles should appear in the right-side detail-page rail. Because the rail also contains the sticky TOC, desktop layout should place TOC above related articles; mobile should move both into the document flow.

### Homepage and Empty States
- **D-17:** The homepage should surface real featured articles, not just latest articles. The current `Post` model has no featured field, so Phase 4 needs a real `featured Boolean @default(false)`-style field and a protected admin editor control. Do not pretend latest posts are featured posts.
- **D-18:** Homepage content modules should replace current "not connected yet" placeholder copy with real content and real statistics.
- **D-19:** If there are no published posts, public pages should show polished Chinese empty states and must not expose admin links or admin instructions.
- **D-20:** Do not generate fake or seed public articles for the real app. Public content should reflect real authored posts.

### Performance, Mobile, and Verification
- **D-21:** Article pages may keep lightweight glow, border, and hover effects, but the main reading surface must not have continuous animation.
- **D-22:** On mobile, TOC, related articles, and series navigation should all move into the content flow and stack or collapse without squeezing the article body.
- **D-23:** Phase 4 verification should prioritize published-only visibility, reading rendering, and ensuring drafts do not leak through search, taxonomy, archive, series, related articles, or homepage surfaces.
- **D-24:** Public queries should read live database data by default. Avoid complex static caching in v1; add `revalidatePath` only where mutation behavior requires it.

### the agent's Discretion
- Choose exact component names, data-access helper names, and internal route organization as long as public route names match the decisions above.
- Choose exact Chinese empty-state copy and visual details, as long as they stay consistent with the current technical-lab style and do not expose admin-only workflow.
- Choose the exact Shiki theme and TOC heading depth during planning, as long as code blocks remain readable and Markdown stays safe.

### Deferred Ideas (OUT OF SCOPE)
## Deferred Ideas

- Dedicated search engine remains v2 scope.
- Client-side Fuse.js search index is not selected for Phase 4.
- Separate draft/published article versions are deferred.
- Manual publish-date editing is deferred.
- Required cover images and local media upload/storage are deferred.
- Drag-and-drop series ordering is deferred; use `seriesOrder`.
- Fake/seed public articles should not be generated for the real app.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| READ-01 | Visitor can browse a public article list containing published posts with title, excerpt, date, cover or visual treatment, tags, and category. | Plan `/notes` as a server-rendered published-only list that uses `status: PUBLISHED`, `publishedAt`, relations, reading time, and CSS fallback visual blocks. [CITED: .planning/REQUIREMENTS.md][VERIFIED: codebase] |
| READ-02 | Visitor can open a published article detail page by slug. | Add `src/app/(public)/notes/[slug]/page.tsx`; call `notFound()` when no published post matches so hidden slugs behave like nonexistent slugs. [CITED: https://nextjs.org/docs/app/api-reference/functions/not-found][CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| READ-03 | Visitor can read Markdown article content rendered with stable typography, headings, links, lists, tables, and images. | Reuse the installed `react-markdown`, `remark-gfm`, `rehype-slug`, and `rehype-sanitize` policy direction; extend components for public images, links, tables, and heading collection. [VERIFIED: codebase][CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md] |
| READ-04 | Visitor can read code blocks with syntax highlighting appropriate for technical notes. | Install Shiki after package checkpoint and use server-side `codeToHast` plus JSX runtime to avoid broad raw HTML injection. [CITED: https://shiki.style/packages/next][VERIFIED: package-legitimacy seam] |
| READ-05 | Visitor can use a generated table of contents to jump to article sections. | Generate heading IDs through the Markdown pipeline and build TOC data from headings; sanitize heading IDs because `rehype-slug` documents DOM-clobbering risk. [CITED: https://github.com/rehypejs/rehype-slug] |
| READ-06 | Visitor can see estimated reading time on article pages. | Use `reading-time@1.5.0` against `bodyMarkdown`; its README supports plain text, Markdown, and HTML and returns minutes/time/word stats. [CITED: https://github.com/ngryman/reading-time][VERIFIED: npm registry] |
| READ-07 | Visitor can see SEO/share metadata for public article pages derived from article title, excerpt, cover, and tags. | Implement `generateMetadata` in article detail and taxonomy/search pages as needed; Next supports dynamic metadata from route params and external data. [CITED: https://nextjs.org/docs/app/api-reference/functions/generate-metadata] |
| ORG-01 | Visitor can browse posts by tag. | Add `/tags/[slug]` and query published posts through tag relation filters. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase] |
| ORG-02 | Visitor can browse posts by category. | Add `/categories/[slug]` and query published posts through category relation filters. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase] |
| ORG-03 | Visitor can browse an archive grouped by publication date. | Group published posts by `publishedAt` year/month after fetching ordered published summaries; schema already indexes `publishedAt`. [VERIFIED: codebase] |
| ORG-04 | Visitor can browse series pages containing ordered posts for a technical topic. | Add `/series/[slug]`; order series posts by `seriesOrder` ascending and filter each post to `PUBLISHED`. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase] |
| ORG-05 | Visitor can navigate previous/next posts inside a series when applicable. | Compute previous/next among published posts in the same series by `seriesOrder`; do not include drafts in navigation. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| ORG-06 | Visitor can see related articles on article detail pages based on shared tags, category, or series. | Query related posts in priority order: same series first, shared tags next, shared category last, all with published-only filters. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| SRCH-01 | Visitor can search published posts from the public site. | Implement `/search` with GET query params and database-side Prisma filters over title, excerpt, body, tags, and category. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: generated Prisma client] |
| SRCH-02 | Search results include enough context to choose a post, including title, excerpt, date, and tags or category. | Use the same public summary DTO as list/taxonomy pages so search result metadata is consistent. [CITED: .planning/phases/04-public-content-library/04-UI-SPEC.md] |
| SRCH-03 | Draft or unpublished posts never appear in search results. | Centralize public query helpers around `status: PUBLISHED` and use draft fixtures in tests. [CITED: .planning/research/PITFALLS.md][VERIFIED: codebase] |
| CMS-05 | Administrator can publish an article so it becomes visible on all public surfaces. | Replace publish boundary stub with guarded update to `PUBLISHED`, first-publish `publishedAt`, and targeted `revalidatePath` calls. [VERIFIED: codebase][CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath] |
| CMS-06 | Administrator can unpublish an article so it is removed from all public surfaces. | Replace unpublish boundary stub with guarded update to `DRAFT`, preserve original `publishedAt` only if required for later history, and revalidate affected paths. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase] |
| TAX-05 | Public taxonomy and series pages only include published posts. | Public tag/category/series queries must all reuse the same published-only boundary. [CITED: .planning/REQUIREMENTS.md][VERIFIED: codebase] |
| QUAL-04 | Publishing, unpublishing, and editing revalidate affected public pages or indexes so visitors see current content. | Mutations should call `revalidatePath` for `/`, `/notes`, detail paths, taxonomy paths, `/archive`, `/series`, and `/search` where data changed. [CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath] |
</phase_requirements>

## Project Constraints (from AGENTS.md)

- Clarify assumptions before coding; ask when uncertainty or contradictions are material instead of silently guessing. [VERIFIED: AGENTS.md/project prompt]
- Prefer the smallest working implementation; do not add one-off abstractions, speculative extensibility, or broad refactors. [VERIFIED: AGENTS.md/project prompt]
- Modify only files directly related to the task, preserve existing style, and remove only imports or variables invalidated by the current change. [VERIFIED: AGENTS.md/project prompt]
- Define concrete success criteria and validate bug fixes/features with tests or targeted verification. [VERIFIED: AGENTS.md/project prompt]
- Use GSD workflow entry points before source edits; this research artifact is part of the GSD planning workflow. [VERIFIED: AGENTS.md/project prompt]
- Public copy is Chinese-first while route names, code identifiers, schema fields, and slugs remain English. [CITED: .planning/phases/04-public-content-library/04-UI-SPEC.md]
- Do not initialize shadcn or third-party UI registries; Phase 4 must retain the manual Tailwind v4 lab design system. [CITED: .planning/phases/04-public-content-library/04-UI-SPEC.md]

## Summary

Phase 4 should be planned around one public-content boundary: all public surfaces read from server-side Prisma helpers that return only `PublicationStatus.PUBLISHED` posts. The current schema already has `status`, `publishedAt`, taxonomy relations, series relations, and indexes, but it lacks the required `featured Boolean @default(false)` field; current public routes are placeholders and publish/unpublish operations are still authorization-only stubs. [VERIFIED: codebase]

The Markdown path should extend the existing safe `react-markdown` stack but make public article rendering server-first, with server-side Shiki highlighting. Because the project already scans against broad `dangerouslySetInnerHTML` use, plan the Shiki path with `codeToHast` and `hast-util-to-jsx-runtime` instead of the simpler `codeToHtml` raw-string example. [VERIFIED: codebase][CITED: https://shiki.style/packages/next]

**Primary recommendation:** build `src/lib/public/content-queries.ts` and `src/lib/markdown/render-public-markdown.tsx` first, then wire routes/components to those helpers so published-only filtering, Markdown safety, search, related posts, and revalidation stay centralized. [VERIFIED: codebase][CITED: .planning/research/PITFALLS.md]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Published-only content reads | API / Backend | Database / Storage | Public pages must not repeat ad hoc status clauses; Prisma query helpers should own `status: PUBLISHED`, relation includes, and DTO mapping. [VERIFIED: codebase][CITED: .planning/research/PITFALLS.md] |
| Article list/detail rendering | Frontend Server (SSR) | Browser / Client | Next server pages should fetch data, render Markdown/metadata, and hydrate only disclosures or small interactive controls. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes][VERIFIED: codebase] |
| Markdown rendering and code highlighting | Frontend Server (SSR) | — | Shiki docs recommend Server Components/serverless runtime for bundled highlighter usage; public article pages should not ship editor or highlighter work to the browser. [CITED: https://shiki.style/packages/next][VERIFIED: codebase] |
| Search | API / Backend | Database / Storage | D-13 requires database-side simple search; generated Prisma types support string `contains` and `QueryMode.insensitive`. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: generated Prisma client] |
| Taxonomy/archive/series routes | Frontend Server (SSR) | Database / Storage | Routes present grouped/ordered data but the database helper owns filtering and relation traversal. [VERIFIED: codebase][CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Publish/unpublish/edit visibility | API / Backend | Frontend Server cache | Admin mutations own auth, validation, status transitions, `publishedAt`, and `revalidatePath`; public routes only consume the resulting state. [VERIFIED: codebase][CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath] |
| Featured homepage module | API / Backend | Frontend Server (SSR) | A real `featured` field must be stored in `Post`; homepage rendering should display explicit featured content or empty state. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.9 installed; 16.2.10 latest on npm | App Router public routes, dynamic article route, metadata, and `revalidatePath` | Use the project-pinned version for Phase 4 unless a separate maintenance task upgrades Next; docs cover dynamic params, metadata, `notFound`, and revalidation. [VERIFIED: codebase][VERIFIED: npm registry][CITED: https://nextjs.org/docs/app/api-reference/functions/generate-metadata] |
| React | 19.2.7 | Server/client component split | Public content can stay server-rendered while mobile disclosures and admin controls remain client-only. [VERIFIED: codebase] |
| Prisma ORM / `@prisma/client` | 7.8.0 | PostgreSQL access, schema migration, relation filters | Existing schema and generated client already model posts, tags, categories, series, and status. [VERIFIED: codebase][VERIFIED: local command] |
| PostgreSQL | 16.14 local CLI/server | Durable content store | Current `DATABASE_URL` is set and `pg_isready` reports local PostgreSQL accepting connections. [VERIFIED: local command] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-markdown` | 10.1.0 installed | Markdown to React pipeline | Use for article body rendering with component overrides. [VERIFIED: codebase][CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md] |
| `remark-gfm` | 4.0.1 installed | Tables, strikethrough, task lists, autolinks | Required for technical-note Markdown features expected by READ-03. [VERIFIED: codebase][CITED: https://github.com/remarkjs/remark-gfm] |
| `rehype-slug` | 6.0.0 installed | Heading IDs for TOC anchors | Use with sanitization because its README warns about DOM clobbering risk. [VERIFIED: codebase][CITED: https://github.com/rehypejs/rehype-slug] |
| `rehype-sanitize` | 6.0.0 installed | Sanitizes HAST output | Keep after unsafe transforms and preserve raw HTML disabled policy. [VERIFIED: codebase][CITED: https://github.com/rehypejs/rehype-sanitize] |
| `shiki` | 4.3.0 recommended pin; 4.3.1 latest | Server-side code highlighting | Install only after checkpoint because package legitimacy returned `SUS` for recent latest publish; official docs support Next Server Components. [WARNING: flagged as suspicious - verify before using.][CITED: https://shiki.style/packages/next][VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam] |
| `hast-util-to-jsx-runtime` | 2.3.6 | Render Shiki HAST as React nodes | Use with Shiki `codeToHast` to avoid a raw HTML string boundary. [CITED: https://shiki.style/packages/next][VERIFIED: npm registry] |
| `reading-time` | 1.5.0 | Reading time metadata | Use on server against Markdown body for READ-06. [CITED: https://github.com/ngryman/reading-time][VERIFIED: npm registry] |
| `lucide-react` | 1.22.0 installed | Public/admin icons | UI-SPEC names lucide icons for list/search/taxonomy controls. [VERIFIED: codebase][CITED: .planning/phases/04-public-content-library/04-UI-SPEC.md] |
| `zod` | 4.4.3 installed | Admin mutation validation | Extend existing post input schemas with `featured` and publish/unpublish input IDs. [VERIFIED: codebase] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma `findMany` filters | Raw SQL `ILIKE` query | Prisma filters are enough for v1 and avoid SQL construction; raw SQL is fallback only if relevance/ranking becomes insufficient, and must use parameterized tagged templates. [VERIFIED: generated Prisma client][CITED: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries] |
| Shiki `codeToHast` | Shiki `codeToHtml` plus `dangerouslySetInnerHTML` | `codeToHtml` is documented and simpler, but `codeToHast` fits this project's no-broad-raw-HTML safety pattern. [CITED: https://shiki.style/packages/next][VERIFIED: codebase] |
| Database-side search | Fuse.js client index | D-13 explicitly rejects a client-side Fuse index in Phase 4. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Markdown-only renderer | MDX | MDX demos are deferred and would expand authoring/runtime scope. [CITED: .planning/REQUIREMENTS.md][CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |

**Installation:**

```bash
npm install shiki@4.3.0 reading-time@1.5.0 hast-util-to-jsx-runtime@2.3.6
```

Planner must insert a human verification checkpoint before installing `shiki` because package legitimacy returned `SUS`. [VERIFIED: package-legitimacy seam]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `shiki` | npm | created 2014; latest 4.3.1 published 2026-07-03; recommended pin 4.3.0 published 2026-06-25 | 14,852,654/wk | github.com/shikijs/shiki | SUS - too-new latest publish | Flagged - planner must add `checkpoint:human-verify` before install; use exact pin `4.3.0` if approved. [WARNING: flagged as suspicious - verify before using.][VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam] |
| `reading-time` | npm | created 2014; latest 1.5.0 published 2021-09-10 | 763,573/wk | github.com/ngryman/reading-time | OK | Approved. [VERIFIED: npm registry] |
| `hast-util-to-jsx-runtime` | npm | created 2023; latest 2.3.6 published 2025-03-05 | 25,518,853/wk | github.com/syntax-tree/hast-util-to-jsx-runtime | OK | Approved. [VERIFIED: npm registry] |

**Packages removed due to [SLOP] verdict:** none. [VERIFIED: package-legitimacy seam]  
**Packages flagged as suspicious [SUS]:** `shiki`; planner must add a human verification checkpoint before install. [VERIFIED: package-legitimacy seam]

All checked packages returned no `scripts.postinstall` value from `npm view`. [VERIFIED: npm registry]

## Architecture Patterns

### System Architecture Diagram

```text
---------------- Reader request ----------------+
| /notes, /notes/[slug], /tags/[slug], /search  |
+-------------------------+---------------------+
                          |
                          v
            Next.js App Router server page
                          |
                          v
          src/lib/public/content-queries.ts
          - status: PUBLISHED filter
          - relation includes/selects
          - summary/detail DTOs
                          |
                          v
             Prisma Client -> PostgreSQL
                          |
             +------------+-------------+
             |                          |
             v                          v
  Markdown render pipeline       Taxonomy/search/archive
  - react-markdown policy        - Prisma relation filters
  - Shiki codeToHast             - year/month grouping
  - TOC extraction               - series ordering
             |                          |
             +------------+-------------+
                          |
                          v
   Server-rendered public UI + metadata + small client disclosures

Admin publish/edit/unpublish
  -> CSRF origin check
  -> requireAdmin()
  -> zod input parsing
  -> Prisma transaction/status update
  -> revalidatePath(affected public paths)
```

This architecture follows the existing App Router/server-only admin mutation pattern and prevents draft leakage by keeping public filtering out of page components. [VERIFIED: codebase][CITED: .planning/research/PITFALLS.md]

### Recommended Project Structure

```text
src/
├── app/(public)/
│   ├── notes/[slug]/page.tsx        # article detail + metadata + 404
│   ├── tags/[slug]/page.tsx         # tag route
│   ├── categories/[slug]/page.tsx   # category route
│   ├── series/[slug]/page.tsx       # ordered series route
│   ├── notes/page.tsx               # published list
│   ├── archive/page.tsx             # year/month archive
│   └── search/page.tsx              # GET-query search
├── components/public/content/        # list, card, visual block, TOC, related, series nav
├── components/markdown/              # shared safe preview + public article renderer
├── lib/public/content-queries.ts     # published-only Prisma helpers
├── lib/public/revalidate.ts          # affected public path calculation
├── lib/markdown/public-render.tsx    # Shiki + TOC + public Markdown policy
└── lib/seo/article-metadata.ts       # metadata helpers
```

Keep this structure scoped to Phase 4; do not add a broad CMS abstraction or standalone taxonomy admin module. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase]

### Pattern 1: Central Published Query Boundary

**What:** all public pages call one public query layer that adds `status: PublicationStatus.PUBLISHED` before any route-specific filters. [VERIFIED: codebase]  
**When to use:** every public list, detail, search, taxonomy, archive, series, related article, and homepage featured/stat query. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]

```typescript
// Source: existing Prisma generated filters + Phase 4 D-23.
import { PublicationStatus } from "@/generated/prisma/enums";

const publishedPostWhere = {
  status: PublicationStatus.PUBLISHED,
  publishedAt: { not: null },
} as const;

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      ...publishedPostWhere,
      slug,
    },
    include: publicPostInclude,
  });
}
```

### Pattern 2: Public Markdown Pipeline Separate From Admin Preview

**What:** keep `MarkdownPreview` as admin preview and create a public server renderer that shares the safety policy but adds Shiki, TOC, images, metadata, and article layout concerns. [VERIFIED: codebase]  
**When to use:** article detail pages and any future public Markdown preview. [CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md]

### Pattern 3: Shiki HAST to React

**What:** use Shiki `codeToHast` and `hast-util-to-jsx-runtime` for code blocks, so highlighting is server-side without introducing a generic raw HTML renderer. [CITED: https://shiki.style/packages/next]

```tsx
// Source: Shiki Next.js custom components docs, adapted for this project.
import { Fragment, type JSX } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { codeToHast, type BundledLanguage } from "shiki";

export async function highlightCode(code: string, lang: BundledLanguage) {
  const tree = await codeToHast(code, {
    lang,
    theme: "github-dark",
  });

  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre: (props) => <pre className="lab-code-block" {...props} />,
    },
  }) as JSX.Element;
}
```

### Pattern 4: Mutation-Driven Public Freshness

**What:** after create/edit/publish/unpublish changes public visibility or taxonomy membership, compute affected paths and call `revalidatePath`. [CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath]  
**When to use:** publish, unpublish, editing a published post, slug changes, taxonomy changes, series changes, and featured changes. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]

### Anti-Patterns to Avoid

- **Ad hoc public filters:** repeated `where` clauses make draft leakage likely; use the public query boundary. [CITED: .planning/research/PITFALLS.md]
- **Pretending latest posts are featured:** D-17 requires an explicit `featured` field and admin control. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]
- **Client-side article rendering:** public Markdown should render on the server for SEO, TOC, and code highlighting. [CITED: .planning/research/ARCHITECTURE.md]
- **Raw HTML Markdown pipeline:** existing preview uses `skipHtml`, no `rehype-raw`, and no `dangerouslySetInnerHTML`; public rendering should preserve that trust boundary. [VERIFIED: codebase][CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown parsing/rendering | Regex-based Markdown parser | `react-markdown` + `remark-gfm` + component overrides | The official pipeline parses Markdown AST, applies remark/rehype plugins, and renders React components. [CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md] |
| Markdown sanitization | Custom HTML allowlist | `skipHtml` + `rehype-sanitize` | Sanitizer docs warn improper ordering can re-open XSS; use a maintained sanitizer. [CITED: https://github.com/rehypejs/rehype-sanitize] |
| Heading anchors | Manual string IDs scattered in components | `rehype-slug` with sanitizer-aware policy | The plugin exists for heading IDs but warns about DOM clobbering. [CITED: https://github.com/rehypejs/rehype-slug] |
| Code highlighting | Regex tokenization or client-side highlighter | Shiki server-side `codeToHast` | Shiki is TextMate grammar based and documented for Next Server Components. [CITED: https://shiki.style/packages/next] |
| Reading time | Custom word counter | `reading-time` | The package handles plain text, Markdown, and HTML and returns minutes/time/words. [CITED: https://github.com/ngryman/reading-time] |
| Search engine | Fuse index or dedicated engine | Prisma database-side simple filters | D-13 explicitly selects database-side simple search and rejects Fuse/dedicated search for Phase 4. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Admin protection | Client-side hidden buttons | Existing `requireAdmin()` inside mutation dispatcher plus CSRF origin check | Current route and dispatcher are guard-first; publish/unpublish must keep that boundary. [VERIFIED: codebase] |

**Key insight:** the hard part is not rendering one page; it is keeping every public surface on the same published-only, safe-Markdown, mutation-freshness contract. [CITED: .planning/research/PITFALLS.md]

## Runtime State Inventory

> Included because Phase 4 requires a Prisma schema migration for `Post.featured` and changes runtime publication state behavior. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Stored data | Local PostgreSQL currently has 1 post, 1 draft, 0 published, 0 archived, 0 categories, 0 tags, and 0 series. [VERIFIED: local Prisma query] | Add `featured Boolean @default(false)` via migration; existing rows should backfill to false by default. Add real publish/unpublish updates for existing and future posts. [VERIFIED: codebase] |
| Live service config | No external CMS/search/CDN service config is in scope; public content reads the same PostgreSQL database via `DATABASE_URL`. [VERIFIED: config/codebase] | No live-service migration; keep dedicated search engine out of Phase 4. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| OS-registered state | No pm2/systemd/launchd/task scheduler registration was found in project/planning/source grep. [VERIFIED: local grep] | None. |
| Secrets/env vars | `.env.example` defines `DATABASE_URL`, admin auth secrets, optional `ADMIN_SITE_ORIGIN`, and Playwright admin password; no new Phase 4 secret is required. [VERIFIED: codebase] | Do not add search-service or media-storage secrets in Phase 4. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Build artifacts | `node_modules`, `.next`, and `test-results` exist locally; generated Prisma client exists under `src/generated/prisma`. [VERIFIED: local command][VERIFIED: codebase] | After schema/package changes, run `npm run db:migrate`, `npm run db:generate`, and rebuild/test; do not manually edit generated Prisma files. [VERIFIED: codebase] |

## Common Pitfalls

### Pitfall 1: Draft Leakage Across Secondary Surfaces

**What goes wrong:** article detail hides drafts, but search, related posts, tag pages, archive, series navigation, or homepage modules expose them. [CITED: .planning/research/PITFALLS.md]  
**Why it happens:** each route writes its own query instead of sharing a public boundary. [CITED: .planning/research/PITFALLS.md]  
**How to avoid:** build and test a central public query layer before route pages. [VERIFIED: codebase]  
**Warning signs:** `prisma.post.findMany` appears directly in public page files, or search/related helpers omit `status: PUBLISHED`. [VERIFIED: codebase]

### Pitfall 2: Shiki Reintroduces Raw HTML Risk

**What goes wrong:** the official simple Shiki example returns HTML with `dangerouslySetInnerHTML`; that conflicts with this project's existing source-level safety scans. [CITED: https://shiki.style/packages/next][VERIFIED: codebase]  
**Why it happens:** `codeToHtml` is the quickest API. [CITED: https://shiki.style/guide/install]  
**How to avoid:** use `codeToHast` and JSX runtime, or constrain any raw HTML boundary to one audited component if the planner deliberately accepts it. [CITED: https://shiki.style/packages/next]  
**Warning signs:** new public source contains `dangerouslySetInnerHTML` or `rehype-raw`. [VERIFIED: codebase]

### Pitfall 3: `publishedAt` Gets Overwritten

**What goes wrong:** editing or re-publishing a post changes the original publish date, breaking archive grouping and metadata history. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]  
**Why it happens:** publish code unconditionally sets `publishedAt: new Date()`. [VERIFIED: codebase]  
**How to avoid:** publish should set `publishedAt` only when the existing value is null and status transitions to `PUBLISHED`. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]  
**Warning signs:** publish mutation does not read the previous post state before update. [VERIFIED: codebase]

### Pitfall 4: Featured Homepage Is Faked

**What goes wrong:** latest posts are labeled as featured, violating D-17. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]  
**Why it happens:** schema has no `featured` field yet. [VERIFIED: codebase]  
**How to avoid:** add `featured Boolean @default(false)` and protected admin editor/list control. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]  
**Warning signs:** homepage query sorts by `publishedAt` and labels results as "精选". [CITED: .planning/phases/04-public-content-library/04-UI-SPEC.md]

### Pitfall 5: Revalidation Is Too Narrow

**What goes wrong:** detail updates appear, but list/search/archive/taxonomy/series/homepage still show stale content. [CITED: .planning/research/PITFALLS.md]  
**Why it happens:** mutation code revalidates only the current detail slug. [CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath]  
**How to avoid:** compute affected old and new paths from the pre-update and post-update post snapshots. [VERIFIED: codebase]  
**Warning signs:** edit mutation does not know the previous slug/category/tags/series/featured state. [VERIFIED: codebase]

## Code Examples

### Database-Side Public Search

```typescript
// Source: generated Prisma filters and Phase 4 D-13.
const searchFilter = (query: string) => ({
  status: PublicationStatus.PUBLISHED,
  OR: [
    { title: { contains: query, mode: "insensitive" } },
    { excerpt: { contains: query, mode: "insensitive" } },
    { bodyMarkdown: { contains: query, mode: "insensitive" } },
    { category: { is: { name: { contains: query, mode: "insensitive" } } } },
    {
      tags: {
        some: {
          tag: { name: { contains: query, mode: "insensitive" } },
        },
      },
    },
  ],
});
```

Generated Prisma types expose `StringFilter.contains`, `StringFilter.mode`, and `QueryMode.insensitive`. [VERIFIED: generated Prisma client]

### Article Detail 404 and Metadata

```tsx
// Source: Next.js notFound and generateMetadata docs.
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return articleMetadata(post);
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <ArticlePage post={post} />;
}
```

Next docs state dynamic segments pass `params` to pages and `generateMetadata`; `notFound()` terminates the segment and injects noindex behavior. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes][CITED: https://nextjs.org/docs/app/api-reference/functions/not-found]

### Publish Transition

```typescript
// Source: existing guard-first mutation pattern plus D-01/D-24.
async function publishPost(input: unknown, adminEmail: string) {
  const { id } = parsePublishPostInput(input);
  const current = await prisma.post.findUniqueOrThrow({
    where: { id },
    include: publicPathSnapshotInclude,
  });

  const next = await prisma.post.update({
    where: { id },
    data: {
      status: PublicationStatus.PUBLISHED,
      publishedAt: current.publishedAt ?? new Date(),
    },
    include: publicPathSnapshotInclude,
  });

  revalidatePublicPostPaths(current, next);
  return publishedResponse(adminEmail, next);
}
```

This must remain behind `requireAdmin()` in `runGuardedPostMutation`, which is currently the first executable mutation dispatcher step. [VERIFIED: codebase]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Public placeholder pages | Live server-rendered public content routes | Phase 4 scope | Replace `/notes`, `/series`, `/archive`, `/search` placeholders and add detail/taxonomy routes. [VERIFIED: codebase][CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Client-side Fuse index | Database-side simple Prisma search | Locked in Phase 4 D-13 | Keeps v1 simple and avoids client bundle/search index leakage. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md] |
| Shiki `codeToHtml` raw string | Shiki `codeToHast` + JSX runtime | Shiki current Next docs | Fits server rendering while avoiding a broad raw HTML boundary. [CITED: https://shiki.style/packages/next] |
| Ad hoc route caching | Live DB reads plus mutation-triggered `revalidatePath` only where needed | Locked in Phase 4 D-24 | Avoids complex static caching in v1 while still refreshing affected pages after writes. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath] |

**Deprecated/outdated:**
- `remark-slug` should not be introduced; use the existing `rehype-slug` path with sanitization-aware handling. [CITED: https://github.com/rehypejs/rehype-slug]
- Dedicated search services and client-side Fuse indexes are out of scope for Phase 4. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]

## Assumptions Log

All claims in this research were verified against project files, local commands, npm registry/package-legitimacy checks, or official documentation. No `[ASSUMED]` claims are intentionally used. [VERIFIED: codebase][VERIFIED: npm registry][CITED: https://nextjs.org/docs]

## Open Questions (RESOLVED)

1. **Should the planner accept `shiki` after the package checkpoint?**  
   - What we know: Shiki is the locked technical direction for server-side code highlighting, official docs cover Next Server Components, and npm shows high downloads/no postinstall script. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][CITED: https://shiki.style/packages/next][VERIFIED: npm view metadata]  
   - What's unclear: The package-legitimacy seam flags `shiki` as `SUS` because the latest publish is very recent. [VERIFIED: package-legitimacy seam]  
   - Recommendation: Plan a `checkpoint:human-verify` before installing, then install exact `shiki@4.3.0` if approved. [VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam]
   - Selected resolution: Shiki: use the blocking human verification checkpoint before installing exact `shiki@4.3.0`.

2. **Should Phase 4 tests seed temporary public posts?**  
   - What we know: D-20 forbids fake or seed public articles for the real app, while existing Playwright authoring tests create and clean up phase-prefixed database fixtures. [CITED: .planning/phases/04-public-content-library/04-CONTEXT.md][VERIFIED: codebase]  
   - What's unclear: Whether the planner should use browser-created admin posts only, direct Prisma fixtures only, or both for Phase 4 verification. [VERIFIED: codebase]  
   - Recommendation: Use isolated phase-prefixed test fixtures with cleanup, never committed seed content, and verify no fake content remains after tests. [VERIFIED: codebase]
   - Selected resolution: Test fixtures: use isolated `phase-4-` fixture slugs/taxonomy names with cleanup; use direct Prisma fixtures for public-surface leakage checks and admin flows where mutation behavior itself is under test.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js/Prisma/npm scripts | yes | v22.23.1 | none needed. [VERIFIED: local command] |
| npm | Package install and scripts | yes | 10.9.8 | none needed. [VERIFIED: local command] |
| PostgreSQL server/CLI | Prisma migration and public queries | yes | psql 16.14; `pg_isready` accepting connections | none needed locally. [VERIFIED: local command] |
| `DATABASE_URL` | Prisma Client/migrations | yes | set in `.env.local` | none needed locally; production must provide secret. [VERIFIED: local command] |
| Prisma CLI/client | Schema migration/generation | yes | 7.8.0 | none needed. [VERIFIED: local command] |
| Playwright | Public route and mobile verification | yes | 1.61.1 | none needed. [VERIFIED: local command] |
| `shiki` direct dependency | Code highlighting | no direct dependency | recommended `4.3.0` | Install after human checkpoint. [VERIFIED: codebase][VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam] |
| `reading-time` direct dependency | Reading time | no | 1.5.0 | Install exact pin. [VERIFIED: codebase][VERIFIED: npm registry] |
| `hast-util-to-jsx-runtime` direct dependency | Shiki HAST rendering | no | 2.3.6 | Install exact pin. [VERIFIED: codebase][VERIFIED: npm registry] |

**Missing dependencies with no fallback:** none after the planned npm install/checkpoint. [VERIFIED: local command]  
**Missing dependencies with fallback:** `shiki` is missing as a direct dependency and package-gate flagged; fallback is the required human verification checkpoint before install. [VERIFIED: package-legitimacy seam]

## Security Domain

Security enforcement is enabled at ASVS level 1 in `.planning/config.json`, and Nyquist validation is explicitly disabled. [VERIFIED: codebase]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Keep publish/unpublish/featured controls behind existing custom single-admin `requireAdmin()` boundary. [VERIFIED: codebase] |
| V3 Session Management | yes | Existing admin session cookie/session helpers remain the auth boundary; Phase 4 should not introduce a second session model. [VERIFIED: codebase] |
| V4 Access Control | yes | Public routes must only expose `PUBLISHED` posts; admin mutations must verify server-side authorization. [VERIFIED: codebase][CITED: .planning/research/PITFALLS.md] |
| V5 Input Validation | yes | Use zod for admin mutation inputs, Prisma parameterized filters for search, `skipHtml`, and `rehype-sanitize` for Markdown. [VERIFIED: codebase][CITED: https://github.com/rehypejs/rehype-sanitize] |
| V6 Cryptography | no new crypto | Reuse existing password/session primitives; Phase 4 does not add cryptographic functionality. [VERIFIED: codebase] |

### Known Threat Patterns for Next.js/Prisma Markdown Content

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Draft or unpublished content leakage | Information Disclosure | Central public query boundary with `status: PUBLISHED` and tests for search/taxonomy/archive/series/related/homepage. [CITED: .planning/research/PITFALLS.md] |
| Stored Markdown XSS | Tampering / Elevation of Privilege | Keep raw HTML disabled, sanitize HAST, avoid `rehype-raw`, and do not add a broad `dangerouslySetInnerHTML` path. [VERIFIED: codebase][CITED: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html] |
| DOM clobbering through heading IDs | Tampering | Use `rehype-slug` with sanitization-aware policy and TOC IDs scoped to article content. [CITED: https://github.com/rehypejs/rehype-slug][CITED: https://github.com/rehypejs/rehype-sanitize] |
| SQL injection in search | Tampering | Prefer Prisma filters; if raw SQL is needed, use tagged templates or parameterized values and never string concatenation. [CITED: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries] |
| Cross-origin admin publish/unpublish calls | Spoofing / CSRF | Preserve existing `rejectCrossOriginAdminRequest()` before mutation dispatch and `requireAdmin()` inside dispatcher. [VERIFIED: codebase] |

## Sources

### Primary (HIGH confidence)
- Project codebase: `package.json`, `prisma/schema.prisma`, public placeholder routes, admin mutations, Markdown preview, generated Prisma client, Playwright config/tests. [VERIFIED: codebase]
- Local commands: `npm list --depth=0`, `npm view`, package legitimacy seam, Node/npm/PostgreSQL/Prisma/Playwright probes, Prisma count query. [VERIFIED: local command][VERIFIED: npm registry]

### Secondary (MEDIUM confidence)
- Next.js official docs: dynamic routes, `generateMetadata`, `notFound`, `revalidatePath`. [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes][CITED: https://nextjs.org/docs/app/api-reference/functions/generate-metadata][CITED: https://nextjs.org/docs/app/api-reference/functions/not-found][CITED: https://nextjs.org/docs/app/api-reference/functions/revalidatePath]
- Shiki official docs: Next.js integration, `codeToHast`, Server Components, serverless runtime note. [CITED: https://shiki.style/packages/next]
- react-markdown and unified ecosystem docs: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-sanitize`. [CITED: https://github.com/remarkjs/react-markdown/blob/main/readme.md][CITED: https://github.com/remarkjs/remark-gfm][CITED: https://github.com/rehypejs/rehype-slug][CITED: https://github.com/rehypejs/rehype-sanitize]
- Prisma official docs: CRUD filters and safe raw SQL. [CITED: https://www.prisma.io/docs/orm/prisma-client/queries/crud][CITED: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries]
- OWASP ASVS and XSS Prevention Cheat Sheet. [CITED: https://owasp.org/www-project-application-security-verification-standard/][CITED: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html]

### Tertiary (LOW confidence)
- None used. [VERIFIED: research log]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - current package state is verified, but `shiki` requires a human checkpoint due package legitimacy `SUS`. [VERIFIED: npm view metadata][VERIFIED: package-legitimacy seam]
- Architecture: HIGH - phase context, UI spec, and existing code boundaries align closely. [VERIFIED: codebase][CITED: .planning/phases/04-public-content-library/04-CONTEXT.md]
- Pitfalls: HIGH - draft leakage, unsafe Markdown, and stale revalidation are already documented in project pitfalls and visible in current stubs/placeholders. [VERIFIED: codebase][CITED: .planning/research/PITFALLS.md]
- Security: MEDIUM - controls are clear, but final assurance depends on implementation tests after Phase 4 code exists. [VERIFIED: codebase][CITED: https://owasp.org/www-project-application-security-verification-standard/]

**Research date:** 2026-07-06  
**Valid until:** 2026-07-13 for package/API currency because Next/Shiki are fast-moving and `shiki` had a recent npm publish; codebase findings remain valid until source changes. [VERIFIED: npm view metadata][VERIFIED: codebase]

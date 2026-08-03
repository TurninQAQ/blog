# Phase 4: Public Content Library - Context

**Gathered:** 2026-07-06T16:29:13+08:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 delivers the public content library for the personal technical blog. Published technical notes become visible across public article list/detail pages, taxonomy pages, archive, series pages, search, related-article surfaces, homepage content modules, SEO metadata, and publish/unpublish visibility behavior.

This phase owns public visibility and reading behavior. It should not introduce comments, reactions, multi-author roles, MDX interactive demos, external platform sync, a dedicated search engine, local media uploads, standalone taxonomy admin pages, or heavy public reading-page animation.

</domain>

<decisions>
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

### The Agent's Discretion
- Choose exact component names, data-access helper names, and internal route organization as long as public route names match the decisions above.
- Choose exact Chinese empty-state copy and visual details, as long as they stay consistent with the current technical-lab style and do not expose admin-only workflow.
- Choose the exact Shiki theme and TOC heading depth during planning, as long as code blocks remain readable and Markdown stays safe.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Requirements
- `.planning/PROJECT.md` — Defines the personal technical blog, full content-library value, Markdown-first publishing workflow, and v1/v2 boundaries.
- `.planning/REQUIREMENTS.md` — Defines READ-01 through READ-07, ORG-01 through ORG-06, SRCH-01 through SRCH-03, CMS-05, CMS-06, TAX-05, and QUAL-04 for Phase 4.
- `.planning/ROADMAP.md` — Defines Phase 4 goal, MVP mode, success criteria, and plan split: public article renderer, taxonomy/archive/series routes, then search/related/publish visibility.
- `.planning/STATE.md` — Carries forward decisions that publish/unpublish were intentionally left authorization-boundary-only in Phase 3 and must become real public visibility behavior in Phase 4.

### Prior Phase Context
- `.planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md` — Public-shell visual language, public routes, homepage identity, reading-surface direction, and no-fake-content principle.
- `.planning/phases/02-data-model-and-admin-access/02-CONTEXT.md` — Custom single-admin auth, Prisma/PostgreSQL model boundary, and guard-first admin mutation rules.
- `.planning/phases/03-markdown-authoring-workflow/03-CONTEXT.md` — Markdown editor/preview decisions, inline taxonomy/series authoring, raw HTML disabled, and Phase 4 publish visibility deferral.

### Research and Architecture
- `.planning/research/STACK.md` — Recommended stack, including Prisma, server-rendered Markdown, Shiki, reading-time, Fuse.js as an optional v1 alternative, and visual performance guidance.
- `.planning/research/ARCHITECTURE.md` — Architecture guidance for Next.js App Router, server-first public pages, Prisma data access, and route organization.
- `.planning/research/PITFALLS.md` — Pitfalls around unsafe Markdown, client-only public rendering, public bundle bloat, and over-heavy visual effects.

### Existing Code
- `prisma/schema.prisma` — Current content models, publication status enum, taxonomy relationships, `publishedAt`, and missing featured field.
- `src/lib/admin/post-mutations.ts` — Current guard-first create/edit/delete logic and publish/unpublish boundary stubs that Phase 4 must replace with real status transitions.
- `src/lib/admin/post-queries.ts` — Existing admin query shape for posts, categories, tags, and series; useful model reference but not a public-query boundary.
- `src/app/(public)/notes/page.tsx` — Current public notes placeholder route to replace with published-only list behavior.
- `src/app/(public)/series/page.tsx` — Current public series placeholder route to replace with series entry behavior.
- `src/app/(public)/archive/page.tsx` — Current public archive placeholder route to replace with year/month grouping.
- `src/app/(public)/search/page.tsx` — Current public search placeholder route to replace with database-backed published-only search.
- `src/components/markdown/MarkdownPreview.tsx` — Existing safe Markdown rendering baseline: `react-markdown`, `remark-gfm`, `rehype-slug`, `rehype-sanitize`, and `skipHtml`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/markdown/MarkdownPreview.tsx` — Safe Markdown rendering baseline for admin preview. Public rendering can reuse the policy direction, but Phase 4 should add server-side Shiki highlighting and article-detail concerns such as TOC.
- `.lab-markdown-preview` and `.lab-reading-surface` styles in `src/app/globals.css` — Existing technical-note typography and reading surface can guide public article layout.
- `src/components/public/SiteHeader.tsx`, `MobileNav.tsx`, and `ContentRouteStrip.tsx` — Existing public navigation already exposes Notes, Series, Archive, and Search.
- `src/components/public/ArticlePreviewShell.tsx` — Current reading-preview section gives a visual baseline for code blocks and technical-note copy.
- `src/config/site.ts` and `src/config/routes.ts` — Current Chinese public navigation and content-route descriptions should remain the public copy source where practical.

### Established Patterns
- Public routes live under `src/app/(public)`, and admin routes live under `src/app/admin`.
- Public UI copy has been converted to Chinese. New public surfaces should continue using Chinese visible text while keeping route names, code identifiers, and schema fields in English.
- Admin mutations use a guard-first pattern where `requireAdmin()` runs before trusted request parsing or writes.
- Markdown raw HTML is disabled for v1 and should remain disabled on public pages.
- Visual effects are isolated and reduced-motion aware. Article reading pages should be calmer than the homepage and must preserve readability.

### Integration Points
- Add public detail route `src/app/(public)/notes/[slug]/page.tsx`.
- Add taxonomy routes `src/app/(public)/tags/[slug]/page.tsx` and `src/app/(public)/categories/[slug]/page.tsx`.
- Add series detail route, likely `src/app/(public)/series/[slug]/page.tsx`.
- Replace placeholder implementations for `/notes`, `/series`, `/archive`, and `/search`.
- Add public query utilities under `src/lib/...` that always filter `status: PUBLISHED`.
- Extend `prisma/schema.prisma` and admin editor controls for real featured posts.
- Replace publish/unpublish stubs in `src/lib/admin/post-mutations.ts` with guarded real status transitions and public-page freshness behavior.
- Add tests that create draft and published content and verify drafts do not appear on any public surface.

</code_context>

<specifics>
## Specific Ideas

- The site should keep feeling like a technical lab, but public reading should stay useful and calm.
- Public article surfaces should be real Chinese blog pages, not placeholder pages or English admin-flavored copy.
- Featured homepage content must be an intentional author choice via data, not inferred from latest publish time.
- Right-side article rail must handle both TOC and related articles without crowding. On desktop, TOC should appear above related articles; on mobile, both should move into the content flow.

</specifics>

<deferred>
## Deferred Ideas

- Dedicated search engine remains v2 scope.
- Client-side Fuse.js search index is not selected for Phase 4.
- Separate draft/published article versions are deferred.
- Manual publish-date editing is deferred.
- Required cover images and local media upload/storage are deferred.
- Drag-and-drop series ordering is deferred; use `seriesOrder`.
- Fake/seed public articles should not be generated for the real app.

</deferred>

---

*Phase: 4-Public Content Library*
*Context gathered: 2026-07-06T16:29:13+08:00*

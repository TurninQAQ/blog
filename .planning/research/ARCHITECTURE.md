# Architecture Research

**Domain:** personal technical blog with single-admin CMS and immersive frontend
**Researched:** 2026-06-30
**Confidence:** HIGH

## Standard Architecture

### System Overview

```text
+-------------------------------------------------------------+
|                    Next.js App Router                        |
|                                                             |
|  Public Routes                  Admin Routes                 |
|  - home                         - login                      |
|  - posts                        - dashboard                  |
|  - post detail                  - editor                     |
|  - tags/categories              - taxonomy management        |
|  - series/archive/search        - preview                    |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                   Server Layer / Actions                     |
|  - auth/session checks                                       |
|  - post mutations                                            |
|  - markdown transforms                                       |
|  - search index generation                                   |
|  - cache revalidation                                        |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|                   Data and Assets                            |
|  PostgreSQL + Prisma    Cover assets    Generated metadata   |
+-------------------------------------------------------------+
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Public shell | Navigation, layout, theme, responsive structure | Server components with isolated client nav/search widgets. |
| Technical-lab visual layer | Hero background, glow, grid, particles, motion | CSS + Motion first; optional dynamically imported Three.js scene. |
| Article renderer | Markdown to safe HTML/React with TOC and code highlighting | Server-side transform using react-markdown/remark/rehype/Shiki or a unified pipeline. |
| Content data layer | Posts, tags, categories, series, related mapping | Prisma models and typed queries. |
| Admin auth | Protect CMS routes and mutations | Auth.js session checks plus single-admin allowlist. |
| Admin editor | Draft/edit/publish Markdown content | Client component with @uiw/react-md-editor and server actions/API mutations. |
| Search index | Published article search | Generated JSON index for Fuse.js in v1; server search later. |
| Cache invalidation | Keep public pages fresh after publish | Next.js revalidation after post/tag/series mutations. |

## Recommended Project Structure

```text
src/
  app/
    (public)/
      page.tsx
      posts/
      tags/
      categories/
      series/
      archive/
      search/
    admin/
      layout.tsx
      login/
      posts/
      taxonomy/
    api/
      auth/
    globals.css
  components/
    public/
    admin/
    markdown/
    visual/
    ui/
  lib/
    auth/
    db/
    markdown/
    posts/
    search/
    seo/
    validation/
  prisma/
    schema.prisma
  tests/
    unit/
    e2e/
```

### Structure Rationale

- **`app/(public)/`:** Keeps public content routes separate from admin surfaces while sharing the same app runtime.
- **`app/admin/`:** Makes route protection, admin layout, and browser-only editor dependencies easier to isolate.
- **`components/markdown/`:** Prevents Markdown rendering concerns from leaking into page components.
- **`components/visual/`:** Keeps expensive effects isolated and easy to disable or lazy-load.
- **`lib/posts/`:** Centralizes query functions and prevents duplicate post filtering rules.
- **`lib/search/`:** Makes it clear which fields enter the public search index.
- **`lib/validation/`:** Shared zod schemas for admin forms and server actions.

## Architectural Patterns

### Pattern 1: Server-Rendered Public Content, Client-Only Enhancements

**What:** Render public pages and Markdown content on the server; hydrate only search widgets, copy buttons, progress bars, and visual effects.

**When to use:** Default for article pages and content routes.

**Trade-offs:** Better SEO and reading performance, but requires a clean boundary between render-time transforms and browser-only interactions.

**Example:**

```typescript
// page.tsx stays server-rendered; interactive widgets live below client boundaries.
export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPublishedPost(params.slug)
  const rendered = await renderMarkdown(post.body)

  return <Article post={post} rendered={rendered} />
}
```

### Pattern 2: Admin Mutations Behind Auth-Checked Server Functions

**What:** Every create/update/publish action verifies the current admin session on the server before writing.

**When to use:** All admin post, tag, category, and series mutations.

**Trade-offs:** Slightly more ceremony than client-only calls, but much safer and simpler to audit.

**Example:**

```typescript
export async function publishPost(input: PublishPostInput) {
  await requireAdmin()
  const data = publishPostSchema.parse(input)
  const post = await db.post.update({ where: { id: data.id }, data: { status: "PUBLISHED" } })
  revalidatePath(`/posts/${post.slug}`)
}
```

### Pattern 3: Dual Markdown Pipeline

**What:** Use the admin editor for writing and preview, but a controlled public rendering pipeline for published pages.

**When to use:** Always for this project.

**Trade-offs:** Preview can differ slightly from final render unless shared components/styles are reused, but public rendering stays secure and optimized.

### Pattern 4: Progressive Visual Effects

**What:** Build visual depth in layers: CSS tokens and backgrounds first, Motion for UI transitions, optional WebGL for the hero layer.

**When to use:** Homepage and brand surfaces; reduce on article pages.

**Trade-offs:** Requires a performance budget and reduced-motion handling, but avoids making content pages fragile.

## Data Flow

### Request Flow

```text
Reader opens article
  -> Next.js route loads published post
  -> Prisma query fetches post/tags/series
  -> Markdown renderer generates body, TOC, code HTML
  -> Server returns article page
  -> Client hydrates small widgets only
```

### Admin Publishing Flow

```text
Admin edits post
  -> editor local state
  -> save/publish server action
  -> requireAdmin()
  -> zod validation
  -> Prisma write
  -> revalidate affected public paths
  -> redirect or refresh admin view
```

### Search Flow

```text
Published posts
  -> selected index fields (title, excerpt, tags, category, series)
  -> generated JSON index
  -> Fuse.js client query
  -> link to public routes
```

### Key Data Flows

1. **Post publishing:** Admin draft becomes published content only after auth, validation, slug uniqueness, and cache revalidation.
2. **Markdown rendering:** Raw Markdown is transformed into safe article output, TOC, headings, excerpts, and code blocks.
3. **Related posts:** Post tags/category/series are used to compute related content.
4. **Visual settings:** Reduced-motion and device constraints control whether heavy effects mount.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k monthly readers | Single Next.js app, managed Postgres, Fuse.js index, simple image storage. |
| 1k-100k monthly readers | Add stronger caching, image CDN discipline, Postgres indexes, server-side search if index gets large. |
| 100k+ monthly readers | Consider edge/CDN cache strategy, dedicated search backend, separate media storage, background jobs for expensive transforms. |

### Scaling Priorities

1. **First bottleneck:** Heavy visual effects and client JavaScript - fix with lazy loading, reduced-motion, and article-page restraint.
2. **Second bottleneck:** Markdown transform and code highlighting - fix by caching rendered output or precomputing on publish.
3. **Third bottleneck:** Search index size - fix by moving from Fuse.js to Postgres full-text or a hosted search service.

## Anti-Patterns

### Anti-Pattern 1: Treating the Admin Editor as the Public Renderer

**What people do:** Use the Markdown editor's preview output as the final article rendering path.

**Why it's wrong:** Editor preview is optimized for editing convenience, not SEO, security, code highlighting, or stable heading IDs.

**Do this instead:** Use the editor for authoring and a separate public Markdown pipeline for published pages.

### Anti-Pattern 2: Unprotected Server Actions

**What people do:** Hide admin UI but forget to enforce admin authorization in the mutation handler.

**Why it's wrong:** Anyone who can call the endpoint/action can mutate content.

**Do this instead:** Put `requireAdmin()` inside every mutation, not just in layouts.

### Anti-Pattern 3: Animation as Page Structure

**What people do:** Build layout and readability around animations that must run for the page to make sense.

**Why it's wrong:** Breaks on reduced-motion, low-power devices, and slow hydration.

**Do this instead:** Make content complete without effects; effects enhance but do not carry meaning.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Managed Postgres | Prisma connection via environment variables | Add migrations and backup strategy before production use. |
| Auth provider or credentials | Auth.js route handler/session helpers | Single-admin allowlist should live server-side. |
| Image storage | Next.js image optimization plus object storage if needed | Local/public upload is fine only for local dev; production needs durable storage. |
| Deployment platform | Next.js-supported Node runtime | Confirm Prisma/database adapter and image pipeline work in target environment. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Public pages to data layer | Typed read functions | Only return published posts to public routes. |
| Admin UI to mutations | Server actions or API routes | Every mutation must call auth and validation. |
| Markdown pipeline to article UI | Rendered document object | Include HTML/React nodes, TOC, headings, excerpt, and code metadata. |
| Visual layer to page layout | Client component props | Effects should be removable without breaking layout. |

## Sources

- https://nextjs.org/docs - App Router, layouts, routing, caching, metadata, and image guidance.
- https://nextjs.org/docs/app/guides/authentication - Authentication and authorization guidance.
- https://www.prisma.io/docs/orm - Prisma schema, migrations, queries, and client usage.
- https://authjs.dev/getting-started/adapters/prisma - Auth.js adapter with Prisma.
- https://github.com/remarkjs/react-markdown - React Markdown pipeline.
- https://shiki.style/ - Syntax highlighting.
- https://www.fusejs.io/ - Search index approach.
- https://motion.dev/docs/react - React animation primitives.
- https://threejs.org/docs/ and https://r3f.docs.pmnd.rs/ - WebGL and React Three architecture.

---
*Architecture research for: personal technical blog with single-admin CMS*
*Researched: 2026-06-30*

# Feature Research

**Domain:** personal technical blog with single-admin CMS and immersive frontend
**Researched:** 2026-06-30
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these makes the product feel incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Public homepage with personal technical profile | The homepage is the first credibility signal for a programmer blog. | MEDIUM | Should show identity, focus areas, selected technologies, and links into content. |
| Article list and article detail pages | Core blog reading flow. | MEDIUM | Include slug routes, published status, timestamps, cover image, tags, and category. |
| Markdown rendering with code highlighting | Technical notes rely on code examples and structured headings. | MEDIUM | Use server-side rendering and Shiki. |
| Table of contents | Long technical posts need jump navigation. | MEDIUM | Generate from headings and stable slugs. |
| Tags and categories | Readers expect browsing by topic. | LOW | Tags can be many-to-many; categories should be fewer and curated. |
| Search | The selected v1 scope includes a full content library. | MEDIUM | Fuse.js index is enough for v1; server search later. |
| Archive page | Common blog navigation pattern for chronological browsing. | LOW | Group by year/month. |
| Series pages | The user selected series/special-topic organization. | MEDIUM | Series needs ordering and next/previous navigation. |
| Related articles | Helps readers continue through technical content. | MEDIUM | Start with tag/category similarity. |
| Responsive reading experience | Blog must work on phones and tablets even if primary writing is desktop. | MEDIUM | Effects must degrade gracefully. |
| Single-admin login | Required for browser-based publishing. | MEDIUM | Admin allowlist or one credentials account. |
| Admin article CRUD | Required because content is managed in the app. | HIGH | Create, edit, delete/archive, draft/publish, cover, tags, categories. |
| Markdown editor with live preview | Confirmed writing experience. | HIGH | Keep in admin routes; public rendering can use a separate renderer. |
| Draft/published workflow | Prevents half-written notes from going public. | MEDIUM | Include preview route or preview mode if possible. |
| SEO metadata and social preview | Public technical posts should share cleanly. | MEDIUM | Metadata should derive from title, excerpt, cover, and tags. |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not all are required, but they align with the user's vision.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Immersive technical-lab hero background | Gives the site a memorable identity and matches the user's "cool" direction. | HIGH | Use particles/grid/mouse-following/parallax; optionally Three.js. |
| Glow/streaming-light visual system | Delivers the "flowing light" feel across navigation, cards, buttons, and article headers. | MEDIUM | Should be restrained on reading surfaces. |
| Command/search palette | Strong developer feel and efficient navigation. | MEDIUM | Useful differentiator after base search exists. |
| Interactive skill/tech profile | Turns homepage from bio text into a visual technical map. | MEDIUM | Can connect skills to posts/projects later. |
| Article progress + sticky TOC | Improves long-form technical reading. | MEDIUM | Especially useful for deep notes. |
| Code-block enhancements | Copy button, filename labels, line highlighting, and language badge. | MEDIUM | Valuable for programmer audience. |
| Reading mode / effect reduction | Balances visual impact with serious reading. | MEDIUM | Could be automatic via reduced-motion and manual toggle. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Public comments in v1 | Readers can discuss posts. | Adds moderation, spam protection, notifications, and account choices. | Defer; use contact links or GitHub discussion links later. |
| Multi-author CMS | Seems more complete. | Contradicts personal-blog focus and adds role/permission complexity. | Single-admin v1. |
| MDX embedded components | Powerful for interactive demos. | Raises authoring complexity and runtime/security concerns. | Markdown v1; add MDX later for demo-heavy posts. |
| Heavy WebGL everywhere | Looks impressive. | Can hurt battery, mobile performance, accessibility, and article readability. | Isolate a hero/background scene and degrade gracefully. |
| Notion/Yuque/GitHub sync | Convenient if content already lives elsewhere. | Sync edge cases and schema mismatch distract from core app. | Own content in the app for v1. |
| Full-text search engine | Better relevance at scale. | Operational overhead for a personal blog. | Fuse.js or Postgres search first. |

## Feature Dependencies

```text
Admin login
    -> Admin shell
        -> Article CRUD
            -> Markdown editor + preview
                -> Draft/publish workflow
                    -> Public article pages

Post model
    -> Tags/categories
    -> Series ordering
    -> Archive
    -> Related articles
    -> Search index

Visual system
    -> Immersive homepage
    -> Article page styling
    -> Admin UI consistency

Markdown renderer
    -> Code highlighting
    -> Table of contents
    -> SEO excerpt/metadata
```

### Dependency Notes

- **Admin article CRUD requires admin login:** Publishing controls must not be public.
- **Public article pages require a stable content model:** Slugs, published state, timestamps, and tags drive routing, SEO, search, related posts, and archive.
- **Search requires indexed public content:** Only published posts should appear.
- **Series requires article ordering:** A series table or order field is needed before rendering next/previous navigation.
- **Immersive effects require performance budgets:** The visual system must be designed before filling every page with effects.

## MVP Definition

### Launch With (v1)

- [ ] Public homepage with personal technical profile and immersive technical-lab visual identity.
- [ ] Public article list, article detail, tags, categories, series, archive, search, and related articles.
- [ ] Markdown rendering with code highlighting, heading anchors, table of contents, and reading time.
- [ ] Single-admin login and protected admin layout.
- [ ] Admin article CRUD with title, slug, excerpt, cover, tags, category, series, draft/published status, and Markdown body.
- [ ] Markdown editor with live preview.
- [ ] Responsive, accessible public pages with reduced-motion handling.

### Add After Validation (v1.x)

- [ ] Command/search palette - once search index and routes are stable.
- [ ] Code block copy buttons, filename labels, and line highlights - after base Markdown rendering is proven.
- [ ] Manual reading/effects mode toggle - if user feedback shows effects distract from reading.
- [ ] Richer project/portfolio section - if homepage personal branding becomes a stronger goal.

### Future Consideration (v2+)

- [ ] Public comments or reactions - requires moderation decisions.
- [ ] MDX interactive demos - requires safer authoring/runtime model.
- [ ] Multi-author roles - only if the blog stops being personal.
- [ ] External content sync - only if existing writing workflow moves outside the app.
- [ ] Dedicated search backend - only after content volume or search expectations outgrow Fuse.js/Postgres.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Technical-lab homepage | HIGH | HIGH | P1 |
| Article data model | HIGH | MEDIUM | P1 |
| Public article reading | HIGH | MEDIUM | P1 |
| Markdown renderer + code highlight | HIGH | MEDIUM | P1 |
| Single-admin auth | HIGH | MEDIUM | P1 |
| Admin article CRUD | HIGH | HIGH | P1 |
| Markdown editor + preview | HIGH | HIGH | P1 |
| Tags/categories/archive | HIGH | LOW | P1 |
| Series | HIGH | MEDIUM | P1 |
| Search | HIGH | MEDIUM | P1 |
| Related articles | MEDIUM | MEDIUM | P1 |
| Command palette | MEDIUM | MEDIUM | P2 |
| Code block enhancements | MEDIUM | MEDIUM | P2 |
| Comments | LOW | HIGH | P3 |
| MDX demos | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Developer blogs | Headless CMS blogs | Our Approach |
|---------|-----------------|--------------------|--------------|
| Fast public reading | Usually strong when static. | Depends on frontend implementation. | Server-render public content and keep animations isolated. |
| Technical code reading | Common via Markdown/MDX and syntax highlighting. | Often needs customization. | First-class Markdown renderer with Shiki and TOC. |
| Visual identity | Often minimal and generic. | Often template-driven. | Technical-lab theme, immersive hero, glow/light language. |
| Writing workflow | Often repository-based. | Strong browser editing. | Browser admin with Markdown editor, but simpler than full CMS. |
| Content organization | Tags and archives common; series vary. | Taxonomy support common. | Include tags, categories, series, archive, related posts in v1. |

## Sources

- `.planning/PROJECT.md` - Confirmed project direction and selected v1 scope.
- https://nextjs.org/docs - Public routing, metadata, server rendering, and full-stack app patterns.
- https://nextjs.org/docs/app/guides/authentication - Auth and route protection guidance.
- https://authjs.dev/getting-started/adapters/prisma - Auth.js + Prisma integration.
- https://github.com/remarkjs/react-markdown - Markdown rendering.
- https://shiki.style/ - Code highlighting.
- https://www.fusejs.io/ - Client-side fuzzy search.
- https://motion.dev/docs/react - Animation.
- https://threejs.org/docs/ and https://r3f.docs.pmnd.rs/ - WebGL/React Three options for immersive background.

---
*Feature research for: personal technical blog with single-admin CMS*
*Researched: 2026-06-30*

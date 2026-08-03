# Stack Research

**Domain:** personal technical blog with single-admin CMS and immersive frontend
**Researched:** 2026-06-30
**Implementation updated:** 2026-07-09
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.9 | Full-stack React framework | One app can host public pages, admin routes, server actions/API routes, metadata, image handling, and cache revalidation. Good fit because v1 needs a real backend but should still feel like a fast content site. |
| React | 19.2.7 | UI runtime | Required by current Next.js. Server/client component split is useful for keeping article pages mostly server-rendered while isolating animations and editor widgets as client components. |
| TypeScript | 6.0.3 | Type safety | Reduces schema, route, and CMS form mistakes as the project grows from blog UI into admin publishing workflows. |
| Tailwind CSS | 4.3.2 | Styling system | Fast iteration on a distinctive dark technical-lab visual system, with CSS variables for glow, grid, and prose tokens. |
| PostgreSQL | Current managed provider | Primary data store | Relational modeling fits posts, tags, categories, series, related posts, auth accounts, and publishing states without needing a separate CMS. |
| Prisma ORM | 7.8.0 | Database schema and typed queries | Strong migration story, typed models, and well-known Next.js integration. Helps keep the custom CMS maintainable. |
| Custom Prisma-backed auth | @node-rs/argon2 2.0.2 | Single-admin authentication | Current implementation uses AdminUser/AdminSession tables, hashed session cookies, and Argon2 password verification. NextAuth/Auth.js was not installed for v1. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tiptap/react and Tiptap extensions | 3.27.3 | Markdown-backed WYSIWYG admin editor | Current admin editor uses a rendered Tiptap canvas, Markdown adapter round-trip, compatibility scanning, code/table/image toolbar controls, and no source-edit fallback. |
| react-markdown | 10.1.0 | Public article Markdown renderer | Use for public article rendering, combined with remark/rehype plugins and custom components. |
| remark-gfm | 4.0.1 | GitHub-flavored Markdown | Use for tables, strikethrough, task lists, and common technical-note syntax. |
| rehype-slug | 6.0.0 | Heading ids | Use for table of contents and deep links. |
| rehype-sanitize | 6.0.0 | HTML sanitization | Use if any raw HTML is allowed or markdown plugins introduce HTML. Prefer disallowing raw HTML in v1. |
| shiki | 4.3.0 | Code highlighting | Use for high-quality, themeable code blocks. Render on the server or at build/request time; do not highlight large posts on the client. |
| reading-time | 1.5.0 | Reading time metadata | Compute and store/display article reading time. |
| Prisma/PostgreSQL search queries | Current app query layer | Public search | Current v1 search is server-rendered and database-backed through the public content query layer; Fuse.js is not installed. Upgrade to a dedicated engine only if content volume or relevance needs require it. |
| motion | 12.42.0 | UI animations | Use for transitions, hover states, page motion, and micro-interactions where CSS is not enough. |
| CSS and 2D Canvas | App-owned implementation | Visual effects | Current homepage effects use CSS plus a homepage-only 2D signal canvas with mobile/offscreen/reduced-motion safeguards; Three.js is not installed. |
| lucide-react | 1.22.0 | Icons | Use for admin controls, navigation, article metadata, and command/search UI. |
| zod | 4.4.3 | Runtime validation | Validate admin forms, slugs, auth input, and server actions. |
| @uiw/react-md-editor | 4.1.1 | Legacy installed dependency | Present in `package.json` from the earlier Phase 3 editor path, but current project source does not import it; the active editor is Tiptap. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | 10.6.0 | Static checks | Use with Next.js/TypeScript rules. |
| Vitest | 4.1.9 | Unit/component tests | Good fit for utilities, Markdown transforms, slug generation, and server logic. |
| Playwright | 1.61.1 | Browser verification | Required for visual/interaction checks: hero effects, admin editor, article reading, search, and responsive layouts. |
| tsx | 4.22.4 | TypeScript scripts | Useful for seed scripts and content/index maintenance tasks. |

## Installation

```bash
# Core
npm install next react react-dom typescript tailwindcss @tailwindcss/postcss postcss prisma @prisma/client

# Auth, CMS, and content
npm install @node-rs/argon2 pg @prisma/adapter-pg @tiptap/core @tiptap/react @tiptap/starter-kit @tiptap/markdown @tiptap/pm @tiptap/extension-code-block @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tiptap/extension-table react-markdown remark-gfm rehype-slug rehype-sanitize shiki reading-time zod

# Visual and UI
npm install motion lucide-react

# Optional hosted Postgres adapter if using Neon
npm install @neondatabase/serverless @prisma/adapter-neon

# Dev dependencies
npm install -D eslint vitest @playwright/test tsx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js full-stack app | Astro + separate API/CMS | Use Astro if the project becomes content-first with no custom admin backend. The confirmed backend makes Next.js simpler. |
| Custom Prisma-backed CMS | Strapi / Payload / Sanity | Use a headless CMS if editorial features, media workflows, or multi-author permissions become important. For a personal blog, custom is leaner. |
| PostgreSQL | SQLite | Use SQLite only for local/offline experiments. Managed Postgres is better for deployed auth and content workflows. |
| Custom Prisma-backed single-admin login | Auth.js / NextAuth | Current implementation uses a small custom session model and guard-first mutation boundary. Reconsider Auth.js only if OAuth, password reset, or multi-user auth becomes scope. |
| Tiptap WYSIWYG authoring | @uiw/react-md-editor split source/preview | Use UIW only if source-first Markdown editing becomes desired again. The current selected direction is direct rendered-canvas editing with Markdown persistence. |
| react-markdown + Shiki | MDX | Use MDX later if articles need embedded React demos. v1 explicitly chose Markdown editor over MDX. |
| Fuse.js client search | Postgres full-text / Meilisearch / Typesense | Upgrade when the article index grows large or search quality becomes a feature. |
| CSS/Canvas/Motion layered effects | Always-on heavy WebGL | Use WebGL only if a future visual phase needs real 3D depth and can preserve reduced-motion/mobile safeguards. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| A static-only blog generator as the only architecture | It conflicts with the confirmed browser-based admin publishing workflow. | Next.js full-stack app with database-backed posts. |
| Client-only Markdown rendering for public article pages | Slower first render, worse SEO, and harder to generate TOC/metadata reliably. | Server-render Markdown and hydrate only interactive widgets. |
| Raw unsanitized HTML inside Markdown | XSS risk in the public site, even with single-admin publishing. | Disallow raw HTML or sanitize with rehype-sanitize. |
| Animation libraries everywhere | Creates performance and accessibility issues. | Use CSS for simple glow/grid effects, Motion for UI transitions, Three.js only where needed. |
| Multi-author CMS architecture in v1 | Adds roles, permissions, moderation, audit logs, and editorial complexity without matching the personal-blog goal. | Single-admin model with an allowlist. |

## Stack Patterns by Variant

**If deployment target is Vercel + managed Postgres:**
- Use Next.js App Router, Prisma, Auth.js, and Neon/Supabase/Postgres.
- Because this keeps frontend, backend, auth, and cache invalidation in one repo.

**If deployment target is a self-hosted VPS:**
- Keep the same Next.js/Prisma/Postgres architecture.
- Add a persistent Node runtime, environment-managed secrets, and a Postgres backup strategy.

**If the immersive background is 2D:**
- Use CSS, Canvas, and Motion first.
- Because this avoids the runtime cost of WebGL.

**If the immersive background needs real 3D depth:**
- Use Three.js with @react-three/fiber, dynamically imported and disabled for reduced-motion.
- Because it keeps the public content shell fast and isolates the expensive visual layer.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.9 | React 19.2.7 | Use App Router conventions and keep client components explicit. |
| Tailwind CSS 4.3.2 | @tailwindcss/postcss 4.3.2, PostCSS 8.5.16 | Use the Tailwind v4 setup style; avoid old v3 config assumptions unless needed. |
| Prisma 7.8.0 | @prisma/client 7.8.0 | Keep CLI and client versions aligned. |
| Tiptap 3.27.3 packages | React 19.x | Keep the editor client-only and verify Markdown adapter compatibility before opening legacy Markdown documents in the WYSIWYG canvas. |
| @node-rs/argon2 2.0.2 | Custom Prisma auth | Keep password hash generation and bootstrap scripts aligned with ignored `.env.local` secrets. |

## Sources

- https://nextjs.org/docs - App Router, rendering, metadata, routing, caching, and deployment guidance.
- https://nextjs.org/docs/app/guides/authentication - Authentication and authorization patterns in the App Router.
- https://tailwindcss.com/docs/installation/framework-guides/nextjs - Tailwind CSS setup with Next.js.
- https://www.prisma.io/docs/orm - Prisma ORM, schema, migrations, and database integration.
- https://tiptap.dev/docs - Tiptap editor and extension documentation.
- https://github.com/remarkjs/react-markdown - React Markdown rendering.
- https://shiki.style/ - Shiki code highlighting.
- https://www.fusejs.io/ - Fuse.js search.
- https://motion.dev/docs/react - Motion for React.
- https://github.com/ranisalt/node-argon2 - Argon2 password hashing package used by the current custom auth path.
- npm registry checked with `npm view <package> version` on 2026-06-30 for package versions.

---
*Stack research for: personal technical blog with single-admin CMS*
*Researched: 2026-06-30*

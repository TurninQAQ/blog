# Project Research Summary

**Project:** Personal Tech Lab Blog
**Domain:** personal technical blog with single-admin CMS and immersive frontend
**Researched:** 2026-06-30
**Confidence:** HIGH

## Executive Summary

This project is best treated as a full-stack content product, not a static blog. The confirmed v1 includes a browser-based single-admin backend, Markdown editor with live preview, article publishing workflow, search, series, archive, and a visually memorable public frontend. A Next.js App Router application with PostgreSQL, Prisma, Auth.js, and a controlled Markdown rendering pipeline fits that shape cleanly.

The main product tension is visual impact versus reading utility. The site should have a strong technical-lab identity and immersive first impression, but article pages must remain stable, readable, responsive, and accessible. The roadmap should establish the visual system early, then build backend/auth/content foundations, then wire the full content library and public reading experience.

The highest-risk areas are admin authorization boundaries, Markdown sanitization, draft leakage through search/archive/related-post paths, cache revalidation after publishing, and heavy animation/WebGL performance. These should be explicit phase success criteria, not late polish.

## Key Findings

### Recommended Stack

Use a single Next.js full-stack app with App Router, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, and Auth.js. This keeps public pages, admin backend, auth, server mutations, metadata, image handling, and cache revalidation in one architecture.

Use @uiw/react-md-editor for admin writing, but do not use the editor preview as the public renderer. Public articles should use a controlled Markdown pipeline with react-markdown/remark/rehype and Shiki for code highlighting. Use Fuse.js for v1 search unless content volume demands a server-side search backend.

**Core technologies:**
- Next.js: app framework - public site, admin routes, server actions/API routes, caching, metadata.
- PostgreSQL + Prisma: content/auth data store - posts, tags, categories, series, related content.
- Auth.js: single-admin authentication - protect admin routes and mutations.
- Tailwind CSS + Motion + optional Three.js: technical-lab visual system - glow, grid, particles, and progressive motion.
- react-markdown + Shiki: article rendering - Markdown, code highlighting, TOC, heading anchors.

### Expected Features

**Must have (table stakes):**
- Homepage with personal technical profile.
- Public article list/detail pages.
- Markdown rendering with code highlighting.
- Table of contents for long posts.
- Tags, categories, series, archive, search, and related articles.
- Single-admin login.
- Admin article CRUD with Markdown editor and live preview.
- Draft/published workflow.
- SEO metadata and responsive reading layout.

**Should have (competitive):**
- Immersive technical-lab hero/background.
- Glow/streaming-light visual language.
- Article progress and sticky TOC.
- Code-block enhancements such as copy buttons and filename labels.
- Command/search palette after base search is stable.
- Reduced-motion or reading-mode behavior.

**Defer (v2+):**
- Public comments and reactions.
- Multi-author CMS roles.
- MDX interactive demos.
- External content sync.
- Dedicated search engine.

### Architecture Approach

Use a layered Next.js architecture: public routes, admin routes, server layer/actions, Prisma data layer, Markdown rendering utilities, search index utilities, and isolated visual-effect components. Public pages should be server-rendered by default; only search, copy buttons, progress, and visual effects should hydrate on the client.

**Major components:**
1. Public shell - homepage, article routes, taxonomy routes, series, archive, search.
2. Admin shell - login, dashboard, editor, taxonomy/content management.
3. Content data layer - Prisma models and typed post/tag/category/series queries.
4. Markdown pipeline - safe public renderer, TOC generation, code highlighting, excerpts.
5. Visual layer - CSS/Motion/optional Three.js effects isolated from reading surfaces.
6. Auth/mutation layer - server-side admin checks, validation, writes, and cache revalidation.

### Critical Pitfalls

1. **Visual effects overpower reading** - define visual intensity levels and verify article readability on mobile and reduced-motion.
2. **Admin UI hidden but mutations unprotected** - require admin checks inside every server mutation.
3. **Markdown XSS and unsafe HTML** - disallow raw HTML or sanitize strictly; test malicious Markdown fixtures.
4. **Slug/status/cache bugs** - enforce unique slugs, centralize public-post queries, and revalidate affected paths.
5. **Draft leakage through search/related/archive** - reuse a single public-content query boundary for every public index.
6. **Heavy WebGL or animations hurt mobile performance** - lazy-load, cap, pause, and provide fallbacks.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Visual Foundation and Public Shell
**Rationale:** The user's v1 priority is visual impact, and the project needs a stable design system before content/admin screens multiply.
**Delivers:** App scaffold, visual tokens, homepage profile, immersive background prototype, responsive shell, article layout skeleton.
**Addresses:** Technical-lab identity, homepage focus, performance/reduced-motion baseline.
**Avoids:** Visual effects overpowering reading, mobile/WebGL performance problems.

### Phase 2: Data Model, Auth, and Admin Foundation
**Rationale:** Browser-based publishing requires a protected backend before real content workflows.
**Delivers:** Prisma schema, Postgres setup, single-admin auth, protected admin layout, post/tag/category/series models.
**Uses:** Prisma, PostgreSQL, Auth.js, zod.
**Implements:** Data/auth boundaries and mutation protection.

### Phase 3: Markdown Authoring and Publishing Workflow
**Rationale:** The core writer loop is create/edit/preview/publish technical notes.
**Delivers:** Admin article CRUD, Markdown editor with live preview, draft/published flow, slug validation, cover/tags/category/series assignment, cache revalidation.
**Uses:** @uiw/react-md-editor, server actions/API routes, Prisma.
**Implements:** Authoring backend and publishing lifecycle.

### Phase 4: Public Content Library
**Rationale:** The confirmed v1 content system includes reading, search, series, archive, and related articles.
**Delivers:** Article detail renderer, code highlighting, TOC, reading time, tags/categories, series, archive, search, related articles, SEO metadata.
**Uses:** react-markdown, remark-gfm, rehype-slug/sanitize, Shiki, Fuse.js.
**Implements:** Full reader-facing blog experience.

### Phase 5: Interaction Polish, Performance, and Verification
**Rationale:** The product promise depends on visual polish that does not damage usability.
**Delivers:** Refined animations, optional command palette, code block enhancements, accessibility, reduced-motion, mobile polish, Playwright visual checks.
**Uses:** Motion, optional Three.js/R3F, Playwright.
**Implements:** Final interaction quality and release readiness.

### Phase Ordering Rationale

- Visual foundation comes first because it is the user's differentiator and should constrain later UI rather than be pasted on.
- Data/auth foundation precedes editor/publishing because admin mutations need secure storage and authorization.
- Authoring precedes public content library because public pages need real published content and stable metadata.
- Public content library precedes polish because search, archive, and series expose filtering/leakage risks that must be solved before final visual polish.
- Verification is final but not isolated: each earlier phase should include its own tests for the risks it introduces.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Need concrete visual implementation choice: CSS/Canvas versus Three.js based on desired background.
- **Phase 2:** Need deployment/provider decision for Postgres and image storage.
- **Phase 3:** Need exact Markdown editor integration and preview/public-render parity strategy.
- **Phase 4:** Need final Markdown sanitization and code highlighting pipeline design.

Phases with standard patterns:
- **Phase 2 auth/data foundation:** Established Next.js/Auth.js/Prisma patterns, but must be implemented carefully.
- **Phase 4 taxonomy/archive/search:** Standard blog patterns with clear draft-filtering requirements.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions checked via npm registry; architecture aligns with official Next.js, Prisma, Auth.js, Tailwind, Markdown, and animation docs. |
| Features | HIGH | Based directly on confirmed project choices and common expectations for technical blogs/CMS-backed sites. |
| Architecture | HIGH | Standard full-stack Next.js pattern with explicit public/admin/data boundaries. |
| Pitfalls | HIGH | Risks are specific to the selected scope: admin auth, Markdown, draft filtering, cache invalidation, and visual performance. |

**Overall confidence:** HIGH

### Gaps to Address

- **Deployment provider:** Decide between Vercel/managed Postgres, VPS, or another host before final database/image implementation.
- **Visual effect type:** Decide whether the immersive background needs Three.js or can be built with CSS/Canvas/Motion.
- **Image storage:** Decide whether cover uploads are local, object storage, or URL-only for v1.
- **Auth method:** Decide credentials login versus OAuth provider allowlist.
- **Search ceiling:** Fuse.js is appropriate for v1; revisit if article volume grows substantially.

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs - App Router, rendering, routing, metadata, caching, and image guidance.
- https://nextjs.org/docs/app/guides/authentication - Next.js authentication and authorization guidance.
- https://tailwindcss.com/docs/installation/framework-guides/nextjs - Tailwind CSS with Next.js.
- https://www.prisma.io/docs/orm - Prisma ORM docs.
- https://authjs.dev/getting-started/adapters/prisma - Auth.js Prisma adapter.
- https://uiwjs.github.io/react-md-editor/ - Markdown editor docs.
- https://github.com/remarkjs/react-markdown - Markdown rendering package.
- https://shiki.style/ - Code highlighting docs.
- https://www.fusejs.io/ - Fuse.js docs.
- https://motion.dev/docs/react - Motion docs.
- https://threejs.org/docs/ and https://r3f.docs.pmnd.rs/ - Three.js and React Three Fiber docs.
- npm registry checked with `npm view <package> version` on 2026-06-30 for current package versions.

### Secondary (MEDIUM confidence)
- Common developer-blog and CMS product conventions inferred from the confirmed project scope.

### Tertiary (LOW confidence)
- None used for core recommendations.

---
*Research completed: 2026-06-30*
*Ready for roadmap: yes*

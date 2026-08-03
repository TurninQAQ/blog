# Walking Skeleton — Personal Tech Lab Blog

**Phase:** 1
**Generated:** 2026-06-30

## Capability Proven End-to-End

A local visitor can run the Next.js app, open an isolated `/__skeleton` probe page, trigger a browser UI action, and see that action round-trip through a Next.js API route with a small local read/write proof.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16 App Router with TypeScript | Matches the selected full-stack app direction and leaves public pages server-rendered by default while allowing isolated client components for menus and effects. |
| Styling | Tailwind CSS v4 with CSS-first `@theme` tokens | Keeps the technical-lab visual system centralized in `src/app/globals.css` and reusable across later public/admin slices. |
| Visual effects | CSS static base plus homepage-only 2D Canvas plus Motion | Implements the Phase 1 locked decision to avoid Three.js/R3F while still supporting an immersive signal-network background. |
| Data layer | No Postgres/Prisma schema in Phase 1; isolated local skeleton probe only | Strict database setup belongs to Phase 2 and would pull content/auth schema decisions into the visual shell phase. The probe proves API/data wiring without article models, auth, CMS workflow, or migrations. |
| Auth | None in Phase 1 | Admin authentication starts in Phase 2; Phase 1 must not expose admin routes or protected mutations. |
| Deployment target | Local full-stack run command: `npm run dev` plus Playwright browser checks | The phase can prove the stack locally without choosing a hosted database or deployment provider before Phase 2. |
| Directory layout | `src/app` App Router, `src/components/public`, `src/components/visual`, `src/config`, `src/tests/e2e` | Separates server-rendered public shell, client-only visual effects, shared copy/route config, and browser verification. |

## Stack Touched in Phase 1

- [ ] Project scaffold (framework, build, lint, test runner)
- [ ] Routing — homepage, public route surfaces, and isolated skeleton probe route
- [ ] Data read/write — isolated local skeleton probe only; no database schema or migration in this phase
- [ ] UI — public shell, homepage, route surfaces, mobile navigation, and visual effect foundation
- [ ] Deployment — documented local full-stack run command through `npm run dev` and Playwright web server

## Phase 1 Schema Tradeoff

Phase 1 deliberately does not introduce `prisma/schema.prisma`, migrations, ORM client setup, article models, auth models, or admin tables. That keeps the visual foundation aligned with the roadmap boundary. The walking-skeleton proof is an isolated probe capability that exercises UI to API to local persisted runtime data; the durable Postgres/Prisma model begins in Phase 2.

No schema push is required in Phase 1 because no schema-relevant files are introduced.

## Out of Scope (Deferred to Later Slices)

- Real article ingestion, published article data, Markdown rendering, or article detail pages.
- Admin authentication, admin layout, protected mutations, sessions, or single-admin credential setup.
- Postgres/Prisma schema, migrations, seed data, or CMS storage.
- Markdown editor, live preview workflow, taxonomy assignment, series ordering, draft/publish controls.
- Comments, reactions, multi-author roles, MDX demos, external sync, or a dedicated search engine.
- Three.js, React Three Fiber, Drei, WebGL hero layers, shadcn blocks, or third-party UI registries.

## Subsequent Slice Plan

Each later phase adds a vertical slice on top of this skeleton without renegotiating the Phase 1 architecture:

- Phase 2: Durable content/auth data model and protected single-admin access boundary.
- Phase 3: Authenticated Markdown authoring workflow with live preview and taxonomy fields.
- Phase 4: Published public content library with article rendering, search, series, archive, and metadata.
- Phase 5: Release-grade interaction polish, performance checks, and end-to-end verification.

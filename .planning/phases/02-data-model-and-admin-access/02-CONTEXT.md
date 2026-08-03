# Phase 2: Data Model and Admin Access - Context

**Gathered:** 2026-07-02T16:55:13+08:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the durable backend foundation for the blog: PostgreSQL/Prisma content and auth models, single-admin email/password authentication, protected admin entry, and reusable server-side authorization boundaries for future CMS mutations.

This phase does not deliver the full Markdown editor, article CRUD UI, public article rendering, search, comments, multi-author roles, or MDX demos. It should leave Phase 3 able to build the writing workflow on top of real models and guards instead of placeholders.

</domain>

<decisions>
## Implementation Decisions

### Single-Admin Login Method
- **D-01:** Use email + password login for v1. Do not use OAuth, Magic Link, or provider-specific account IDs in Phase 2.
- **D-02:** The administrator login identifier is an email address.
- **D-03:** Local development should use `.env.local` secrets, including `ADMIN_EMAIL` and a password hash. Secrets must not be committed.
- **D-04:** Do not implement a public password reset or recovery flow in v1. The single administrator can manually rotate the password hash or relevant secret.

### Admin Identity and Session Boundary
- **D-05:** Use an env allowlist plus a database user record. `ADMIN_EMAIL` defines the only valid administrator; the database stores the user and session records needed by Auth.js.
- **D-06:** Do not expose any registration, invite, or hidden signup entrypoint in v1.
- **D-07:** Use database-backed sessions with `httpOnly` cookies so admin routes and server mutations can be verified on the server.
- **D-08:** Admin sessions should last 30 days.
- **D-17:** Preserve the database-backed session decision by implementing a custom Prisma-backed admin session DAL for email/password login. Do not relax Phase 2 to stock NextAuth Credentials with JWT sessions.

### Database and Content Model Boundary
- **D-09:** Target generic PostgreSQL through `DATABASE_URL`. Do not bind Phase 2 to Neon, Supabase, or SQLite.
- **D-10:** Create the complete v1 Prisma content-model skeleton in Phase 2: Post, Tag, Category, Series, publication status, slugs, timestamps, and necessary join tables.
- **D-11:** A Post may have one Category and many Tags. Category is the primary section; tags are cross-cutting indexes.
- **D-12:** Series is an independent model. A Post may optionally belong to one Series and carry a `seriesOrder` value.

### Admin Protection and Mutation Test Boundary
- **D-13:** Unauthenticated access to `/admin` should redirect on the server to `/admin/login`; the protected admin shell should not flash client-side before auth checks complete.
- **D-14:** Centralize authorization in shared server utilities such as `getAdminSession()` and `requireAdmin()` so pages, server actions, and API routes reuse the same guard.
- **D-15:** Phase 2 must implement protected mutation boundaries or test stubs for create, edit, delete, publish, and unpublish even though the CRUD UI arrives later.
- **D-16:** Tests should cover both admin page protection and unauthenticated mutation rejection for create, edit, delete, publish, and unpublish boundaries.

### The Agent's Discretion
- Choose the exact password hashing package/algorithm and bootstrap script shape during planning, as long as secrets remain outside git and the implementation supports env-provided password hashes.
- Choose exact Prisma field names and indexes where not specified here, while preserving the model relationships and single-admin boundary above.
- Choose whether mutation guard coverage is implemented as server action tests, route-handler tests, or shared service tests, as long as direct unauthenticated backend calls are rejected.
- Keep admin UI styling consistent with the existing technical-lab visual language without expanding Phase 2 into the full CMS editor.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Requirements
- `.planning/PROJECT.md` — Defines the personal technical blog, browser-based single-admin backend, Markdown-first writing workflow, and v1/v2 scope boundaries.
- `.planning/REQUIREMENTS.md` — Defines AUTH-01 through AUTH-04 plus later CMS/content requirements that Phase 2 must prepare for.
- `.planning/ROADMAP.md` — Defines Phase 2 goal, success criteria, and planned plan split.
- `.planning/STATE.md` — Current project state and carry-forward decisions from Phase 1.

### Prior Phase Context
- `.planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md` — Public-shell decisions and integration boundaries; Phase 2 should not regress the public visual shell.

### Research and Architecture
- `.planning/research/STACK.md` — Recommends Next.js App Router, PostgreSQL, Prisma, Auth.js/NextAuth, and typed validation for the CMS foundation.
- `.planning/research/ARCHITECTURE.md` — Recommends admin auth as Auth.js session checks plus single-admin allowlist, content data layer via Prisma, and auth-checked server mutations.
- `.planning/research/PITFALLS.md` — Warns that hidden admin UI is not enough; every mutation must verify admin authorization.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/config/site.ts` and `src/config/routes.ts`: Existing public copy and route configuration. Keep admin navigation separate unless explicitly adding a login entrypoint.
- `src/app/layout.tsx` and `src/app/(public)/layout.tsx`: Root/public layout split is already established; Phase 2 should add `src/app/admin/...` without disturbing the public route group.
- `src/components/public/*`: Public shell, header, footer, route strip, hero, and placeholders are already implemented and should remain public-only.
- `src/tests/e2e/*.spec.ts`: Existing Playwright pattern covers public shell and visual checks; Phase 2 can add auth/admin protection tests alongside this style.

### Established Patterns
- Next.js App Router is the application structure. Public pages live in the `(public)` route group.
- Homepage visual effects are isolated and client-loaded; admin/auth work should not import public visual effect code into backend routes or auth utilities.
- Current dependencies do not include Prisma, Auth.js, zod, or password hashing packages yet; Phase 2 plans must add them intentionally.
- The existing `/__skeleton` and `/api/skeleton-probe` are diagnostic scaffolding, not durable storage or auth patterns.

### Integration Points
- Add `prisma/schema.prisma` and migration/seed/bootstrap support for Postgres-backed auth and content models.
- Add `src/lib/db/*` for Prisma client access and `src/lib/auth/*` for custom admin session helpers, password verification, cookies, and admin guards.
- Add login/logout route handlers or server actions for the custom Prisma-backed admin session flow; do not plan a stock NextAuth Credentials + JWT implementation.
- Add `src/app/admin/login` for unauthenticated admin login and protected `src/app/admin` layout/page routes behind server-side checks.
- Add guarded mutation surfaces or test stubs for create/edit/delete/publish/unpublish so Phase 3 can attach real CMS actions.

</code_context>

<specifics>
## Specific Ideas

- Prefer a lean personal-CMS foundation over a generalized multi-user CMS.
- Prefer generic Postgres compatibility through `DATABASE_URL`; deployment-provider adapters can be introduced later only if needed.
- Keep `/admin` protected server-side and keep mutation authorization independent of route visibility.

</specifics>

<deferred>
## Deferred Ideas

- OAuth provider login and email Magic Link are not v1 defaults; revisit only if password login becomes a maintenance burden.
- Public password reset and email recovery flows are deferred beyond Phase 2.
- Registration, invitation flows, multi-author roles, and permissions remain out of v1.
- Provider-specific database optimization for Neon/Supabase is deferred until deployment choices require it.

</deferred>

---

*Phase: 2-Data Model and Admin Access*
*Context gathered: 2026-07-02T16:55:13+08:00*

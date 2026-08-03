# Phase 02: Data Model and Admin Access - Research

**Researched:** 2026-07-02  
**Domain:** Next.js App Router admin authentication, Prisma 7/PostgreSQL schema design, single-admin authorization guards, and unauthorized mutation tests  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

The following constraints are copied from `.planning/phases/02-data-model-and-admin-access/02-CONTEXT.md`. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
- OAuth provider login and email Magic Link are not v1 defaults; revisit only if password login becomes a maintenance burden.
- Public password reset and email recovery flows are deferred beyond Phase 2.
- Registration, invitation flows, multi-author roles, and permissions remain out of v1.
- Provider-specific database optimization for Neon/Supabase is deferred until deployment choices require it.
</user_constraints>

## Project Constraints (from AGENTS.md)

- The app is a personal programmer-focused technical lab blog with a real v1 backend/admin workflow, not a static-only blog. [CITED: AGENTS.md]
- v1 optimizes for one owner/writer and public technical-note readers; do not introduce multi-user roles. [CITED: AGENTS.md]
- Markdown remains the default content format for later writing flows, but this phase is only the data/auth foundation. [CITED: AGENTS.md][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
- One protected administrator account is enough for v1. [CITED: AGENTS.md]
- Public visual effects must remain responsive and degraded gracefully; admin work must not regress the public shell. [CITED: AGENTS.md][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
- Repo edits should happen through GSD workflow artifacts unless the user explicitly bypasses that workflow. [CITED: AGENTS.md]
- No project-local skills were found under `.codex/skills/` or `.agents/skills/`. [VERIFIED: codebase grep]

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | Administrator can log in to a protected admin area. | Requires an auth-decision checkpoint because stock NextAuth v4 Credentials does not support database sessions; once resolved, the planner should build a server-rendered `/admin/login`, validate `ADMIN_EMAIL`, verify the env password hash, and create a session boundary. [CITED: .planning/REQUIREMENTS.md][CITED: https://next-auth.js.org/errors][CITED: https://authjs.dev/getting-started/authentication/credentials] |
| AUTH-02 | Unauthenticated visitors cannot access admin pages. | Use a server-side admin layout/page guard that redirects `/admin` to `/admin/login` before rendering protected shell content. [CITED: .planning/REQUIREMENTS.md][CITED: https://nextjs.org/docs/app/guides/authentication][CITED: https://next-auth.js.org/configuration/nextjs] |
| AUTH-03 | Unauthenticated visitors cannot create, edit, delete, publish, or unpublish articles by calling backend mutations directly. | Put `requireAdmin()` inside every mutation stub/route handler/action and test direct unauthenticated POST calls; Next.js docs explicitly warn Server Functions are direct POST entry points. [CITED: .planning/REQUIREMENTS.md][CITED: https://nextjs.org/docs/app/getting-started/mutating-data][CITED: https://nextjs.org/docs/app/guides/data-security] |
| AUTH-04 | The system supports a single-admin model for v1 without multi-author roles. | Use `ADMIN_EMAIL` as the allowlist, one DB admin user record, no registration/invite/reset routes, and no roles table in v1. [CITED: .planning/REQUIREMENTS.md][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md] |
</phase_requirements>

## Summary

The phase can safely plan Prisma 7/PostgreSQL content models, a Prisma client boundary, server-side admin guards, and Playwright-based unauthorized mutation tests. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][CITED: https://nextjs.org/docs/app/guides/data-security][VERIFIED: codebase grep]

The main planning risk is a hard compatibility conflict in the locked auth requirements: the phase asks for email/password Credentials plus database-backed sessions, but official NextAuth v4 docs say Credentials requires JWT sessions and does not persist credentials users or sessions through the database adapter. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://next-auth.js.org/providers/credentials][CITED: https://next-auth.js.org/errors]

**Primary recommendation:** Add a human decision checkpoint before Plan 02-02; do not plan stock NextAuth v4 Credentials as satisfying database-backed sessions. Preserve D-07 by approving a custom Prisma-backed admin session DAL or change one locked decision before implementation. [CITED: https://next-auth.js.org/errors][CITED: https://nextjs.org/docs/app/guides/data-security]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| PostgreSQL content/auth schema | Database / Storage | API / Backend | Posts, tags, categories, series, publication status, and session/user records are durable relational state managed through Prisma migrations. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://www.prisma.io/docs/orm] |
| Prisma client singleton | API / Backend | Database / Storage | Prisma 7 Client is server-side database access and must be instantiated with the PostgreSQL driver adapter. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction] |
| Admin login credential verification | API / Backend | Frontend Server | The login form can render in `/admin/login`, but email allowlist and password hash verification must run server-side. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://authjs.dev/getting-started/authentication/credentials] |
| Admin page protection | Frontend Server (SSR) | API / Backend | `/admin` should redirect server-side before protected content renders, while the shared server guard owns the actual authorization check. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://nextjs.org/docs/app/guides/authentication] |
| Backend mutation authorization | API / Backend | Database / Storage | Create/edit/delete/publish/unpublish boundaries are server entry points and must call `requireAdmin()` before validation or writes. [CITED: https://nextjs.org/docs/app/getting-started/mutating-data][CITED: https://nextjs.org/docs/app/guides/data-security] |
| Admin visual styling | Frontend Server / Browser | Public design tokens | Login/admin shell styling should reuse the technical-lab language without pulling public visual effects into backend/auth utilities. [CITED: AGENTS.md][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.2.9 installed; npm latest 16.2.10 modified 2026-07-02 | App Router routes, layouts, route handlers, redirects, and server functions. | Existing repo dependency; current Next.js docs cover authentication, route handlers, server mutations, and data security patterns used in this phase. [VERIFIED: package.json][VERIFIED: npm registry][CITED: https://nextjs.org/docs/app/guides/authentication] |
| `react` / `react-dom` | 19.2.7 installed | UI runtime for admin login/page components. | Existing repo dependency required by the Next.js app. [VERIFIED: package.json][VERIFIED: npm registry] |
| `prisma` | 7.8.0 | Prisma CLI, schema, migrations, and generation. | Prisma 7 official docs require a Prisma config, generated client output, and migrations for schema-managed DB access. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][VERIFIED: package-legitimacy] |
| `@prisma/client` | 7.8.0 | Generated Prisma Client runtime package. | Official Prisma 7 docs require importing the generated client and using it with a driver adapter. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][VERIFIED: package-legitimacy] |
| `@prisma/adapter-pg` | 7.8.0 | PostgreSQL driver adapter for Prisma 7. | Prisma 7 requires a driver adapter for direct PostgreSQL connections. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][VERIFIED: package-legitimacy] |
| `pg` [WARNING: flagged as suspicious - verify before using.] | 8.22.0 | PostgreSQL JavaScript driver used by `@prisma/adapter-pg`. | Prisma 7 docs list `pg` for PostgreSQL, but the legitimacy seam flagged the current package version as too-new. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][VERIFIED: package-legitimacy] |
| `next-auth` | 4.24.14 | Auth.js/NextAuth route handler and session helper if auth decision changes allow it. | The project stack selected NextAuth v4, and v4 supports App Router route handler initialization; caveat: stock Credentials cannot satisfy database-session D-07. [CITED: .planning/research/STACK.md][CITED: https://next-auth.js.org/configuration/initialization][CITED: https://next-auth.js.org/errors][VERIFIED: package-legitimacy] |
| `@auth/prisma-adapter` | 2.11.2 | Auth.js Prisma adapter schema and DB session/user/account models if Auth.js remains in scope. | Official Auth.js Prisma adapter docs define the required models and install package. [CITED: https://authjs.dev/getting-started/adapters/prisma][VERIFIED: package-legitimacy] |
| `zod` | 4.4.3 | Runtime validation for credentials, env, slugs, status, and mutation inputs. | Zod official docs define it as TypeScript-first runtime schema validation, and project stack already selected it for admin validation. [CITED: https://zod.dev/][CITED: .planning/research/STACK.md][VERIFIED: package-legitimacy] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@node-rs/argon2` [ASSUMED][VERIFIED: package-legitimacy] | 2.0.2 | Password hash and verify package for env-provided admin password hashes. | Use if the planner accepts the discretionary Argon2 package choice; Auth.js docs require custom password logic but do not prescribe this exact package. [CITED: https://authjs.dev/getting-started/authentication/credentials][VERIFIED: package-legitimacy] |
| `tsx` | 4.22.4 | Run TypeScript bootstrap/hash/seed scripts. | Use for local scripts such as generating an admin password hash or seeding a single admin record. [CITED: https://www.prisma.io/docs/guides/frameworks/nextjs][VERIFIED: package-legitimacy] |
| `@types/pg` | 8.20.0 | TypeScript types for `pg`. | Use with Prisma 7 generic PostgreSQL driver setup. [CITED: https://www.prisma.io/docs/guides/frameworks/nextjs][VERIFIED: package-legitimacy] |
| `@playwright/test` | 1.61.1 installed | Admin page and unauthenticated API/route-handler tests. | Existing repo test runner already covers browser and API route patterns; no new unit runner is required for Phase 2. [VERIFIED: package.json][CITED: https://playwright.dev/docs/api/class-apirequestcontext] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| NextAuth v4 Credentials + database sessions | NextAuth v4 Credentials + JWT sessions | Officially supported for Credentials, but violates D-07 database-backed session requirement. [CITED: https://next-auth.js.org/errors][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md] |
| NextAuth v4 Credentials + database sessions | Auth.js database sessions with OAuth or Email provider | Official adapter/session path, but violates D-01 and D-04 because OAuth/Magic Link/reset flows are out of scope. [CITED: https://authjs.dev/concepts/session-strategies][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md] |
| NextAuth v4 Credentials + database sessions | Custom Prisma-backed admin session DAL | Satisfies D-01 and D-07, but changes the Auth.js-specific part of D-05 and must be approved before planning. [CITED: https://nextjs.org/docs/app/guides/data-security][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md] |
| Adding Vitest now | Use existing Playwright test runner | Playwright is already configured and can test route handlers/API requests; Vitest would add another package and was flagged too-new in legitimacy checks. [VERIFIED: package.json][CITED: https://playwright.dev/docs/test-fixtures][VERIFIED: package-legitimacy] |

**Installation:**

```bash
# Data model and generic PostgreSQL access
npm install @prisma/client@7.8.0 @prisma/adapter-pg@7.8.0 pg@8.22.0 zod@4.4.3
npm install -D prisma@7.8.0 @types/pg@8.20.0 tsx@4.22.4

# Only after resolving the Credentials/database-session decision gate
npm install next-auth@4.24.14 @auth/prisma-adapter@2.11.2 @node-rs/argon2@2.0.2
```

**Version verification:** New package versions were checked with `npm view <package> version time.created time.modified repository.url scripts.postinstall` on 2026-07-02. [VERIFIED: npm registry]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `prisma` | npm | created 2016-06-03; modified 2026-06-08 | 13.1M/wk | github.com/prisma/prisma | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `@prisma/client` | npm | created 2020-01-15; modified 2026-06-08 | 11.8M/wk | github.com/prisma/prisma | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `@prisma/adapter-pg` | npm | created 2023-09-20; modified 2026-06-08 | 3.3M/wk | github.com/prisma/prisma | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `pg` | npm | created 2010-12-19; modified 2026-06-29 | 33.6M/wk | github.com/brianc/node-postgres | SUS: too-new | Flagged - planner must add `checkpoint:human-verify` before install. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `@types/pg` | npm | created 2016-05-17; modified 2026-03-20 | 40.0M/wk | github.com/DefinitelyTyped/DefinitelyTyped | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `next-auth` | npm | created 2018-01-22; modified 2026-04-14 | 4.1M/wk | github.com/nextauthjs/next-auth | OK | Approved after auth decision gate. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `@auth/prisma-adapter` | npm | created 2023-06-01; modified 2026-04-14 | 647.8k/wk | github.com/nextauthjs/next-auth | OK | Approved after auth decision gate. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `zod` | npm | created 2020-03-07; modified 2026-05-04 | 209.7M/wk | github.com/colinhacks/zod | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `@node-rs/argon2` | npm | created 2021-12-29; modified 2025-05-04 | 623.2k/wk | github.com/napi-rs/node-rs | OK | Approved package, but exact package choice remains [ASSUMED] until accepted by planner/user. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |
| `tsx` | npm | created 2015-08-20; modified 2026-05-31 | 56.9M/wk | github.com/privatenumber/tsx | OK | Approved. [VERIFIED: package-legitimacy][VERIFIED: npm registry] |

**Packages removed due to [SLOP] verdict:** none. [VERIFIED: package-legitimacy]  
**Packages flagged as suspicious [SUS]:** `pg` because the current release is too-new; no suspicious postinstall script was returned by npm metadata. [VERIFIED: package-legitimacy][VERIFIED: npm registry]

*Packages discovered through discretionary recommendation rather than official auth documentation are tagged `[ASSUMED]`; the planner should confirm them before locking the install decision. [ASSUMED]*

## Architecture Patterns

### System Architecture Diagram

```text
+-------------------------------+
| Browser: /admin/login form    |
+---------------+---------------+
                |
                v
+-------------------------------+
| Server login boundary          |
| - validate email/password      |
| - enforce ADMIN_EMAIL          |
| - verify password hash         |
+---------------+---------------+
                |
      decision: auth stack resolved?
          | yes, DB session path
          v
+-------------------------------+       +------------------------------+
| Prisma-backed session/user DB  +------>| httpOnly session cookie      |
| User + Session or AdminSession |       | 30 day maxAge                |
+---------------+---------------+       +--------------+---------------+
                |                                      |
                v                                      v
+-------------------------------+       +------------------------------+
| /admin server layout/page      |<------| getAdminSession()/require... |
| redirect unauthenticated user  |       | central allowlist guard      |
+---------------+---------------+       +--------------+---------------+
                |                                      |
                v                                      v
+-------------------------------+       +------------------------------+
| Protected admin shell          |       | Mutation boundaries/stubs    |
| Phase 3 attaches CMS UI        |       | create/edit/delete/publish   |
+-------------------------------+       | unpublish reject unauth POST |
                                        +--------------+---------------+
                                                       |
                                                       v
                                        +------------------------------+
                                        | Prisma Post/Tag/Category/    |
                                        | Series/PublicationStatus DB  |
                                        +------------------------------+
```

### Recommended Project Structure

```text
prisma/
|-- schema.prisma                 # Prisma 7 schema: Auth.js/custom session plus content models
`-- migrations/                   # Generated by prisma migrate dev
prisma.config.ts                  # Prisma 7 datasource/migration config
scripts/
|-- generate-admin-password-hash.ts # Emits hash for .env.local, no plaintext stored
`-- bootstrap-admin.ts            # Optional one-admin DB record bootstrap
src/
|-- app/
|   |-- admin/
|   |   |-- layout.tsx            # Server-side admin protection
|   |   |-- login/page.tsx        # Login form only
|   |   `-- page.tsx              # Protected admin landing shell
|   `-- api/
|       |-- auth/[...nextauth]/route.ts # Only if Auth.js decision remains valid
|       `-- admin/posts/.../route.ts    # Mutation boundary stubs or API mutations
|-- generated/prisma/             # Prisma 7 generated client output
|-- lib/
|   |-- db/prisma.ts              # Prisma singleton with PrismaPg adapter
|   |-- auth/
|   |   |-- config.ts             # Auth options or custom session config
|   |   |-- admin.ts              # getAdminSession(), requireAdmin()
|   |   `-- password.ts           # hash/verify wrapper
|   `-- admin/post-mutations.ts   # create/edit/delete/publish/unpublish guarded stubs
`-- tests/e2e/
    |-- admin-auth.spec.ts        # /admin redirect/login smoke
    `-- admin-mutations.spec.ts   # unauthenticated direct mutation rejection
```

This structure extends the existing App Router `src/app/(public)` separation with an `src/app/admin` surface and keeps public visual components out of backend auth utilities. [VERIFIED: codebase grep][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]

### Pattern 1: Prisma 7 Generated Client With PostgreSQL Adapter

**What:** Use `prisma.config.ts`, `generator client { provider = "prisma-client"; output = "../src/generated/prisma" }`, and instantiate `PrismaClient` with `PrismaPg`. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]  
**When to use:** All Phase 2 database access. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Example:**

```typescript
// Source: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

### Pattern 2: Auth Decision Gate Before Login Implementation

**What:** Put a required checkpoint before Plan 02-02 because NextAuth v4 Credentials plus Prisma adapter does not satisfy database sessions. [CITED: https://next-auth.js.org/errors]  
**When to use:** Before writing Auth.js config, login route handlers, or session schema migrations. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Example planning rule:**

```text
checkpoint:human-verify
Question: D-01 email/password and D-07 database sessions conflict with stock NextAuth v4 Credentials.
Default recommendation: preserve D-07 and approve a custom Prisma-backed admin session DAL, or explicitly relax D-07 to JWT sessions.
```

### Pattern 3: Central Server Guard For Pages And Mutations

**What:** All protected surfaces call one `getAdminSession()` / `requireAdmin()` boundary, and page redirects are separate from mutation rejection. [CITED: https://nextjs.org/docs/app/guides/data-security]  
**When to use:** Admin layout, route handlers, server actions, and service functions. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Example:**

```typescript
// Source: https://nextjs.org/docs/app/guides/data-security
import "server-only";

import { redirect } from "next/navigation";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export async function getAdminSession() {
  const session = await readSessionFromResolvedAuthStack();
  if (session?.user?.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}
```

### Pattern 4: Route-Handler Mutation Stubs For Unauthorized Tests

**What:** Keep Phase 2 mutation endpoints/stubs thin, call `requireAdmin()` first, and return 401 for unauthenticated direct calls. [CITED: https://nextjs.org/docs/app/getting-started/route-handlers][CITED: https://nextjs.org/docs/app/getting-started/mutating-data]  
**When to use:** Create/edit/delete/publish/unpublish boundaries before the Phase 3 CRUD UI exists. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Example:**

```typescript
// Source: https://nextjs.org/docs/app/getting-started/route-handlers
import { NextResponse } from "next/server";

import { requireAdmin, UnauthorizedError } from "@/lib/auth/admin";

export async function POST() {
  try {
    await requireAdmin();
    return NextResponse.json({ status: "stubbed" });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    throw error;
  }
}
```

### Anti-Patterns to Avoid

- **Planning stock Credentials + DB sessions as working:** NextAuth v4 official docs reject that combination; plan a decision gate instead. [CITED: https://next-auth.js.org/errors]
- **Using old Prisma 6 client patterns:** Prisma 7 requires generated output, ESM support, and a driver adapter for PostgreSQL. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7]
- **Protecting only `/admin` UI:** Next.js docs say page-level checks do not protect Server Actions or direct mutation calls. [CITED: https://nextjs.org/docs/app/guides/data-security]
- **Adding roles for a single admin:** v1 explicitly excludes multi-author roles and permissions. [CITED: .planning/REQUIREMENTS.md][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
- **Committing local secrets:** `.env*` files are gitignored and D-03 says `.env.local` secrets must not be committed. [CITED: .gitignore][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema migrations and typed queries | Raw SQL files plus handwritten query wrappers | Prisma 7 schema, Migrate, and generated client | Prisma provides a single schema, migrations, and type-safe query API. [CITED: https://www.prisma.io/docs/orm] |
| Password hashing | Plain SHA, reversible encryption, or custom KDF string parsing | `@node-rs/argon2` after checkpoint, or another approved password hash package | Auth.js docs require password logic but warn it is extra security work; use a proven hash/verify package rather than custom crypto. [CITED: https://authjs.dev/getting-started/authentication/credentials][ASSUMED] |
| Admin authorization | Per-route email checks copied across files | Shared `getAdminSession()` and `requireAdmin()` server module | Centralized DAL-style authorization is the Next.js recommended pattern. [CITED: https://nextjs.org/docs/app/guides/data-security] |
| Input validation | Ad hoc `if` chains at every route | Zod schemas for env, credentials, slugs, status, and mutation inputs | Zod validates untrusted data and returns typed parsed output. [CITED: https://zod.dev/] |
| Session strategy workaround | Customizing NextAuth internals to force DB sessions for Credentials | Explicit decision: custom Prisma session DAL or relax D-07 to JWT | Official NextAuth v4 docs say Credentials must use JWT sessions. [CITED: https://next-auth.js.org/errors] |
| Publication state | Free-form strings | Prisma enum such as `DRAFT`, `PUBLISHED`, `ARCHIVED` | The phase requires publication status, and enum constraints prevent invalid states. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][ASSUMED] |

**Key insight:** This phase should centralize trust boundaries first; future editor CRUD can attach to those boundaries, but hidden UI cannot compensate for unguarded server mutations. [CITED: https://nextjs.org/docs/app/guides/data-security][CITED: .planning/research/PITFALLS.md]

## Common Pitfalls

### Pitfall 1: Credentials Provider Session Strategy Conflict

**What goes wrong:** The plan installs NextAuth v4 Credentials with a Prisma adapter and assumes database sessions work. [CITED: https://next-auth.js.org/errors]  
**Why it happens:** Auth.js supports database sessions generally, but NextAuth v4 Credentials is explicitly limited to JWT sessions. [CITED: https://next-auth.js.org/providers/credentials][CITED: https://authjs.dev/concepts/session-strategies]  
**How to avoid:** Add a pre-implementation checkpoint and resolve whether D-07 or the Auth.js Credentials approach changes. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Warning signs:** `session: { strategy: "database" }` appears beside `CredentialsProvider`, or `Session` table is expected to populate after Credentials login. [CITED: https://next-auth.js.org/errors]

### Pitfall 2: Prisma 7 Old-Pattern Breakage

**What goes wrong:** Code imports `PrismaClient` from `@prisma/client` and calls `new PrismaClient()` without an adapter. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7]  
**Why it happens:** Prisma 7 changed generator output and requires driver adapters. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]  
**How to avoid:** Generate the client into `src/generated/prisma`, import from that path, add `prisma.config.ts`, and pass `new PrismaPg({ connectionString })`. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]  
**Warning signs:** `datasource db { url = env("DATABASE_URL") }`, `provider = "prisma-client-js"`, or `new PrismaClient()` without adapter. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7]

### Pitfall 3: Page Redirect Mistaken For Backend Authorization

**What goes wrong:** `/admin` redirects correctly, but direct create/edit/delete/publish/unpublish calls still run. [CITED: https://nextjs.org/docs/app/guides/data-security]  
**Why it happens:** Server Actions and route handlers are independent server entry points. [CITED: https://nextjs.org/docs/app/getting-started/mutating-data][CITED: https://nextjs.org/docs/app/getting-started/route-handlers]  
**How to avoid:** Put `requireAdmin()` inside every mutation and test direct unauthenticated calls. [CITED: https://nextjs.org/docs/app/guides/data-security]  
**Warning signs:** Mutation modules do not import the auth guard, or tests only check visible pages. [CITED: .planning/research/PITFALLS.md]

### Pitfall 4: Single Admin Becomes Role System

**What goes wrong:** Phase 2 adds roles, invites, registration, author ownership, or reset flows. [CITED: .planning/REQUIREMENTS.md]  
**Why it happens:** Auth systems often expand into generic CMS identity features. [ASSUMED]  
**How to avoid:** Use `ADMIN_EMAIL`, one admin user record, no public signup/reset, and no v1 roles table. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]  
**Warning signs:** `Role`, `Invite`, `PasswordResetToken`, or `authorId` ownership decisions appear in the Phase 2 schema without explicit user approval. [CITED: .planning/REQUIREMENTS.md][ASSUMED]

### Pitfall 5: Local Database Assumed But Not Available

**What goes wrong:** Planner schedules `prisma migrate dev` before a PostgreSQL URL exists. [VERIFIED: codebase grep]  
**Why it happens:** The repo has no `.env.local`, no `.env`, and no `psql`/`pg_isready` CLI on PATH in this environment. [VERIFIED: local command]  
**How to avoid:** Plan either a local Docker Compose Postgres setup or a checkpoint requiring a `DATABASE_URL` before migrations. [VERIFIED: local command][CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]  
**Warning signs:** Migration tasks have no preceding DB availability step. [ASSUMED]

## Code Examples

Verified patterns from official sources:

### App Router NextAuth v4 Route Handler Caveat

```typescript
// Source: https://next-auth.js.org/configuration/initialization
// Valid v4 App Router initialization, but not sufficient for D-07 with Credentials.
import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth/config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

### Prisma 7 Schema Skeleton

```prisma
// Source: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum PublicationStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Post {
  id            String            @id @default(cuid())
  title         String
  slug          String            @unique
  excerpt       String?
  bodyMarkdown  String
  status        PublicationStatus @default(DRAFT)
  publishedAt   DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  categoryId    String?
  category      Category?         @relation(fields: [categoryId], references: [id])
  seriesId      String?
  series        Series?           @relation(fields: [seriesId], references: [id])
  seriesOrder   Int?
  tags          PostTag[]

  @@index([status, publishedAt])
  @@index([categoryId])
  @@index([seriesId, seriesOrder])
}
```

### Playwright Unauthorized Mutation Test

```typescript
// Source: https://playwright.dev/docs/api/class-apirequestcontext
import { expect, test } from "@playwright/test";

const endpoints = [
  "/api/admin/posts/create",
  "/api/admin/posts/edit",
  "/api/admin/posts/delete",
  "/api/admin/posts/publish",
  "/api/admin/posts/unpublish",
] as const;

test("rejects unauthenticated admin mutations", async ({ request }) => {
  for (const endpoint of endpoints) {
    const response = await request.post(endpoint, {
      data: { id: "post_stub" },
      failOnStatusCode: false,
    });

    expect(response.status(), endpoint).toBe(401);
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma `provider = "prisma-client-js"` and import from `@prisma/client` | Prisma 7 `provider = "prisma-client"` with explicit generated output import | Prisma ORM 7 upgrade docs | Planner must add generated output path and update imports. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7] |
| Prisma datasource URL inside `schema.prisma` | `DATABASE_URL` in `prisma.config.ts` datasource config | Prisma ORM 7 upgrade docs | Planner must create `prisma.config.ts`; schema datasource only names provider. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7] |
| Prisma Client without explicit driver adapter | `new PrismaClient({ adapter: new PrismaPg(...) })` for PostgreSQL | Prisma ORM 7 docs | Planner must install `@prisma/adapter-pg` and `pg`. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction] |
| NextAuth v4 Credentials with database adapter assumed safe | Credentials requires JWT sessions in official v4 docs | NextAuth v4 docs current as of 2026-07-02 | Planner must not claim D-07 is met by stock Credentials. [CITED: https://next-auth.js.org/errors] |
| `unauthorized()` as general production auth primitive | `unauthorized()` remains experimental and requires `authInterrupts` | Next.js docs last updated 2026-03-03 | Prefer explicit redirect/401 helpers for Phase 2 unless user accepts experimental Next.js config. [CITED: https://nextjs.org/docs/app/api-reference/functions/unauthorized] |

**Deprecated/outdated:**
- `prisma-client-js` default import assumptions are outdated for Prisma 7 planning. [CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7]
- Middleware/Proxy should not be the primary place for DB-backed authorization checks because Next.js recommends DAL/page/action checks for secure authorization. [CITED: https://nextjs.org/docs/app/guides/authentication][CITED: https://nextjs.org/docs/app/guides/data-security]
- NextAuth v5 exists only under the `beta` dist-tag while `latest` remains 4.24.14, so switching to v5 should be a user-approved stack decision. [VERIFIED: npm registry]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@node-rs/argon2` is the recommended password hash package for this project, subject to planner/user confirmation. | Standard Stack, Don't Hand-Roll | Deployment/native-package compatibility or user preference may favor a different Argon2/bcrypt/scrypt package. |
| A2 | Route-handler mutation stubs are the lowest-friction way to test unauthenticated create/edit/delete/publish/unpublish calls in Phase 2. | Architecture Patterns, Code Examples | If Phase 3 must use server actions only, the test harness may need refactoring or Vitest-style direct service tests. |
| A3 | `PublicationStatus` values `DRAFT`, `PUBLISHED`, and `ARCHIVED` are sufficient for v1 schema skeleton. | Code Examples, Don't Hand-Roll | If archive semantics differ from unpublish/delete, status names may need user clarification. |

## Open Questions (Resolved for Planning)

1. **(RESOLVED) How should the auth conflict be resolved before Plan 02-02?**
   - What we know: D-01 requires email/password, D-07 requires database-backed sessions, and official NextAuth v4 Credentials requires JWT sessions. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://next-auth.js.org/errors]
   - Resolution: D-17 locks the implementation to a custom Prisma-backed single-admin session DAL and rejects stock NextAuth Credentials/JWT for Phase 2. Plans 02-01 and 02-02 preserve D-07 by using `AdminUser`, `AdminSession`, httpOnly cookies, and shared `getAdminSession()` / `requireAdmin()` helpers. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
   - Planning action: Do not add `next-auth`, `@auth/prisma-adapter`, `CredentialsProvider`, or JWT session strategy in Phase 2. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]

2. **(RESOLVED) Where should local PostgreSQL come from?**
   - What we know: The phase targets generic PostgreSQL through `DATABASE_URL`; `.env.local` and `.env` are absent, `psql` is absent, and Docker/Compose are available. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][VERIFIED: local command]
   - Resolution: Plan 02-01 treats `DATABASE_URL` as required user setup and gates verification through the schema/migration task. A successful `npm run db:migrate -- --name init_content_admin`, `npm run db:generate`, and `npm run admin:bootstrap` proves the database path. If PostgreSQL is unavailable, the executor must record the blocker and cannot mark Phase 2 fully verified. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
   - Planning action: No provider-specific database dependency is introduced in Phase 2; local Docker or a managed PostgreSQL URL can satisfy the same `DATABASE_URL` contract per D-09. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]

3. **(RESOLVED) Should Phase 2 add `"type": "module"` now?**
   - What we know: Prisma 7 docs require ESM package support and this repo currently has no `"type": "module"` field. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][VERIFIED: package.json]
   - Resolution: Plan 02-01 adds `"type": "module"` to `package.json` with the Prisma package setup so Prisma 7 config, tsx scripts, and generated-client imports operate in an explicit ESM package. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]
   - Planning action: Plan 02-01 verifies module-mode compatibility with `npm run lint`, `npm run build`, `npm run db:validate`, `npm run db:generate`, `npm run admin:hash-password`, and a desktop Playwright public-shell smoke run before later auth work depends on the package mode. [VERIFIED: package.json]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js 16, Prisma 7, scripts | yes | v22.23.1 | None needed. [VERIFIED: local command] |
| npm | Package install/scripts | yes | 10.9.8 | None needed. [VERIFIED: local command] |
| Docker | Optional local Postgres | yes | 27.5.1 | External `DATABASE_URL`. [VERIFIED: local command] |
| Docker Compose | Optional local Postgres | yes | v2.32.4 | External `DATABASE_URL`. [VERIFIED: local command] |
| PostgreSQL CLI (`psql`, `pg_isready`) | Manual DB probes | no | - | Use Prisma migration/client checks or `docker exec` inside a Postgres container. [VERIFIED: local command] |
| `DATABASE_URL` in local env file | Prisma migrate/client | no local env file found | - | Create `.env.local` or provide environment-managed secret before migrations. [VERIFIED: local command][CITED: .gitignore] |
| OpenSSL | `NEXTAUTH_SECRET` generation | yes | OpenSSL 3.0.13 | Node `crypto.randomBytes` script if needed. [VERIFIED: local command][CITED: https://next-auth.js.org/configuration/options] |

**Missing dependencies with no fallback:**
- A usable `DATABASE_URL` is required before applying migrations or testing real Prisma writes. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]

**Missing dependencies with fallback:**
- `psql`/`pg_isready` are absent; Prisma CLI/client checks or Docker container commands can verify connectivity instead. [VERIFIED: local command]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Email/password verification must be server-side, allowlisted by `ADMIN_EMAIL`, and backed by an approved password hash algorithm. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://authjs.dev/getting-started/authentication/credentials] |
| V3 Session Management | yes | Use httpOnly cookies, 30-day max age, server-readable sessions, and a single shared session lookup helper after the auth decision is resolved. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://next-auth.js.org/configuration/options] |
| V4 Access Control | yes | `requireAdmin()` must enforce the single-admin allowlist in layouts, route handlers, server actions, and service mutations. [CITED: https://nextjs.org/docs/app/guides/data-security] |
| V5 Input Validation | yes | Use Zod schemas for env, credentials, slugs, publication status, and mutation inputs. [CITED: https://zod.dev/] |
| V6 Cryptography | yes | Use Auth.js/NextAuth secret handling or a custom session secret plus approved password hashing; do not write custom crypto. [CITED: https://next-auth.js.org/configuration/options][ASSUMED] |

### Known Threat Patterns for Next.js Admin Auth

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated direct mutation POST | Elevation of Privilege | `requireAdmin()` inside every mutation plus Playwright direct POST rejection tests. [CITED: https://nextjs.org/docs/app/getting-started/mutating-data][CITED: https://nextjs.org/docs/app/guides/data-security] |
| Credential brute force | Spoofing | Keep no registration/reset surface, validate `ADMIN_EMAIL`, use password hash verify, and add rate limiting or lockout if exposed beyond trusted use. [CITED: https://authjs.dev/getting-started/authentication/credentials][ASSUMED] |
| Session theft through client JavaScript | Information Disclosure | Store session token in httpOnly cookie and keep secrets outside committed files. [CITED: https://next-auth.js.org/configuration/options][CITED: .gitignore] |
| Client-provided admin/role data | Elevation of Privilege | Ignore client role claims and check server session email against `ADMIN_EMAIL`. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md][CITED: https://nextjs.org/docs/app/guides/data-security] |
| SQL injection in content/admin writes | Tampering | Use Prisma typed queries and Zod validation instead of string-built SQL. [CITED: https://www.prisma.io/docs/orm][CITED: https://zod.dev/] |

## Sources

### Primary (official docs and project files)

- `.planning/phases/02-data-model-and-admin-access/02-CONTEXT.md` - locked Phase 2 decisions, discretion, and deferred scope. [CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
- `.planning/REQUIREMENTS.md` - AUTH-01 through AUTH-04 requirement text. [CITED: .planning/REQUIREMENTS.md]
- `AGENTS.md` - project constraints and GSD workflow rules. [CITED: AGENTS.md]
- `package.json`, `playwright.config.ts`, `src/tests/e2e/*` - installed dependencies and existing test style. [VERIFIED: codebase grep]
- NextAuth v4 docs - route handler initialization, session options, App Router server session helper, Credentials constraints, and errors. [CITED: https://next-auth.js.org/configuration/initialization][CITED: https://next-auth.js.org/configuration/options][CITED: https://next-auth.js.org/configuration/nextjs][CITED: https://next-auth.js.org/providers/credentials][CITED: https://next-auth.js.org/errors]
- Auth.js docs - Prisma adapter schema, current Credentials guidance, database/session concepts. [CITED: https://authjs.dev/getting-started/adapters/prisma][CITED: https://authjs.dev/getting-started/authentication/credentials][CITED: https://authjs.dev/concepts/session-strategies]
- Prisma ORM docs - Prisma 7 config, generated client, driver adapter, migrations, and Next.js setup. [CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction][CITED: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7][CITED: https://www.prisma.io/docs/guides/frameworks/nextjs]
- Next.js docs - authentication, data security, route handlers, mutating data, and experimental `unauthorized()`. [CITED: https://nextjs.org/docs/app/guides/authentication][CITED: https://nextjs.org/docs/app/guides/data-security][CITED: https://nextjs.org/docs/app/getting-started/route-handlers][CITED: https://nextjs.org/docs/app/getting-started/mutating-data][CITED: https://nextjs.org/docs/app/api-reference/functions/unauthorized]
- Playwright docs - API request context and fixtures. [CITED: https://playwright.dev/docs/api/class-apirequestcontext][CITED: https://playwright.dev/docs/test-fixtures]
- Zod docs - TypeScript-first validation and install. [CITED: https://zod.dev/]
- OWASP ASVS project page - ASVS purpose and stable 5.0.0 reference. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Secondary (tool verification)

- `npm view` metadata for package versions, publish dates, source repos, and postinstall scripts. [VERIFIED: npm registry]
- `gsd-tools package-legitimacy check` for recommended npm packages. [VERIFIED: package-legitimacy]
- Local environment probes for Node, npm, Docker, Docker Compose, OpenSSL, PostgreSQL CLI, env file presence, and git state. [VERIFIED: local command]

### Tertiary (LOW confidence)

- Assumptions about `@node-rs/argon2` being the preferred hash package, route-handler stubs being the best test seam, and publication enum names. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Prisma, Next.js, Auth.js, Playwright, and Zod findings are official-doc backed, but the auth session strategy has an unresolved user-decision conflict. [CITED: https://next-auth.js.org/errors][CITED: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction]
- Architecture: MEDIUM - the guard and Prisma patterns are official-doc backed, but final auth implementation depends on resolving D-07 versus stock Credentials. [CITED: https://nextjs.org/docs/app/guides/data-security][CITED: .planning/phases/02-data-model-and-admin-access/02-CONTEXT.md]
- Pitfalls: HIGH - the biggest pitfalls are directly confirmed by official docs and prior project pitfalls research. [CITED: https://next-auth.js.org/errors][CITED: https://nextjs.org/docs/app/guides/data-security][CITED: .planning/research/PITFALLS.md]

**Research date:** 2026-07-02  
**Valid until:** 2026-07-16 because Next.js/Auth.js/Prisma package and docs are moving quickly. [VERIFIED: npm registry]

# Phase 2: Data Model and Admin Access - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-07-02T16:55:13+08:00
**Phase:** 2-Data Model and Admin Access
**Areas discussed:** Single-admin login method, Admin identity and session boundary, Database and content model boundary, Admin protection and mutation test boundary

---

## Single-Admin Login Method

### Login Method

| Option | Description | Selected |
|--------|-------------|----------|
| Email + password login | Fewest external dependencies; good fit for personal blog v1 | yes |
| GitHub/Google OAuth allowlist | Avoids password maintenance but requires third-party OAuth setup | |
| Email Magic Link | Nice experience but requires email delivery service and reliability | |

**User's choice:** Email + password login.
**Notes:** Use the simplest secure single-admin approach for v1.

### Administrator Identifier

| Option | Description | Selected |
|--------|-------------|----------|
| Email | Matches allowlist, Auth.js, and future profile fields | yes |
| Username | Simple but disconnected from email/auth workflows | |
| Third-party account ID | Best suited to OAuth-based login | |

**User's choice:** Email.
**Notes:** The admin identity should be email-based.

### Local Development Login

| Option | Description | Selected |
|--------|-------------|----------|
| `.env.local` ADMIN_EMAIL + password hash | Keeps local and production behavior consistent without committing secrets | yes |
| Hard-coded dev admin | Convenient but risks leaking into production | |
| OAuth-only local login | Requires third-party callback setup for local dev | |

**User's choice:** `.env.local` ADMIN_EMAIL + password hash.
**Notes:** Secrets must stay outside the repository.

### Password Reset

| Option | Description | Selected |
|--------|-------------|----------|
| No public reset | Single administrator can rotate env/database secret manually | yes |
| Email reset | Better UX but adds email service and security workflow | |
| TODO only | Leaves no actual recovery path | |

**User's choice:** No public reset.
**Notes:** Public password reset is out of v1.

---

## Admin Identity and Session Boundary

### Administrator Source

| Option | Description | Selected |
|--------|-------------|----------|
| Env allowlist + database user record | `ADMIN_EMAIL` defines the only admin; DB stores Auth.js user/session data | yes |
| Env only | Simplest but weakens session/audit adapter value | |
| Database only | Drifts toward a multi-user account system | |

**User's choice:** Env allowlist + database user record.
**Notes:** Preserve single-admin scope while still using database-backed sessions.

### Registration Entrypoint

| Option | Description | Selected |
|--------|-------------|----------|
| No registration | Only the configured administrator email can authenticate | yes |
| Hidden registration | Convenient bootstrap but creates a security boundary | |
| Invite registration | Multi-user capability; better left beyond v1 | |

**User's choice:** No registration.
**Notes:** v1 must not expose signup or invite flows.

### Session Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Database session + httpOnly cookie | Server-verifiable; suitable for admin pages and mutations | yes |
| JWT-only | Fewer tables but weaker server-side revocation/control | |
| Very short session | More secure but worse writing experience | |

**User's choice:** Database session + httpOnly cookie.
**Notes:** Server-side verification is required for mutation protection.

### Session Duration

| Option | Description | Selected |
|--------|-------------|----------|
| 30 days | Reduces repeated login for infrequent personal writing | yes |
| 7 days | More conservative | |
| Browser-session lifetime | Closing browser invalidates session; secure but inconvenient | |

**User's choice:** 30 days.
**Notes:** Good balance for a personal admin workflow.

---

## Database and Content Model Boundary

### Database Provider Posture

| Option | Description | Selected |
|--------|-------------|----------|
| Generic PostgreSQL `DATABASE_URL` | Works with local Docker/Postgres, Neon, or Supabase without vendor lock-in | yes |
| Neon-optimized setup | Good for serverless deployment but introduces early platform coupling | |
| SQLite first | Fast locally but conflicts with Postgres/Auth deployment direction | |

**User's choice:** Generic PostgreSQL `DATABASE_URL`.
**Notes:** Keep provider-specific adapters out of Phase 2 unless required.

### Prisma Schema Completeness

| Option | Description | Selected |
|--------|-------------|----------|
| Complete v1 content skeleton | Post, Tag, Category, Series, publication status, slug, timestamps, joins | yes |
| Auth + Post only | Faster but causes more schema churn in later phases | |
| Auth only | Does not satisfy Phase 2 content-model criteria | |

**User's choice:** Complete v1 content skeleton.
**Notes:** Phase 2 should prepare the durable model for Phases 3 and 4.

### Category and Tag Relationship

| Option | Description | Selected |
|--------|-------------|----------|
| One Category + many Tags per post | Category as primary section, tags as cross-cutting indexes | yes |
| Many Categories + many Tags per post | More flexible but harder to edit and reason about | |
| Tags only | Simple but weakens archive/category organization | |

**User's choice:** One Category + many Tags per post.
**Notes:** Fits technical notes with one main section and multiple topics.

### Series Model

| Option | Description | Selected |
|--------|-------------|----------|
| Independent Series table + optional Post series + seriesOrder | Clear semantics and enough for ordered technical series | yes |
| Merge Series with Tag | Fewer tables but mixes distinct concepts | |
| Defer Series | Conflicts with v1 series requirement and causes future migration work | |

**User's choice:** Independent Series table + optional Post series + seriesOrder.
**Notes:** Series is a first-class v1 content organization concept.

---

## Admin Protection and Mutation Test Boundary

### Unauthenticated `/admin` Access

| Option | Description | Selected |
|--------|-------------|----------|
| Server redirect to `/admin/login` | Avoids exposing protected admin shell before auth checks complete | yes |
| 401 page | Clear but worse login flow | |
| Client-side check and redirect | Can flash protected UI; not a real security boundary | |

**User's choice:** Server redirect to `/admin/login`.
**Notes:** Auth checks should happen before protected UI renders.

### Guard Location

| Option | Description | Selected |
|--------|-------------|----------|
| Shared `requireAdmin()` / `getAdminSession()` server utilities | Reusable by pages, server actions, and API routes | yes |
| Each page or route checks independently | Short-term fast but easy to miss a path | |
| Middleware only | Helpful for entry routes but insufficient for internal mutation calls | |

**User's choice:** Shared server guard utilities.
**Notes:** Avoid duplicating auth checks across the codebase.

### Mutation Guard Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Add protected mutation boundaries / test stubs now | Meets Phase 2 success criteria and supports later CMS work | yes |
| Protect pages only | Leaves direct backend calls uncovered | |
| Defer until editor phase | Makes Phase 2 security goal incomplete | |

**User's choice:** Add protected mutation boundaries / test stubs now.
**Notes:** CRUD UI can wait, but mutation authorization cannot.

### Unauthenticated Test Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Page access + mutation guard unit/integration tests | Covers `/admin` and direct create/edit/delete/publish/unpublish calls | yes |
| Page redirect only | Does not cover backend mutation attacks | |
| Manual testing only | Too easy to regress | |

**User's choice:** Page access + mutation guard tests.
**Notes:** Tests must prove direct unauthenticated mutation calls are rejected.

## The Agent's Discretion

- Exact password hashing package/algorithm.
- Exact Prisma field names, indexes, and migration details where not specified.
- Exact test shape for guard coverage, as long as unauthenticated mutation calls are rejected.
- Exact visual treatment of the admin login/protected placeholder page within the existing technical-lab style.

## Deferred Ideas

- OAuth login, Magic Link login, public password reset, email recovery, registration, invite flows, multi-author roles, and provider-specific database optimization are deferred beyond Phase 2 unless a later plan explicitly reopens them.

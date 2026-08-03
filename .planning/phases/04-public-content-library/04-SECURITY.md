---
phase: 04
slug: public-content-library
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity
threats_open: 0
asvs_level: 1
block_on: high
register_authored_at_plan_time: true
created: 2026-07-07
---

# Phase 04 - Security

Per-phase security contract: threat register, accepted risks, and audit trail.

## Scope

Audited Phase 04 plan-time threat models from `04-01-PLAN.md` through `04-11-PLAN.md`, summary threat flags from `04-01-SUMMARY.md` through `04-11-SUMMARY.md`, and the implementation files listed in the secure-phase request. Verification depth: ASVS L1, grep/presence-level evidence in the cited implementation or lock/artifact files.

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry -> runtime dependencies | Approved packages enter the runtime/build graph. | `shiki`, rendering dependency manifests and lockfile entries |
| database -> public query helpers/routes | Stored posts, taxonomy, series, and archive data become public DTOs and pages. | Published article metadata, Markdown, slugs, taxonomy relations |
| author Markdown -> React output | Stored Markdown becomes public article UI. | Markdown body, headings, code blocks, links, images |
| admin browser -> mutation route -> Prisma | Admin-only actions change publication and featured state. | Post IDs, status, `publishedAt`, `featured` |
| mutation route -> public route cache | Publication changes invalidate public pages. | Old/new public path snapshots |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status | Evidence |
|-----------|----------|-----------|----------|-------------|------------|--------|----------|
| T-04-01-01 | Tampering | `shiki@4.3.0` package install | high | mitigate | Block install until human approval is recorded against exact npm identity/version. | closed | `04-01-SUMMARY.md:30`, `04-01-SUMMARY.md:53`, `package-lock.json:9836` |
| T-04-SC | Tampering | npm installs | high | mitigate | Exact pins only after approval; later phase package installs not authorized. | closed | `package.json:23`, `package.json:31`, `package.json:35`, `package-lock.json:15`, `package-lock.json:23`, `package-lock.json:27`, `04-02-SUMMARY.md:38` |
| T-04-02-01 | Information Disclosure | `src/lib/public/content-queries.ts` | high | mitigate | Centralized `PUBLISHED` plus non-null `publishedAt` predicate for public helpers. | closed | `src/lib/public/content-queries.ts:97`, `src/lib/public/content-queries.ts:331`, `src/lib/public/content-queries.ts:408`, `src/tests/e2e/public-content-library.spec.ts:824` |
| T-04-02-02 | Tampering / Elevation of Privilege | `src/lib/markdown/public-render.tsx` | high | mitigate | Strip/skip raw HTML, sanitize output, and convert Shiki HAST to JSX. | closed | `src/lib/markdown/public-render.tsx:141`, `src/lib/markdown/public-render.tsx:183`, `src/lib/markdown/public-render.tsx:188`, `src/lib/markdown/public-render.tsx:355`, `src/lib/markdown/public-render.tsx:357`, `src/tests/e2e/public-content-library.spec.ts:1088` |
| T-04-02-03 | Denial of Service | server code highlighting | medium | mitigate | Highlight code in server-rendered article path, not admin preview/client bundles. | closed | `src/lib/markdown/public-render.tsx:16`, `src/lib/markdown/public-render.tsx:345`, `src/app/(public)/notes/[slug]/page.tsx:44` |
| T-04-03-01 | Information Disclosure | `/notes` | high | mitigate | `/notes` consumes `getPublishedPostList()` and has draft absence coverage. | closed | `src/app/(public)/notes/page.tsx:3`, `src/app/(public)/notes/page.tsx:8`, `src/tests/e2e/public-content-library.spec.ts:876`, `src/tests/e2e/public-content-library.spec.ts:909` |
| T-04-03-02 | Information Disclosure | `PublicEmptyState` | low | mitigate | Public empty copy avoids admin links and publishing workflow instructions. | closed | `src/app/(public)/notes/page.tsx:33`, `src/components/public/content/PublicEmptyState.tsx:23`, `src/tests/e2e/public-content-library.spec.ts:1677` |
| T-04-04-01 | Information Disclosure | organization browser coverage | high | mitigate | Tests include private-only and mixed draft/published fixtures before route wiring. | closed | `src/tests/e2e/public-content-library.spec.ts:281`, `src/tests/e2e/public-content-library.spec.ts:390`, `src/tests/e2e/public-content-library.spec.ts:1159`, `src/tests/e2e/public-content-library.spec.ts:1270` |
| T-04-04-02 | Information Disclosure | organization empty states | low | mitigate | Organization empty states use Chinese public copy without admin/workflow references. | closed | `src/components/public/content/ArchiveTimeline.tsx:59`, `src/components/public/content/SeriesIndex.tsx:20`, `src/components/public/content/SeriesDetailList.tsx:51`, `src/tests/e2e/public-content-library.spec.ts:1652` |
| T-04-05-01 | Information Disclosure | `getSeriesNavigation(postId)` | high | mitigate | Series navigation reads only published posts with non-null `publishedAt`. | closed | `src/lib/public/content-queries.ts:599`, `src/lib/public/content-queries.ts:620`, `src/lib/public/content-queries.ts:640`, `src/tests/e2e/public-content-library.spec.ts:1291` |
| T-04-05-02 | Tampering | generated navigation hrefs | medium | mitigate | Navigation hrefs are built from stored slugs returned by typed public helpers. | closed | `src/lib/public/content-queries.ts:659`, `src/lib/public/content-queries.ts:666`, `src/components/public/content/SeriesNavigation.tsx:25`, `src/components/public/content/SeriesNavigation.tsx:26` |
| T-04-06-01 | Tampering | Prisma schema push | high | mitigate | Explicit non-destructive migration and db push recorded without data-loss confirmation. | closed | `prisma/migrations/20260706000000_add_post_featured/migration.sql:2`, `src/tests/e2e/data-model-foundation.spec.ts:100`, `src/tests/e2e/data-model-foundation.spec.ts:103`, `04-06-SUMMARY.md:103` |
| T-04-06-02 | Information Disclosure | featured flag default | low | mitigate | Existing rows default to `featured = false`. | closed | `prisma/schema.prisma:60`, `prisma/migrations/20260706000000_add_post_featured/migration.sql:2`, `src/tests/e2e/data-model-foundation.spec.ts:81` |
| T-04-07-01 | Spoofing / CSRF | admin publish/unpublish routes | high | mitigate | Preserve origin rejection and guard-first `requireAdmin()` dispatcher. | closed | `src/app/api/admin/posts/[operation]/route.ts:48`, `src/app/api/admin/posts/[operation]/route.ts:62`, `src/lib/admin/post-mutations.ts:805`, `src/lib/admin/post-mutations.ts:809`, `src/tests/e2e/admin-mutations.spec.ts:340`, `src/tests/e2e/admin-mutations.spec.ts:376` |
| T-04-07-02 | Tampering | publish/unpublish mutations | high | mitigate | Parse `{ id }` with zod, read previous state, preserve first `publishedAt`, and write after auth. | closed | `src/lib/admin/post-input.ts:136`, `src/lib/admin/post-input.ts:140`, `src/lib/admin/post-input.ts:241`, `src/lib/admin/post-mutations.ts:686`, `src/lib/admin/post-mutations.ts:689`, `src/lib/admin/post-mutations.ts:701`, `src/lib/admin/post-mutations.ts:758`, `src/tests/e2e/admin-mutations.spec.ts:225` |
| T-04-07-03 | Information Disclosure | stale public pages | medium | mitigate | Compute old/new affected public paths and call `revalidatePath`. | closed | `src/lib/admin/post-mutations.ts:730`, `src/lib/public/revalidate.ts:55`, `src/lib/public/revalidate.ts:67`, `src/lib/public/revalidate.ts:73`, `src/lib/public/revalidate.ts:78`, `src/tests/e2e/admin-mutations.spec.ts:422` |
| T-04-08-01 | Information Disclosure | `searchPublishedPosts()` | high | mitigate | Search filters spread the shared published-only predicate. | closed | `src/lib/public/content-queries.ts:341`, `src/lib/public/content-queries.ts:354`, `src/lib/public/content-queries.ts:356`, `src/tests/e2e/public-content-library.spec.ts:1378` |
| T-04-08-02 | Information Disclosure | homepage helper | high | mitigate | Homepage helper filters `PUBLISHED` plus non-null `publishedAt`. | closed | `src/lib/public/content-queries.ts:387`, `src/lib/public/content-queries.ts:389`, `src/lib/public/content-queries.ts:394`, `src/tests/e2e/public-content-library.spec.ts:1439` |
| T-04-08-03 | Tampering | search query input | medium | mitigate | Query is trimmed/bounded and passed through Prisma filters. | closed | `src/app/(public)/search/page.tsx:13`, `src/app/(public)/search/page.tsx:16`, `src/components/public/content/SearchForm.tsx:31`, `src/lib/public/content-queries.ts:350`, `src/lib/public/content-queries.ts:354` |
| T-04-09-01 | Information Disclosure | `/notes/[slug]` | high | mitigate | Detail route calls published-only helper and `notFound()` on null. | closed | `src/app/(public)/notes/[slug]/page.tsx:38`, `src/app/(public)/notes/[slug]/page.tsx:40`, `src/lib/public/content-queries.ts:408`, `src/lib/public/content-queries.ts:413`, `src/tests/e2e/public-content-library.spec.ts:1014` |
| T-04-09-02 | Tampering | article Markdown output | high | mitigate | Article route renders through safe public Markdown renderer; raw-render scan remains covered. | closed | `src/app/(public)/notes/[slug]/page.tsx:44`, `src/lib/markdown/public-render.tsx:348`, `src/lib/markdown/public-render.tsx:355`, `src/lib/markdown/public-render.tsx:357`, `src/tests/e2e/public-content-library.spec.ts:1088` |
| T-04-10-01 | Information Disclosure | taxonomy and series routes | high | mitigate | Taxonomy/series routes use published helpers and `notFound()` for private-only slugs. | closed | `src/app/(public)/tags/[slug]/page.tsx:17`, `src/app/(public)/tags/[slug]/page.tsx:20`, `src/app/(public)/categories/[slug]/page.tsx:17`, `src/app/(public)/categories/[slug]/page.tsx:20`, `src/app/(public)/series/[slug]/page.tsx:18`, `src/app/(public)/series/[slug]/page.tsx:21`, `src/tests/e2e/public-content-library.spec.ts:1270` |
| T-04-10-02 | Information Disclosure | archive route | high | mitigate | Archive helper reads only published posts with non-null `publishedAt`. | closed | `src/app/(public)/archive/page.tsx:7`, `src/lib/public/content-queries.ts:520`, `src/lib/public/content-queries.ts:523`, `src/lib/public/content-queries.ts:524`, `src/tests/e2e/public-content-library.spec.ts:1195` |
| T-04-10-03 | Tampering | dynamic route slugs | medium | mitigate | Dynamic slugs feed typed Prisma filters only through public helpers. | closed | `src/app/(public)/tags/[slug]/page.tsx:16`, `src/app/(public)/tags/[slug]/page.tsx:17`, `src/app/(public)/categories/[slug]/page.tsx:16`, `src/app/(public)/categories/[slug]/page.tsx:17`, `src/app/(public)/series/[slug]/page.tsx:17`, `src/app/(public)/series/[slug]/page.tsx:18`, `src/lib/public/content-queries.ts:425`, `src/lib/public/content-queries.ts:478`, `src/lib/public/content-queries.ts:556` |
| T-04-11-01 | Information Disclosure | related helper | high | mitigate | Related helper filters `PUBLISHED` plus non-null `publishedAt` and excludes current article. | closed | `src/lib/public/content-queries.ts:673`, `src/lib/public/content-queries.ts:705`, `src/lib/public/content-queries.ts:707`, `src/lib/public/content-queries.ts:708`, `src/tests/e2e/public-content-library.spec.ts:1479` |
| T-04-11-02 | Information Disclosure | stale public pages | medium | mitigate | Final browser checks cover public surfaces after publication behavior. | closed | `src/tests/e2e/public-content-library.spec.ts:1584`, `src/tests/e2e/public-content-library.spec.ts:1607`, `src/tests/e2e/public-content-library.spec.ts:1618`, `src/tests/e2e/public-content-library.spec.ts:1635`, `src/tests/e2e/public-content-library.spec.ts:1644` |

## Summary Threat Flags

| Flag | Mapping | Status | Evidence |
|------|---------|--------|----------|
| `threat_flag: auth-surface` from `04-07-SUMMARY.md` | Mapped to T-04-07-01 and T-04-07-02 because `feature`/`unfeature` reuse the existing guarded mutation route and dispatcher. | registered | `04-07-SUMMARY.md:188`, `src/lib/admin/post-mutations.ts:32`, `src/lib/admin/post-mutations.ts:777`, `src/lib/admin/post-mutations.ts:791`, `src/app/api/admin/posts/[operation]/route.ts:48`, `src/lib/admin/post-mutations.ts:809` |

No unregistered threat flags.

## Open Threats

No blocking or non-blocking open threats.

## Accepted Risks Log

No accepted risks.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open Blocking | Open Non-Blocking | Run By |
|------------|---------------|--------|---------------|-------------------|--------|
| 2026-07-07 | 26 | 26 | 0 | 0 | gsd-security-auditor |

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-07

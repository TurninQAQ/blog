---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 06
current_phase_name: Brand, Homepage, and Secure Authoring Upgrade
status: human_needed
stopped_at: Phase 06 technically complete; awaiting human visual approval and provider launch evidence
last_updated: "2026-07-12T02:19:43+08:00"
last_activity: 2026-07-12
last_activity_desc: Phase 06 technical closeout completed
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 33
  completed_plans: 33
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-06-30)

**Core value:** Publish technical notes through a visually distinctive developer blog that feels memorable on entry and remains useful for reading, searching, and revisiting technical content.
**Current focus:** Phase 06 technical closeout — human visual approval and provider launch evidence pending

## Current Position

Phase: 06 (Brand, Homepage, and Secure Authoring Upgrade) — TECHNICALLY COMPLETE
Plan: 4 of 4
Status: Technical verification passed; human visual approval required; public exposure blocked pending provider controls
Last activity: 2026-07-12 — Phase 06 technical closeout completed

Overall progress: [██████████] 100%

## Performance Metrics

**Velocity:**

- Total plans completed: 33
- Average duration: 13min across summaries with recorded timing
- Total execution time: 2.77 hours across summaries with recorded timing

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 7 | - | - |
| 02 | 3 | - | - |
| 03 | 3 | 90min | 30min |
| 04 | 11 | - | - |
| 05 | 5 | - | - |
| 06 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: 05-05, 06-01, 06-02, 06-03, 06-04
- Trend: 33 plans completed

*Updated after each plan completion*
| Phase 01 P01 | 2min | 1 tasks | 4 files |
| Phase 01 P02 | 22min | 2 tasks | 14 files |
| Phase 01 P03 | 6min | 1 tasks | 6 files |
| Phase 01 P04 | 9min | 2 tasks | 11 files |
| Phase 01 P05 | 18min | 2 tasks | 12 files |
| Phase 01 P06 | 19min | 2 tasks | 11 files |
| Phase 01 P07 | 2min | 1 tasks | 3 files |
| Phase 02 P01 | 13min | 3 tasks | 28 files |
| Phase 02 P02 | 18min | 3 tasks | 11 files |
| Phase 02 P03 | 6min | 2 tasks | 4 files |
| Phase 03 P01 | 30min | 3 tasks | 15 files |
| Phase 03 P02 | 45min | 3 tasks | 8 files |
| Phase 03 P03 | 15min | 3 tasks | 11 files |
| Phase 04 P06 | 3min | 1 tasks | 8 files |
| Phase 04 P01 | 2min | 1 tasks | 4 files |
| Phase 04 P02 | 9min | 2 tasks | 6 files |
| Phase 04 P03 | 8min | 2 tasks | 8 files |
| Phase 04 P09 | 8min | 2 tasks | 8 files |
| Phase 04 P04 | 8min | 2 tasks | 6 files |
| Phase 04 P10 | 10min | 2 tasks | 10 files |
| Phase 04 P05 | 38min | 2 tasks | 5 files |
| Phase 04 P07 | 14min | 2 tasks | 10 files |
| Phase 04 P08 | 17min | 2 tasks | 8 files |
| Phase 04 P11 | 13min | 2 tasks | 6 files |
| Phase 05 P01 | 14min | 3 tasks | 5 files |
| Phase 05 P02 | 16min | 2 tasks | 2 files |
| Phase 05 P03 | 10min | 2 tasks | 3 files |
| Phase 05 P04 | 42 min | 2 tasks | 11 files |
| Phase 05 P05 | 9min | 2 tasks | 2 files |

## Quick Tasks Completed

| Date | Task | Summary |
|------|------|---------|
| 2026-07-11 | light-mecha-manga-public-redesign | Rebuilt the public frontend in the selected light mecha manga direction with original responsive assets, pointer-aware homepage motion, calm reading surfaces, and full automated and visual verification. |
| 2026-07-09 | wysiwyg-editor-cutover | Replaced the admin source/preview authoring UI with a Tiptap WYSIWYG article canvas, Markdown compatibility gate, code/table/image toolbar support, and regression coverage. |
| 2026-07-06 | chinese-ui-copy | Converted current public/admin UI copy and user-visible errors to Chinese; added Chinese taxonomy slug fallback; verified with lint, build, and full Playwright. |
| 2026-07-06 | wider-admin-editor | Widened the admin Markdown source/preview workspace, increased editor height, and verified admin flows across desktop/mobile/reduced-motion. |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Initialization: Technical-lab style, Markdown editor, single-admin CMS, immersive background effects, and full content library are in v1.
- Roadmap: Use Vertical MVP mode for all initial phases.
- Stack: Research recommends Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Auth.js, controlled Markdown rendering, Shiki, and progressive animation layers.
- [Phase 01]: Approved exact pinned Phase 1 npm package set after npm metadata verification; downstream plans may install those versions.
- [Phase 01]: Plan 01-02 established the Next.js/Tailwind/Playwright scaffold and intentionally deferred /__skeleton plus /api/skeleton-probe implementation to Plan 01-03. — Preserves phase boundaries: this plan ships scaffold and RED proof only; the walking-skeleton implementation remains a separate vertical slice.
- [Phase 01]: Plan 01-03 implemented an isolated /__skeleton walking-skeleton probe using a local .next/cache runtime store, with no schema push or durable content/auth/admin/search scope. — Preserves the Phase 1 visual-shell boundary while proving local browser-to-API wiring.
- [Phase 01]: Plan 01-04 established siteConfig/contentRoutes as the public copy and navigation boundary for the shell.
- [Phase 01]: Plan 01-04 implemented accessible mobile navigation with focus containment, Escape close, focus return, and 44px route rows verified by Playwright.
- [Phase 01]: Plan 01-05 kept homepage identity, route placeholders, and reading preview server-rendered; homepage canvas/effects remain Plan 01-06 scope.
- [Phase 01]: Plan 01-05 enforces one public mailto contact in the hero first viewport and no GitHub/RSS/Projects placeholders.
- [Phase 01]: Plan 01-06 implemented the homepage visual foundation with CSS plus 2D Canvas only; no Three.js, React Three Fiber, or Drei dependency/import was added.
- [Phase 01]: Plan 01-06 isolated the signal canvas behind a homepage-only client dynamic import with mobile, hidden/offscreen, and reduced-motion safeguards.
- [Phase 01]: Accepted the Phase 1 public visual shell after automated verification and human checkpoint approval. — Plan 01-07 reran lint, build, and Playwright successfully, recorded user approval 'approved / 认可', and made no source changes.
- [Phase 02]: Plan 02-01 preserved custom Prisma-backed single-admin persistence by adding no next-auth or @auth/prisma-adapter packages.
- [Phase 02]: Plan 02-01 initially hit missing PostgreSQL/admin env, then local PostgreSQL and ignored .env.local were created; migration, double admin bootstrap, and AdminUser count checks passed for zhdydkdh@163.com.
- [Phase 02]: Plan 02-02 preserved D-17 with a custom Prisma-backed AdminSession DAL and no stock NextAuth/Auth.js Credentials, JWT, OAuth, Magic Link, registration, invite, or reset surface.
- [Phase 02]: Plan 02-02 protects `/admin` server-side via `requireAdminPage()` in the page component to avoid guarding `/admin/login` through segment layout inheritance.
- [Phase 02]: Plan 02-02 normalized dotenv-escaped Argon2 hashes so Next dev and tsx scripts read the same ignored `.env.local` admin password hash.
- [Phase 02]: Plan 02-03 established guard-first backend mutation boundaries for create/edit/delete/publish/unpublish using the existing custom single-admin requireAdmin() primitive.
- [Phase 02]: Plan 02-03 kept post mutation routes body-free and Prisma-write-free; Phase 3 must attach real content writes only behind runGuardedPostMutation().
- [Phase 03]: Plan 03-02 installed approved exact Markdown editor/preview direct dependencies and reran with exact pins after npm initially wrote caret ranges.
- [Phase 03]: Plan 03-02 keeps Markdown preview on the project-owned react-markdown pipeline with skipHtml, rehype-sanitize, no source-level rehype-raw import, and no dangerouslySetInnerHTML.
- [Phase 03]: Plan 03-02 originally isolated @uiw/react-md-editor to an admin-only wrapper; this is now historical. The active admin editor is `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` using Tiptap, and source scans verify no project source imports the legacy UIW editor.
- [Phase 03]: Plan 03-03 keeps taxonomy management inline inside the article editor and adds no standalone /admin/categories, /admin/tags, or /admin/series routes.
- [Phase 03]: Plan 03-03 resolves or creates taxonomy records inside guarded post save transactions, replaces PostTag rows on edit, and rejects duplicate series order with field-level errors.
- [Phase 03]: Phase 3 is complete; publish/unpublish remains authorization-boundary-only and must become real public visibility behavior in Phase 4.
- [Phase 03]: The 2026-07-09 WYSIWYG cutover selected sketch variant A. Admin article editing now uses a single rendered Tiptap canvas, persists Markdown via adapter round-trip, blocks unsupported Markdown through a compatibility notice, and does not keep a source-edit fallback.
- [Phase 04]: Planning split the public content library into 11 execution plans across 9 waves, with Shiki human verification, featured schema gate, published-only public queries, safe Markdown rendering, taxonomy/archive/series routes, search, related articles, homepage featured modules, publish/unpublish visibility, and final no-draft-leakage checks.
- [Phase 04]: Added Post.featured as a non-null Boolean with @default(false), so existing posts are not accidentally featured.
- [Phase 04]: Kept generated Prisma files generated-only via npm run db:generate; no manual generated-client edits were made.
- [Phase 04]: User approved exact shiki@4.3.0 npm identity with checkpoint response approved before any dependency installation. — Unlocks Plan 04-02 to install only exact pins shiki@4.3.0, reading-time@1.5.0, and hast-util-to-jsx-runtime@2.3.6.
- [Phase 04]: Plan 04-01 remained metadata-only and preserved package.json and package-lock.json unchanged. — Dependency installation stays in Plan 04-02 after the supply-chain gate.
- [Phase 04]: Plan 04-02 installed only the 04-01 approved exact pins: shiki@4.3.0, reading-time@1.5.0, and hast-util-to-jsx-runtime@2.3.6. — Preserves the supply-chain gate and prevents unplanned search, MDX, or raw-HTML Markdown dependencies.
- [Phase 04]: Plan 04-02 centralized public post visibility around PublicationStatus.PUBLISHED plus non-null publishedAt. — Downstream public routes can consume one query boundary instead of duplicating draft-leak-prone filters.
- [Phase 04]: Plan 04-02 public Markdown strips raw HTML outside code fences before sanitized Shiki/React rendering. — Keeps Phase 3 raw HTML policy aligned while avoiding dangerouslySetInnerHTML and rehype-raw.
- [Phase 04]: Plan 04-03 kept /notes server-rendered through getPublishedPostList() and added no route-local Prisma query. — Preserves the published-only public query boundary from Plan 04-02 and mitigates draft leakage.
- [Phase 04]: Plan 04-03 established dense public note rows with cover-or-CSS technical-lab visuals and Chinese empty-state copy without admin links. — Satisfies READ-01 and the Phase 4 UI contract while avoiding fake content or admin workflow disclosure.
- [Phase 04]: Plan 04-09 keeps /notes/[slug] fully inside the existing published-only helper boundary, including generateMetadata(). — Preserves D-02 non-disclosure and prevents route-local Prisma query drift.
- [Phase 04]: Plan 04-09 uses the 04-02 safe Markdown renderer for article pages rather than adding another Markdown/raw HTML rendering path. — Keeps raw HTML disabled and Shiki highlighting centralized.
- [Phase 04]: Plan 04-09 renders the same TOC data in a desktop sticky rail and mobile in-flow disclosure before the article body. — Satisfies D-06/D-22 without client-side article animation.
- [Phase 04]: Plan 04-04 kept organization display components props-only and left route/query wiring to Plan 04-10. — Prevents route-local Prisma drift and preserves the planned 04-04/04-10 boundary.
- [Phase 04]: Plan 04-04 committed organization route tests as expected RED coverage without marking ORG/TAX requirements complete. — The tests document tag/category/archive/series draft-leak requirements, but live browsing remains pending until 04-10 turns them green.
- [Phase 04]: Plan 04-10 keeps public organization routes behind src/lib/public/content-queries.ts helpers; route files do not query Prisma directly. — This preserves the published-only public query boundary and reduces draft leakage risk across tags, categories, archive, and series.
- [Phase 04]: Plan 04-10 forces dynamic rendering for database-backed public content routes. — Full Playwright verification showed static caching could expose stale published visibility state; force-dynamic aligns the routes with Phase 4 D-24 live-read behavior.
- [Phase 04]: Plan 04-05 kept article series navigation inside src/lib/public/content-queries.ts and did not add route-local Prisma queries. — Preserves the Phase 4 published-only public query boundary and avoids duplicate draft-leak filtering in route files.
- [Phase 04]: Plan 04-05 renders SeriesNavigation only when a published series neighbor exists. — Standalone articles and single-post series should not render empty navigation chrome.
- [Phase 04]: Plan 04-05 places series navigation after the article body in the main article flow. — This satisfies mobile document-flow behavior and leaves later related articles to compose after series navigation.
- [Phase 04]: Plan 04-07 implemented feature/unfeature as explicit protected admin post operations so editor/list controls can mutate featured state without duplicating full edit payloads. — This keeps server authorization centralized in the existing admin mutation route and makes list-level featured controls practical.
- [Phase 04]: Plan 04-07 preserves publishedAt when unpublishing and removes public visibility through status DRAFT plus the published-only query boundary. — This satisfies D-03 while retaining first-publish history for future re-publish behavior.
- [Phase 04]: Plan 04-07 centralizes public path revalidation in src/lib/public/revalidate.ts using previous and next post snapshots. — Old/new snapshots let mutation code revalidate detail, taxonomy, archive, series, search, notes, and homepage surfaces consistently.
- [Phase 04]: Plan 04-08 keeps /search server-rendered through searchPublishedPosts(query) with Prisma filters; no Fuse, client index, or dedicated search engine was added. — Preserves the public query boundary and the no-new-search-dependency constraint.
- [Phase 04]: Plan 04-08 derives homepage featured content from explicit Post.featured and published-only statistics. — Prevents latest-post-as-featured behavior and keeps drafts out of homepage modules.
- [Phase 04]: Plan 04-11 keeps related articles inside the shared public content query layer — Prevents route-local Prisma drift and ensures related candidates reuse PublicationStatus.PUBLISHED plus non-null publishedAt filtering.
- [Phase 04]: Plan 04-11 ranks related posts by first matching priority: series, then shared tags, then category — Keeps same-series posts ahead of tag/category matches while avoiding additive scores that could let combined lower-priority matches outrank series.
- [Phase 04]: Plan 04-11 used existing Tailwind lab tokens for related rail styling instead of adding globals.css rules — The existing design system satisfied the desktop rail/mobile flow contract with less global CSS surface.
- [Phase 05]: Kept GSD outside the blog application dependency graph — The global tool and project planning history remain available while production dependencies contain no GSD runtime node.
- [Phase 05]: Separated process liveness from database readiness — Exact no-store responses and a single read-only SELECT 1 distinguish operator states without disclosing runtime details.
- [Phase 05]: Kept CI provider-neutral with disposable generated credentials — The pipeline verifies migrations, admin bootstrap, browser flows, and production security without choosing or deploying to a hosting provider.
- [Phase 05]: Verified Phase 3 against the accepted Tiptap Markdown-backed WYSIWYG canvas; UIW source/preview evidence remains historical. — The 2026-07-09 cutover is the active accepted architecture and fresh gates now cover it directly.
- [Phase 05]: Kept Plan 05-02 evidence-only with no editor implementation, dependency, route, schema, or product behavior change. — All current behavior passed once the GFM test assertion accepted valid separator widths.
- [Phase 05]: Production requires a final absolute HTTPS admin origin; the Playwright plaintext password remains test-only. — Keeps CSRF and redirect trust explicit while preventing test credentials from entering the production runtime.
- [Phase 05]: Release operations documentation remains provider-neutral and external launch gates remain blocked. — Repository verification cannot prove TLS, proxy, secret, database, monitoring, recovery, or infrastructure controls.
- [Phase 05]: PostgreSQL recovery uses encrypted custom-format logical backups, SHA-256 evidence, and a fresh isolated restore before production authorization. — Prevents unverified destructive recovery and preserves migration forward-fix as the preferred response.
- [Phase 05]: Used one bounded companion fixture to make series navigation and related-note visual regions observable without altering existing content. — Both records and unique orphan taxonomy were removed after evidence capture.
- [Phase 05]: Reduced-motion homepage evidence requires a static canvas with disabled pointer following and stable frame count, not canvas removal. — This matches the implemented D-07 contract and the passing reduced-motion browser test.
- [Phase 05]: Accepted the v1 application locally only after current mandatory gates, 44/44 visual rows, 10/10 evidence integrity checks, and 27/27 local Markdown targets passed. — Keeps the Phase 5 release decision tied to fresh auditable evidence.
- [Phase 05]: Kept public exposure blocked on final HTTPS/Host, secrets, private TLS PostgreSQL, restore, proxy/WAF, monitoring, and independent infrastructure evidence. — Repository application readiness cannot prove provider controls.
- [Phase 05]: Carried the five existing D-15 product deferrals forward without implementing or expanding them. — Preserves the approved v1 scope boundary.
- [Phase 06]: Applied the exact `Hans‘s Blog` brand, removed the homepage reading preview, and replaced the public artwork with original responsive orbital assets. — Preserves the selected visual direction without retaining recognizable third-party franchise identifiers.
- [Phase 06]: Extended the existing Markdown-backed Tiptap editor with fixed formatting/tone controls, bounded atomic Markdown import, and guarded PostgreSQL-backed image insertion. — Keeps raw HTML disabled and avoids replacing the accepted editor architecture.
- [Phase 06]: Made managed media private until transactional publication and added bounded ingest, quota, reclamation, and race-safe exposure controls. — Keeps untrusted bytes behind authentication and makes public exposure monotonic.
- [Phase 06]: Declared 4/4 plans and 5/5 mapped requirements technically complete after clean backend/UI reviews. — Overall verification remains `human_needed` for visual approval, and `06-SECURITY.md` remains blocked on provider evidence.

### Pending Todos

None yet.

### Blockers/Concerns

- Human approval is still required for the final Phase 6 desktop, 390 px, 320 px, editor, and image-modal visual evidence.
- Public exposure remains blocked by `T-06-38` and `T-06-39` until the final provider supplies auditable Host/TLS/proxy/WAF, secret custody, private database, restore, monitoring/alerting, incident-response, and independent infrastructure evidence.
- `06-SECURITY.md` remains `status: blocked`; the lower-severity CSP, third-party image privacy, and durable auditability items also remain recorded for remediation.

### Roadmap Evolution

- Phase 03 edited: edited fields: goal
- Phase 03 post-completion editor model changed from split Markdown source/preview to Tiptap WYSIWYG canvas; sketch variant A selected and implemented.
- Phase 04 complete: published-only public queries and real publish/unpublish behavior are implemented.
- Phase 6 added: Brand, homepage, and secure authoring experience upgrade with final release re-verification
- Phase 6 technically complete: 4/4 plans and 5/5 requirements complete; human visual approval and provider launch gates remain open

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| Community | Comments and reactions | Deferred to v2 | Initialization |
| CMS | Multi-author roles | Deferred to v2 | Initialization |
| Authoring | MDX interactive demos | Deferred to v2 | Initialization |
| Integrations | External content sync | Deferred to v2 | Initialization |
| Search | Dedicated search engine | Deferred to v2 | Initialization |

## Session Continuity

Last session: 2026-07-12T02:19:43+08:00
Stopped at: Phase 06 technical closeout complete; awaiting human visual approval and provider launch evidence
Resume file: .planning/phases/06-brand-homepage-and-secure-authoring-experience-upgrade-with-/06-VERIFICATION.md

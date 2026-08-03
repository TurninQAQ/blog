# Roadmap: Personal Tech Lab Blog

## Overview

Build the blog as a vertical MVP in five phases: first establish the memorable technical-lab public shell, then add the secure data/auth foundation, then make the writer workflow real, then expose the full public content library, and finally harden the interaction quality, performance, and verification. Each phase keeps the site runnable and moves one end-to-end slice closer to the confirmed v1.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Visual Foundation and Public Shell** - Establish the app shell, personal technical homepage, and responsive technical-lab visual system. (completed 2026-07-01)
- [x] **Phase 2: Data Model and Admin Access** - Add the content/auth data model and secure single-admin access boundary. (completed 2026-07-03)
- [x] **Phase 3: Markdown Authoring Workflow** - Deliver authenticated article creation, editing, Markdown-backed WYSIWYG authoring, taxonomy assignment, and draft management. (completed 2026-07-06; WYSIWYG editor cutover completed 2026-07-09)
- [x] **Phase 4: Public Content Library** - Render published technical notes with search, taxonomy, series, archive, related articles, and SEO metadata. (completed 2026-07-07)
- [x] **Phase 5: Interaction Polish and Verification** - Refine motion, mobile behavior, performance, and end-to-end verification for release. (completed 2026-07-11)

## Phase Details

### Phase 1: Visual Foundation and Public Shell

**Goal:** The public app has a distinctive technical-lab first impression, responsive shell, personal programmer profile, and visual-effect foundation that does not compromise readability.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Nothing (first phase)
**Requirements:** VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):

  1. Visitor can open the homepage and immediately understand the owner's programmer identity and primary content routes.
  2. Homepage includes an immersive technical-lab background or effect layer with clear fallback behavior.
  3. Flowing-light/glow styling is applied consistently to core public UI surfaces without reducing text contrast.
  4. Public shell works on desktop and mobile with no text overlap, and reduced-motion mode removes nonessential motion.
  5. Article/layout placeholders remain readable before visual effects hydrate.

**Plans:** 7/7 plans complete

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Verify and approve the exact current npm package set before any install.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Scaffold Next.js tooling, Tailwind tokens, and the RED skeleton browser proof.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-03-PLAN.md — Implement the isolated walking-skeleton probe from browser UI to API to local runtime data.
- [x] 01-04-PLAN.md — Build configurable public shell, route config, header, mobile navigation, and footer.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — Build homepage identity, lab index, reading preview, and public route empty states.

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — Implement homepage-only signal network effect, glow system, mobile/reduced-motion safeguards, and browser verification.

**Wave 6** *(blocked on Wave 5 completion)*

- [x] 01-07-PLAN.md — Run final automated and human verification for the Phase 1 public visual shell.

### Phase 2: Data Model and Admin Access

**Goal:** The app has a durable content model, database access, and single-admin authentication boundary that protects admin pages and backend mutations.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Phase 1
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria** (what must be TRUE):

  1. Administrator can log in and reach a protected admin area.
  2. Unauthenticated visitors cannot access admin pages.
  3. Server-side mutation boundaries reject unauthenticated create, edit, delete, publish, and unpublish attempts.
  4. Content models exist for posts, tags, categories, series, and publication status.
  5. The auth model remains single-admin for v1 and does not introduce multi-author roles.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Add Prisma/PostgreSQL schema, package/script setup, and schema push/generate gate.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 02-02-PLAN.md — Implement custom Prisma-backed single-admin login/session flow and protected admin layout.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 02-03-PLAN.md — Add reusable mutation guards and unauthenticated create/edit/delete/publish/unpublish boundary tests.

### Phase 3: Markdown Authoring Workflow

**Goal:** As a site administrator, I want to write and manage technical notes in a protected Markdown backend with a rendered WYSIWYG authoring canvas, so that I can reliably draft, edit, organize, and publish technical notes.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Phase 2
**Requirements:** CMS-01, CMS-02, CMS-03, CMS-04, CMS-07, EDIT-01, EDIT-02, EDIT-03, EDIT-04, TAX-01, TAX-02, TAX-03, TAX-04, QUAL-01
**Success Criteria** (what must be TRUE):

  1. Administrator can create, edit, delete, and save draft articles with required metadata.
  2. Markdown-backed WYSIWYG editor supports a rendered article canvas with article-like typography, code blocks, tables, and image URL insertion.
  3. Article form validates required fields, slug format, duplicate slugs, and publication-ready metadata.
  4. Administrator can assign tags, category, optional series, and series order while editing.
  5. Public bundles do not load admin-only editor code, unsupported Markdown is blocked from the WYSIWYG editor instead of silently losing content, and public Markdown rendering prevents unsafe raw HTML.

**Plans:** 3/3 plans complete

Plans:
**Wave 1**

- [x] 03-01: Build admin post list and article form with create, edit, delete, and draft save.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 03-02: Integrate the first Markdown editor/preview path, validation, and safe Markdown rendering utilities. Superseded in the admin UI by the 2026-07-09 Tiptap WYSIWYG editor cutover.

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 03-03: Add tag/category/series assignment and series ordering in the admin workflow.

### Phase 4: Public Content Library

**Goal:** Published technical notes are visible across the full public reading experience: article pages, lists, taxonomy, series, archive, search, related articles, and metadata.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Phase 3
**Requirements:** READ-01, READ-02, READ-03, READ-04, READ-05, READ-06, READ-07, ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, ORG-06, SRCH-01, SRCH-02, SRCH-03, CMS-05, CMS-06, TAX-05, QUAL-04
**Success Criteria** (what must be TRUE):

  1. Published posts appear on article list/detail pages with Markdown content, code highlighting, TOC, reading time, and SEO/share metadata.
  2. Visitors can browse published posts by tag, category, archive date, and ordered series.
  3. Visitors can search published posts and see contextual results without drafts appearing.
  4. Article pages show related published articles and series previous/next navigation when applicable.
  5. Publishing, unpublishing, and editing update affected public pages, indexes, and taxonomy surfaces.

**Plans:** 11/11 plans complete

Plans:

**Wave 1**

- [x] 04-01-PLAN.md — Verify Shiki package legitimacy before any syntax-highlighting install.
- [x] 04-06-PLAN.md — Add the featured schema field, migration, Prisma schema push, and generated client updates.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02-PLAN.md — Install approved rendering dependencies and create the public query, Markdown, metadata, and fixture foundation.

**Wave 3** *(blocked on 04-02 completion)*

- [x] 04-03-PLAN.md — Build the public notes list route, dense note cards, fallback visuals, and list empty states.

**Wave 4** *(blocked on 04-03 completion)*

- [x] 04-09-PLAN.md — Build the public article detail route with Markdown, code highlighting, TOC, reading time, and metadata.

**Wave 5** *(blocked on 04-09 completion)*

- [x] 04-04-PLAN.md — Add organization browsing coverage and shared tag/category/archive/series display components.

**Wave 6** *(blocked on 04-04 completion)*

- [x] 04-10-PLAN.md — Wire tag, category, archive, series index, and series detail routes with published-only filtering.

**Wave 7** *(blocked on 04-10 and 04-06 completion as applicable)*

- [x] 04-05-PLAN.md — Wire previous/next series navigation into article detail pages.
- [x] 04-07-PLAN.md — Implement protected publish/unpublish/featured controls and public revalidation.

**Wave 8** *(blocked on 04-05 and 04-07 completion)*

- [x] 04-08-PLAN.md — Add public search and homepage featured modules with published-only visibility checks.

**Wave 9** *(blocked on 04-08 completion)*

- [x] 04-11-PLAN.md — Add related articles and final cross-surface public visibility verification.

### Phase 5: Interaction Polish and Verification

**Goal:** As a site owner preparing the blog for public release, I want to verify the complete reader and administrator workflows, responsive visuals, and reduced-motion behavior with reproducible evidence, so that the MVP can be released reliably.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Phase 4
**Requirements:** QUAL-05
**Success Criteria** (what must be TRUE):

  1. Core public flows are verified: homepage, article reading, taxonomy browsing, series navigation, archive, search, and related articles.
  2. Core admin flows are verified: login, create, edit, preview, draft, publish, unpublish, delete, and taxonomy/series assignment.
  3. Desktop and mobile visual checks confirm no incoherent overlap, blank effect layers, or unreadable text.
  4. Reduced-motion behavior and animation performance are verified for homepage and article pages.
  5. Release documentation records remaining v2 deferrals and verification evidence.

**Plans:** 5/5 plans complete

Plans:

- [x] 05-01-PLAN.md
- [x] 05-02-PLAN.md
- [x] 05-03-PLAN.md
- [x] 05-04-PLAN.md
- [x] 05-05-PLAN.md

**Wave 1**

- [x] 05-01: Establish production scripts, health checks, CI, and a clean application dependency graph.

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 05-02: Close Phase 3 authoring evidence gaps and record fresh verification.
- [x] 05-03: Document environment, production operation, and PostgreSQL backup/recovery.

**Wave 3** *(blocked on Waves 1-2 completion)*

- [x] 05-04: Capture current responsive and reduced-motion visual evidence with a freshness manifest.

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 05-05: Publish the final release report and validate every local evidence link.

### Phase 6: Brand, Homepage, and Secure Authoring Upgrade

**Goal:** As the site owner, I want the blog to use the final brand and original artwork while the administrator can import Markdown and author rich technical notes with secure local images, so the revised product is ready for a fresh release verification.
**Mode:** mvp
**UI hint**: yes
**Depends on:** Phase 5
**Requirements:** VIS-06, EDIT-05, EDIT-06, EDIT-07, QUAL-06
**Success Criteria** (what must be TRUE):

  1. All current public/admin brand surfaces say `Hans‘s Blog`, the homepage reading-preview block is absent, and desktop/mobile/fallback mecha assets are original and responsive.
  2. The editor supports bold, ordered/unordered lists, body/H1-H4, safe preset text tones, code blocks, and Markdown round trips without allowing raw HTML.
  3. A modal accepts local selection, drag/drop, and paste; the server authenticates before parsing, validates signatures/dimensions, strips metadata, transcodes to WebP, and stores bytes durably in PostgreSQL.
  4. A local Markdown file can populate a new draft atomically after bounded parsing and compatibility validation; import never publishes content.
  5. Unit, Prisma, build, source/dependency security, headed browser, production smoke, and current responsive visual checks pass, with external provider controls still reported honestly.

**Plans:** 4/4 plans complete

Plans:

- [x] 06-01-PLAN.md — Final brand, homepage simplification, and original visual assets.
- [x] 06-02-PLAN.md — Markdown-backed editor formatting, safe text tones, and local Markdown import.
- [x] 06-03-PLAN.md — Guard-first PostgreSQL image upload, modal, drag/drop, and paste.
- [x] 06-04-PLAN.md — Full security, browser, responsive visual, and release reverification.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Visual Foundation and Public Shell | 7/7 | Complete    | 2026-07-01 |
| 2. Data Model and Admin Access | 3/3 | Complete    | 2026-07-03 |
| 3. Markdown Authoring Workflow | 3/3 | Complete    | 2026-07-06 |
| 4. Public Content Library | 11/11 | Complete    | 2026-07-07 |
| 5. Interaction Polish and Verification | 5/5 | Complete   | 2026-07-11 |
| 6. Brand, Homepage, and Secure Authoring Upgrade | 4/4 | Technical Complete | 2026-07-12 |

## Coverage

| Phase | Requirement Count | Requirements |
|-------|-------------------|--------------|
| 1 | 7 | VIS-01, VIS-02, VIS-03, VIS-04, VIS-05, QUAL-02, QUAL-03 |
| 2 | 4 | AUTH-01, AUTH-02, AUTH-03, AUTH-04 |
| 3 | 14 | CMS-01, CMS-02, CMS-03, CMS-04, CMS-07, EDIT-01, EDIT-02, EDIT-03, EDIT-04, TAX-01, TAX-02, TAX-03, TAX-04, QUAL-01 |
| 4 | 20 | READ-01, READ-02, READ-03, READ-04, READ-05, READ-06, READ-07, ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, ORG-06, SRCH-01, SRCH-02, SRCH-03, CMS-05, CMS-06, TAX-05, QUAL-04 |
| 5 | 1 | QUAL-05 |
| 6 | 5 | VIS-06, EDIT-05, EDIT-06, EDIT-07, QUAL-06 |

**Coverage:**

- v1 requirements: 51 total
- Mapped to phases: 51
- Unmapped: 0

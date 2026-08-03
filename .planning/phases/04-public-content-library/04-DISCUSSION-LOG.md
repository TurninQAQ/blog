# Phase 4: Public Content Library - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06T16:29:13+08:00
**Phase:** 4-Public Content Library
**Areas discussed:** Publish visibility, Article list and detail, Tags/categories/archive/series, Search and related articles, Homepage and empty states, Performance/mobile/verification

---

## Publish Visibility

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should `publishedAt` be handled when publishing? | Preserve first publish time; Refresh on every publish; Administrator manually sets publish time | Preserve first publish time |
| How should public detail pages behave for unpublished posts? | Always 404; Show "article unpublished"; Redirect to `/notes` | Always 404 |
| How should `ARCHIVED` be used in v1? | Keep reserved and public behavior only uses `DRAFT`/`PUBLISHED`; Unpublish to `ARCHIVED`; Archived remains public but hidden from lists | Keep reserved and public behavior only uses `DRAFT`/`PUBLISHED` |
| How should public pages update after editing a published post? | Save immediately updates public content; Editing returns post to draft; Add draft/published versions | Save immediately updates public content |

**User's choice:** `1.A 2.A 3.A 4.A`
**Notes:** Public visibility must not leak unpublished slugs. Unpublish returns to draft for v1.

---

## Article List and Detail

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| What layout should `/notes` use? | Information-dense article list; Large card grid; Timeline | Information-dense article list |
| Where should article TOC live? | Desktop right sticky TOC and mobile content-flow TOC; Static TOC before body only; No TOC | Desktop right sticky TOC and mobile content-flow TOC |
| How should code highlighting work? | Server-side Shiki with horizontally scrollable code blocks; Client-side highlighting; Plain CSS code blocks | Server-side Shiki with horizontally scrollable code blocks |
| How should article covers work? | Optional cover with CSS visual fallback; Require cover to publish; No cover on detail page | Optional cover with CSS visual fallback |

**User's choice:** "全部按推荐"
**Notes:** Reading pages should support technical-note scanning without sacrificing readability.

---

## Tags, Categories, Archive, and Series

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should tag and category pages be routed? | `/tags/[slug]` and `/categories/[slug]`; Only `/notes?tag=...&category=...`; Both | `/tags/[slug]` and `/categories/[slug]` |
| How should `/archive` group posts? | Year and month; Year only; Specific-date timeline | Year and month |
| What should `/series` entry show? | Series list with published-post count and latest update; Only series names and descriptions; Expand articles under each series | Only series names and descriptions |
| How should series detail pages sort and navigate? | `seriesOrder` ascending plus previous/next article navigation; Publish-date order; Drag-and-drop order | `seriesOrder` ascending plus previous/next article navigation |

**User's choice:** "3选b，其他按推荐"
**Notes:** The entry page should stay simple, while series detail and article detail provide ordered navigation.

---

## Search and Related Articles

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should `/search` be implemented? | Database-side simple search; Fuse.js client search; Dedicated search engine | Database-side simple search |
| What should search results show? | Title, excerpt, publish date, category, tags, reading time; Title and excerpt only; Body hit snippets | Title, excerpt, publish date, category, tags, reading time |
| How should related articles be selected? | Series first, then shared tags, then same category; Tags only; Category only | Series first, then shared tags, then same category |
| Where should related articles appear? | Article bottom, max 3; Right-side rail; Article bottom, max 6 | Right-side rail |

**User's choice:** "4选b，其他按推荐"
**Notes:** Right rail must handle both TOC and related articles: TOC first, related articles below on desktop; both move into content flow on mobile.

---

## Homepage and Empty States

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| Should the homepage connect to real content? | Latest 3 published posts; Keep homepage as identity and route entry only; Featured articles | Featured articles |
| How should homepage content modules change? | Replace "not connected" copy with real stats and content; Keep modules and change copy only; Delete content modules | Replace "not connected" copy with real stats and content |
| What should public pages show when no posts are published? | Chinese empty states with no public admin hints; Tell admin to publish; Show draft previews | Chinese empty states with no public admin hints |
| Should the app generate seed/example articles? | Do not generate fake articles; Generate one demo technical note; Test-only seed | Do not generate fake articles |

**User's choice:** `1C,2A,3A,4A`
**Notes:** Featured posts require a real model field and admin editor control. Latest posts must not be presented as featured posts.

---

## Performance, Mobile, and Verification

| Question | Options Presented | Selected |
|----------|-------------------|----------|
| How should article-page motion be controlled? | Lightweight glow/border/hover only; Obvious dynamic background; Remove all reading-page effects | Lightweight glow/border/hover only |
| How should mobile article side information degrade? | TOC, related articles, and series navigation enter content flow; Hide TOC and related articles; Keep side rail with horizontal scrolling | TOC, related articles, and series navigation enter content flow |
| What should Phase 4 automated verification emphasize? | Public visibility, reading rendering, and no draft leakage; Mostly screenshots; Core happy path only | Public visibility, reading rendering, and no draft leakage |
| How should publish/unpublish freshness work? | Live database reads by default, add `revalidatePath` only if needed; Heavy static cache plus precise revalidation; Fully client-side fetching | Live database reads by default, add `revalidatePath` only if needed |

**User's choice:** "全部按推荐"
**Notes:** Public correctness and no draft leakage are higher priority than aggressive caching in v1.

## The Agent's Discretion

- Exact component and helper names.
- Exact Chinese empty-state copy and visual fallback details.
- Exact Shiki theme and TOC heading depth.
- Exact implementation split between public query helpers and route components.

## Deferred Ideas

- Dedicated search engine.
- Client-side Fuse.js search index.
- Separate draft/published article versions.
- Manual publish-date editing.
- Required cover images and media upload/storage.
- Drag-and-drop series ordering.
- Fake or seed public articles for the real app.

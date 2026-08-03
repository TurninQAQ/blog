# Personal Tech Lab Blog

## What This Is

A programmer-focused personal blog for publishing and organizing technical notes. The public experience should feel like a "technical lab": a strong personal technical identity on the homepage, immersive visual effects, and interactive ambience that makes the site memorable.

The product is not just a static blog. v1 includes a single-admin writing backend with a Markdown-backed WYSIWYG editor, so articles can be drafted, edited, published, searched, grouped into series, and archived from the app itself.

## Core Value

Publish technical notes through a visually distinctive developer blog that feels memorable on entry and remains useful for reading, searching, and revisiting technical content.

## Requirements

### Validated

- [x] The homepage presents a strong programmer identity and technical profile before leading into content. Validated in Phase 1: Visual Foundation and Public Shell.
- [x] The visual system creates a "technical lab" feel with an immersive static fallback, homepage-only 2D signal network, flowing/glow styling, mobile safeguards, and reduced-motion behavior. Validated in Phase 1: Visual Foundation and Public Shell.
- [x] The Phase 1 public shell works on desktop and mobile without visual effects harming readability or performance. Validated in Phase 1: Visual Foundation and Public Shell.
- [x] A single administrator can log in to a protected backend. Validated in Phase 2: Data Model and Admin Access.
- [x] The backend provides a Markdown-backed WYSIWYG writing canvas for technical notes. Validated in Phase 3 and the 2026-07-09 WYSIWYG editor cutover.
- [x] The article system supports title, body, cover URL, tags, categories, draft/published status, and publishing workflow. Validated across Phase 3 and Phase 4.
- [x] The public blog supports technical article reading with code highlighting, table of contents, reading time, related articles, search, series, and archive views. Validated in Phase 4: Public Content Library.

### Active

- [ ] The complete content and admin experience works well on desktop and mobile without visual effects harming readability or performance.

### Out of Scope

- Multi-author publishing - this is a personal blog v1; single-admin workflow is enough.
- Public comments and community features - useful later, but not needed for the core writing and reading loop.
- Native mobile app - responsive web is sufficient for v1.
- External content-source sync from Notion, Yuque, GitHub, or similar tools - v1 owns content in the app/backend.
- MDX component embedding in articles - powerful, but higher complexity than the confirmed Markdown editor requirement.
- Full CMS/team editorial workflow - too heavy for a personal technical notebook.

## Context

The user is a programmer who wants a personal blog for recording technical notes. The site should look cooler and more interactive than a typical minimalist blog, with strong visual effects, streaming/glowing motion, and an immersive first impression.

Confirmed direction from questioning:

- Experience direction: technical lab.
- Content shape: Markdown technical notes.
- v1 priority: visual impact.
- Interaction emphasis: immersive background effects.
- Homepage focus: personal technical profile.
- Publishing model: browser-based backend management.
- Editor: Markdown-backed WYSIWYG editor with rendered article canvas; raw Markdown remains the persisted storage format.
- Content capability: full technical content library, including search, series, and archive.
- Admin model: single administrator login.

The product should balance visual distinction with long-term utility. Effects should support the identity of the site, not make articles hard to read or the app slow.

## Current State

Phases 1 through 4 are complete. The app now has the verified technical-lab public shell, custom single-admin authentication, Prisma/PostgreSQL content models, protected admin article management, a Markdown-backed Tiptap WYSIWYG editor, public published-only article routes, code-highlighted Markdown rendering, taxonomy/archive/series/search/related-article surfaces, publish/unpublish controls, and public revalidation. Phase 5 remains the release-readiness phase for final interaction polish, responsive verification, reduced-motion checks, and release notes.

## Constraints

- **Audience**: The primary user is the site owner as writer; public visitors are readers of technical notes - v1 should optimize for this single-author loop.
- **Content format**: Markdown is the default writing format - because technical notes need code blocks, headings, structure, and low-friction editing.
- **Admin access**: One protected administrator account is enough - because multi-user roles are out of scope.
- **Performance**: Visual effects must remain responsive and degrade gracefully - because a blog must stay readable on common desktop and mobile devices.
- **Scope**: v1 includes a real backend/admin workflow - because the user selected browser-based article management instead of repository-only Markdown files.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Build a technical-lab style blog rather than a plain article site | The user wants a cool, interactive, programmer-oriented identity with memorable visual effects | Validated in Phase 1 public shell |
| Use Markdown-backed WYSIWYG authoring for backend writing | The user selected a Typora-like writing experience where the article canvas is edited directly while Markdown remains the storage format | Implemented in Phase 3 post-phase cutover |
| Include single-admin authentication in v1 | The user wants browser-based publishing while keeping the site personal | Validated in Phase 2 |
| Prioritize immersive background effects for v1 visual impact | The user selected visual impact and immersive effects as the first-release emphasis | Validated in Phase 1 via static lab fallback and 2D signal network |
| Include full content-library features in v1 | The user selected search, series, archive, code highlighting, TOC, reading time, and related articles | Validated in Phase 4 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `$gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `$gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-01 after Phase 1 completion*

# Phase 01: visual-foundation-and-public-shell - Research

**Researched:** 2026-06-30  
**Domain:** Next.js public shell, Tailwind v4 design tokens, responsive frontend effects, accessibility, and browser verification  
**Confidence:** MEDIUM

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
## Implementation Decisions

### Public Identity Copy

- **D-01:** Use an English/Chinese mixed personal brand direction, such as `Hans' Tech Lab` / `Hans 的技术实验室`. Keep owner/name configurable; do not hard-code `Personal Tech Lab` as the final brand.
- **D-02:** Hero support copy should use a lab-exploration tone: a digital lab for code notes, system sketches, and experiments in building software.
- **D-03:** Only include Email in the first viewport for Phase 1. Use `zhdydkdh@163.com`. Do not include GitHub, RSS, or Projects placeholders in the hero.
- **D-04:** Use mixed English and Chinese on the homepage. Main title and CTA can be English; supporting explanations and empty states may include Chinese for readability.

### Background Personality

- **D-05:** Use a Signal network background: nodes, connecting lines, pulse signals, and slight mouse attraction. It should feel like system topology or a distributed network.
- **D-06:** Motion intensity should be Ambient subtle: slow drift and occasional pulses. Prioritize stable hero readability over spectacle.
- **D-07:** Use Light attraction on desktop: nearby nodes subtly move toward the pointer or connected lines brighten. Do not use pointer-follow behavior on mobile.
- **D-08:** The signal network should feel like a Data pulse field: fewer nodes, with emphasis on pulses flowing along connections like packet or data transmission.

### Placeholder Content Style

- **D-09:** Homepage preview cards should be System placeholders, not fake articles. Cards should represent content/system modules such as Notes, Series, and Archive, and make clear that real content will connect later.
- **D-10:** Module placeholder copy should use an Editorial tone. The cards should read like content-column descriptions, not fake articles and not overly console-like jargon.
- **D-11:** Placeholder route empty states on `/notes`, `/series`, `/archive`, and `/search` should be Chinese-first so Chinese readers understand immediately. Homepage copy can remain mixed English/Chinese.
- **D-12:** The code/prose reading preview should be a generic preview that demonstrates code block and technical-note typography without implying a real article exists.

### Navigation Priority

- **D-13:** Primary CTA points to Notes. Keep `Explore Notes` as the first action even while Phase 1 only has placeholder/empty-state content.
- **D-14:** Secondary CTA should be `Open Lab Index`, jumping to the homepage route strip or index section showing Notes, Series, Archive, and Search.
- **D-15:** Header navigation order is Notes / Series / Archive / Search.
- **D-16:** Mobile menu uses the same order as the header: Notes / Series / Archive / Search.

### the agent's Discretion
- Choose exact final phrasing for mixed English/Chinese supporting copy as long as it follows the decisions above and the approved UI-SPEC.
- Choose the exact signal-node animation implementation within the UI-SPEC limits: CSS + 2D Canvas + Motion, no Three.js/R3F in Phase 1.
- Choose placeholder card titles/descriptions as long as they are editorial module placeholders and cannot be mistaken for real published posts.

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within Phase 1 scope.
</user_constraints>

## Project Constraints (from AGENTS.md)

- The project is a programmer-focused personal technical lab blog with a memorable public technical identity and a later single-admin writing backend. [CITED: AGENTS.md]
- v1 optimizes for a single owner/writer and public technical-note readers; do not introduce multi-user roles in Phase 1. [CITED: AGENTS.md]
- Markdown is the default content format for future writing, but Phase 1 must not implement the editor or real article rendering. [CITED: AGENTS.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]
- Visual effects must remain responsive and degrade gracefully because public reading must stay readable on desktop and mobile. [CITED: AGENTS.md]
- v1 includes a real backend/admin workflow later, so Phase 1 should scaffold a Next.js full-stack app foundation rather than a static-only blog generator. [CITED: AGENTS.md][CITED: .planning/research/STACK.md]
- GSD workflow enforcement says direct repo edits should happen through GSD entry points unless the user explicitly bypasses them. [CITED: AGENTS.md]
- No project-local skills were found under `.codex/skills/` or `.agents/skills/`; no additional project skill rules apply. [VERIFIED: codebase grep]

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIS-01 | Visitor can see a homepage hero that clearly presents the owner as a programmer, including a concise technical profile and primary navigation into content. | Use `HeroIdentity`, configurable site copy, `Explore Notes`, and route strip in the server-rendered homepage. [CITED: .planning/REQUIREMENTS.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| VIS-02 | Visitor can experience an immersive technical-lab background on the homepage using effects such as particles, grid motion, mouse-following interaction, or parallax. | Use CSS base plus homepage-only 2D Canvas signal network; no Three.js/R3F in this phase. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| VIS-03 | Visitor can see a consistent flowing-light visual language across key UI elements such as navigation, cards, buttons, section dividers, and article feature areas. | Encode mint accent, grid, scanline, border-glow, and focus tokens in Tailwind v4 CSS variables and local primitives. [CITED: https://tailwindcss.com/docs/theme][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| VIS-04 | Visitor can use the public site on mobile without visual effects causing layout overlap, unreadable text, or broken interactions. | Cap canvas DPR and signal counts, disable pointer-follow on mobile, test 320px/390px screenshots and horizontal overflow. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |
| VIS-05 | Visitor with reduced-motion preferences receives a calmer experience where nonessential animation is disabled or simplified. | Use CSS `prefers-reduced-motion`, Motion `useReducedMotion`/`MotionConfig`, and Playwright reduced-motion emulation. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion][CITED: https://motion.dev/docs/react-use-reduced-motion][CITED: https://playwright.dev/docs/api/class-testoptions] |
| QUAL-02 | Public article pages are readable before nonessential visual effects hydrate. | Phase 1 should make all placeholders and reading preview complete in server-rendered HTML/CSS before the client canvas loads. [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| QUAL-03 | Heavy visual effects are isolated so article reading remains responsive. | Keep canvas behind the homepage hero only, load it client-side, pause hidden/offscreen animation, and do not import effect code into placeholder routes. [CITED: https://nextjs.org/docs/app/guides/lazy-loading][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API] |
</phase_requirements>

## Summary

Phase 1 should establish a runnable Next.js App Router project, a shared public shell, homepage identity, route placeholders, and the visual design tokens that later phases reuse. The codebase currently has planning artifacts only, so the planner should create the scaffold, project scripts, route group structure, global CSS tokens, and local public components from scratch. [VERIFIED: codebase grep][CITED: https://nextjs.org/docs/app/getting-started/installation]

The locked visual choice is CSS + 2D Canvas + Motion, not Three.js/R3F. The canvas belongs only to the homepage hero and must be optional: static CSS background and readable content must exist before hydration, reduced-motion must disable nonessential motion, and mobile must use lower signal counts with no pointer-follow. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]

**Primary recommendation:** Scaffold a Next.js 16 App Router shell with Tailwind v4 tokens, local semantic public components, and a dynamically mounted homepage-only signal canvas; gate latest package installs because the legitimacy seam flagged most current releases as `SUS` for very recent publication dates. [CITED: https://nextjs.org/docs/app/getting-started/project-structure][CITED: https://tailwindcss.com/docs/theme][VERIFIED: package-legitimacy]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| App scaffold, route groups, root/public layouts | Frontend Server (Next.js App Router) | Browser / Client | App Router uses file-system routing, layouts/pages are server components by default, and browser interactivity should be layered only where needed. [CITED: https://nextjs.org/docs/app/getting-started/project-structure][CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] |
| Homepage identity and placeholder public routes | Frontend Server (SSR) | Browser / Client | Identity, navigation, and empty states should render before hydration; client code only enhances menu/effects. [CITED: https://nextjs.org/docs/app/getting-started/layouts-and-pages][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| Design tokens and flowing-light visual language | Browser / Client CSS | Frontend Server | Tailwind v4 tokens live in CSS and are served with the shell; they should not require JavaScript to render. [CITED: https://tailwindcss.com/docs/theme][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| Signal network canvas | Browser / Client | Frontend Server placeholder shell | Canvas requires browser APIs, so it must mount inside a client boundary while the server shell provides the fallback background. [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |
| Reduced-motion and mobile safeguards | Browser / Client CSS/JS | Playwright verification | CSS media queries, Motion hooks, and canvas loop guards enforce the behavior; Playwright should emulate viewports and reduced motion. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion][CITED: https://motion.dev/docs/react-use-reduced-motion][CITED: https://playwright.dev/docs/api/class-testoptions] |
| Public content placeholders | Frontend Server (SSR) | Browser / Client | `/notes`, `/series`, `/archive`, and `/search` are placeholder pages in Phase 1; no data layer or CMS should be pulled forward. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/ROADMAP.md] |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `create-next-app` [WARNING: flagged as suspicious - verify before using.] | 16.2.9, modified 2026-06-29 | Scaffold App Router, TypeScript, Tailwind, ESLint, and path alias baseline. | Official Next.js getting-started flow covers creating a new app with `create-next-app`; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started][VERIFIED: package-legitimacy] |
| `next` [WARNING: flagged as suspicious - verify before using.] | 16.2.9, modified 2026-06-29 | App Router framework for layouts, public routes, metadata, and later backend/admin phases. | Official docs make layouts/pages and server/client component boundaries the standard App Router model; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started/project-structure][CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components][VERIFIED: package-legitimacy] |
| `react` [WARNING: flagged as suspicious - verify before using.] | 19.2.7, modified 2026-06-29 | UI runtime for server and client components. | Required by Next.js scaffolding; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started/installation][VERIFIED: package-legitimacy] |
| `react-dom` [WARNING: flagged as suspicious - verify before using.] | 19.2.7, modified 2026-06-29 | React DOM renderer used by Next.js. | Required by Next.js scaffolding; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started/installation][VERIFIED: package-legitimacy] |
| `typescript` [VERIFIED: npm registry] | 6.0.3, modified 2026-06-18 | Static typing for components, route config, and visual utilities. | Next.js getting-started docs explicitly support TypeScript examples; package passed legitimacy. [CITED: https://nextjs.org/docs/app/getting-started/installation][VERIFIED: npm registry] |
| `tailwindcss` [WARNING: flagged as suspicious - verify before using.] | 4.3.2, modified 2026-06-29 | Utility CSS and v4 token system. | Tailwind v4 official docs define `@theme` variables for design tokens; seam verdict is `SUS` only because the current release is too new. [CITED: https://tailwindcss.com/docs/theme][VERIFIED: package-legitimacy] |
| `@tailwindcss/postcss` [WARNING: flagged as suspicious - verify before using.] | 4.3.2, modified 2026-06-29 | Tailwind v4 PostCSS plugin for Next.js. | Official Next.js CSS docs use `@tailwindcss/postcss` in `postcss.config.mjs`; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started/css][VERIFIED: package-legitimacy] |
| `postcss` [WARNING: flagged as suspicious - verify before using.] | 8.5.16, modified 2026-06-28 | CSS transform pipeline for Tailwind. | Required by the official Tailwind/Next setup path; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started/css][VERIFIED: package-legitimacy] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `motion` [WARNING: flagged as suspicious - verify before using.] | 12.42.0, modified 2026-06-25 | Header/menu/card microinteractions and reduced-motion aware UI transitions. | Use only for small UI transitions; use CSS for simple color/glow changes and keep the canvas loop separate. [CITED: https://motion.dev/docs/react][CITED: https://motion.dev/docs/react-use-reduced-motion][VERIFIED: package-legitimacy] |
| `lucide-react` [WARNING: flagged as suspicious - verify before using.] | 1.22.0, modified 2026-06-28 | Icons for navigation, route cards, buttons, and mobile menu controls. | Use direct icon imports; official docs state imported icons are tree-shaken and customizable through props. [CITED: https://lucide.dev/guide/react][VERIFIED: package-legitimacy] |
| `@playwright/test` [WARNING: flagged as suspicious - verify before using.] | 1.61.1, modified 2026-06-30 | Browser screenshots and responsive/reduced-motion checks. | Use for UI contract verification after scaffold; seam verdict is `SUS` only because the current release is too new. [CITED: https://playwright.dev/docs/test-snapshots][CITED: https://playwright.dev/docs/api/class-testoptions][VERIFIED: package-legitimacy] |
| `eslint` [WARNING: flagged as suspicious - verify before using.] | 10.6.0, modified 2026-06-26 | Static linting. | Use via Next scaffold/lint script; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started][VERIFIED: package-legitimacy] |
| `eslint-config-next` [WARNING: flagged as suspicious - verify before using.] | 16.2.9, modified 2026-06-29 | Next.js lint rules. | Use with the generated Next lint config; seam verdict is `SUS` only because the current release is too new. [CITED: https://nextjs.org/docs/app/getting-started][VERIFIED: package-legitimacy] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS + 2D Canvas + Motion | Three.js / React Three Fiber | Deferred by locked Phase 1 decision; WebGL adds bundle/GPU risk and is explicitly out of scope for this phase. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| Local semantic components | shadcn blocks or third-party registries | UI-SPEC says shadcn is not initialized and Phase 1 must not use registry blocks. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |
| Next.js full-stack scaffold | Static-only generator | Static-only conflicts with later browser-based backend/admin workflow chosen for v1. [CITED: AGENTS.md][CITED: .planning/research/STACK.md] |
| Playwright browser checks | Manual screenshots only | UI-SPEC requires desktop/mobile/reduced-motion verification; Playwright gives repeatable viewport and media emulation. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md][CITED: https://playwright.dev/docs/test-use-options] |

**Installation:**

```bash
# Planner must add checkpoint:human-verify before installing packages flagged SUS.
npx create-next-app@16.2.9 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install motion@12.42.0 lucide-react@1.22.0
npm install -D @playwright/test@1.61.1
npx playwright install chromium
```

**Version verification:** Versions above were checked with `npm view <package> version time.modified repository.url scripts.postinstall` and `package-legitimacy check --ecosystem npm ...` on 2026-06-30. [VERIFIED: local command]

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `create-next-app` | npm | created 2017-01-14; latest current line published 2026-06-09 | 388k/wk | github.com/vercel/next.js | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `next` | npm | created 2011-07-11; latest current line published 2026-06-09 | 39.6M/wk | github.com/vercel/next.js | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `react` | npm | created 2011-10-26; latest current line published 2026-06-01 | 146.2M/wk | github.com/facebook/react | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `react-dom` | npm | created 2014-05-06; latest current line published 2026-06-01 | 138.0M/wk | github.com/facebook/react | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `typescript` | npm | created 2012-10-01; latest current line published 2026-04-16 | 217.5M/wk | github.com/microsoft/TypeScript | OK | Approved. [VERIFIED: npm registry] |
| `tailwindcss` | npm | created 2017-10-06; latest current line published 2026-06-29 | 118.2M/wk | github.com/tailwindlabs/tailwindcss | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `@tailwindcss/postcss` | npm | created 2024-02-02; latest current line published 2026-06-29 | 23.7M/wk | github.com/tailwindlabs/tailwindcss | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `postcss` | npm | created 2013-11-04; latest current line published 2026-06-28 | 249.5M/wk | github.com/postcss/postcss | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `motion` | npm | created 2013-12-26; latest current line published 2026-06-25 | 13.2M/wk | github.com/motiondivision/motion | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `lucide-react` | npm | created 2020-10-19; latest current line published 2026-06-28 | 83.8M/wk | github.com/lucide-icons/lucide | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `@playwright/test` | npm | created 2020-09-24; latest current line published 2026-06-23 | 40.8M/wk | github.com/microsoft/playwright | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `eslint` | npm | created 2013-07-04; latest current line published 2026-06-26 | 138.6M/wk | github.com/eslint/eslint | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |
| `eslint-config-next` | npm | created 2015-09-21; latest current line published 2026-06-09 | 22.3M/wk | github.com/vercel/next.js | SUS: too-new | Flagged - planner must add checkpoint before install. [VERIFIED: package-legitimacy] |

**Packages removed due to [SLOP] verdict:** none. [VERIFIED: package-legitimacy]  
**Packages flagged as suspicious [SUS]:** `create-next-app`, `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `motion`, `lucide-react`, `@playwright/test`, `eslint`, `eslint-config-next`. [VERIFIED: package-legitimacy]

*Packages flagged `SUS` were flagged for too-new current releases, not missing packages, low downloads, missing repositories, or risky postinstall scripts; the planner must still add a `checkpoint:human-verify` before each install per GSD package policy. [VERIFIED: package-legitimacy]*

## Architecture Patterns

### System Architecture Diagram

```text
+-----------------------------+
| Reader opens public route   |
+--------------+--------------+
               |
               v
+-----------------------------+
| Next.js App Router           |
| app/(public)/layout.tsx      |
| app/(public)/page.tsx        |
| app/(public)/notes|series... |
+--------------+--------------+
               |
               v
+-----------------------------+        +-----------------------------+
| Server-rendered public shell |        | Static CSS visual base      |
| Header, hero, routes, cards  +------->| Tailwind @theme tokens      |
| empty states, reading shell  |        | grid/scanline/fallback bg   |
+--------------+--------------+        +-----------------------------+
               |
               v
+-----------------------------+
| Client enhancement boundary  |
| MobileNav + Motion states    |
| homepage Canvas mount only   |
+--------------+--------------+
               |
       +-------+--------+
       |                |
       v                v
+--------------+  +----------------------+
| Reduced       |  | Canvas allowed       |
| motion/mobile |  | desktop/tablet hero  |
| static only   |  | DPR/count capped     |
+--------------+  +----------------------+
```

### Recommended Project Structure

```text
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx          # PublicShell wrapper for homepage and placeholders
│   │   ├── page.tsx            # Homepage identity, route strip, previews
│   │   ├── notes/page.tsx      # Chinese-first placeholder empty state
│   │   ├── series/page.tsx     # Chinese-first placeholder empty state
│   │   ├── archive/page.tsx    # Chinese-first placeholder empty state
│   │   └── search/page.tsx     # Chinese-first placeholder empty state
│   ├── globals.css             # Tailwind import, @theme tokens, static visual base
│   └── layout.tsx              # Root html/body metadata shell
├── components/
│   ├── public/
│   │   ├── PublicShell.tsx
│   │   ├── SiteHeader.tsx
│   │   ├── MobileNav.tsx
│   │   ├── HeroIdentity.tsx
│   │   ├── ContentRouteStrip.tsx
│   │   ├── FeaturedNoteCard.tsx
│   │   ├── ArticlePreviewShell.tsx
│   │   └── SiteFooter.tsx
│   └── visual/
│       ├── LabBackground.tsx          # Server-safe static base + client mount slot
│       ├── LabBackgroundClient.tsx    # "use client" dynamic import boundary
│       └── SignalNetworkCanvas.tsx    # Canvas loop and pointer/reduced-motion guards
├── config/
│   ├── site.ts                 # Brand/name/email/nav copy; keeps owner configurable
│   └── routes.ts               # Notes/Series/Archive/Search route metadata
└── tests/
    └── e2e/
        └── public-shell.spec.ts # Playwright visual/responsive checks after scaffold
```

This structure follows Next.js App Router file conventions, keeps public routes publicly accessible only where `page.tsx` exists, and isolates browser-only APIs in client components. [CITED: https://nextjs.org/docs/app/getting-started/project-structure][CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components]

### Pattern 1: Server Shell First, Effects Later

**What:** Render the public shell, route placeholders, copy, and static CSS background without relying on client JavaScript. [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components]  
**When to use:** All Phase 1 public pages, especially homepage and placeholders. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Example:**

```tsx
// Source: https://nextjs.org/docs/app/getting-started/layouts-and-pages
// src/app/(public)/layout.tsx
import { PublicShell } from "@/components/public/PublicShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
```

### Pattern 2: Client Boundary Owns Browser APIs

**What:** Keep `next/dynamic(..., { ssr: false })` inside a client component, because Next.js documents that `ssr: false` is not supported from server components. [CITED: https://nextjs.org/docs/app/guides/lazy-loading]  
**When to use:** Homepage signal canvas and mobile menu state. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Example:**

```tsx
// Source: https://nextjs.org/docs/app/guides/lazy-loading
// src/components/visual/LabBackgroundClient.tsx
"use client";

import dynamic from "next/dynamic";

const SignalNetworkCanvas = dynamic(() => import("./SignalNetworkCanvas"), {
  ssr: false,
});

export function LabBackgroundClient() {
  return <SignalNetworkCanvas />;
}
```

### Pattern 3: Tailwind v4 CSS-First Tokens

**What:** Put UI-SPEC color, font, spacing, radius, and motion tokens in `globals.css` using Tailwind v4 `@theme`; use `:root` for CSS variables that should not generate utility APIs. [CITED: https://tailwindcss.com/docs/theme]  
**When to use:** Plan 01-01 token foundation before building components. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Example:**

```css
/* Source: https://tailwindcss.com/docs/theme */
@import "tailwindcss";

@theme {
  --color-lab-base: #070a0f;
  --color-lab-surface: #111822;
  --color-lab-accent: #2ef2b5;
  --color-lab-text: #e8f0f8;
  --color-lab-muted: #728096;
  --radius-lab: 8px;
  --font-sans: var(--font-inter);
  --font-mono: var(--font-jetbrains-mono);
}

:root {
  --lab-border-hairline: rgba(168, 179, 194, 0.18);
  --lab-border-active: rgba(46, 242, 181, 0.32);
}
```

### Pattern 4: Reduced-Motion Branching in UI and Canvas

**What:** Use CSS media queries, Motion reduced-motion APIs, and canvas loop guards so decorative movement can be removed without changing layout. [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion][CITED: https://motion.dev/docs/react-use-reduced-motion]  
**When to use:** Mobile nav transitions, hover lift, scanline/glow motion, pointer-follow, and canvas animation. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Example:**

```tsx
// Source: https://motion.dev/docs/react-use-reduced-motion
"use client";

import { motion, useReducedMotion } from "motion/react";

export function MobilePanel({ open, children }: { open: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: open ? 1 : 0, y: open || reduce ? 0 : -8 }}
      transition={{ duration: reduce ? 0.08 : 0.18 }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 5: Explicit Browser Verification

**What:** Add Playwright checks after scaffold for desktop/mobile screenshots, no overflow, placeholder routes, reduced-motion behavior, and mobile menu keyboard interaction. [CITED: https://playwright.dev/docs/test-snapshots][CITED: https://playwright.dev/docs/test-use-options]  
**When to use:** Phase 1 acceptance, even though Nyquist validation is disabled in `.planning/config.json`. [VERIFIED: codebase grep][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Example:**

```ts
// Source: https://playwright.dev/docs/api/class-testoptions
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });

test("homepage is readable without horizontal overflow in reduced motion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasOverflow).toBe(false);
});
```

### Anti-Patterns to Avoid

- **Importing canvas/browser APIs from server components:** It risks server errors and breaks the SSR-first fallback. Use a client boundary. [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components]
- **Using `ssr: false` from a server component:** Next.js documents that this option is not supported from server components. Move the dynamic import into a client component. [CITED: https://nextjs.org/docs/app/guides/lazy-loading]
- **Building article/CMS features in Phase 1:** Real article data, article rendering, admin auth, editor, and CMS workflows are explicitly out of scope. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/ROADMAP.md]
- **Making the canvas define layout height:** Effects must be positioned behind content and never reserve required reading layout. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]
- **Applying hero-level motion behind prose:** Reading preview and future article pages must use low-intensity stable backgrounds. [CITED: .planning/research/PITFALLS.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Routing, layouts, placeholders | Custom router or static-only page system | Next.js App Router route groups and `page.tsx`/`layout.tsx` | App Router already defines file routing, layouts, and server/client boundaries. [CITED: https://nextjs.org/docs/app/getting-started/project-structure] |
| Design token utility generation | Ad hoc class strings and one-off CSS values | Tailwind v4 `@theme` plus UI-SPEC tokens | `@theme` maps tokens to utilities and keeps the phase contract reusable. [CITED: https://tailwindcss.com/docs/theme] |
| Icon SVGs | Manually drawn inline SVGs for common UI icons | `lucide-react` direct imports | Lucide React exports standalone, customizable, tree-shaken icon components. [CITED: https://lucide.dev/guide/react] |
| UI transition engine | Timer-based React state loops for hover/menu motion | CSS transitions and Motion for small UI transitions | Motion provides React animation primitives and reduced-motion APIs; CSS is enough for simple color/glow states. [CITED: https://motion.dev/docs/react][CITED: https://motion.dev/docs/react-accessibility] |
| Animation scheduling | `setInterval` canvas animation loop | `requestAnimationFrame` with visibility/offscreen/reduced-motion guards | `requestAnimationFrame` aligns callbacks with browser repaint and browsers pause it in hidden contexts. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame] |
| Modal/mobile menu accessibility semantics | Unchecked focus movement and inertness assumptions | WAI-ARIA dialog pattern behavior or native focus APIs implemented against the pattern | The APG specifies focus containment, Escape close, and focus return behavior for modal overlays. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/] |
| Browser visual verification | Manual visual memory | Playwright screenshots and viewport/reduced-motion emulation | Playwright supports screenshots, viewport config, and reduced-motion emulation. [CITED: https://playwright.dev/docs/test-snapshots][CITED: https://playwright.dev/docs/api/class-testoptions] |

**Key insight:** The hard part is not drawing nodes; it is keeping the public shell meaningful before JavaScript, preventing effects from affecting layout/readability, and proving mobile/reduced-motion behavior in a real browser. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md][CITED: .planning/research/PITFALLS.md]

## Common Pitfalls

### Pitfall 1: UI-SPEC Copy Conflicts with Configurable Brand Decision

**What goes wrong:** Implementation hard-codes `Personal Tech Lab` everywhere because UI-SPEC lists it as the Hero H1, ignoring CONTEXT D-01's configurable personal brand decision. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]  
**Why it happens:** The copywriting contract is concrete, while the discussion decision says the owner/name must be configurable. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]  
**How to avoid:** Create `src/config/site.ts` and source all brand/name/email/nav labels from config; default values may follow UI-SPEC but must not be duplicated across components. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]  
**Warning signs:** Brand strings repeated in multiple components or no central site config. [ASSUMED]

### Pitfall 2: Canvas Hydration Becomes Required for First Impression

**What goes wrong:** Homepage looks blank or visually broken until the canvas hydrates. [CITED: .planning/research/PITFALLS.md]  
**Why it happens:** Designers put all background affordance inside JavaScript instead of CSS. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**How to avoid:** Render static radial depth, grid, scanline, and section surfaces in CSS before mounting `SignalNetworkCanvas`. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Warning signs:** Disabling JavaScript leaves a flat empty page or a blank effect rectangle. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]

### Pitfall 3: Latest Package Versions Are Installed Without Human Checkpoint

**What goes wrong:** The plan violates GSD package policy because package legitimacy returned `SUS` for many latest releases. [VERIFIED: package-legitimacy]  
**Why it happens:** The packages are legitimate, popular packages, but the current versions were published very recently. [VERIFIED: package-legitimacy]  
**How to avoid:** Insert `checkpoint:human-verify` before installing any `SUS` package and record that postinstall scripts were absent in `npm view`. [VERIFIED: package-legitimacy]  
**Warning signs:** A task installs `next@16.2.9`, `tailwindcss@4.3.2`, `motion@12.42.0`, or `@playwright/test@1.61.1` without checkpoint text. [VERIFIED: package-legitimacy]

### Pitfall 4: Mobile Menu Looks Right but Fails Keyboard Behavior

**What goes wrong:** Mobile nav opens visually but focus escapes behind it, Escape does not close it, or focus does not return to the trigger. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/]  
**Why it happens:** Overlay styling is implemented before modal keyboard semantics. [ASSUMED]  
**How to avoid:** Implement trigger `aria-expanded`, focus containment, Escape close, close button, and focus return; verify with Playwright. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Warning signs:** `Menu` button toggles only CSS classes and no test exercises keyboard flow. [ASSUMED]

### Pitfall 5: Reduced Motion Only Disables CSS, Not Canvas

**What goes wrong:** CSS animations stop, but requestAnimationFrame canvas pulses and pointer attraction still run. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Why it happens:** CSS media queries do not automatically stop JavaScript animation loops. [CITED: https://web.dev/articles/prefers-reduced-motion]  
**How to avoid:** Check `window.matchMedia("(prefers-reduced-motion: reduce)")`, subscribe to changes, and avoid starting the canvas loop when reduction is active. [CITED: https://web.dev/articles/prefers-reduced-motion]  
**Warning signs:** Playwright with `reducedMotion: "reduce"` still observes canvas frame counters changing. [CITED: https://playwright.dev/docs/api/class-testoptions]

### Pitfall 6: Visual Effects Leak into Placeholder Routes

**What goes wrong:** `/notes`, `/series`, `/archive`, or `/search` loads homepage effect code or shows animated hero treatment behind empty states. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Why it happens:** `LabBackground` is globally mounted with canvas behavior instead of separating static shell background from homepage canvas. [ASSUMED]  
**How to avoid:** Mount static CSS globally but mount `LabBackgroundClient` only on homepage hero. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md]  
**Warning signs:** Placeholder route bundles import `SignalNetworkCanvas` or effect code. [ASSUMED]

## Code Examples

Verified patterns from official sources:

### Site Config Boundary

```ts
// Source: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md
export const siteConfig = {
  brand: {
    en: "Hans' Tech Lab",
    zh: "Hans 的技术实验室",
  },
  email: "zhdydkdh@163.com",
  nav: [
    { href: "/notes", label: "Notes" },
    { href: "/series", label: "Series" },
    { href: "/archive", label: "Archive" },
    { href: "/search", label: "Search" },
  ],
} as const;
```

### Canvas Loop Guard

```ts
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dprCap = window.innerWidth < 768 ? 1 : 1.5;
const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
let frame = 0;
let running = !reduceMotion.matches && document.visibilityState === "visible";

function draw(time: number) {
  if (!running) return;
  // draw nodes, connections, and pulse positions using cached arrays
  frame = window.requestAnimationFrame(draw);
}

document.addEventListener("visibilitychange", () => {
  running = !reduceMotion.matches && document.visibilityState === "visible";
  if (running && frame === 0) frame = window.requestAnimationFrame(draw);
  if (!running && frame !== 0) {
    window.cancelAnimationFrame(frame);
    frame = 0;
  }
});

if (running) frame = window.requestAnimationFrame(draw);
```

### Mobile Dialog Semantics Checklist

```tsx
// Source: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
<button aria-expanded={open} aria-controls="mobile-nav" aria-label="Open navigation">
  <Menu aria-hidden="true" />
</button>

{open ? (
  <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navigation">
    <button aria-label="Close navigation">
      <X aria-hidden="true" />
    </button>
    <nav aria-label="Mobile navigation">{/* same Notes / Series / Archive / Search order */}</nav>
  </div>
) : null}
```

### Playwright Reduced-Motion Project

```ts
// Source: https://playwright.dev/docs/test-use-options
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } } },
    { name: "reduced-motion", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } },
  ],
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind v3 config-first theme customization | Tailwind v4 CSS-first `@theme` variables | Tailwind v4 era; docs current in 2026 | Put design tokens in CSS and avoid assuming a large `tailwind.config.js` is required. [CITED: https://tailwindcss.com/docs/theme] |
| Pages Router layout conventions | App Router `app/` with layouts/pages and server/client components | App Router current docs | Use route groups and server-rendered layouts for the public shell. [CITED: https://nextjs.org/docs/app/getting-started/project-structure] |
| Global client app shell by default | Server components by default with client components for browser APIs | App Router current docs | Browser APIs, state, event handlers, and canvas belong behind `use client` boundaries. [CITED: https://nextjs.org/docs/app/getting-started/server-and-client-components] |
| Animation-only visual acceptance | Browser-verified responsive/reduced-motion acceptance | Playwright current docs and UI-SPEC | Add viewport screenshots, overflow checks, and media emulation. [CITED: https://playwright.dev/docs/test-snapshots][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |

**Deprecated/outdated:**
- Tailwind v3-only assumptions about `tailwind.config.js` as the primary token home are outdated for this v4 phase; use `@theme` unless a later need requires config. [CITED: https://tailwindcss.com/docs/theme]
- Three.js/R3F for Phase 1 visual foundation is out of scope by user decision, even though project-level stack research keeps it as a later option. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: .planning/research/STACK.md]
- Middleware terminology may be stale in Next.js 16 docs; Next now calls it Proxy, but Phase 1 should not need Proxy. [CITED: https://nextjs.org/docs/app/getting-started/proxy]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Repeated hard-coded brand strings are the main implementation warning sign for the configurable-brand decision. | Common Pitfalls | Planner may under-specify site config tasks. |
| A2 | Mobile overlay keyboard failures usually happen when visual styling is implemented before modal semantics. | Common Pitfalls | Planner may omit focus-management tasks and tests. |
| A3 | Placeholder routes may import canvas code if static and canvas backgrounds are not separated. | Common Pitfalls | Planner may miss bundle/readability isolation checks. |

## Open Questions (Resolved)

1. **Exact final brand string**
   - What we know: CONTEXT D-01 gives examples like `Hans' Tech Lab` / `Hans 的技术实验室` and requires owner/name configurability. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]
   - What's unclear: Whether `Hans` is the final display owner name or only an example. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]
   - RESOLVED: Phase 1 will create a configurable `siteConfig` copy boundary. Initial defaults are `Hans' Tech Lab`, `Hans 的技术实验室`, owner/name fields based on `Hans`, and email `zhdydkdh@163.com`, matching D-01 and D-03 while keeping the brand editable in one file. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md]

2. **Latest-version checkpoint outcome**
   - What we know: npm versions are current and popular, but most latest package releases were flagged `SUS` for too-new publication. [VERIFIED: package-legitimacy]
   - What's unclear: Whether the human checkpoint will approve latest versions or prefer pinning to older patch lines. [VERIFIED: package-legitimacy]
   - RESOLVED: Execution must run a blocking package checkpoint before any install. The checkpoint must verify every `SUS` package separately with exact `pkg@version` strings using `npm view "$pkg" name version repository.url scripts.postinstall`, then request human approval for the pinned set before installation. [VERIFIED: package-legitimacy]

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next.js scaffold/build/dev server | yes | v22.23.1 | none needed. [VERIFIED: local command] |
| npm | Package install and scripts | yes | 10.9.8 | none needed; pnpm/yarn are absent. [VERIFIED: local command] |
| npx | Playwright browser install command | yes | 10.9.8 | use local `node_modules/.bin/playwright` after install. [VERIFIED: local command] |
| Git | GSD doc commit and repo workflow | yes | 2.43.0 | none needed. [VERIFIED: local command] |
| Playwright CLI | Browser verification | no | not installed | Install `@playwright/test` and run `npx playwright install chromium`. [VERIFIED: local command] |
| Chromium/Chrome browser binary | Playwright screenshots | no | not installed | Playwright-managed Chromium after install. [VERIFIED: local command] |
| PostgreSQL | Later backend/auth phases | not required | n/a | Do not introduce in Phase 1. [CITED: .planning/ROADMAP.md] |

**Missing dependencies with no fallback:** none for planning; browser verification requires installing Playwright dependencies during implementation. [VERIFIED: local command]  
**Missing dependencies with fallback:** Playwright CLI/browser are absent before scaffold; install them as Phase 1 dev dependencies. [VERIFIED: local command]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Phase 1 has no admin/auth routes; defer to Phase 2. [CITED: .planning/ROADMAP.md] |
| V3 Session Management | no | Phase 1 has no sessions; defer to Phase 2. [CITED: .planning/ROADMAP.md] |
| V4 Access Control | no | Phase 1 has no protected resources or mutations; later admin routes must enforce server-side checks. [CITED: .planning/ROADMAP.md][CITED: .planning/research/PITFALLS.md] |
| V5 Input Validation | yes, narrow | Route placeholders and mailto/static links should not parse user-controlled data; if search input exists as a placeholder, keep it inert or validate locally without backend behavior. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: https://owasp.org/www-project-application-security-verification-standard/] |
| V6 Cryptography | no | No cryptographic functions in Phase 1; do not introduce custom crypto. [CITED: .planning/ROADMAP.md] |

OWASP ASVS provides a basis for testing web application technical security controls, and the current stable ASVS version listed by OWASP is 5.0.0. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Known Threat Patterns for Next.js Public Shell

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS through future content surfaces | Tampering | Phase 1 must not render raw article data or unsafe HTML; later Markdown phases need sanitization. [CITED: .planning/ROADMAP.md][CITED: .planning/research/PITFALLS.md] |
| Link spoofing / misleading placeholders | Spoofing | Route cards must be real links to placeholder routes and clearly state no content is published yet. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md] |
| Client-side CPU/battery abuse from unbounded canvas | Denial of Service | Cap DPR and particle counts, pause when hidden/offscreen, and disable in reduced motion. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md][CITED: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API] |
| Accessibility denial for keyboard/mobile users | Denial of Service | Implement mobile menu focus containment, Escape close, visible focus rings, and 44px tap targets. [CITED: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/][CITED: .planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md] |

## Sources

### Primary (HIGH confidence)
- `.planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md` - locked user decisions, phase boundary, and no-Three.js decision. [VERIFIED: codebase grep]
- `.planning/phases/01-visual-foundation-and-public-shell/01-UI-SPEC.md` - approved UI contract, component inventory, motion limits, responsive and accessibility checks. [VERIFIED: codebase grep]
- `.planning/REQUIREMENTS.md` and `.planning/ROADMAP.md` - requirement IDs, Phase 1 scope, success criteria, and planned slices. [VERIFIED: codebase grep]
- npm registry commands plus package-legitimacy seam - versions, modified dates, repositories, postinstall absence, and legitimacy verdicts. [VERIFIED: package-legitimacy]

### Secondary (MEDIUM confidence)
- https://nextjs.org/docs/app/getting-started/installation - scaffold and root app setup. [CITED: nextjs.org]
- https://nextjs.org/docs/app/getting-started/project-structure - App Router folder routing, colocation, and private folder conventions. [CITED: nextjs.org]
- https://nextjs.org/docs/app/getting-started/server-and-client-components - server/client component boundaries and browser API guidance. [CITED: nextjs.org]
- https://nextjs.org/docs/app/guides/lazy-loading - dynamic imports and `ssr: false` client-component constraint. [CITED: nextjs.org]
- https://nextjs.org/docs/app/getting-started/css - Tailwind with Next.js setup using `@tailwindcss/postcss`. [CITED: nextjs.org]
- https://tailwindcss.com/docs/theme - Tailwind v4 `@theme` variables and token-to-utility behavior. [CITED: tailwindcss.com]
- https://motion.dev/docs/react and https://motion.dev/docs/react-use-reduced-motion - Motion React usage and reduced-motion hook. [CITED: motion.dev]
- https://lucide.dev/guide/react - Lucide React import, customization, and tree-shaking guidance. [CITED: lucide.dev]
- https://playwright.dev/docs/test-snapshots and https://playwright.dev/docs/api/class-testoptions - screenshot tests and reduced-motion emulation. [CITED: playwright.dev]
- https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame, https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API, https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API, and https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion - browser animation, visibility, observer, and reduced-motion APIs. [CITED: developer.mozilla.org]
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ - modal dialog keyboard and ARIA behavior. [CITED: w3.org]
- https://owasp.org/www-project-application-security-verification-standard/ - ASVS purpose and current stable version. [CITED: owasp.org]

### Tertiary (LOW confidence)
- Assumptions A1-A3 in the Assumptions Log are implementation heuristics based on frontend experience and must be validated during planning/review. [ASSUMED]

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - package names and versions were official-doc-cited and checked through npm/package-legitimacy, but many latest releases are `SUS` due to very recent publication dates. [VERIFIED: package-legitimacy]
- Architecture: HIGH - Phase 1 boundaries come directly from locked CONTEXT.md, ROADMAP.md, UI-SPEC, and current Next.js docs. [CITED: .planning/phases/01-visual-foundation-and-public-shell/01-CONTEXT.md][CITED: https://nextjs.org/docs/app/getting-started/project-structure]
- Pitfalls: MEDIUM - major risks are documented in project/UI specs and browser docs; some warning signs are implementation heuristics marked assumed. [CITED: .planning/research/PITFALLS.md][ASSUMED]

**Research date:** 2026-06-30  
**Valid until:** 2026-07-07 for package versions and latest Next/Tailwind/Motion docs; 2026-07-30 for architecture and UI constraints unless CONTEXT.md or UI-SPEC changes. [ASSUMED]

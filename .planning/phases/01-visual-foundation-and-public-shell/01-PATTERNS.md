# Phase 01: visual-foundation-and-public-shell - Pattern Map

**Mapped:** 2026-06-30
**Files analyzed:** 29
**Analogs found:** 0 / 29

The repository currently has planning artifacts only. `rg --files` found no implementation files matching TypeScript, React, CSS, Next.js config, package config, or Playwright config patterns outside `.planning/` and `AGENTS.md`. Every implementation file below is greenfield and must follow `01-CONTEXT.md`, `01-RESEARCH.md`, and `01-UI-SPEC.md` rather than copying an existing source analog.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | batch | none | greenfield |
| `package-lock.json` | config | batch | none | generated |
| `next.config.ts` | config | request-response | none | greenfield |
| `tsconfig.json` | config | transform | none | greenfield |
| `postcss.config.mjs` | config | transform | none | greenfield |
| `eslint.config.mjs` | config | batch | none | greenfield |
| `playwright.config.ts` | config | batch | none | greenfield |
| `src/app/layout.tsx` | provider/layout | request-response | none | greenfield |
| `src/app/globals.css` | config/styles | transform | none | greenfield |
| `src/app/(public)/layout.tsx` | provider/layout | request-response | none | greenfield |
| `src/app/(public)/page.tsx` | route/page | request-response | none | greenfield |
| `src/app/(public)/notes/page.tsx` | route/page | request-response | none | greenfield |
| `src/app/(public)/series/page.tsx` | route/page | request-response | none | greenfield |
| `src/app/(public)/archive/page.tsx` | route/page | request-response | none | greenfield |
| `src/app/(public)/search/page.tsx` | route/page | request-response | none | greenfield |
| `src/components/public/PublicShell.tsx` | component | request-response | none | greenfield |
| `src/components/public/SiteHeader.tsx` | component | request-response/event-driven | none | greenfield |
| `src/components/public/MobileNav.tsx` | component | event-driven | none | greenfield |
| `src/components/public/HeroIdentity.tsx` | component | request-response | none | greenfield |
| `src/components/public/ContentRouteStrip.tsx` | component | request-response | none | greenfield |
| `src/components/public/FeaturedNoteCard.tsx` | component | request-response | none | greenfield |
| `src/components/public/ArticlePreviewShell.tsx` | component | request-response | none | greenfield |
| `src/components/public/SiteFooter.tsx` | component | request-response | none | greenfield |
| `src/components/visual/LabBackground.tsx` | component | request-response | none | greenfield |
| `src/components/visual/LabBackgroundClient.tsx` | component | event-driven | none | greenfield |
| `src/components/visual/SignalNetworkCanvas.tsx` | component | streaming/event-driven | none | greenfield |
| `src/config/site.ts` | config | transform | none | greenfield |
| `src/config/routes.ts` | config | transform | none | greenfield |
| `src/tests/e2e/public-shell.spec.ts` | test | batch/browser | none | greenfield |

## Pattern Assignments

### Scaffold and Tooling Config

**Files:** `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`

**Analog:** none. Create from the Next.js App Router scaffold and keep package installs behind the required human verification checkpoint because many current package versions were flagged `SUS` for recent publication dates.

**Scaffold command pattern** (`01-RESEARCH.md` lines 127-135):

```bash
# Planner must add checkpoint:human-verify before installing packages flagged SUS.
npx create-next-app@16.2.9 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install motion@12.42.0 lucide-react@1.22.0
npm install -D @playwright/test@1.61.1
npx playwright install chromium
```

**Package checkpoint pattern** (`01-RESEARCH.md` lines 157-160):

```markdown
**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `create-next-app`, `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `motion`, `lucide-react`, `@playwright/test`, `eslint`, `eslint-config-next`.
```

### App Router Layouts and Pages

**Files:** `src/app/layout.tsx`, `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/notes/page.tsx`, `src/app/(public)/series/page.tsx`, `src/app/(public)/archive/page.tsx`, `src/app/(public)/search/page.tsx`

**Analog:** none. Use the greenfield App Router structure from research and keep pages server-rendered unless they need browser state.

**Project structure pattern** (`01-RESEARCH.md` lines 203-237):

```text
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── notes/page.tsx
│   │   ├── series/page.tsx
│   │   ├── archive/page.tsx
│   │   └── search/page.tsx
│   ├── globals.css
│   └── layout.tsx
```

**Public layout pattern** (`01-RESEARCH.md` lines 247-255):

```tsx
// src/app/(public)/layout.tsx
import { PublicShell } from "@/components/public/PublicShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
```

**Route placeholder contract** (`01-UI-SPEC.md` lines 90-92):

```markdown
- `/notes`, `/series`, `/archive`, and `/search` may be placeholder pages in Phase 1, but each must render inside the same public shell.
- Placeholder pages must use the empty-state copy in this spec and must not show broken links, fake loading spinners, or dead controls.
```

### Public Shell Components

**Files:** `src/components/public/PublicShell.tsx`, `src/components/public/SiteHeader.tsx`, `src/components/public/MobileNav.tsx`, `src/components/public/HeroIdentity.tsx`, `src/components/public/ContentRouteStrip.tsx`, `src/components/public/FeaturedNoteCard.tsx`, `src/components/public/ArticlePreviewShell.tsx`, `src/components/public/SiteFooter.tsx`

**Analog:** none. Build local semantic components; do not use shadcn blocks or third-party registries in Phase 1.

**Component inventory pattern** (`01-UI-SPEC.md` lines 236-248):

```markdown
| `PublicShell` | Shared public layout wrapper | Provides background color, header, main, footer, and content stacking |
| `LabBackground` | Ambient visual foundation | CSS base always available; optional Canvas only on homepage hero |
| `SiteHeader` | Public navigation | Sticky header, semantic nav, desktop links, mobile menu trigger |
| `MobileNav` | Small-screen navigation | Full-height panel, 44px rows, Escape/close support, focus returns to trigger |
| `HeroIdentity` | Homepage first impression | H1, concise programmer profile, CTA actions, no card wrapper |
| `ContentRouteStrip` | Primary routes | Notes, Series, Archive, Search route entries with icons and short labels |
| `FeaturedNoteCard` | Placeholder/content preview | Repeated item card only; supports title, excerpt, metadata, tags |
| `ArticlePreviewShell` | Reading-surface preview | Static prose/code placeholder showing low-intensity article treatment |
| `SiteFooter` | Utility/footer nav | Compact metadata and repeated route links |
```

**State pattern** (`01-UI-SPEC.md` lines 250-255):

```markdown
- Links: default, hover, active/current, focus-visible.
- Buttons: default, hover, focus-visible, disabled.
- Cards: default, hover/focus-within, featured.
- Mobile nav: closed, opening/open, closing, focus-trapped.
- Placeholder route pages: empty, error.
```

**Mobile menu accessibility pattern** (`01-RESEARCH.md` lines 473-486):

```tsx
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

### Visual Background Components

**Files:** `src/components/visual/LabBackground.tsx`, `src/components/visual/LabBackgroundClient.tsx`, `src/components/visual/SignalNetworkCanvas.tsx`

**Analog:** none. Use CSS first, then a client-only 2D Canvas enhancement on the homepage hero only. Do not add Three.js/R3F in Phase 1.

**Client boundary pattern** (`01-RESEARCH.md` lines 263-277):

```tsx
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

**Canvas loop guard pattern** (`01-RESEARCH.md` lines 445-469):

```ts
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const dprCap = window.innerWidth < 768 ? 1 : 1.5;
const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
let frame = 0;
let running = !reduceMotion.matches && document.visibilityState === "visible";

function draw(time: number) {
  if (!running) return;
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

**Effect limits** (`01-UI-SPEC.md` lines 203-214):

```markdown
1. Static CSS base: radial depth gradients, grid texture, and scanline overlay. This renders before JavaScript.
2. Optional 2D Canvas hero layer: particles, flowing trace lines, or signal nodes. It is client-only, dynamically loaded, `aria-hidden`, and `pointer-events: none`.
3. UI motion: Motion or CSS transitions for nav/menu/card interactions only.
- Canvas only on homepage hero.
- Canvas device pixel ratio cap: `1` on mobile, `1.5` on desktop.
- Particle/signal count cap: `36` mobile, `72` tablet, `120` desktop.
- Pause canvas animation when document is hidden or when the canvas is outside the viewport.
```

### Global CSS Tokens

**File:** `src/app/globals.css`

**Analog:** none. Use Tailwind v4 CSS-first tokens and define the technical-lab visual foundation before any client effect hydrates.

**Tailwind token pattern** (`01-RESEARCH.md` lines 285-304):

```css
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

**Design-system constraints** (`01-UI-SPEC.md` lines 49-55):

```markdown
- Define tokens in Tailwind v4 CSS variables in the global stylesheet created during app scaffold.
- Build reusable primitives locally.
- Use lucide icons for route buttons and controls.
- Do not hand-draw icon SVGs when a lucide icon exists.
- Do not put page sections inside floating cards. Cards are only for repeated note/route preview items.
```

### Site and Route Config

**Files:** `src/config/site.ts`, `src/config/routes.ts`

**Analog:** none. Centralize brand, email, nav, and route metadata so copy is configurable and not duplicated across components.

**Site config pattern** (`01-RESEARCH.md` lines 424-440):

```ts
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

**Configurable brand decision** (`01-CONTEXT.md` lines 20-25):

```markdown
- Use an English/Chinese mixed personal brand direction, such as `Hans' Tech Lab` / `Hans 的技术实验室`. Keep owner/name configurable; do not hard-code `Personal Tech Lab` as the final brand.
- Only include Email in the first viewport for Phase 1. Use `zhdydkdh@163.com`. Do not include GitHub, RSS, or Projects placeholders in the hero.
- Use mixed English and Chinese on the homepage.
```

### Playwright Verification

**Files:** `playwright.config.ts`, `src/tests/e2e/public-shell.spec.ts`

**Analog:** none. Create browser checks for desktop, mobile, reduced motion, placeholder routes, no overflow, and mobile nav keyboard behavior.

**Test case pattern** (`01-RESEARCH.md` lines 338-351):

```ts
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

**Playwright config pattern** (`01-RESEARCH.md` lines 491-507):

```ts
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

## Shared Patterns

### Server-Rendered Public Shell

**Source:** `01-RESEARCH.md` lines 241-255 and `01-UI-SPEC.md` lines 229-232
**Apply to:** root layout, public layout, homepage, placeholder pages, public shell components

Render copy, navigation, empty states, and the static CSS background before client JavaScript. Effect components must not reserve layout height and the page must remain readable if canvas fails.

### Client Boundaries for Browser APIs

**Source:** `01-RESEARCH.md` lines 257-277 and lines 354-360
**Apply to:** `MobileNav`, `LabBackgroundClient`, `SignalNetworkCanvas`

Browser APIs, `next/dynamic(..., { ssr: false })`, pointer tracking, `requestAnimationFrame`, and Motion state belong behind `"use client"` files. Placeholder routes must not import canvas code.

### Reduced Motion and Mobile Limits

**Source:** `01-UI-SPEC.md` lines 208-227
**Apply to:** visual components, mobile nav, hover states, Playwright checks

Use DPR caps, signal-count caps, visibility/offscreen pausing, no mobile pointer-follow behavior, and `prefers-reduced-motion` branches that disable canvas animation, parallax, hover lift, and looping scanlines.

### Local Design Primitives

**Source:** `01-UI-SPEC.md` lines 37-55
**Apply to:** all public components

Use local React components and semantic HTML, lucide icons, 8px maximum radius for cards/buttons, no nested cards, no page-section card wrappers, and no shadcn or third-party registry blocks in Phase 1.

### Centralized Copy and Routes

**Source:** `01-CONTEXT.md` lines 20-25, lines 41-47, and `01-RESEARCH.md` lines 424-440
**Apply to:** `site.ts`, `routes.ts`, header, footer, route strip, hero, placeholder pages

Put brand, email, and route metadata in config. Header and mobile navigation order must be Notes / Series / Archive / Search. Primary CTA points to Notes; secondary CTA jumps to the homepage lab index section.

### Browser Acceptance Checks

**Source:** `01-UI-SPEC.md` lines 372-390
**Apply to:** Playwright config/spec and implementation verification

Verify desktop `1440x900`, mobile `390x844`, minimum mobile `320px`, reduced motion, placeholder routes, keyboard navigation, mobile menu focus behavior, contrast, canvas fallback, and absence of Three.js/R3F in Phase 1.

## No Analog Found

No implementation analogs exist in the codebase.

| File Group | Role/Data Flow | Reason |
|------------|----------------|--------|
| Scaffold and config files | config / batch-transform | Repository has no `package.json`, Next.js config, TypeScript config, Tailwind/PostCSS config, or ESLint config. |
| App Router files | layout and route pages / request-response | Repository has no `src/app`, `app/`, Next.js pages, layouts, or route groups. |
| Public shell components | components / request-response and event-driven | Repository has no React component tree or component conventions. |
| Visual components | components / streaming and event-driven | Repository has no canvas, animation, Motion, or visual-effect source. |
| Site config files | config / transform | Repository has no source-level copy or route metadata config. |
| Playwright files | config/test / batch-browser | Repository has no Playwright config or browser tests. |

## Metadata

**Analog search scope:** project root excluding `.git`; targeted searches for `*.ts`, `*.tsx`, `*.js`, `*.jsx`, `*.css`, `*.mjs`, `*.cjs`, `package.json`, `tsconfig.json`, and `next.config.*`.
**Files scanned:** 15 tracked files; 0 implementation source/config analog files found.
**Project skills:** no `.codex/skills/` or `.agents/skills/` project skills found.
**Pattern extraction date:** 2026-06-30

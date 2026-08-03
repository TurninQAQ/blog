---
quick_id: 260710-kvr
status: complete
mode: quick-full
date: 2026-07-10
description: Implement selected option 1 light mecha manga redesign for public frontend only; preserve admin and backend
must_haves:
  truths:
    - The public homepage visibly matches the selected light Japanese mecha manga direction on desktop and mobile.
    - Homepage motion reacts to pointer or scroll on capable desktop browsers and becomes static for mobile and reduced-motion users.
    - Notes, article reading, search, taxonomy, series, and archive surfaces use a calm light reading theme without continuous background motion.
    - Existing public routes, content data, accessibility behavior, admin UI, backend, and database contracts remain functional.
  artifacts:
    - public/images/mecha/hero-desktop.webp
    - public/images/mecha/hero-mobile.webp
    - public/images/mecha/note-fallback.webp
    - src/components/public/HeroIdentity.tsx
    - src/components/visual/SignalNetworkCanvas.tsx
    - src/app/globals.css
    - design-qa.md
  key_links:
    - The selected reference at docs/design/mecha-manga-option-1.png grounds the homepage composition and palette.
    - LabBackground keeps the generated hero asset and interactive canvas isolated to the homepage.
    - PublicShell-scoped tokens prevent the light redesign from leaking into admin routes.
---

# Quick Task 260710-kvr: Light Mecha Manga Public Redesign

## Design Contract

- Palette: paper `#f7f9fc`, white `#ffffff`, ink `#101217`, cobalt `#075fce`, signal red `#df2532`, safety yellow `#f2b72b`, screentone gray `#d9e0e8`.
- Typography: heavy system display stack for the manga-cover title, neutral system Chinese body stack, and the existing monospace stack for technical metadata.
- Layout: restrained white public shell; desktop hero copy occupies the left 42% and the original mecha asset dominates the right; mobile copy stays above the portrait mecha crop; the next content band remains visible in the first viewport.
- Signature: generated mecha cover art plus cursor-reactive manga speed strokes and subtle parallax, confined to the homepage.
- Reading: white paper, graphite body text, blue links, red structural accents, stable `720px` prose width, and no ambient animation.

## Task 1: Land Visual Assets And Public Theme Foundation

**Files:** generated assets under `public/images/mecha/`, selected reference under `docs/design/`, `src/app/globals.css`, public shell/header/footer components.

**Action:** Add the selected original mecha assets, scope light color tokens to `.public-shell`, and restyle public navigation and framing without changing admin/global dark tokens.

**Verify:** Public routes render light while `/admin/login` keeps the existing dark theme; no generated runtime asset resolves outside the repository.

**Done:** Public and admin themes are visibly isolated and all assets load without console or network errors.

## Task 2: Rebuild Homepage And Calm Reading Surfaces

**Files:** homepage, hero, visual canvas, route strip, featured notes, preview, note list/card, article layout/header/markdown/TOC, and supporting public components.

**Action:** Recreate option 1 with live Chinese HTML content over the generated manga artwork, pointer/scroll interaction with reduced-motion safeguards, manga-style content rows, and restrained light article/list surfaces. Preserve all routes, data queries, and test IDs.

**Verify:** Desktop `1440x900`, mobile `390x844`, minimum mobile `320x720`, no horizontal overflow, all primary links work, article prose remains readable, and canvas metadata safeguards still pass.

**Done:** The public site is recognizably the selected concept while content behavior and accessibility contracts remain intact.

## Task 3: Regression And Design QA

**Files:** focused Playwright coverage if visual contracts change, `design-qa.md`, screenshots under `output/playwright/mecha-redesign/`.

**Action:** Run lint, unit tests, build, focused/full public Playwright checks, capture same-state screenshots, compare the desktop implementation against the selected reference, fix all P0-P2 mismatches, and document the final comparison.

**Verify:** Required commands pass; browser console is clean; desktop/mobile/reduced-motion checks pass; `design-qa.md` ends with `final result: passed`.

**Done:** Automated and visual evidence supports handoff, with only explicitly documented P3 polish remaining.

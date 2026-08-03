---
phase: 01-visual-foundation-and-public-shell
plan: 04
subsystem: public-shell
tags: [nextjs, react, tailwind, playwright, accessibility, navigation]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Next.js/Tailwind/Playwright scaffold and public route group from Plan 01-02
  - phase: 01-visual-foundation-and-public-shell
    provides: Isolated walking-skeleton probe from Plan 01-03
provides:
  - Configurable public site copy and route metadata through `siteConfig` and `contentRoutes`
  - Semantic server-rendered public shell with header, main, and footer landmarks
  - Desktop and mobile navigation in locked Notes / Series / Archive / Search order
  - Accessible mobile navigation with Escape close, focus containment, focus return, and 44px route rows
  - Browser contract for shell/navigation behavior across desktop and mobile Playwright projects
affects: [phase-01-homepage, phase-01-route-placeholders, public-navigation, browser-verification]

tech-stack:
  added: []
  patterns:
    - Server-rendered public shell wraps the public route group through `PublicShell`
    - Public copy and navigation labels are centralized in `siteConfig` and `contentRoutes`
    - Browser-only menu state and focus handling are isolated in the `MobileNav` client component
    - RED Playwright shell contract is committed before implementation

key-files:
  created:
    - src/config/site.ts
    - src/config/routes.ts
    - src/components/public/PublicShell.tsx
    - src/components/public/SiteHeader.tsx
    - src/components/public/MobileNav.tsx
    - src/components/public/SiteFooter.tsx
    - src/tests/e2e/public-shell.spec.ts
  modified:
    - src/app/(public)/layout.tsx
    - src/app/(public)/page.tsx
    - src/app/globals.css
    - playwright.config.ts

key-decisions:
  - "Kept this slice focused on shell, navigation, footer, and config; homepage modules and placeholder route pages remain deferred to Plan 01-05."
  - "Used email as the only public contact surface and added no GitHub, RSS, Projects, source, or profile placeholders."
  - "Added a mobile Playwright project because Plan 01-04 verification explicitly requires `--project=mobile`."

patterns-established:
  - "Public config boundary: brand, owner, email, hero CTA labels, and route labels flow from `siteConfig`/`contentRoutes` into shell components."
  - "Mobile nav accessibility pattern: trigger owns `aria-expanded`/`aria-controls`; panel uses dialog semantics, traps Tab focus, closes on Escape, and restores focus."
  - "Shell e2e pattern: commit RED browser contract first, then make it pass with server-rendered shell primitives."

requirements-completed: [VIS-01, VIS-03, VIS-04, QUAL-02]

coverage:
  - id: D1
    description: Configurable public brand, owner, email, hero CTA labels, and Notes / Series / Archive / Search route metadata.
    requirement: VIS-01
    verification:
      - kind: other
        ref: "node -e source check for `zhdydkdh@163.com`, `Hans' Tech Lab`, and `Hans 的技术实验室` in src/config/site.ts"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders PublicShell semantic landmarks and configured brand copy @shell-nav"
        status: pass
    human_judgment: false
  - id: D2
    description: Semantic public shell renders header, primary nav, main, and footer around public route children.
    requirement: QUAL-02
    verification:
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders PublicShell semantic landmarks and configured brand copy @shell-nav"
        status: pass
    human_judgment: false
  - id: D3
    description: Desktop header and footer navigation use locked Notes / Series / Archive / Search order.
    requirement: VIS-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#keeps desktop route order Notes / Series / Archive / Search @shell-nav"
        status: pass
    human_judgment: false
  - id: D4
    description: Mobile navigation opens from the trigger, uses the same route order, provides 44px rows, traps focus, closes on Escape, and returns focus.
    requirement: VIS-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#opens Mobile navigation in locked order, traps focus, and returns focus after Escape @shell-nav"
        status: pass
    human_judgment: false
  - id: D5
    description: Public contact boundary exposes only email and no GitHub, RSS, or Projects placeholders.
    requirement: VIS-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#uses the email-only public contact boundary @shell-nav"
        status: pass
      - kind: other
        ref: "source scan for GitHub/RSS/Projects public placeholders"
        status: pass
    human_judgment: false

duration: 9min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 04: Public Shell and Navigation Summary

**Config-driven public shell with locked content navigation and accessible mobile menu verified in desktop and mobile browsers.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-06-30T10:07:32Z
- **Completed:** 2026-06-30T10:15:46Z
- **Tasks:** 2
- **Files modified:** 11 implementation/config/test files

## Accomplishments

- Added `siteConfig` and `contentRoutes` so public brand, owner, email, hero CTA labels, and route labels are centralized.
- Built `PublicShell`, `SiteHeader`, `MobileNav`, and `SiteFooter` with semantic landmarks and locked Notes / Series / Archive / Search ordering.
- Implemented mobile menu keyboard behavior: open trigger state, dialog semantics, close button focus, Tab containment, Escape close, focus return, and 44px route rows.
- Added and passed the `@shell-nav` Playwright contract across desktop and mobile projects.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add RED shell and navigation browser contract** - `14c35c2` (test)
2. **Task 2: Implement configurable public shell and navigation** - `338e2cf` (feat)

## Files Created/Modified

- `src/config/site.ts` - Configurable brand, owner/name, email, hero support copy, and CTA/nav labels.
- `src/config/routes.ts` - Locked content route metadata for Notes, Series, Archive, and Search.
- `src/components/public/PublicShell.tsx` - Shared public layout wrapper with header, main, and footer.
- `src/components/public/SiteHeader.tsx` - Sticky server-rendered header with desktop navigation and mobile trigger.
- `src/components/public/MobileNav.tsx` - Client-only accessible mobile navigation.
- `src/components/public/SiteFooter.tsx` - Footer metadata, email contact, and repeated route links.
- `src/app/(public)/layout.tsx` - Wires public routes through `PublicShell`.
- `src/app/(public)/page.tsx` - Uses `siteConfig` for existing scaffold brand/hero copy without adding homepage modules.
- `src/app/globals.css` - Adds button focus handling and shell overflow isolation.
- `playwright.config.ts` - Adds the mobile Playwright project required by this plan.
- `src/tests/e2e/public-shell.spec.ts` - RED/GREEN shell/navigation browser contract.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed.
- `npx playwright test src/tests/e2e/public-shell.spec.ts --grep @shell-nav --project=desktop --project=mobile` - passed, 8/8 tests.
- `node -e "const fs=require('fs'); const s=fs.readFileSync('src/config/site.ts','utf8'); if(!s.includes('zhdydkdh@163.com')||!s.includes(\"Hans' Tech Lab\")||!s.includes('Hans 的技术实验室')) process.exit(1)"` - passed.
- Stub scan for `TODO`, `FIXME`, placeholder text, and hardcoded empty UI values in touched shell files - passed.
- Public contact scan found no added GitHub/RSS/Projects placeholders; matches were limited to the negative Playwright assertion and Playwright's `projects` config key.

## Decisions Made

- Kept `/notes`, `/series`, `/archive`, and `/search` as route links only; placeholder pages and homepage route modules remain Plan 01-05 scope.
- Kept email as the only public contact link. No social, source, RSS, project, or profile placeholders were added.
- Left visual effect work out of the shell components. The static global background remains from the scaffold; homepage signal effects remain Plan 01-06 scope.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added the mobile Playwright project**
- **Found during:** Task 2 verification setup
- **Issue:** The plan's verification command required `--project=mobile`, but `playwright.config.ts` only defined `desktop` from the scaffold.
- **Fix:** Added a `mobile` project using the Pixel 7 device profile and `390x844` viewport.
- **Files modified:** `playwright.config.ts`
- **Verification:** `npx playwright test src/tests/e2e/public-shell.spec.ts --grep @shell-nav --project=desktop --project=mobile` passed 8/8.
- **Committed in:** `338e2cf`

**2. [Rule 2 - Missing Critical] Centralized existing homepage scaffold copy through `siteConfig`**
- **Found during:** Task 2 implementation
- **Issue:** The existing scaffold homepage still hardcoded the public brand and hero copy, which would violate the plan's centralized-copy boundary once shell config was added.
- **Fix:** Updated the existing public homepage copy to read from `siteConfig` while avoiding Plan 01-05 homepage module work.
- **Files modified:** `src/app/(public)/page.tsx`
- **Verification:** Browser shell test and source config check passed.
- **Committed in:** `338e2cf`

---

**Total deviations:** 2 auto-fixed (1 Rule 3 blocking issue, 1 Rule 2 missing critical functionality).
**Impact on plan:** Both fixes were required to satisfy the accepted shell contract. No homepage content modules, route placeholder pages, CMS, auth, database, article, search, social, RSS, or projects scope was added.

## Issues Encountered

- The first GREEN browser run exposed a strict Playwright text locator issue because the Chinese brand copy correctly appeared in the header, homepage scaffold, and footer. The assertion was narrowed to the first visible matching copy and the suite then passed.
- Running `next build` and Playwright still regenerates tracked `next-env.d.ts` route-type content. The generated churn was restored before committing and was not included in task commits.
- Playwright continues to print harmless `NO_COLOR` / `FORCE_COLOR` runtime warnings. They did not affect verification.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - this plan intentionally leaves homepage modules and placeholder public route pages to Plan 01-05, but it does not add data-fed UI stubs or fake content.

## Threat Flags

None - the new public navigation links, public copy exposure, and mobile keyboard/focus behavior are covered by the plan threat model. No new network endpoint, auth path, file access pattern, or schema boundary was introduced.

## TDD Gate Compliance

- RED gate commit exists: `14c35c2` (`test(01-04): add RED shell navigation contract`).
- GREEN gate commit exists after RED: `338e2cf` (`feat(01-04): implement configurable public shell`).
- RED verification failed for expected missing shell landmarks/nav/email/mobile trigger after lint and build passed.

## Next Phase Readiness

Plan 01-05 can build homepage identity modules, route strip/index, reading preview, and placeholder public route empty states on top of the committed shell/config/navigation boundary. Plan 01-06 can mount homepage-only visual effects without changing the shell semantics.

## Self-Check: PASSED

- Confirmed all created and modified shell/config/test files exist.
- Confirmed task commits `14c35c2` and `338e2cf` exist in git history.
- Confirmed `.planning/phases/01-visual-foundation-and-public-shell/01-04-SUMMARY.md` exists on disk.

---
*Phase: 01-visual-foundation-and-public-shell*
*Completed: 2026-06-30*

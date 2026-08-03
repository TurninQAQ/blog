---
phase: 01-visual-foundation-and-public-shell
plan: 06
subsystem: public-ui
tags: [nextjs, react, canvas, tailwind, playwright, visual-effects, accessibility]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Homepage identity, public routes, route placeholders, and reading preview from Plan 01-05
provides:
  - Homepage-only static technical-lab background with server-rendered fallback before canvas hydration
  - Client-isolated 2D Canvas signal network with nodes, links, pulse traces, ambient drift, and desktop pointer attraction
  - Mobile, hidden/offscreen, and reduced-motion canvas safeguards with DPR/count caps
  - Flowing-light border, glow, section-divider, and reduced-motion CSS effect classes
  - Desktop, mobile, min-mobile, reduced-motion, route-isolation, canvas-pixel, and banned-WebGL Playwright coverage
affects: [phase-01-verification, public-homepage, visual-effects, responsive-shell, reduced-motion]

tech-stack:
  added: []
  patterns:
    - Server-safe `LabBackground` renders static CSS fallback while `LabBackgroundClient` owns the client-only dynamic canvas import.
    - `SignalNetworkCanvas` exposes stable data attributes for browser verification of animation state, pointer mode, signal count, DPR, and frame count.
    - Visual-effects tests use Node package/import checks instead of broad negative grep gates.

key-files:
  created:
    - src/components/visual/LabBackground.tsx
    - src/components/visual/LabBackgroundClient.tsx
    - src/components/visual/SignalNetworkCanvas.tsx
  modified:
    - playwright.config.ts
    - src/app/(public)/page.tsx
    - src/app/globals.css
    - src/components/public/ArticlePreviewShell.tsx
    - src/components/public/ContentRouteStrip.tsx
    - src/components/public/FeaturedNoteCard.tsx
    - src/components/public/HeroIdentity.tsx
    - src/tests/e2e/visual-effects.spec.ts

key-decisions:
  - "Implemented Phase 1 visual effects with CSS plus 2D Canvas only; no Three.js, React Three Fiber, or Drei dependency/import was added."
  - "Kept the canvas mounted only by the homepage `LabBackground` wrapper and loaded it through a client-only dynamic import boundary."
  - "Used data attributes on the canvas as a stable browser-verification surface for animation, reduced-motion, mobile, DPR, and count safeguards."

patterns-established:
  - "Homepage visual layer pattern: `LabBackground` static fallback -> `LabBackgroundClient` dynamic boundary -> `SignalNetworkCanvas` browser loop."
  - "Canvas loop guard pattern: requestAnimationFrame plus matchMedia, document visibility, IntersectionObserver, ResizeObserver, and cleanup."
  - "Visual-effects Playwright matrix: desktop, mobile, min-mobile, reduced-motion, no-JS fallback, route isolation, canvas pixels, and banned package/import checks."

requirements-completed: [VIS-02, VIS-03, VIS-04, VIS-05, QUAL-02, QUAL-03]

coverage:
  - id: D1
    description: "Homepage renders a nonblank static lab background before JavaScript and a homepage-only 2D signal-network canvas after hydration."
    requirement: VIS-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#renders a homepage-only signal canvas over a static lab fallback @visual-effects"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#keeps the static lab background readable before canvas hydration @visual-effects"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Canvas remains client-isolated, aria-hidden, pointer-passive, homepage-only, and absent from /notes, /series, /archive, and /search."
    requirement: QUAL-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#does not mount homepage effect code on public placeholder routes @visual-effects"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#renders a homepage-only signal canvas over a static lab fallback @visual-effects"
        status: pass
    human_judgment: false
  - id: D3
    description: "Mobile and minimum-width mobile viewports disable pointer-follow behavior, cap DPR/counts, and avoid horizontal overflow."
    requirement: VIS-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#disables pointer-follow and prevents horizontal overflow on mobile widths @visual-effects"
        status: pass
      - kind: e2e
        ref: "npm run test:e2e"
        status: pass
    human_judgment: false
  - id: D4
    description: "Reduced-motion mode preserves static lab identity while canvas animation and pointer attraction are inactive."
    requirement: VIS-05
    verification:
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#keeps static identity while canvas animation and pointer attraction are inactive @visual-effects"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D5
    description: "Flowing-light borders, glow states, section dividers, and reduced-motion CSS safeguards extend the visual language without WebGL dependencies."
    requirement: VIS-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#does not depend on Three.js, React Three Fiber, or Drei @visual-effects"
        status: pass
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "node package/file checks from PLAN.md"
        status: pass
    human_judgment: false
  - id: D6
    description: "Public route and reading surfaces remain readable before nonessential visual effects hydrate."
    requirement: QUAL-02
    verification:
      - kind: e2e
        ref: "npm run test:e2e"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/visual-effects.spec.ts#keeps the static lab background readable before canvas hydration @visual-effects"
        status: pass
    human_judgment: false

duration: 19min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 06: Visual Foundation and Signal Network Summary

**Homepage-only CSS and 2D Canvas signal-network foundation with mobile, reduced-motion, and route-isolation safeguards.**

## Performance

- **Duration:** 19 min
- **Started:** 2026-06-30T10:35:00Z
- **Completed:** 2026-06-30T10:53:45Z
- **Tasks:** 2
- **Files modified:** 11 implementation/config/test files

## Accomplishments

- Added `LabBackground`, `LabBackgroundClient`, and `SignalNetworkCanvas` so the homepage has a static CSS lab fallback plus a client-only 2D signal network.
- Implemented capped DPR/counts, document visibility pause, offscreen pause, reduced-motion static mode, cleanup of listeners/observers, and desktop-only pointer attraction.
- Extended global CSS with static grid/scanline fallback, flowing border light, glow card/action states, section divider treatment, and reduced-motion overrides.
- Added Playwright projects and visual-effect checks for desktop, mobile, 320px minimum mobile, reduced motion, no-JS static fallback, route isolation, canvas pixels, and banned WebGL packages/imports.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add RED browser contract for visual effects** - `16c37ea` (test)
2. **Task 2: Implement homepage signal network and motion safeguards** - `238b5fb` (feat)

## Files Created/Modified

- `src/components/visual/LabBackground.tsx` - Server-safe static lab background wrapper with optional homepage canvas mount.
- `src/components/visual/LabBackgroundClient.tsx` - Client-only `next/dynamic` boundary for `SignalNetworkCanvas`.
- `src/components/visual/SignalNetworkCanvas.tsx` - 2D Canvas signal-network loop with pulses, node links, desktop pointer attraction, mobile/reduced-motion guards, and cleanup.
- `src/app/(public)/page.tsx` - Wraps the homepage hero in `LabBackground enableCanvas`.
- `src/app/globals.css` - Adds static background, scanline, glow, flowing-border, section-divider, and reduced-motion CSS rules.
- `src/components/public/HeroIdentity.tsx` - Applies restrained glow/flow classes to hero actions.
- `src/components/public/ContentRouteStrip.tsx` - Applies section divider and route-card glow classes.
- `src/components/public/FeaturedNoteCard.tsx` - Applies glow-card interaction styling.
- `src/components/public/ArticlePreviewShell.tsx` - Applies low-intensity reading-surface styling.
- `src/tests/e2e/visual-effects.spec.ts` - Adds the visual-effects browser contract and banned WebGL package/import checks.
- `playwright.config.ts` - Adds `min-mobile` and `reduced-motion` projects.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed.
- `npx playwright test src/tests/e2e/visual-effects.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - passed, 16/16 effective tests with 8 intentional project skips.
- `npm run test:e2e` - passed, 64/64 effective tests with 8 intentional project skips.
- `node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); const banned=['three','@react-three/fiber','@react-three/drei']; for (const name of banned) { if ((pkg.dependencies && pkg.dependencies[name]) || (pkg.devDependencies && pkg.devDependencies[name])) process.exit(1); }"` - passed.
- `node -e "const fs=require('fs'); const files=['src/components/visual/LabBackground.tsx','src/components/visual/LabBackgroundClient.tsx','src/components/visual/SignalNetworkCanvas.tsx']; for (const f of files) { if (!fs.existsSync(f)) process.exit(1); }"` - passed.
- RED gate verification passed before implementation: lint/build passed, `src/components/visual/SignalNetworkCanvas.tsx` was absent, and the desktop visual-effects test failed on the missing `data-signal-canvas` and homepage static lab background.

## Decisions Made

- Used CSS plus 2D Canvas only for Phase 1 effects, keeping Three.js/R3F/Drei out of dependencies and imports.
- Kept `next/dynamic(..., { ssr: false })` inside `LabBackgroundClient`, not inside a server component.
- Exposed animation state, pointer-follow mode, signal count, DPR, and frame count through data attributes so Playwright can verify behavior without brittle visual guessing.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used typed Playwright reduced-motion context options**
- **Found during:** Task 1 RED verification
- **Issue:** The installed Playwright typings reject `reducedMotion` directly in project `use`, causing `next build` type checking to fail.
- **Fix:** Configured the reduced-motion project with `contextOptions: { reducedMotion: "reduce" }`.
- **Files modified:** `playwright.config.ts`
- **Verification:** `npm run build` passed and the reduced-motion project emulated reduced motion.
- **Committed in:** `16c37ea`

**2. [Rule 1 - Test Bug] Scoped desktop-only pointer assertions**
- **Found during:** Task 2 visual-effects verification
- **Issue:** The RED contract expected desktop pointer attraction in mobile and reduced-motion projects, and the minimum mobile project initially used a WebKit device descriptor not installed in this environment.
- **Fix:** Scoped the desktop pointer/canvas animation assertion to the desktop project and changed `min-mobile` to Chromium mobile emulation via the Pixel 7 descriptor with a 320px viewport.
- **Files modified:** `src/tests/e2e/visual-effects.spec.ts`, `playwright.config.ts`
- **Verification:** Full visual-effects matrix passed.
- **Committed in:** `238b5fb`

**3. [Rule 3 - Blocking] Added explicit non-null canvas/context references**
- **Found during:** Task 2 build verification
- **Issue:** TypeScript did not preserve `canvas` and 2D context narrowing inside nested effect closures, blocking `next build`.
- **Fix:** Introduced explicit `HTMLCanvasElement` and `CanvasRenderingContext2D` locals after null guards.
- **Files modified:** `src/components/visual/SignalNetworkCanvas.tsx`
- **Verification:** `npm run build` passed.
- **Committed in:** `238b5fb`

---

**Total deviations:** 3 auto-fixed (1 Rule 1 test bug, 2 Rule 3 blocking issues).
**Impact on plan:** All fixes were necessary to satisfy the planned verification gates and did not add scope beyond the homepage visual foundation.

## Issues Encountered

- `next build` continues to regenerate tracked `next-env.d.ts` route metadata between `.next/types` and `.next/dev/types`; the generated churn was restored before commits.
- Playwright continues to print harmless `NO_COLOR` / `FORCE_COLOR` runtime warnings. They did not affect verification.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

The following placeholder surfaces remain intentional Phase 1 content-shell scaffolding and do not block this plan:

| Surface | File | Reason |
|---------|------|--------|
| Editorial module copy | `src/app/(public)/page.tsx` | Describes future Notes/Series/Archive areas without fake articles until CMS/content phases connect data. |
| Reading preview | `src/components/public/ArticlePreviewShell.tsx` | Demonstrates article-safe typography before real article rendering arrives in later phases. |

Array initializers in `SignalNetworkCanvas` and `visual-effects.spec.ts` are runtime/test collection state, not UI stubs.

## Threat Flags

None - the browser canvas boundary, package/dependency surface, public route isolation, and reduced-motion/mobile safeguards are covered by the plan threat model. No new network endpoint, auth path, file access pattern, or schema boundary was introduced.

## TDD Gate Compliance

- RED gate commit exists: `16c37ea` (`test(01-06): add RED visual effects contract`).
- GREEN gate commit exists after RED: `238b5fb` (`feat(01-06): implement homepage signal network effects`).
- RED verification failed for expected missing visual behavior after lint/build passed.

## Next Phase Readiness

Plan 01-07 can run final Phase 1 visual/human verification against a homepage with static fallback, active desktop signal canvas, guarded mobile/reduced-motion behavior, and unchanged public route placeholder surfaces.

## Self-Check: PASSED

- Confirmed `src/components/visual/LabBackground.tsx`, `src/components/visual/LabBackgroundClient.tsx`, `src/components/visual/SignalNetworkCanvas.tsx`, and `src/tests/e2e/visual-effects.spec.ts` exist.
- Confirmed task commits `16c37ea` and `238b5fb` exist in git history.
- Confirmed the plan-level verification commands passed before state updates.
- Confirmed no accidental tracked file deletions were introduced.

---
*Phase: 01-visual-foundation-and-public-shell*
*Completed: 2026-06-30*

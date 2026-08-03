---
phase: 01-visual-foundation-and-public-shell
plan: 05
subsystem: public-ui
tags: [nextjs, react, tailwind, playwright, homepage, public-routes, tdd]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Configurable public shell, route metadata, header, mobile navigation, and footer from Plan 01-04
provides:
  - Homepage hero identity with configurable English/Chinese brand copy and lab-exploration support copy
  - Lab index route strip linking to Notes, Series, Archive, and Search in locked order
  - Editorial system-module cards for Notes, Series, and Archive without fake article metadata
  - Generic reading preview demonstrating prose, inline code, and code-block typography
  - Chinese-first empty-state pages for /notes, /series, /archive, and /search
  - Desktop and mobile Playwright browser contract for homepage/routes/preview/mobile overflow
affects: [phase-01-signal-effects, public-homepage, public-route-placeholders, browser-verification]

tech-stack:
  added: []
  patterns:
    - Server-rendered homepage sections compose local public components before any canvas/effect layer exists.
    - Route placeholders are explicit Chinese-first empty states, not fake content records.
    - RED Playwright homepage/routes contract precedes implementation.

key-files:
  created:
    - src/components/public/HeroIdentity.tsx
    - src/components/public/ContentRouteStrip.tsx
    - src/components/public/FeaturedNoteCard.tsx
    - src/components/public/ArticlePreviewShell.tsx
    - src/app/(public)/notes/page.tsx
    - src/app/(public)/series/page.tsx
    - src/app/(public)/archive/page.tsx
    - src/app/(public)/search/page.tsx
  modified:
    - src/app/(public)/page.tsx
    - src/components/public/SiteFooter.tsx
    - src/config/site.ts
    - src/tests/e2e/public-shell.spec.ts

key-decisions:
  - "Kept this slice server-rendered and content-focused; homepage canvas/effect work remains Plan 01-06 scope."
  - "Rendered exactly one mailto contact link by moving the public email action into the hero and removing the duplicate footer mail link."
  - "Used editorial module cards and route empty states instead of fake article titles, dates, tags, authors, search controls, or loading UI."

patterns-established:
  - "Homepage composition pattern: HeroIdentity -> ContentRouteStrip -> FeaturedNoteCard grid -> ArticlePreviewShell."
  - "Public empty-state route pattern: Chinese-first h1, English route label, explanatory body, and a real link back to the homepage."
  - "Browser contract pattern: @homepage-routes covers first-viewport actions, route modules, empty states, reading preview, and 390px/320px overflow."

requirements-completed: [VIS-01, VIS-03, VIS-04, QUAL-02]

coverage:
  - id: D1
    description: "Homepage presents Hans' Tech Lab / Hans 的技术实验室 with lab-exploration support copy, Explore Notes, Open Lab Index, and one approved email contact."
    requirement: VIS-01
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders configured mixed-language hero identity and approved first-viewport actions @homepage-routes"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false
  - id: D2
    description: "Homepage lab index and editorial module cards expose Notes, Series, Archive, and Search without fake article metadata."
    requirement: VIS-03
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders lab-index route strip and editorial system-module cards @homepage-routes"
        status: pass
      - kind: other
        ref: "source scan for GitHub/RSS/Projects/loading/fake article placeholders"
        status: pass
    human_judgment: false
  - id: D3
    description: "Notes, Series, Archive, and Search render Chinese-first empty states inside the shared public shell."
    requirement: QUAL-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders Chinese-first empty states for public content routes @homepage-routes"
        status: pass
      - kind: other
        ref: "node -e Chinese source check for notes/series/archive/search pages"
        status: pass
    human_judgment: false
  - id: D4
    description: "Generic reading preview demonstrates prose, inline code, and code-block typography without implying a real article exists."
    requirement: QUAL-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#renders a generic reading preview with prose and code typography @homepage-routes"
        status: pass
    human_judgment: false
  - id: D5
    description: "Homepage stays inside 390px and 320px mobile viewport widths with no horizontal overflow."
    requirement: VIS-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#keeps homepage inside the 390px mobile viewport @homepage-routes"
        status: pass
      - kind: e2e
        ref: "src/tests/e2e/public-shell.spec.ts#keeps homepage inside the 320px mobile viewport @homepage-routes"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 05: Homepage Identity and Public Routes Summary

**Server-rendered homepage identity, lab index, editorial modules, reading preview, and Chinese-first public route empty states.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-30T10:14:00Z
- **Completed:** 2026-06-30T10:32:19Z
- **Tasks:** 2
- **Files modified:** 12 implementation/config/test files

## Accomplishments

- Added a mixed English/Chinese hero identity sourced from `siteConfig`, with `Explore Notes`, `Open Lab Index`, and the approved `mailto:zhdydkdh@163.com` contact.
- Added `ContentRouteStrip`, `FeaturedNoteCard`, and `ArticlePreviewShell` so the homepage has meaningful content surfaces before Plan 01-06 canvas effects.
- Added `/notes`, `/series`, `/archive`, and `/search` pages with Chinese-first empty states inside the shared public shell.
- Extended `src/tests/e2e/public-shell.spec.ts` with the `@homepage-routes` browser contract and verified it on desktop and mobile.

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend RED browser contract for homepage and routes** - `946ec89` (test)
2. **Task 2: Implement homepage, route surfaces, and reading preview** - `b111e8c` (feat)

## Files Created/Modified

- `src/components/public/HeroIdentity.tsx` - Homepage first-viewport identity, configured brand copy, CTAs, and single email action.
- `src/components/public/ContentRouteStrip.tsx` - `#lab-index` route strip for Notes, Series, Archive, and Search.
- `src/components/public/FeaturedNoteCard.tsx` - Reusable editorial system-module card.
- `src/components/public/ArticlePreviewShell.tsx` - Generic reading typography preview with prose and code block.
- `src/app/(public)/page.tsx` - Homepage composition in the required section order.
- `src/app/(public)/notes/page.tsx` - Chinese-first Notes empty state.
- `src/app/(public)/series/page.tsx` - Chinese-first Series empty state.
- `src/app/(public)/archive/page.tsx` - Chinese-first Archive empty state.
- `src/app/(public)/search/page.tsx` - Chinese-first Search empty state.
- `src/components/public/SiteFooter.tsx` - Removed duplicate footer email link so only the hero exposes the mailto contact.
- `src/config/site.ts` - Updated hero support copy for the lab-exploration tone and Chinese supporting sentence.
- `src/tests/e2e/public-shell.spec.ts` - Added homepage/routes/reading/mobile overflow browser contract.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed.
- `npx playwright test src/tests/e2e/public-shell.spec.ts --project=desktop --project=mobile` - passed, 20/20 tests.
- `node -e "const fs=require('fs'); const files=['src/app/(public)/notes/page.tsx','src/app/(public)/series/page.tsx','src/app/(public)/archive/page.tsx','src/app/(public)/search/page.tsx']; for (const f of files) { const s=fs.readFileSync(f,'utf8'); if(!/[\\u4e00-\\u9fff]/.test(s)) process.exit(1); }"` - passed.
- RED gate verification passed before implementation: lint/build passed, `src/components/public/HeroIdentity.tsx` was absent, and the `@homepage-routes --project=desktop` Playwright run failed on missing homepage/lab-index/reading-preview/route behavior.
- Stub/forbidden-scope scan found no `TODO`, `FIXME`, `coming soon`, `placeholder`, hardcoded empty UI values, canvas/Three.js additions, or public GitHub/RSS/Projects content. Matches were limited to negative Playwright assertions and the pre-existing `MobileNav` client boundary.

## Decisions Made

- Kept this plan server-rendered and did not add canvas, Motion behavior, Three.js, admin, auth, CMS, search implementation, or article data.
- Kept email as the only public contact action and rendered it once in the hero first viewport.
- Used static editorial module copy and route empty states because Phase 1 has no content database yet.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Enforced single mailto contact boundary**
- **Found during:** Task 2 implementation
- **Issue:** Plan 01-04 left a footer `mailto:` link, but Plan 01-05 requires one approved email contact in the first viewport.
- **Fix:** Removed the footer mail link and rendered the approved email action in `HeroIdentity`.
- **Files modified:** `src/components/public/SiteFooter.tsx`, `src/components/public/HeroIdentity.tsx`
- **Verification:** `src/tests/e2e/public-shell.spec.ts#uses the email-only public contact boundary @shell-nav` and `#renders configured mixed-language hero identity and approved first-viewport actions @homepage-routes` passed on desktop/mobile.
- **Committed in:** `b111e8c`

**2. [Rule 1 - Test Bug] Scoped homepage-route assertions to the intended surface**
- **Found during:** Task 2 verification
- **Issue:** The RED contract initially selected all page links/buttons, so the legitimate header `Explore Notes` link and mobile menu button could fail homepage/route assertions.
- **Fix:** Scoped hero CTA checks to `main` and scoped "no dead controls" to route-page `main` content.
- **Files modified:** `src/tests/e2e/public-shell.spec.ts`
- **Verification:** Full desktop/mobile Playwright run passed 20/20 tests.
- **Committed in:** `b111e8c`

---

**Total deviations:** 2 auto-fixed (1 Rule 2 missing critical functionality, 1 Rule 1 test bug).
**Impact on plan:** Both adjustments preserved the locked public-shell decisions and avoided adding later-phase functionality.

## Issues Encountered

- `next build` continues to regenerate tracked `next-env.d.ts` route metadata. The generated churn was restored before commits and is not part of this plan.
- Playwright continues to print harmless `NO_COLOR` / `FORCE_COLOR` runtime warnings. They did not affect verification.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

The following placeholders are intentional Phase 1 surfaces and do not block this plan:

| Surface | File | Reason |
|---------|------|--------|
| Notes empty state | `src/app/(public)/notes/page.tsx` | Real published notes arrive with later CMS/public content plans. |
| Series empty state | `src/app/(public)/series/page.tsx` | Series data arrives after article taxonomy and ordering are implemented. |
| Archive empty state | `src/app/(public)/archive/page.tsx` | Archive data depends on published article records. |
| Search empty state | `src/app/(public)/search/page.tsx` | Search behavior is deferred to the public content library phase. |
| Editorial module cards | `src/app/(public)/page.tsx` | Cards describe content areas and intentionally avoid fake article records. |

## Threat Flags

None - the new public route surfaces, internal links, public copy, and generic static preview are covered by the plan threat model. No new network endpoint, auth path, file access pattern, or schema boundary was introduced.

## TDD Gate Compliance

- RED gate commit exists: `946ec89` (`test(01-05): add RED homepage routes contract`).
- GREEN gate commit exists after RED: `b111e8c` (`feat(01-05): implement public homepage routes`).
- RED verification failed for expected missing homepage/lab-index/reading-preview/route behavior after lint and build passed.

## Next Phase Readiness

Plan 01-06 can mount homepage-only signal network effects on top of the committed server-rendered shell without changing homepage semantics, route links, or placeholder route behavior.

## Self-Check: PASSED

- Confirmed all created homepage component files and public route pages exist.
- Confirmed task commits `946ec89` and `b111e8c` exist in git history.
- Confirmed `.planning/phases/01-visual-foundation-and-public-shell/01-05-SUMMARY.md` exists on disk.
- Confirmed final verification commands passed before state updates.

---
*Phase: 01-visual-foundation-and-public-shell*
*Completed: 2026-06-30*

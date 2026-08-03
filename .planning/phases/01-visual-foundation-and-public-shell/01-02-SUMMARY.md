---
phase: 01-visual-foundation-and-public-shell
plan: 02
subsystem: scaffold
tags: [nextjs, react, typescript, tailwind, playwright, eslint]

requires:
  - phase: 01-visual-foundation-and-public-shell
    provides: Exact pinned Phase 1 npm package approval from Plan 01-01
provides:
  - Runnable Next.js App Router scaffold with TypeScript, Tailwind v4, ESLint, and Playwright scripts
  - Server-rendered technical-lab token baseline and neutral public route surface
  - RED Playwright walking-skeleton proof for the deferred /__skeleton route and /api/skeleton-probe API
affects: [phase-01-walking-skeleton, phase-01-public-shell, browser-verification]

tech-stack:
  added:
    - next@16.2.9
    - react@19.2.7
    - react-dom@19.2.7
    - typescript@6.0.3
    - tailwindcss@4.3.2
    - "@tailwindcss/postcss@4.3.2"
    - postcss@8.5.16
    - eslint@10.6.0
    - eslint-config-next@16.2.9
    - motion@12.42.0
    - lucide-react@1.22.0
    - "@playwright/test@1.61.1"
  patterns:
    - Next.js App Router with src/app route group scaffold
    - Tailwind v4 CSS-first lab tokens in globals.css
    - Playwright webServer-backed desktop project for browser verification
    - RED browser/API contract committed before walking-skeleton implementation

key-files:
  created:
    - package.json
    - package-lock.json
    - next-env.d.ts
    - next.config.ts
    - tsconfig.json
    - postcss.config.mjs
    - eslint.config.mjs
    - playwright.config.ts
    - src/app/layout.tsx
    - src/app/globals.css
    - src/app/(public)/layout.tsx
    - src/app/(public)/page.tsx
    - src/tests/e2e/skeleton.spec.ts
  modified:
    - .gitignore

key-decisions:
  - "Kept Plan 01-02 limited to scaffold, tokens, and RED proof; /__skeleton and /api/skeleton-probe implementation remains in Plan 01-03."
  - "Used the Next TypeScript ESLint preset only because eslint-config-next core-web-vitals React rules are not compatible with the approved ESLint 10.6.0 pin."

patterns-established:
  - "Scaffold copy-back pattern: create-next-app runs in a temporary sibling and only generated app/config files are copied into the GSD repo."
  - "RED e2e proof pattern: lint/build must pass before accepting an intentional Playwright failure for a missing future route/API."

requirements-completed: [VIS-03, QUAL-02, QUAL-03]

coverage:
  - id: D1
    description: Runnable Next.js App Router scaffold with pinned package scripts and lockfile.
    requirement: VIS-03
    verification:
      - kind: other
        ref: "npm run lint"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
      - kind: other
        ref: "package.json direct dependency/script pin check"
        status: pass
    human_judgment: false
  - id: D2
    description: Tailwind v4 technical-lab token baseline and static fallback background.
    requirement: QUAL-02
    verification:
      - kind: other
        ref: "grep src/app/globals.css for @theme lab tokens and grid/fallback variables"
        status: pass
    human_judgment: false
  - id: D3
    description: RED Playwright walking-skeleton proof fails for the intentionally missing route/API after lint/build pass.
    requirement: QUAL-03
    verification:
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/skeleton.spec.ts --project=desktop expected nonzero with /api/skeleton-probe 404 and missing Skeleton Probe heading"
        status: pass
    human_judgment: false
  - id: D4
    description: No CMS, admin, auth, Prisma, migration, article, or search implementation files were introduced.
    verification:
      - kind: other
        ref: "test ! -f prisma/schema.prisma && test ! -d prisma/migrations && forbidden path scan"
        status: pass
    human_judgment: false

duration: 22min
completed: 2026-06-30
status: complete
---

# Phase 01 Plan 02: Scaffold and RED Skeleton Proof Summary

**Next.js/Tailwind/Playwright scaffold with server-rendered lab tokens and an intentionally failing walking-skeleton browser contract.**

## Performance

- **Duration:** 22 min
- **Started:** 2026-06-30T09:22:00Z
- **Completed:** 2026-06-30T09:43:47Z
- **Tasks:** 2
- **Files modified:** 14 implementation/config files

## Accomplishments

- Created a Next.js 16 App Router scaffold with TypeScript, Tailwind v4, ESLint, npm scripts, Playwright config, and a generated lockfile.
- Replaced starter content with a neutral server-rendered technical-lab surface and global CSS tokens for base, surface, text, muted text, mint accent, 8px radius, grid, and static fallback background.
- Added a RED Playwright proof for `/__skeleton` and `/api/skeleton-probe`; it fails for the expected missing route/API behavior after lint and build pass.
- Kept CMS, admin, auth, Prisma, migrations, article, and search implementation files out of this slice.

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold app and tooling after package approval** - `3110d51` (feat)
2. **Task 2: Add RED skeleton browser proof** - `e660a83` (test)

## Files Created/Modified

- `package.json` - Pinned direct dependencies and scripts `dev`, `build`, `lint`, and `test:e2e`.
- `package-lock.json` - npm lockfile generated from the pinned scaffold dependencies.
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` - Next.js, TypeScript, Tailwind/PostCSS, and ESLint baseline configuration.
- `playwright.config.ts` - Desktop Chromium project with `npm run dev` web server.
- `src/app/layout.tsx` - Root metadata and global stylesheet import.
- `src/app/globals.css` - Tailwind v4 lab tokens and static visual fallback.
- `src/app/(public)/layout.tsx` and `src/app/(public)/page.tsx` - Neutral server-rendered public route group surface.
- `src/tests/e2e/skeleton.spec.ts` - RED walking-skeleton browser/API proof.
- `.gitignore` - Ignores dependency, Next build, Playwright, test result, log, and env artifacts.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed.
- `test ! -f prisma/schema.prisma && test ! -d prisma/migrations` - passed.
- Forbidden implementation scan for admin/auth/CMS/search/Prisma paths - passed.
- RED command passed by expecting failure: `npx playwright test src/tests/e2e/skeleton.spec.ts --project=desktop` exited nonzero with `/api/skeleton-probe` returning 404 and the `/__skeleton` page missing the `Skeleton Probe` heading.

## Decisions Made

- Kept the scaffold page intentionally neutral and static; real public shell components, route placeholders, and content modules remain in later Phase 1 plans.
- Preserved the Plan 01-03 boundary by not creating `src/app/__skeleton/page.tsx` or `src/app/api/skeleton-probe/route.ts`.
- Used the Next TypeScript ESLint preset only under ESLint 10.6.0 because the core-web-vitals React rules crash with the approved pinned version set.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added exact TypeScript ambient type packages**
- **Found during:** Task 1 (Scaffold app and tooling after package approval)
- **Issue:** The generated TypeScript React scaffold needs Node/React ambient types to build, but create-next-app generated caret ranges.
- **Fix:** Pinned `@types/node`, `@types/react`, and `@types/react-dom` exactly in `package.json` so the TypeScript scaffold builds without unpinned direct dev dependencies.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm run lint` and `npm run build` passed.
- **Committed in:** `3110d51`

**2. [Rule 3 - Blocking] Adjusted ESLint config for approved ESLint 10 pin**
- **Found during:** Task 1 verification
- **Issue:** `eslint-config-next/core-web-vitals` loads React plugin rules that call an API incompatible with `eslint@10.6.0`, causing lint to crash before source analysis.
- **Fix:** Kept `eslint-config-next/typescript` and removed the incompatible core-web-vitals preset while preserving the approved dependency versions.
- **Files modified:** `eslint.config.mjs`
- **Verification:** `npm run lint` passed.
- **Committed in:** `3110d51`

**3. [Rule 3 - Blocking] Installed Playwright Chromium system dependencies**
- **Found during:** Task 2 verification
- **Issue:** The first browser run failed before reaching `/__skeleton` because the runtime lacked Linux libraries such as `libatk-1.0.so.0`.
- **Fix:** Ran `npx playwright install-deps chromium` to prepare the automated browser environment, then reran the RED proof.
- **Files modified:** none in repo
- **Verification:** Playwright launched Chromium and failed for the expected missing route/API contract.
- **Committed in:** n/a, environment setup only

---

**Total deviations:** 3 auto-fixed (Rule 3 blocking issues).
**Impact on plan:** All fixes were required to make the approved scaffold verifiable. No CMS/admin/auth/database/search scope was added.

## Issues Encountered

- `npm audit` reports two moderate findings through Next's nested PostCSS dependency. npm's suggested fix conflicts with the approved `next@16.2.9` pin, so no dependency change was made in this plan.
- Next dev emitted an `allowedDevOrigins` warning for `127.0.0.1` during Playwright. It did not affect the RED proof; future browser plans can either use `localhost` consistently or add an explicit dev origin if the warning becomes noisy.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None - this plan added a neutral scaffold surface and an intentionally failing RED test, but no data-fed UI stub that blocks the plan goal.

## TDD Gate Compliance

Task 2 intentionally stops at RED. The required `test(01-02)` commit exists before any walking-skeleton implementation, and GREEN is deferred to Plan 01-03 by the plan boundary.

## Next Phase Readiness

Plan 01-03 can implement `src/app/__skeleton/page.tsx`, `src/app/api/skeleton-probe/route.ts`, and the small local probe store against the committed RED contract.

## Self-Check: PASSED

- Confirmed all scaffold, config, public route, test, and summary files exist.
- Confirmed task commits `3110d51` and `e660a83` exist in git history.
- Confirmed final working tree was clean before planning metadata updates.

---
*Phase: 01-visual-foundation-and-public-shell*
*Completed: 2026-06-30*

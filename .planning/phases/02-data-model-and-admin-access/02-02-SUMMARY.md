---
phase: 02-data-model-and-admin-access
plan: "02"
subsystem: admin-auth
tags: [nextjs, prisma, postgresql, server-actions, httpOnly-cookie, single-admin]

requires:
  - phase: 02-data-model-and-admin-access
    provides: Plan 02-01 Prisma schema, generated client, auth env parser, password helper, and bootstrapped AdminUser row
provides:
  - Custom Prisma-backed admin session DAL with hashed opaque tokens and httpOnly cookies
  - Server-side admin session reader, mutation guard primitive, and page redirect helper
  - Admin login server action, logout route, protected `/admin` landing, and responsive login UI
  - Browser contract proving redirect, login, invalid credentials, successful session, sign out, and no horizontal overflow
affects: [phase-02-mutation-guards, phase-03-markdown-authoring-workflow]

tech-stack:
  added: []
  patterns:
    - Custom `AdminSession` token hashing via HMAC-SHA256 before Prisma lookup
    - Next server actions for credential submission with `useActionState` client form state
    - Server-side page guard through `requireAdminPage()` before protected `/admin` content renders
    - Local `.env.local` Argon2 hash compatibility across Next dotenv expansion and Node/tsx env loading

key-files:
  created:
    - src/lib/auth/session.ts
    - src/lib/auth/admin.ts
    - src/app/admin/login/actions.ts
    - src/app/admin/logout/route.ts
    - src/app/admin/login/page.tsx
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/components/admin/AdminLoginForm.tsx
    - src/components/admin/AdminShell.tsx
    - src/tests/e2e/admin-auth.spec.ts
  modified:
    - src/lib/auth/env.ts

key-decisions:
  - "Preserved D-17 with a custom Prisma-backed AdminSession DAL and no next-auth, @auth/prisma-adapter, OAuth, Magic Link, registration, invite, reset, or JWT Credentials implementation."
  - "Protected `/admin` in the page component instead of the shared `/admin` layout because a guarded segment layout would also wrap `/admin/login` and cause a redirect loop."
  - "Escaped ADMIN_PASSWORD_HASH dollar signs in ignored `.env.local` and normalized escaped hashes in `getAuthEnv()` so Next dev and tsx scripts read the same Argon2 value."

patterns-established:
  - "Admin session cookies use the `admin_session` name, 30-day max age, httpOnly, sameSite lax, path `/`, and secure only in production."
  - "Session rows store only token hashes; plaintext session tokens remain cookie-only."
  - "Admin UI stays separate from public shell/canvas modules and exposes only the Phase 2 access-boundary placeholder."

requirements-completed: [AUTH-01, AUTH-02, AUTH-04]

coverage:
  - id: D1
    description: Custom Prisma-backed single-admin login creates, reads, and destroys durable AdminSession rows through an httpOnly cookie.
    requirement: AUTH-01
    verification:
      - kind: e2e
        ref: "npx playwright test src/tests/e2e/admin-auth.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion"
        status: pass
      - kind: integration
        ref: "npm run admin:bootstrap && AdminUser count check"
        status: pass
    human_judgment: false
  - id: D2
    description: Unauthenticated `/admin` requests redirect server-side to `/admin/login` before protected admin content renders.
    requirement: AUTH-02
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-auth.spec.ts#redirects unauthenticated /admin requests before protected shell renders"
        status: pass
    human_judgment: false
  - id: D3
    description: Admin login and protected landing UI match the Phase 2 narrow shell: visible labels, generic login failure, authenticated status cards, sign out, and no forbidden account-entry surfaces.
    requirement: AUTH-04
    verification:
      - kind: e2e
        ref: "src/tests/e2e/admin-auth.spec.ts#custom single-admin auth boundary"
        status: pass
      - kind: other
        ref: "forbidden auth-stack/copy/homepage-effect source scan"
        status: pass
    human_judgment: false

duration: 18min
completed: 2026-07-03
status: complete
---

# Phase 02 Plan 02: Custom Admin Login and Session Summary

**Custom Prisma-backed single-admin login with hashed durable sessions, server-side admin protection, and a responsive technical-lab admin shell.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-07-03T02:08:36Z
- **Completed:** 2026-07-03T02:27:35Z
- **Tasks:** 3
- **Files modified:** 11 implementation/test files

## Accomplishments

- Added a RED Playwright admin-auth contract covering redirect, login semantics, invalid credentials, successful login, sign out, responsive overflow, reduced motion, and forbidden account-entry links.
- Implemented `createAdminSession()`, `getAdminSession()`, `destroyAdminSession()`, `requireAdmin()`, and `requireAdminPage()` using the Plan 02-01 Prisma `AdminUser`/`AdminSession` schema.
- Added `/admin/login`, `/admin/logout`, and protected `/admin` with the Phase 2 UI contract: visible labels, generic Chinese-first error, authenticated status cards, and no later-scope CMS controls.
- Verified local login against the bootstrapped `ADMIN_EMAIL` row and ignored `.env.local` credentials.

## Task Commits

Each task or verification-blocking fix was committed atomically:

1. **Task 1: Add RED admin login and protection browser contract** - `eefb536` (test)
2. **Task 2: Implement custom Prisma-backed session DAL and auth actions** - `9a87747` (feat)
3. **Task 3: Build protected admin login and landing UI** - `64a11d8` (feat)
4. **Plan verification fix: Normalize escaped admin password hashes** - `3ab4276` (fix)

## Files Created/Modified

- `src/tests/e2e/admin-auth.spec.ts` - Playwright contract for admin redirect, login form, invalid credentials, successful login, sign out, responsive overflow, and reduced motion.
- `src/lib/auth/session.ts` - Custom AdminSession DAL with opaque token generation, HMAC-SHA256 token hashes, 30-day cookie settings, session lookup, expiry rejection, and deletion.
- `src/lib/auth/admin.ts` - Shared admin session reader, `requireAdmin()`, `UnauthorizedAdminError`, and `requireAdminPage()` redirect helper.
- `src/app/admin/login/actions.ts` - Server action that validates credentials, enforces `ADMIN_EMAIL`, verifies `ADMIN_PASSWORD_HASH`, creates the session, and redirects to `/admin`.
- `src/app/admin/logout/route.ts` - Node route handler that destroys the current session and redirects to `/admin/login`.
- `src/components/admin/AdminLoginForm.tsx` - Client form boundary with pending state, generic error rendering, visible labels, and 44px controls.
- `src/components/admin/AdminShell.tsx` - Protected admin header, sign-out form, empty state, and allowed status cards.
- `src/app/admin/login/page.tsx` - Login page shell with static lab grid, narrow panel, expired-session helper, and a single back link to `/`.
- `src/app/admin/layout.tsx` - Admin route-segment shell that avoids wrapping `/admin/login` in the protected guard.
- `src/app/admin/page.tsx` - Protected admin landing page that calls `requireAdminPage()` before rendering shell content.
- `src/lib/auth/env.ts` - Normalizes dotenv-escaped Argon2 hashes before fail-closed validation.

## Verification

- `npm run lint` - passed.
- `npm run build` - passed.
- `npm run admin:bootstrap` - passed with `removedExtraAdmins: 0`.
- `AdminUser` count check via Prisma - passed with exactly one `ADMIN_EMAIL` row and exactly one total admin row.
- `npx playwright test src/tests/e2e/admin-auth.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion` - passed: 21 passed, 3 intentionally skipped reduced-motion-only checks in non-reduced projects.
- Forbidden auth-stack/copy/homepage-effect source scan - passed.
- Task 1 RED proof: after adding only the test, lint/build/bootstrap/count passed and desktop Playwright failed because `/admin` did not redirect and `/admin/login` did not render the admin form.

## Decisions Made

- Preserved D-17 by implementing custom Prisma-backed sessions directly instead of stock Auth.js/NextAuth Credentials, JWT sessions, OAuth, Magic Link, registration, invite, or reset flows.
- Stored only session token hashes in PostgreSQL; plaintext opaque tokens are cookie-only.
- Kept `/admin` protected server-side through `requireAdminPage()` in the page component because guarding `src/app/admin/layout.tsx` would also guard `/admin/login`.
- Used `@next/env` in Playwright setup so browser tests load `.env.local` the same way the Next dev server does.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Moved admin guard from segment layout to protected page**
- **Found during:** Task 3
- **Issue:** A guarded `src/app/admin/layout.tsx` would wrap `/admin/login` as well as `/admin`, causing unauthenticated users to loop back to login before the login page could render.
- **Fix:** Kept `src/app/admin/layout.tsx` as an unprotected route-segment shell and called `requireAdminPage()` in `src/app/admin/page.tsx` before rendering protected admin content.
- **Files modified:** `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`
- **Verification:** Playwright unauthenticated redirect and successful login/sign-out tests passed across desktop, mobile, min-mobile, and reduced-motion projects.
- **Committed in:** `64a11d8`

**2. [Rule 1 - Bug] Fixed Next server-action export constraint**
- **Found during:** Task 3 build verification
- **Issue:** Next build rejected exported constants/types from `src/app/admin/login/actions.ts` because `"use server"` files can only export async functions at runtime.
- **Fix:** Made the login error constant and state type module-local and declared the client state shape in `AdminLoginForm`.
- **Files modified:** `src/app/admin/login/actions.ts`, `src/components/admin/AdminLoginForm.tsx`
- **Verification:** Re-ran `npm run lint`, `npm run build`, and admin Playwright verification successfully.
- **Committed in:** `64a11d8`

**3. [Rule 3 - Blocking] Normalized escaped Argon2 hashes across env loaders**
- **Found during:** Overall verification
- **Issue:** Next dotenv expansion requires `$` in Argon2 hashes to be escaped in `.env.local`, while Node/tsx `--env-file` preserves the backslashes. `npm run admin:bootstrap` then failed `ADMIN_PASSWORD_HASH` validation.
- **Fix:** Escaped the ignored local `.env.local` hash line and updated `getAuthEnv()` to normalize `\$` back to `$` before validating the Argon2 hash.
- **Files modified:** `src/lib/auth/env.ts` and ignored `.env.local`
- **Verification:** `npm run admin:bootstrap`, Prisma AdminUser count check, `npm run lint`, `npm run build`, and full admin Playwright verification passed.
- **Committed in:** `3ab4276`

**4. [Rule 1 - Bug] Scoped invalid-login alert assertion around Next route announcer**
- **Found during:** Task 3 Playwright verification
- **Issue:** Next injects a route announcer with `role="alert"`, making `page.getByRole("alert")` ambiguous after the real login error rendered.
- **Fix:** Filtered the assertion to the alert containing the generic login failure message.
- **Files modified:** `src/tests/e2e/admin-auth.spec.ts`
- **Verification:** Full four-project admin auth Playwright run passed.
- **Committed in:** `64a11d8`

---

**Total deviations:** 4 auto-fixed (3 Rule 1 bugs, 1 Rule 3 blocker).
**Impact on plan:** All fixes preserved the intended D-17 custom-session architecture and were required for correct Next.js route, server-action, env, and browser-test behavior.

## Issues Encountered

- `.env.local` remains ignored and uncommitted. Its `ADMIN_PASSWORD_HASH` value now has escaped dollar signs so Next dev reads the Argon2 hash correctly; `getAuthEnv()` normalizes the same value for tsx scripts.
- `next-env.d.ts` was repeatedly modified by `next build` from `.next/types` to `.next/dev/types`; this generated path change was reverted each time and not committed.

## User Setup Required

None for this local execution. The existing ignored `.env.local` was adjusted in place for dotenv-compatible Argon2 hash parsing and was not staged.

## Known Stubs

- `src/components/admin/AdminShell.tsx` intentionally renders the Phase 2 empty state copy `内容工作流尚未连接`. This is required by the UI-SPEC and will be replaced by the Markdown writing workflow in Phase 3; it does not block the Plan 02-02 login/session goal.

## Self-Check: PASSED

- Confirmed all key created/modified files exist on disk.
- Confirmed task and fix commits `eefb536`, `9a87747`, `64a11d8`, and `3ab4276` exist in git history.
- Confirmed final verification passed for lint, build, admin bootstrap, AdminUser count check, four-project admin auth Playwright, and forbidden source scans.

## Next Phase Readiness

Plan 02-03 can reuse `requireAdmin()` and `UnauthorizedAdminError` for create/edit/delete/publish/unpublish mutation guards. The local database has one bootstrapped admin row, and `/admin` now proves custom DB-backed login/session behavior end to end.

---
*Phase: 02-data-model-and-admin-access*
*Completed: 2026-07-03*

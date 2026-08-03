# Phase 02: Data Model and Admin Access - Pattern Map

**Mapped:** 2026-07-03
**Files analyzed:** 26
**Analogs found:** 17 / 26

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | transform | `package.json` | exact |
| `package-lock.json` | config | transform | `package-lock.json` | exact |
| `prisma.config.ts` | config | CRUD | none local; use `02-RESEARCH.md` Prisma 7 pattern | no-local-analog |
| `prisma/schema.prisma` | model | CRUD | none local; use `02-RESEARCH.md` schema skeleton | no-local-analog |
| `prisma/migrations/**/migration.sql` | migration | batch | none local; Prisma-generated | no-local-analog |
| `scripts/generate-admin-password-hash.ts` | utility | transform | none local | no-local-analog |
| `scripts/bootstrap-admin.ts` | utility | batch | none local | no-local-analog |
| `src/generated/prisma/**` | model | CRUD | none local; generated output | no-local-analog |
| `src/lib/db/prisma.ts` | service | CRUD | `src/lib/skeleton/probe-store.ts` | partial |
| `src/lib/auth/env.ts` | config | transform | `src/lib/skeleton/probe-gate.ts` | role-match |
| `src/lib/auth/password.ts` | utility | transform | none local | no-local-analog |
| `src/lib/auth/session.ts` | service | CRUD | `src/lib/skeleton/probe-store.ts` | partial |
| `src/lib/auth/admin.ts` | middleware | request-response | none local; use `02-RESEARCH.md` guard pattern | no-local-analog |
| `src/app/admin/layout.tsx` | route | request-response | `src/app/(public)/layout.tsx` | role-match |
| `src/app/admin/page.tsx` | route | request-response | `src/app/(public)/notes/page.tsx` | role-match |
| `src/app/admin/login/page.tsx` | route | request-response | `src/app/(public)/notes/page.tsx` | role-match |
| `src/app/admin/login/actions.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | partial |
| `src/app/admin/logout/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/lib/admin/post-mutations.ts` | service | CRUD | none local; use guard-first research pattern | no-local-analog |
| `src/app/api/admin/posts/create/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/app/api/admin/posts/edit/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/app/api/admin/posts/delete/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/app/api/admin/posts/publish/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/app/api/admin/posts/unpublish/route.ts` | route | request-response | `src/app/api/skeleton-probe/route.ts` | role-match |
| `src/tests/e2e/admin-auth.spec.ts` | test | request-response | `src/tests/e2e/public-shell.spec.ts` | role-match |
| `src/tests/e2e/admin-mutations.spec.ts` | test | request-response | `src/tests/e2e/skeleton.spec.ts` | exact |

## Pattern Assignments

### `package.json` and `package-lock.json` (config, transform)

**Analog:** `package.json`

**Script/dependency pattern** (lines 1-24):

```json
{
  "name": "personal-tech-lab-blog",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "test": "npm run lint",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "lucide-react": "1.22.0",
    "motion": "12.42.0",
    "next": "16.2.9",
    "react": "19.2.7",
    "react-dom": "19.2.7"
  }
}
```

**Apply:** Add Prisma, PostgreSQL adapter, Zod, password hashing, and script dependencies intentionally. Let `npm install` update `package-lock.json`; do not hand-edit lockfile content.

---

### `prisma.config.ts`, `prisma/schema.prisma`, `prisma/migrations/**`, `src/generated/prisma/**` (config/model/migration, CRUD/batch)

**Analog:** No local Prisma or database analog exists.

**Pattern source:** Use `02-RESEARCH.md` Pattern 1 and Prisma schema skeleton. The planner must create the first durable DB layer with Prisma 7 conventions:

```typescript
// Use the research pattern, not a local analog:
// - prisma.config.ts owns DATABASE_URL datasource configuration.
// - schema.prisma uses generator provider = "prisma-client".
// - generated client output goes under src/generated/prisma.
// - PostgreSQL access uses @prisma/adapter-pg.
```

**Apply:** Include content models `Post`, `Tag`, `Category`, `Series`, publication status enum, join tables, timestamps, slugs, and custom admin user/session models. Preserve D-17: do not plan stock NextAuth Credentials + JWT sessions as the auth model.

---

### `src/lib/db/prisma.ts` (service, CRUD)

**Analog:** `src/lib/skeleton/probe-store.ts`

**Imports and typed state pattern** (lines 1-7):

```typescript
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export type ProbeState = {
  count: number;
  updatedAt: string;
};
```

**Factory/singleton pattern** (lines 35-45, 87-95):

```typescript
export function createProbeStore(probePath: string) {
  let writeQueue: Promise<void> = Promise.resolve();

  async function readProbe(): Promise<ProbeState> {
    try {
      const contents = await readFile(probePath, "utf8");
      const parsed = JSON.parse(contents) as unknown;

      if (isProbeState(parsed)) {
        return parsed;
      }
    }
```

```typescript
const defaultStore = createProbeStore(defaultProbePath);

export function readProbe() {
  return defaultStore.readProbe();
}

export function writeProbe() {
  return defaultStore.writeProbe();
}
```

**Apply:** Copy the module-bound singleton shape, not the filesystem logic. `src/lib/db/prisma.ts` should import `"server-only"`, instantiate the Prisma 7 generated client with `PrismaPg`, cache it on `globalThis` in development, and export a single `prisma` instance.

---

### `src/lib/auth/env.ts` (config, transform)

**Analog:** `src/lib/skeleton/probe-gate.ts`

**Environment gate pattern** (lines 1-5):

```typescript
export function isSkeletonProbeEnabled() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_SKELETON_PROBE === "true"
  );
}
```

**Apply:** Use a small server-only env module for required auth/database values. Unlike the skeleton probe, admin auth must fail closed when `ADMIN_EMAIL`, password hash, session secret, or `DATABASE_URL` is missing.

---

### `src/lib/auth/session.ts`, `src/lib/auth/admin.ts`, `src/lib/auth/password.ts` (service/middleware/utility, CRUD/request-response/transform)

**Analog:** No local auth/session/password analog exists. Partial utility shape from `src/lib/skeleton/probe-store.ts`.

**Error handling pattern** (lines 46-59):

```typescript
} catch (error) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  ) {
    return emptyProbe;
  }

  throw error;
}

return emptyProbe;
```

**Serialized write pattern** (lines 62-84):

```typescript
async function writeProbe(): Promise<ProbeState> {
  const operation = writeQueue.then(async () => {
    const current = await readProbe();
    const next = {
      count: current.count + 1,
      updatedAt: new Date().toISOString(),
    };

    await mkdir(dirname(probePath), { recursive: true });
    await writeFile(probePath, JSON.stringify(next), "utf8");

    return next;
  });

  writeQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}
```

**Apply:** Implement a custom Prisma-backed admin session DAL. `session.ts` should create/read/delete 30-day DB sessions and set/read httpOnly cookies. `admin.ts` should expose `getAdminSession()`, `requireAdmin()`, and a page redirect helper. `password.ts` should wrap the approved hash/verify package. These files must not use stock NextAuth Credentials + JWT sessions.

---

### `src/app/admin/layout.tsx` (route, request-response)

**Analog:** `src/app/(public)/layout.tsx`

**Route-group layout pattern** (lines 1-8):

```typescript
import { PublicShell } from "@/components/public/PublicShell";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicShell>{children}</PublicShell>;
}
```

**Root layout boundary** (lines 10-19 in `src/app/layout.tsx`):

```typescript
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body>{children}</body>
    </html>
  );
}
```

**Apply:** Add `src/app/admin/layout.tsx` as a separate App Router branch. It should call the server-side admin page guard before rendering protected children. Do not modify `src/app/(public)/layout.tsx`, and do not import public canvas/background components into admin auth.

---

### `src/app/admin/page.tsx` and `src/app/admin/login/page.tsx` (route, request-response)

**Analog:** `src/app/(public)/notes/page.tsx`

**Server page + lab surface pattern** (lines 1-29):

```typescript
import Link from "next/link";

export default function NotesPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[1120px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          Notes
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          笔记尚未发布
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          写作工作流和内容系统接入后，已发布的技术笔记会出现在这里。
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-lab border border-[var(--lab-border-hairline)] px-4 text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:border-[var(--lab-border-active)] hover:bg-lab-surface hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
        >
          Back to Lab Index
        </Link>
      </div>
    </section>
  );
}
```

**Apply:** Login page can use the same compact server-rendered route style and lab tokens. Protected admin page should be intentionally minimal in Phase 2: enough to prove server-side auth, not a CMS editor.

---

### `src/app/admin/login/actions.ts`, `src/app/admin/logout/route.ts`, and `src/app/api/admin/posts/*/route.ts` (route, request-response)

**Analog:** `src/app/api/skeleton-probe/route.ts`

**Imports/runtime pattern** (lines 1-6):

```typescript
import { NextResponse } from "next/server";

import { isSkeletonProbeEnabled } from "@/lib/skeleton/probe-gate";
import { readProbe, writeProbe } from "@/lib/skeleton/probe-store";

export const runtime = "nodejs";
```

**Response helpers** (lines 8-17):

```typescript
function probeResponse(state: Awaited<ReturnType<typeof readProbe>>) {
  return NextResponse.json({
    status: "ok",
    count: state.count,
    updatedAt: state.updatedAt,
  });
}

function disabledProbeResponse() {
  return new NextResponse(null, { status: 404 });
}
```

**GET/POST handler shape** (lines 20-34):

```typescript
export async function GET() {
  if (!isSkeletonProbeEnabled()) {
    return disabledProbeResponse();
  }

  return probeResponse(await readProbe());
}

export async function POST() {
  if (!isSkeletonProbeEnabled()) {
    return disabledProbeResponse();
  }

  return probeResponse(await writeProbe());
}
```

**Apply:** Use the route-handler shape and `runtime = "nodejs"` where Prisma/password hashing requires Node. For post mutation routes, call `requireAdmin()` before parsing or mutating and return `401` for the project `UnauthorizedError`. Login is the exception: it validates credentials, creates a DB session, sets the httpOnly cookie, and redirects. Logout deletes the current session and clears the cookie.

---

### `src/lib/admin/post-mutations.ts` (service, CRUD)

**Analog:** No local admin service analog exists.

**Nearest local utility pattern:** `src/lib/skeleton/probe-store.ts` lines 35-84 show isolated typed operations behind exported functions. Use that structure only for module organization.

**Apply:** Expose create/edit/delete/publish/unpublish mutation boundaries or stubs that call `requireAdmin()` first. If route handlers own all Phase 2 mutation stubs, this service can be omitted, but the guard-first mutation boundary must still exist and be tested.

---

### `src/tests/e2e/admin-auth.spec.ts` (test, request-response)

**Analog:** `src/tests/e2e/public-shell.spec.ts`

**Page navigation and semantic assertions** (lines 11-29):

```typescript
test.describe("public shell and navigation @shell-nav", () => {
  test("renders PublicShell semantic landmarks and configured brand copy @shell-nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /Primary navigation/i }),
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 1, name: /Hans' Tech Lab/i }),
    ).toBeVisible();
    await expect(page.getByText("Hans 的技术实验室").first()).toBeVisible();
  });
```

**Apply:** Test unauthenticated `/admin` server redirect to `/admin/login`, login page rendering, no protected admin shell flash, and successful protected page access only when a valid custom DB-backed session cookie exists.

---

### `src/tests/e2e/admin-mutations.spec.ts` (test, request-response)

**Analog:** `src/tests/e2e/skeleton.spec.ts`

**Direct route-handler import test style** (lines 4-6, 33-46):

```typescript
import { GET, POST } from "../../app/api/skeleton-probe/route";
import { createProbeStore } from "../../lib/skeleton/probe-store";

test.describe("walking skeleton probe", () => {
  test("keeps the diagnostic API unavailable in production unless explicitly enabled", async () => {
    await withProbeEnv({ nodeEnv: "production" }, async () => {
      await expect((await GET()).status).toBe(404);
      await expect((await POST()).status).toBe(404);
    });
```

**API request test style** (lines 63-89):

```typescript
test("exposes a local skeleton API read and write contract", async ({
  request,
}) => {
  const initialRead = await request.get("/api/skeleton-probe");
  expect(
    initialRead.status(),
    "GET /api/skeleton-probe should return the current probe state",
  ).toBe(200);
  const initialState = await initialRead.json();

  const write = await request.post("/api/skeleton-probe", {
    data: { source: "playwright" },
  });
  expect(
    write.status(),
    "POST /api/skeleton-probe should persist a new probe value",
  ).toBe(200);

  const nextRead = await request.get("/api/skeleton-probe");
  expect(
    nextRead.status(),
    "GET /api/skeleton-probe should reflect the persisted write",
  ).toBe(200);
  const nextState = await nextRead.json();

  expect(nextState).not.toEqual(initialState);
});
```

**Apply:** Prefer `request.post()` direct endpoint tests for unauthenticated create/edit/delete/publish/unpublish rejection. Keep assertion messages endpoint-specific.

## Shared Patterns

### Import Paths And TypeScript Strictness

**Source:** `tsconfig.json` lines 21-23
**Apply to:** All new `src/**` files

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Use `@/` imports for app code. Relative imports are already used from tests into route modules; keep that style in `src/tests/e2e/*`.

### App Router Route Handlers

**Source:** `src/app/api/skeleton-probe/route.ts` lines 1-6, 20-34
**Apply to:** `src/app/admin/logout/route.ts`, `src/app/api/admin/posts/*/route.ts`

```typescript
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  if (!isSkeletonProbeEnabled()) {
    return disabledProbeResponse();
  }

  return probeResponse(await writeProbe());
}
```

Admin routes should replace the probe gate with auth/session checks. Mutation routes must call `requireAdmin()` before body parsing, validation, or writes.

### Server Route Isolation

**Source:** `src/app/(public)/layout.tsx` lines 1-8 and `src/app/(public)/page.tsx` lines 35-42
**Apply to:** All `src/app/admin/**`

```typescript
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicShell>{children}</PublicShell>;
}
```

```typescript
export default function Home() {
  return (
    <>
      <LabBackground enableCanvas>
        <HeroIdentity />
      </LabBackground>
      <ContentRouteStrip />
```

Keep the admin branch separate from the public route group. Do not import `LabBackground`, `HeroIdentity`, or canvas code into auth/backend files.

### Lab Styling Tokens For Admin UI Only

**Source:** `src/app/globals.css` lines 3-21, 161-224
**Apply to:** `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, admin form components if created

```css
@theme {
  --color-lab-base: #070a0f;
  --color-lab-surface: #111822;
  --color-lab-surface-strong: #182232;
  --color-lab-text: #e8f0f8;
  --color-lab-text-muted: #a8b3c2;
  --color-lab-muted: #728096;
  --color-lab-accent: #2ef2b5;
  --radius-lab: 8px;
}
```

```css
.lab-flow-border,
.lab-glow-card,
.lab-reading-surface {
  position: relative;
  overflow: hidden;
}
```

Use tokens and compact surfaces; do not copy homepage visual effects as backend/auth patterns.

### Playwright Configuration And API Tests

**Source:** `playwright.config.ts` lines 3-18 and `src/tests/e2e/skeleton.spec.ts` lines 63-89
**Apply to:** `src/tests/e2e/admin-auth.spec.ts`, `src/tests/e2e/admin-mutations.spec.ts`

```typescript
export default defineConfig({
  testDir: "./src/tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
```

Tests can rely on the existing dev-server fixture. For auth tests that need DB state, add explicit setup/teardown and avoid committed secrets.

## No Analog Found

Files with no close local match in the codebase. Planner should use `02-RESEARCH.md` patterns and official docs rather than forcing public/skeleton code to fit.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `prisma.config.ts` | config | CRUD | First Prisma 7 config in repo. |
| `prisma/schema.prisma` | model | CRUD | First database schema in repo. |
| `prisma/migrations/**/migration.sql` | migration | batch | No migrations exist yet; generated by Prisma. |
| `scripts/generate-admin-password-hash.ts` | utility | transform | No scripts directory or password hashing analog exists. |
| `scripts/bootstrap-admin.ts` | utility | batch | No DB bootstrap analog exists. |
| `src/generated/prisma/**` | model | CRUD | Generated output, not hand-written code. |
| `src/lib/auth/password.ts` | utility | transform | No crypto/password helper exists. |
| `src/lib/auth/admin.ts` | middleware | request-response | No auth guard or redirect helper exists. |
| `src/lib/admin/post-mutations.ts` | service | CRUD | No guarded content mutation service exists. |

## Metadata

**Analog search scope:** `src/app`, `src/lib`, `src/config`, `src/components/public`, `src/tests/e2e`, root config files.
**Files scanned:** 39 repo files outside `node_modules` and generated output; 30 files under `src`.
**Project skills:** No project-local `.codex/skills/` or `.agents/skills/` were found.
**Pattern extraction date:** 2026-07-03

**Explicit exclusions:** `src/components/visual/*`, homepage canvas code, and public visual-effect tests are not auth/backend analogs. They only provide an isolation rule: admin/backend code must not import public visual effects.

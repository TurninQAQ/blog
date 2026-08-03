# Chinese UI Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert all currently implemented user-visible public and admin UI copy to Chinese.

**Architecture:** Keep code identifiers, route paths, API payload fields, CSS classes, and test names unchanged. Change only visible labels, buttons, headings, placeholders, empty states, status messages, validation messages, and accessible labels that users encounter in the browser.

**Tech Stack:** Next.js App Router, React components, Playwright e2e tests.

---

### Task 1: Update UI expectations to Chinese

**Files:**
- Modify: `src/tests/e2e/public-shell.spec.ts`
- Modify: `src/tests/e2e/admin-auth.spec.ts`
- Modify: `src/tests/e2e/admin-authoring.spec.ts`

- [x] Replace English text expectations with Chinese equivalents for public shell, admin login, admin dashboard, editor, taxonomy, delete, and validation flows.
- [x] Run focused Playwright tests and confirm failures come from still-English production UI copy.

### Task 2: Translate public UI copy

**Files:**
- Modify: `src/lib/site.ts` or current site config file if present
- Modify: `src/app/(public)/*.tsx`
- Modify: `src/components/public/*.tsx`
- Modify: `src/components/markdown/MarkdownPreview.tsx`
- Modify: `src/components/skeleton/SkeletonProbeClient.tsx` and `src/app/__skeleton/page.tsx` only for visible internal probe copy

- [x] Translate navigation labels, hero, content modules, empty pages, footer, mobile nav labels, preview placeholders, and visible skeleton probe text.
- [x] Preserve route paths such as `/notes`, `/series`, `/archive`, `/search`.

### Task 3: Translate admin UI copy

**Files:**
- Modify: `src/app/admin/login/*.tsx`
- Modify: `src/components/admin/*.tsx`
- Modify: `src/lib/admin/post-input.ts`
- Modify: `src/lib/admin/post-mutations.ts`
- Modify: `src/lib/auth/admin.ts` and `src/lib/auth/csrf.ts` only for user-visible HTTP/error text

- [x] Translate login labels, admin shell, dashboard, post list, editor labels/placeholders, taxonomy controls, status messages, validation errors, and delete dialog.
- [x] Keep operation names and JSON status values unchanged.

### Task 4: Verify and commit

- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Run the affected Playwright suites across desktop/mobile/min-mobile/reduced-motion.
- [x] Update quick summary/state if needed and commit atomically.

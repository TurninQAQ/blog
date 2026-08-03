---
slug: wider-admin-editor
status: completed
completed: 2026-07-06
---

# Wider Admin Editor Summary

The admin article editor now gives the Markdown source and preview panes substantially more room on desktop.

Changes:

- Widened the protected admin content shell from `1120px` to `1520px`.
- Moved the metadata controls below the editor on normal desktop widths; they return to a right rail only on very wide screens.
- Increased Markdown editor and preview height from `360px` to `520px`.
- Added a Playwright layout regression test that failed at `331px` pane width before the fix and now requires at least `560px`.

Verification:

- `npm run lint`
- `npm run build`
- `npx playwright test src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-authoring.spec.ts` — 93 passed, 15 skipped

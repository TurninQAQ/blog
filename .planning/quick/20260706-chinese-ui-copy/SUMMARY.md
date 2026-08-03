---
slug: chinese-ui-copy
status: completed
completed: 2026-07-06
---

# Chinese UI Copy Summary

Converted the currently implemented public blog surface, admin login, admin shell, dashboard, post list, editor, taxonomy controls, delete dialog, validation errors, and visible skeleton probe text to Chinese.

Kept route paths, API operation names, JSON status values, CSS classes, and internal identifiers unchanged. Added an ASCII fallback for slug generation so Chinese taxonomy names no longer produce empty slugs.

Verification:

- `npm run lint`
- `npm run build`
- `npx playwright test` — 225 passed, 23 skipped

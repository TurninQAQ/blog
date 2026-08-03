---
phase: "06-brand-homepage-and-secure-authoring-experience-upgrade-with-"
reviewed: "2026-07-11T17:57:46Z"
depth: deep
files_reviewed: 6
files_reviewed_list:
  - src/components/public/content/PostVisualBlock.tsx
  - src/lib/admin/post-input.ts
  - src/lib/markdown/public-render.test.tsx
  - src/lib/markdown/public-render.tsx
  - src/lib/security/url-policy.test.ts
  - src/lib/security/url-policy.ts
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 06: UI Code Review Report

**Reviewed:** 2026-07-11T17:57:46Z
**Depth:** deep final closure review
**Files Reviewed:** 6
**Status:** clean

## Summary

All findings CR-01 and WR-01 through WR-07 are closed. The final URL contract now accepts only canonical lowercase `https://` for external cover and Markdown images; uppercase schemes are routed through the explicit-scheme branch and rejected consistently before persistence or import. This matches the lowercase protocol behavior of public sanitization. Lowercase external images retain `no-referrer`, while managed `/media/...` images remain unaffected.

The final scoped code passes lint, focused unit/schema tests, and whitespace validation with no new blocker, warning, or information finding.

## Re-review Audit Trail

| Original ID | Disposition | Re-review evidence |
| --- | --- | --- |
| CR-01 | Closed | `PostEditorShell` tracks a monotonically increasing form revision, preserves dirty state after an overlapping edit, and disables publication while dirty (`src/components/admin/PostEditorShell.tsx:372`, `src/components/admin/PostEditorShell.tsx:413-417`, `src/components/admin/PostEditorShell.tsx:562-654`, `src/components/admin/PostEditorShell.tsx:747-758`). The slow-save browser test proves zero publication requests before a second save and verifies the newer title/tag in the database (`src/tests/e2e/admin-ui.spec.ts:712-823`). |
| WR-01 | Closed | Public-scoped tone colors now use the readable dark palette (`src/app/globals.css:1102-1116`), and the rendered article test computes all four contrast ratios against the effective background and requires at least 4.5:1 (`src/tests/e2e/public-content-library.spec.ts:1366-1429`). |
| WR-02 | Closed | `file.size` is rejected before `arrayBuffer()` (`src/components/admin/PostEditorShell.tsx:446-454`). The browser regression uses a 1 MiB + 1 byte file, preserves existing fields, and instruments `Blob.prototype.arrayBuffer` to prove zero reads (`src/tests/e2e/admin-authoring.spec.ts:790-836`). |
| WR-03 | Closed | The overwrite predicate now includes `slug`, `seriesOrder`, and `featured` (`src/components/admin/PostEditorShell.tsx:109-125`). The slug-only cancellation test verifies the prompt and unchanged form (`src/tests/e2e/admin-authoring.spec.ts:839-868`). |
| WR-04 | Closed | Public H2-H5 sizes are explicitly monotonic at 28/23/19/16px (`src/app/globals.css:1078-1096`), and a rendered authored H1-H4 fixture asserts strictly descending computed sizes after semantic demotion (`src/tests/e2e/public-content-library.spec.ts:1342-1364`). |
| WR-05 | Closed | Browser coverage requests every desktop/mobile/fallback asset with 200 + `image/webp`, decodes all three, and separately checks the rendered mobile and note-fallback images have nonzero natural width (`src/tests/e2e/visual-effects.spec.ts:144-184`, `src/tests/e2e/visual-effects.spec.ts:250-273`, `src/tests/e2e/public-content-library.spec.ts:921-942`). |
| WR-06 | Closed | `createHeadingId` now reserves `article-heading-*` while retaining duplicate suffixes (`src/lib/markdown/public-render.tsx:116-130`). Unit coverage proves `Main Content` cannot emit `id="main-content"` (`src/lib/markdown/public-render.test.tsx:57-95`), and public-article E2E expectations use the prefixed TOC targets (`src/tests/e2e/public-content-library.spec.ts:1016-1027`, `src/tests/e2e/public-content-library.spec.ts:1126-1167`). A source-wide public ID check found no shell ID in this namespace. |
| WR-07 | Closed | `isAbsoluteHttpsUrl` now requires the canonical lowercase prefix (`src/lib/security/url-policy.ts:21-32`), while the case-insensitive explicit-scheme detector ensures uppercase HTTPS is rejected rather than mistaken for a relative path (`src/lib/security/url-policy.ts:8-9`, `src/lib/security/url-policy.ts:50-65`). Cover and Markdown policy tests place uppercase HTTPS in the rejected sets (`src/lib/security/url-policy.test.ts:29-47`, `src/lib/security/url-policy.test.ts:70-86`), and the server draft schema applies these same predicates to both fields (`src/lib/admin/post-input.ts:153-171`, `src/lib/admin/post-input.ts:198-213`). |

## Final Disposition

No active findings remain in the final narrow review scope.

## Validation

- `npm run lint` — passed.
- `./node_modules/.bin/vitest run --no-cache src/lib/security/url-policy.test.ts src/lib/markdown/public-render.test.tsx src/lib/admin/post-input.test.ts` — 3 files, 72 tests passed.
- `git diff --check -- <6 reviewed files>` — passed.
- Static call-chain verification confirmed both server cover validation and Markdown body validation reuse the canonical URL policy.
- Lowercase external images retain `no-referrer`; managed media remains without that external-only policy. The defensive case-insensitive predicate in `PostVisualBlock` does not broaden server acceptance.
- Playwright suites were inspected for behavioral coverage but not executed during this report-only re-review.

---

_Initial review: 2026-07-11T16:54:19Z — 1 Critical, 5 Warnings_
_Re-review: 2026-07-11T17:32:30Z — all original findings closed; 1 new Warning_
_Final narrow re-review: 2026-07-11T17:52:51Z — WR-06 closed; 1 new Warning_
_Final closure review: 2026-07-11T17:57:46Z — WR-07 closed; clean_
_Reviewer: generic-agent workaround (gsd-code-reviewer role preamble)_
_Depth: deep final closure review_

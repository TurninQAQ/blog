# Phase 04 - UI Review

**Audited:** 2026-07-07
**Baseline:** `.planning/phases/04-public-content-library/04-UI-SPEC.md`
**Screenshots:** not captured (no dev server responded on `localhost:3000`, `5173`, or `8080`)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | Contract copy now matches the Chinese-first public states and destructive confirmation requirement. |
| 2. Visuals | 3/4 | Public list, article, search, taxonomy, and recovery structures are implemented, but rendered breakpoint screenshots were unavailable. |
| 3. Color | 3/4 | Lab palette is consistent, but one public error action and phase-scoped admin errors still use non-contract accent/destructive treatments. |
| 4. Typography | 3/4 | Public surfaces and Markdown headings use the approved scale, but scoped admin publication files still contain `13px`, `20px`, and `28px` text. |
| 5. Spacing | 3/4 | Major layout widths and touch targets match the contract, but several public components still use undeclared 12px/20px/odd-pixel spacing. |
| 6. Experience Design | 4/4 | Public empty/error/404 states, destructive confirmation, published-only boundaries, and responsive reading/search flows are covered. |

**Overall: 20/24**

---

## Top 3 Priority Fixes

1. **Normalize phase-scoped admin typography and error color** - `AdminPublishControls`, `AdminPostList`, and `PostEditorShell` still use out-of-scale admin text and hard-coded red values. Replace `13px`/`20px`/`28px` with the declared roles where these controls sit inside Phase 04 publication UI, and replace `#ff8a8a`/`rgba(255,107,107,...)` with the UI-SPEC destructive/error tokens.
2. **Tighten public spacing to the declared scale** - public components still use `gap-3`, `py-3`, `p-5`, `space-y-3`, and CSS values like `6px`, `3px`, and `10px 12px`. Convert these to the declared 4/8/16/24/32/48/64 scale or document exact exceptions.
3. **Reduce accent on public error recovery** - `src/app/(public)/error.tsx` gives the retry action an accent border/text treatment. Keep the recovery action neutral, or reserve accent for the contract-listed elements while leaving the home link as the non-primary recovery path.

---

## Prior Top 3 Fix Status

1. **Unpublish confirmation:** RESOLVED. `src/components/admin/AdminPublishControls.tsx:68` now calls `window.confirm()` with the required destructive copy before `runMutation("unpublish")`, and `src/tests/e2e/admin-authoring.spec.ts:529` verifies dismissal preserves `PUBLISHED` state.
2. **Public error/404 treatments:** RESOLVED. `src/app/(public)/not-found.tsx:10` and `src/app/(public)/error.tsx:16` now render `内容暂时无法加载。请刷新页面或稍后再试。` plus a home recovery link, and `src/tests/e2e/public-content-library.spec.ts:1031` / `:1290` verify hidden slugs use that copy.
3. **Markdown heading typography:** RESOLVED. `.lab-markdown-preview h1-h6` now share `font-size: 24px` at `src/app/globals.css:249`, and `src/tests/e2e/public-content-library.spec.ts:1301` guards against the previous `20px`/`18px` rules.

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

**PASS:** Public copy matches the UI-SPEC contract. `/notes` uses the required title and empty-state body at `src/app/(public)/notes/page.tsx:34`, search uses the required label/placeholder/no-query/no-result copy at `src/components/public/content/SearchForm.tsx:18`, `src/components/public/content/SearchForm.tsx:32`, `src/components/public/content/SearchResults.tsx:31`, and `src/components/public/content/SearchResults.tsx:41`.

**PASS:** Destructive confirmation copy is now present exactly in `src/components/admin/AdminPublishControls.tsx:70`, and public 404/error recovery copy is present in `src/app/(public)/not-found.tsx:10` and `src/app/(public)/error.tsx:16`.

### Pillar 2: Visuals (3/4)

**PASS:** The public content library is structured around scannable surfaces rather than decorative card walls: dense note rows in `src/components/public/content/PublicNoteCard.tsx:32`, article rail/body layout in `src/components/public/content/ArticlePage.tsx:37`, search results in `src/components/public/content/SearchResults.tsx:47`, and related articles below TOC/mobile flow in `src/components/public/content/RelatedArticlesRail.tsx:31`.

**WARNING:** No dev server was available, so this audit could not capture desktop/tablet/mobile screenshots to verify actual wrapping, visual balance, or overlap at the UI-SPEC target breakpoints. Code and Playwright coverage are strong, but Visuals stays at 3/4 without rendered screenshot evidence.

### Pillar 3: Color (3/4)

**PASS:** Public surfaces consistently use the lab base/surface/text/accent system, and accent appears primarily on labels, focus rings, selected markers, links, and key metadata. Source scan found 77 public accent-token lines, mostly from `text-lab-accent`, `outline-lab-accent`, `lab-border-active`, and controlled glow/focus treatments.

**WARNING:** `src/app/(public)/error.tsx:21` gives the retry button an accent border/text treatment. The UI-SPEC reserves accent for listed discovery/focus/link states; error recovery should remain neutral unless promoted into the contract.

**WARNING:** Phase-scoped admin publication surfaces still use non-contract red values: `src/components/admin/AdminPublishControls.tsx:146` uses `text-[#ff8a8a]`, and `src/components/admin/PostEditorShell.tsx:411` uses `rgba(255,107,107,...)` plus `text-[#ff8a8a]` instead of the declared destructive/error tokens.

### Pillar 4: Typography (3/4)

**PASS:** Public routes/components use the declared 14px, 16px, 24px, and 40px roles with 400/600 weights. Examples include public H1 display at `src/app/(public)/notes/page.tsx:17`, card headings at `src/components/public/content/PublicNoteCard.tsx:38`, body text at `src/components/public/content/PublicNoteCard.tsx:43`, and metadata at `src/components/public/content/PublicNoteCard.tsx:47`.

**PASS:** The previous Markdown heading defect is fixed: all `.lab-markdown-preview h1-h6` rules now use `font-size: 24px` at `src/app/globals.css:249`.

**WARNING:** Phase-scoped admin publication files still use typography outside the Phase 04 scale: `text-[13px]` in `src/components/admin/AdminPublishControls.tsx:146`, `src/components/admin/AdminPostList.tsx:90`, and `src/components/admin/PostEditorShell.tsx:499`; `text-[28px]` / mobile `text-[20px]` in `src/components/admin/AdminPostList.tsx:57` and `src/components/admin/PostEditorShell.tsx:371`; and `text-[20px]` in `src/components/admin/AdminPostList.tsx:150`.

### Pillar 5: Spacing (3/4)

**PASS:** Major layout dimensions match the UI-SPEC: public shells use `max-w-[1120px]` with responsive padding in `src/app/(public)/notes/page.tsx:11`, article layout uses `720px` + `280px` columns in `src/components/public/content/ArticlePage.tsx:37`, and 44px interaction targets are used in TOC, related, and series navigation at `src/components/public/content/TableOfContents.tsx:57`, `src/components/public/content/RelatedArticlesRail.tsx:52`, and `src/components/public/content/SeriesNavigation.tsx:27`.

**WARNING:** The spacing scan found 51 public lines using values outside the declared named scale. Current examples include `gap-3` / `py-3` in `src/components/public/content/SeriesNavigation.tsx:27`, `p-5` in `src/components/public/content/PublicEmptyState.tsx:10` and `src/components/public/content/SearchForm.tsx:12`, `space-y-3` in `src/components/public/content/RelatedArticlesRail.tsx:47`, plus CSS odd values `margin-top: 6px`, `text-underline-offset: 3px`, `padding: 2px 6px`, and `padding: 10px 12px` in `src/app/globals.css:267`, `:284`, `:297`, and `:341`.

### Pillar 6: Experience Design (4/4)

**PASS:** Public query boundaries are strong. `publishedPostWhere` enforces `PUBLISHED` plus non-null `publishedAt` at `src/lib/public/content-queries.ts:97`, and list/search/homepage/detail/archive/series/related helpers reuse it at `src/lib/public/content-queries.ts:331`, `:354`, `:387`, `:408`, `:523`, `:596`, and `:705`.

**PASS:** Public 404, error, empty, and destructive states are now covered. Hidden article/taxonomy slugs render the generic public recovery copy in `src/tests/e2e/public-content-library.spec.ts:1014` and `:1275`; cancellation of destructive unpublish is tested at `src/tests/e2e/admin-authoring.spec.ts:529`.

**PASS:** Search and article reading interactions match the contract: GET search has visible labels and bounded input at `src/components/public/content/SearchForm.tsx:9`, empty query returns no result list at `src/components/public/content/SearchResults.tsx:28`, mobile TOC uses native `details` at `src/components/public/content/TableOfContents.tsx:28`, and Markdown strips raw HTML / sanitizes rendered content in `src/lib/markdown/public-render.tsx:141` and `:345`.

---

## Verification Evidence

- `npm run build`: passed after the UI fixes.
- `npm test`: passed after the UI fixes.
- `npx playwright test src/tests/e2e/public-content-library.spec.ts src/tests/e2e/admin-authoring.spec.ts --project=desktop --project=mobile --project=min-mobile --project=reduced-motion`: 152 passed after the UI fixes.
- Final full matrix after the UI fixes: `timeout 900 npx playwright test --project=desktop --project=mobile --project=min-mobile --project=reduced-motion`: 357 passed, 23 skipped.
- Earlier full matrix before these UI fixes: 349 passed, 23 skipped.
- Phase verifier status before UI fixes: 45/45 must-haves verified.
- Security status: 26/26 threats closed, 0 blocking open threats.

---

## Files Audited

- `.planning/phases/04-public-content-library/04-UI-SPEC.md`
- `.planning/phases/04-public-content-library/04-CONTEXT.md`
- `.planning/phases/04-public-content-library/04-01-PLAN.md` through `04-11-PLAN.md`
- `.planning/phases/04-public-content-library/04-01-SUMMARY.md` through `04-11-SUMMARY.md`
- `.planning/phases/04-public-content-library/04-VERIFICATION.md`
- `.planning/phases/04-public-content-library/04-SECURITY.md`
- `src/app/(public)/**`
- `src/components/public/**`
- `src/components/admin/AdminPublishControls.tsx`
- `src/components/admin/AdminPostList.tsx`
- `src/components/admin/PostEditorShell.tsx`
- `src/lib/public/content-queries.ts`
- `src/lib/markdown/public-render.tsx`
- `src/app/globals.css`
- `src/tests/e2e/public-content-library.spec.ts`
- `src/tests/e2e/public-shell.spec.ts`
- `src/tests/e2e/admin-authoring.spec.ts`

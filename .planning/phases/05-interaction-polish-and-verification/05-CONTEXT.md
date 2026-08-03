# Phase 5: Interaction Polish and Verification - Context

**Gathered:** 2026-07-10T08:42:54+08:00
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 5 makes the existing MVP release-ready. It verifies the complete public reading and single-admin publishing workflows, closes user-visible interaction and responsive defects, validates reduced-motion behavior, and records reproducible release evidence.

This phase does not add product capabilities or choose and implement a production hosting provider. Comments, reactions, multi-author roles, MDX demos, local media uploads, external publishing sync, a dedicated search engine, and major new animation concepts remain outside Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Release Verification Scope
- **D-01:** Verify the full public reader path: homepage, article list, article detail, search, tags, categories, archive, series, series navigation, and related articles.
- **D-02:** Verify the full protected admin path: login, create, WYSIWYG edit, save draft, publish, unpublish, delete, and category/tag/series assignment.
- **D-03:** Draft leakage is a release blocker. Drafts must remain absent from the homepage, list, detail, search, tags, categories, archive, series, and related-article surfaces.
- **D-04:** Re-verify the WYSIWYG editor's release-critical behavior for code blocks, tables, image URLs, Markdown persistence, and compatibility blocking for unsupported content.

### Visual and Interaction Polish Standard
- **D-05:** Visually inspect every key public page plus the admin login, post list/dashboard, and editor surfaces.
- **D-06:** Responsive verification must cover 320px, 390px, and desktop widths. No horizontal page overflow, inaccessible controls, text overlap, or incoherent layout is acceptable.
- **D-07:** Reduced-motion is mandatory verification scope. Nonessential motion must stop or degrade safely, canvas animation must be inactive or safely disabled, and all content must remain complete and readable.
- **D-08:** Fix only user-visible polish defects such as blank effect layers, jank, obstruction, overlap, unreadable text, or broken controls. Do not add a new large animation system in this phase.

### Quality Gates
- **D-09:** `npm run lint`, `npm run test:unit`, and `npm run build` must all pass before Phase 5 can complete.
- **D-10:** Playwright verification should be grouped around public content, admin publishing, visual/responsive behavior, and authentication/security boundaries.
- **D-11:** Preserve screenshots for representative desktop, mobile, and reduced-motion states as release evidence.
- **D-12:** Record every non-blocking defect. Apply small, directly scoped fixes when practical; release-safe residual issues must be listed as known limitations.

### Release Record and Remaining Items
- **D-13:** Final release documentation must preserve the commands run, verification results, screenshot evidence, and known limitations.
- **D-14:** Production deployment prerequisites belong in a provider-neutral launch checklist. Phase 5 must not block on choosing or implementing a hosting provider.
- **D-15:** Carry forward the existing v2 deferrals without expanding their scope or creating a new v2 roadmap during this phase.
- **D-16:** Phase 5 is complete only when all mandatory gates pass, required evidence exists, and no remaining issue breaks a core public or admin workflow.

### The Agent's Discretion
- Choose exact Playwright file grouping, helper reuse, test data setup, screenshot filenames, and evidence directory structure.
- Choose the smallest implementation fix for each verified defect while preserving the existing public/admin boundaries and technical-lab visual language.
- Choose the release-note and launch-checklist file layout, provided all evidence required by D-13 is easy to audit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and Requirements
- `.planning/PROJECT.md` - Defines the personal technical blog, single-author workflow, visual identity, performance constraint, and v1 scope.
- `.planning/REQUIREMENTS.md` - Defines QUAL-05 and the existing v2 deferrals that Phase 5 must verify and preserve.
- `.planning/ROADMAP.md` - Defines the Phase 5 goal, success criteria, dependencies, and intended three-part plan split.
- `.planning/STATE.md` - Records the true implementation state of Phases 1 through 4 and the current WYSIWYG editor cutover.

### Prior Phase Decisions
- `.planning/phases/04-public-content-library/04-CONTEXT.md` - Defines every public route, published-only behavior, draft-leakage boundary, and reading-layout decision under verification.
- `.planning/phases/03-markdown-authoring-workflow/03-CONTEXT.md` - Defines the Tiptap WYSIWYG authoring model, Markdown compatibility boundary, admin workflow, and image-URL-only policy.
- `.planning/phases/02-data-model-and-admin-access/02-CONTEXT.md` - Defines single-admin authentication, protected routing, CSRF behavior, and guard-first mutation requirements.

### Existing Verification and Runtime Boundaries
- `src/tests/e2e/public-content-library.spec.ts` - Existing public content, published-only, taxonomy, archive, series, search, related-article, and homepage coverage.
- `src/tests/e2e/public-shell.spec.ts` - Existing public shell and responsive behavior coverage.
- `src/tests/e2e/visual-effects.spec.ts` - Existing canvas fallback, mobile overflow, and reduced-motion verification.
- `src/tests/e2e/admin-authoring.spec.ts` - Existing admin writing and WYSIWYG browser coverage.
- `src/tests/e2e/admin-auth.spec.ts` - Existing login, logout, and protected-route coverage.
- `src/tests/e2e/admin-mutations.spec.ts` - Existing publishing, revalidation, CSRF, and guard-first mutation coverage.
- `src/lib/public/content-queries.ts` - Central published-only public query boundary.
- `src/lib/public/revalidate.ts` - Mutation-driven public cache revalidation boundary.
- `src/lib/admin/post-mutations.ts` - Protected create, edit, delete, publish, unpublish, and taxonomy mutation boundary.
- `src/components/visual/SignalNetworkCanvas.tsx` - Active canvas animation lifecycle and reduced-motion behavior.
- `src/components/visual/LabBackground.tsx` - Static visual fallback used when the interactive layer is unavailable.
- `src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx` - Active rendered editing canvas.
- `src/components/admin/wysiwyg/WysiwygToolbar.tsx` - Active editor controls, including URL-based image insertion.
- `src/lib/admin/wysiwyg/compatibility.ts` - Unsupported Markdown compatibility gate.
- `src/lib/admin/wysiwyg/markdown-adapter.ts` - Markdown-to-editor and editor-to-Markdown persistence boundary.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- The current Playwright suites already cover most Phase 5 behavior. Extend or reorganize them only where release-level gaps remain rather than replacing the suites.
- `compatibility.test.ts` and `markdown-adapter.test.ts` provide focused unit coverage for the WYSIWYG compatibility and round-trip boundaries.
- `SignalNetworkCanvas.tsx` already reacts to `prefers-reduced-motion`; Phase 5 should verify its lifecycle and adjust only demonstrated defects.
- Public content queries share a `publishedPostWhere` boundary, which is the primary implementation point for proving that drafts cannot leak.

### Established Patterns
- Visible public and admin copy is Chinese; routes, schema fields, and code identifiers remain English.
- Public routes and protected admin routes are separated, with admin-only editor code isolated from public bundles.
- Admin mutations authorize first through `requireAdmin()` before trusting submitted data or writing to the database.
- Public content is Markdown-backed, server-rendered, and sanitized; raw HTML remains disabled.
- The public homepage may use ambient motion, but reading surfaces stay calm and prioritize legibility.
- Existing effects use CSS and 2D canvas with static fallbacks instead of an always-on WebGL stack.

### Integration Points
- Add missing release-level assertions to the existing E2E groups for public, admin, visual/responsive, and auth/security behavior.
- Run the existing unit, lint, build, and Playwright commands as explicit release gates.
- Capture representative browser screenshots during visual verification and reference them from the Phase 5 verification/release artifacts.
- Record any scoped fixes and residual known limitations in the Phase 5 summary and release documentation.

</code_context>

<specifics>
## Specific Ideas

- Verification must cover both 320px and 390px mobile widths in addition to desktop.
- Reduced-motion evidence must show that content remains complete while pointer-follow and continuous canvas animation are inactive.
- The release decision is evidence-based: passing automated checks alone is insufficient without visual evidence, and visual approval alone is insufficient without passing mandatory checks.
- Polish work should preserve the current design and interaction model rather than introducing a redesign.

</specifics>

<deferred>
## Deferred Ideas

- Production hosting-provider selection and provider-specific deployment automation.
- Comments, reactions, and other reader interaction features.
- Multi-author accounts and role-based permissions.
- MDX interactive demos and arbitrary embedded components.
- Local image upload, storage, media processing, and media management.
- External publishing-platform synchronization.
- A dedicated search engine.
- Major new animation concepts or a heavy WebGL redesign.

</deferred>

---

*Phase: 5-Interaction Polish and Verification*
*Context gathered: 2026-07-10T08:42:54+08:00*

# Design QA: Hans‘s Blog Orbital Mecha Experience

**Findings**

- No actionable P0, P1, or P2 mismatch remains in the final public or authoring comparison.
- The runtime orbital mecha is an original production asset rather than the exact robot embedded in the concept screenshot. Its ivory/graphite base with cobalt, coral, and cyan accents, technical ink linework, and right-heavy composition preserve the selected direction while keeping the Hans‘s Blog identity, text, and controls live.
- Built-in imagegen brief summary: create an original orbital engineering-lab mecha with purposeful asymmetric machinery, ivory/graphite armor, cobalt/coral/cyan accents, technical manga linework, and dedicated desktop/mobile/fallback crops. Negative constraints were explicit: no V-fin, twin eyes, samurai mask, red chin, Gundam chest/shoulders, shield, weapons, logos, or text.

**Comparison Target**

- Source visual truth: `docs/design/mecha-manga-option-1.png`
- Current public desktop evidence: `output/playwright/phase6/prod-home-desktop.png` (1440×900 project viewport; 1425×1696 retained full-page bitmap)
- Current responsive evidence: `output/playwright/phase6/prod-home-390.png` (390×844 project viewport) and `output/playwright/phase6/prod-home-320.png` (320×720 project viewport)
- Current authoring evidence: `output/playwright/phase6/prod-admin-editor.png` and `output/playwright/phase6/prod-admin-image-modal.png`
- Integrity manifest: `output/playwright/phase6/evidence-manifest-2026-07-11.json` records all five files, dimensions, byte sizes, and SHA-256 digests.
- State: light-theme public homepage plus authenticated desktop authoring/editor image-dialog states.

**Required Fidelity Surfaces**

- Fonts and typography: the heavy display stack reproduces the source's condensed manga-cover hierarchy without negative letter spacing; Chinese body copy remains neutral and readable. The title wrapping and small navigation weights are stable at all checked widths.
- Spacing and layout rhythm: the final hero keeps copy on the left, artwork dominant on the right, and a visible featured-note band at the fold. Header height, rules, CTA spacing, and responsive section boundaries follow the reference without horizontal overflow.
- Colors and visual tokens: the artwork uses ivory, graphite, cobalt, coral, and cyan; the surrounding product UI keeps paper white, ink black, cobalt, signal red, safety yellow, and screentone gray. Contrast remains adequate on reading surfaces and controls.
- Image quality and asset fidelity: the orbital desktop/mobile/fallback WebP assets are sharp at their rendered sizes, use purpose-built crops, and show no stretching, transparency halo, or placeholder treatment.
- Copy and content: the English brand is consistently Hans‘s Blog; public supporting copy remains Chinese, uses real blog data, and preserves the owner identity, email contact, content routes, and primary calls to action.
- Authoring surfaces: the editor retains a calm white writing canvas inside the same ink/cobalt system, while Markdown import, all formatting controls, and the local-file/URL image dialog remain legible and operational.

**Primary Interactions Tested**

- Header navigation and homepage CTA links
- Mobile menu open, close, focus containment, Escape handling, and focus return
- Desktop pointer parallax and manga-stroke response
- Mobile and reduced-motion static fallbacks
- Article table of contents and public content navigation
- Markdown import, formatting toolbar, image picker/drop/paste, save, publish, and private-to-public managed-media flow

**Console Check**

- Fresh browser session: 0 errors, 0 warnings.

**Comparison History**

Entries 1–3 below are the Phase 5 historical mecha-redesign trail; those paths are retained for provenance and are not the current final evidence.

1. Initial responsive pass found a P2 mobile composition issue: the portrait mecha occupied too little width and left an unintended empty column. The mobile artwork wrapper was changed to a full-bleed, stable-height crop. Post-fix evidence: `output/playwright/mecha-redesign/home-mobile-final.png` and `output/playwright/mecha-redesign/home-min-mobile-final.png`.
2. Initial desktop full-view pass found a P2 hierarchy mismatch: the route strip appeared at the fold where the concept showed the latest-note band. Featured notes were moved directly below the hero and compacted for desktop. Post-fix evidence: `output/playwright/mecha-redesign/home-desktop-final.png`.
3. The Phase 5 closeout comparison found no remaining P0/P1/P2 issue at that time. Historical evidence: `output/playwright/mecha-redesign/design-comparison-home.png` and `output/playwright/mecha-redesign/design-comparison-title.png`.
4. Phase 6 replaced the retained current evidence with five production-state captures covering the Hans‘s Blog orbital homepage at desktop/390/320 and the desktop editor/image modal. Visual inspection found no new P0/P1/P2 issue.

**Implementation Checklist**

- [x] Match the selected light manga-mecha composition and palette.
- [x] Keep public text and controls live and functional.
- [x] Provide dedicated desktop and mobile artwork.
- [x] Degrade motion for mobile and reduced-motion users.
- [x] Keep reading surfaces calm and preserve the admin theme.
- [x] Verify responsive layouts, interactions, console, lint, tests, and production build.
- [x] Retain exactly five Phase 6 screenshots with dimensions and SHA-256 values in the current evidence manifest.

**Final Automation Evidence**

- Full headed four-project matrix: 491 passed, 32 conditional skips, 1 isolated timeout.
- The exact timed-out case was rerun independently and passed 3/3; the timeout remains disclosed rather than being rewritten as a clean full-matrix run.
- Complete reduced-motion project: 122 passed, 9 conditional skips.
- Current unit baseline: 18 files, 217 passed. Both full and production-only npm audit views report 0 vulnerabilities.

**Follow-up Polish**

- No blocking polish remains. Future content-specific cover art can reuse the established manga-note visual slot without changing this layout.

final result: passed

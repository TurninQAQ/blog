---
status: resolved
trigger: "Phase 05-04 reduced-motion Playwright run intermittently expected the ProseMirror focus outline to be cobalt rgb(7, 95, 206), but observed ink rgb(16, 18, 23)."
created: "2026-07-11T20:28:00+08:00"
updated: "2026-07-11T21:06:00+08:00"
---

# Debug Session: Admin Focus Outline Flake

## Symptoms

- expected: The focused ProseMirror editor exposes the approved, accessible focus outline required by the current admin visual contract.
- actual: The reduced-motion run intermittently observes a solid ink outline instead of the asserted solid cobalt outline.
- error: `admin-ui.spec.ts:624` expected `rgb(7, 95, 206)` but received `rgb(16, 18, 23)`.
- timeline: The same full headed matrix passed in Phase 05-02, then failed only this assertion in the immediately following Phase 05-04 run; 464 other tests passed and 23 were conditionally skipped.
- reproduction: Run the reduced-motion project for the admin UI focus-outline test around `src/tests/e2e/admin-ui.spec.ts:609` and repeat to detect intermittent state.

## Current Focus

hypothesis: Confirmed and fixed — zero reduced-motion transition duration prevents Chromium from exposing a time-zero ink outline before the intended cobalt focus ring.
test: Self-verification complete: unchanged immediate regression repeated headless and headed, full reduced-motion admin UI coverage, lint, and exact diff/worktree inspection.
expecting: Human/session-manager confirmation before any resolution/archive step; no commit is authorized in this investigation.
next_action: Return the human-verify checkpoint with exact root cause, one-line fix, and verification evidence; leave this session unarchived.
reasoning_checkpoint:
  hypothesis: "The reduced-motion selector sets a nonzero 0.01ms transition duration on ProseMirror while transition-property is all; focus therefore transitions outline-color/offset/width from the prior ink/3px state to cobalt/2px, and the immediate test sometimes samples transition time zero."
  confirming_evidence:
    - "A 20-navigation probe reproduced 9 immediate failures and 4 microtask failures, with zero failures after one animation frame."
    - "Every captured failure retained the same connected, active, :focus-visible node with the cobalt token and selector present, while live CSSTransitions named outline-color, outline-offset, and outline-width at currentTime 0."
    - "Computed transitionDuration was 1e-05s and transitionProperty was all, exactly matching the admin reduced-motion 0.01ms rule."
  falsification_test: "Change only 0.01ms to 0s; if the unchanged immediate assertion or concise probe can still observe ink, the hypothesis is wrong."
  fix_rationale: "A zero duration prevents creation of the outline transitions at their source and better matches the reduced-motion intent; no token, selector, focus modality, or expected color needs to change."
  blind_spots: "Verification is Chromium/Playwright-specific and the universal admin rule also covers other descendants; the change only removes already-negligible reduced-motion transitions and does not alter normal-motion behavior."
tdd_checkpoint: not applicable until root cause is established

## Evidence

- timestamp: "2026-07-11T20:29:00+08:00"
  checked: Debug knowledge base
  found: `.planning/debug/knowledge-base.md` does not exist, so there is no prior matching resolution to reuse.
  implication: This needs direct investigation rather than a known-pattern shortcut.
- timestamp: "2026-07-11T20:29:20+08:00"
  checked: Worktree scope
  found: The worktree already contains modified `next-env.d.ts` plus untracked release notes, screenshots, Phase 5 output, and this debug directory.
  implication: Preserve all pre-existing changes and restrict any eventual patch to evidence-supported test/style files plus this debug record.
- timestamp: "2026-07-11T20:29:40+08:00"
  checked: Playwright reduced-motion project and failing test excerpt
  found: The project sets Chromium `reducedMotion: "reduce"`; the test calls `bodyEditor.focus()` and immediately samples computed `outlineColor`, `outlineStyle`, and `outlineWidth`. Admin CSS contains an explicit `.ProseMirror:focus-visible { outline: 2px solid var(--admin-cobalt) }` rule.
  implication: The core differential is runtime focus/cascade state at the immediate sample, not an absent intended cobalt declaration.
- timestamp: "2026-07-11T20:33:00+08:00"
  checked: Complete `admin-ui.spec.ts`, `globals.css`, `admin.css`, editor component, editor shell, toolbar, and layout import path
  found: Global CSS deliberately sets `.lab-wysiwyg-canvas .ProseMirror { outline: none; color: #e8f0f8; }`. Admin CSS overrides color to ink unconditionally but supplies the solid cobalt outline only under `.manga-admin-shell .lab-wysiwyg-canvas .ProseMirror:focus-visible`. The admin layout imports that stylesheet and the Tiptap element receives `role=textbox`, `aria-label=正文`, and `contenteditable` through editor attributes.
  implication: Ink is the expected computed `outlineColor` fallback when the cobalt `:focus-visible` rule is inactive; selector specificity rules out simple source-order override while `:focus-visible` is truly matched.
- timestamp: "2026-07-11T20:33:30+08:00"
  checked: Common bug pattern mapping and fault tree
  found: The symptom is intermittent, so Async/Timing and State Management (initialization/remount) are primary pattern candidates. Fault-tree branches are (A) focus-visible state absent, including focus modality; (B) Tiptap replaces/remounts the focused DOM node between locator actions; (C) admin stylesheet or custom property is transiently unavailable; (D) locator resolves a different textbox.
  implication: A repeated runtime probe must record active element identity, `:focus`, `:focus-visible`, connectivity, matching role/name/class, custom properties, and computed outline together to distinguish these branches.
- timestamp: "2026-07-11T20:36:30+08:00"
  checked: Exact isolated reduced-motion test repeated 20 times with one worker
  found: `npx playwright test src/tests/e2e/admin-ui.spec.ts --project=reduced-motion --grep "ProseMirror focus indicator is visibly cobalt" --repeat-each=20 --workers=1 --reporter=line` completed `20 passed (1.1m)`.
  implication: There is no stable product regression in the isolated path. The prior one-off failure remains a true flake candidate; changing the expected color or production CSS is unsupported without reproducing the runtime state.
- timestamp: "2026-07-11T20:38:30+08:00"
  checked: Preserved Phase 05-04 artifacts and relevant git history
  found: No trace or detailed error context for the failed run remains; the current `test-results` was overwritten by the clean repeat. Git history shows commit `51921af` introduced both the cobalt `:focus-visible` rule and this exact immediate-snapshot test, and the later Phase 05-02 headed full matrix recorded 465 passed / 23 skipped.
  implication: There is no evidence for a stale color contract or a post-pass stylesheet change. Diagnosis must rely on runtime probing and the test's synchronization semantics.
- timestamp: "2026-07-11T20:41:30+08:00"
  checked: WR-03 introducing commit and review/verification notes
  found: Commit `51921af` added only the scoped 2px cobalt focus-visible rule and the immediate computed-style assertion. Later review found no focus-indicator regression, and visual QA explicitly observed a 2px cobalt ring. The known full-matrix evidence was headed Chromium under Xvfb, whereas the first 20-repeat reproduction was headless.
  implication: Headed/Xvfb focus activation is a concrete environment difference to test before adding instrumentation or changing code.
- timestamp: "2026-07-11T20:44:30+08:00"
  checked: Exact isolated reduced-motion test repeated headed under Xvfb
  found: `xvfb-run -a npx playwright test ... --repeat-each=20 --workers=1 --headed` completed `20 passed (1.2m)`.
  implication: Headed execution alone does not reproduce the flake; the product contract is stable across 40 total exact repeats (20 headless + 20 headed).
- timestamp: "2026-07-11T20:47:30+08:00"
  checked: Disposable observability probe design
  found: Added a temporary standalone Playwright probe that performs 100 authenticated editor navigations and captures marker identity, active element, `:focus`, `:focus-visible`, outline color/style/width, resolved cobalt token, matching stylesheet rule count, plus microtask and animation-frame follow-ups.
  implication: The next run can distinguish focus modality, DOM replacement, transient settling, and cascade/token failure without modifying product behavior.
- timestamp: "2026-07-11T20:50:30+08:00"
  checked: 100-navigation headed reduced-motion observability probe
  found: The probe reproduced many immediate ink outlines. Representative attempt 3 kept the same tagged, connected, active element with both `:focus` and `:focus-visible` true, resolved `--admin-cobalt: #075fce`, and found one matching `.ProseMirror:focus-visible` rule, but computed `rgb(16, 18, 23) solid 3px` immediately and after a microtask; one animation frame later the same node computed `rgb(7, 95, 206) solid 2px`. Other samples settled after a microtask; attempt 99 captured an intermediate color before settling. The probe failed intentionally because anomalies were nonempty.
  implication: Focus modality, DOM replacement, missing selector, and wrong token are directly ruled out. The failure is a real transient computed-style state that settles on the correct product contract at the rendering boundary.
- timestamp: "2026-07-11T20:53:30+08:00"
  checked: Concise 20-navigation transition-metadata probe
  found: Nine of 20 immediate samples were wrong, four remained wrong after a microtask, and zero were wrong after one animation frame. Wrong samples computed `transitionDuration: 1e-05s`, `transitionProperty: all`, and live time-zero CSS transitions for `outline-color`, `outline-offset`, and `outline-width`.
  implication: H3 is confirmed by direct mechanism evidence. The 0.01ms reduced-motion rule, not focus modality, DOM identity, token value, selector presence, or a stylesheet regression, creates the flaky snapshot.
- timestamp: "2026-07-11T20:58:30+08:00"
  checked: Post-fix unchanged immediate focus-outline assertion, headless reduced-motion
  found: Twenty repeated executions passed (`20 passed (1.0m)`), for 0 observed immediate mismatches after the one-value `0s` counterfactual.
  implication: The first verification leg supports the causal hypothesis; headed repetitions remain before declaring the fix stable.
- timestamp: "2026-07-11T21:01:30+08:00"
  checked: Post-fix unchanged immediate focus-outline assertion, headed reduced-motion under Xvfb
  found: Twenty repeated executions passed (`20 passed (1.1m)`), for 0 observed immediate mismatches.
  implication: The counterfactual is stable across 40 post-fix exact repetitions (20 headless + 20 headed), with the original immediate regression assertion unchanged.
- timestamp: "2026-07-11T21:03:30+08:00"
  checked: Complete admin UI spec in reduced-motion mode
  found: All 12 tests passed (`12 passed (29.7s)`), including static reduced-motion behavior, computed admin colors, editor accessibility, unchanged focus-outline regression, toolbar navigation, mutation guards, and image policy.
  implication: The one-value fix did not regress adjacent reduced-motion admin behavior in the owned browser coverage.
- timestamp: "2026-07-11T21:05:30+08:00"
  checked: Lint, final scoped diff, probe cleanup, and worktree preservation
  found: `npm run lint` passed. The only product diff is `src/app/admin/admin.css` changing `transition-duration: 0.01ms` to `0s`; `src/tests/e2e/admin-ui.spec.ts` is unchanged, the disposable probe is absent, and all pre-existing unrelated modified/untracked files remain present and untouched.
  implication: The fix is minimal, regression coverage is preserved, and the worktree is ready for the session manager's human verification/commit decision.

## Eliminated

- hypothesis: H2 — headed Chromium/Xvfb by itself causes the ink focus-outline failure.
  evidence: The same reduced-motion test passed 20/20 headed under Xvfb, matching the 20/20 headless batch.
  timestamp: "2026-07-11T20:44:30+08:00"
- hypothesis: H1 — the failure occurs because the sampled editor is not `:focus-visible` or because Tiptap replaces it after focus.
  evidence: Reproduced ink samples remained the same tagged/connected active element and matched both `:focus` and `:focus-visible`; the correct selector and token were present.
  timestamp: "2026-07-11T20:50:30+08:00"

## Resolution

root_cause: The admin reduced-motion media rule assigns every descendant a nonzero `0.01ms` transition duration while `transition-property` remains `all`. Focusing ProseMirror therefore creates outline-color/offset/width transitions; Chromium may report the time-zero ink 3px outline to an immediate computed-style read before it settles to the intended cobalt 2px ring.
fix: Changed only the scoped admin reduced-motion duration from `0.01ms` to `0s`, preventing the outline transitions; removed the disposable probe and preserved the original cobalt assertion unchanged.
verification: Pre-fix probe reproduced 9/20 immediate and 4/20 microtask mismatches with live time-zero outline transitions, settling 20/20 by one frame. Post-fix unchanged focus test passed 20/20 headless and 20/20 headed under Xvfb; full reduced-motion admin UI spec passed 12/12; `npm run lint` passed; final diff is one CSS value and the probe is removed.
files_changed:
  - src/app/admin/admin.css

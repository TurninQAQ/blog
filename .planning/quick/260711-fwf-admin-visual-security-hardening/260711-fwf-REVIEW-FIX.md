---
phase: quick-admin-visual-security-hardening
fixed_at: 2026-07-11T07:29:54Z
review_path: .planning/quick/260711-fwf-admin-visual-security-hardening/260711-fwf-REVIEW.md
iteration: 3
findings_in_scope: 10
fixed: 10
skipped: 0
status: all_fixed
---

# Quick 260711-fwf: Code Review Fix Report

**Fixed at:** 2026-07-11T07:29:54Z  
**Source review:** `.planning/quick/260711-fwf-admin-visual-security-hardening/260711-fwf-REVIEW.md`  
**Iteration:** 3 of 3

## Summary

- Iteration 3 findings: 1
- Iteration 3 fixed: 1
- Cumulative findings: 10
- Cumulative fixed: 10
- Skipped: 0
- Application audit gate: `passed`
- Public exposure: `blocked_pending_provider_controls`

## Iteration 3 Fixed Issues

### WR-01: Slow-save reconciliation and publication serialization are incomplete

**Files modified:** `src/components/admin/PostEditorShell.tsx`, `src/components/admin/AdminPublishControls.tsx`, `src/tests/e2e/admin-ui.spec.ts`  
**Commit:** `82678a1`  
**Applied fix:** Publication controls now synchronously report request busy state to the editor through a stable callback. The parent keeps both a state value for rendering and a ref for the Save handler's pre-fetch guard. Publication refreshes run inside their own React transition, so Save remains disabled through both the mutation fetch and the resulting `router.refresh`; save/parent refresh state continues to disable publication controls. A failed publication request leaves a visible error and clears child and parent busy state without changing publication state.

Save reconciliation now merges every scalar independently and treats category ID/new name, tag IDs/new names, and series ID/new name/order as coherent groups. An unchanged group receives returned IDs and clears saved one-shot names even when another field changed during the request; an edited group remains untouched. Tag IDs compare by values rather than array identity/order, and `featured` participates in the scalar merge.

**Evidence:** Two new headed delayed-response regressions failed against the prior implementation: publication-first left Save enabled, and a title edit prevented returned taxonomy IDs from being installed. After the fix both passed. The combined headed run passed 3/3, retaining the existing save-first/newer-edits/network-failure regression and confirming a failed publication request restores publication and Save controls.

## Iteration 2 Fixed Issues

### WR-01: Slow saves overwrite newer edits and race publication mutations

**Files modified:** `src/components/admin/PostEditorShell.tsx`, `src/components/admin/AdminPublishControls.tsx`, `src/tests/e2e/admin-ui.spec.ts`  
**Commit:** `b97aa07`  
**Applied fix:** The editor captures an immutable submitted snapshot and applies canonical response state only when the current form still equals that snapshot. Equality explicitly covers every scalar, the ordered `tagIds` array, and the `featured` boolean, so a successful slow response cannot erase later edits. Save/refresh busy state now disables publication controls; publication mutations also use a synchronous ref guard. Their fetch path uses `try/catch/finally`, reports network failures, always clears pending, and changes publication state only after a valid successful response.

**Evidence:** The headed delayed-success regression edits title and tags after Save, verifies both survive the response, proves a programmatic publication attempt sends zero requests while save is busy, then aborts a publication request and verifies a visible network alert, restored buttons, and unchanged draft publication state.

### WR-02: Scanner misses encrypted PKCS#8 private keys

**Files modified:** `scripts/security-source-scan.mjs`, `docs/security/public-exposure-audit-2026-07-11.md`  
**Commit:** `8a6cefc`  
**Applied fix:** The exact PEM rule now recognizes standard `ENCRYPTED PRIVATE KEY` headers while preserving generic PKCS#8, RSA, DSA, EC, OpenSSH, and PGP private-key formats. The executable self-test builds separate temporary Git fixtures for encrypted and unencrypted headers and requires finding exit 1 for both; assignment, clean, Git failure, and read failure semantics remain covered. Fixture strings are constructed without embedding scanner-triggering PEM literals in source, so no broad Markdown exclusion was added.

**Evidence:** Self-test passed; the worktree scan returned zero findings; running the updated scanner against the final main tracked/pending tree, including current REVIEW and REVIEW-FIX artifacts, returned 0 findings across 264 text files with 35 NUL-containing binaries skipped.

## Cumulative Fix Ledger

| Iteration | Finding | Commit(s) | Result |
|---|---|---|---|
| 1 | CR-01 CommonMark image-reference bypass | `78f60ba` | Replaced partial regex parsing with `unified`/`remark-parse` AST validation and direct API zero-write regressions. |
| 1 | WR-01 Host-derived CSRF trust | `9a670ba`, `a6f54e3` | Strict shared canonical-origin parser; hostile Host/Origin rejection; explicit test canonical origin. |
| 1 | WR-02 prefixed secret assignments | `b10d1b1` | Sensitive identifier/high-entropy assignment coverage with executable exit-semantics fixtures. |
| 1 | WR-03 missing ProseMirror focus | `51921af` | Scoped computed 2px cobalt focus-visible indicator. |
| 1 | WR-04 unlocked save/delete fetches | `8041e6b` | Full-request pending guards, duplicate/dismissal prevention, visible network and unknown errors. |
| 1 | WR-05 incomplete toolbar semantics | `8a8cf65` | Roving tabindex plus ArrowLeft/ArrowRight/Home/End navigation. |
| 1 | WR-06 hidden id field error | `1c719e2` | Non-visible server fields normalize to the form alert. |
| 2 | WR-01 slow-save/publication races | `b97aa07` | Snapshot-safe response merge and serialized, failure-safe publication controls. |
| 2 | WR-02 encrypted PKCS#8 false negative | `8a6cefc` | Encrypted/unencrypted PEM fixtures and expanded private-key header detection. |
| 3 | WR-01 bidirectional serialization/canonical merge | `82678a1` | Parent/child request and refresh coordination plus per-field/coherent-group canonical reconciliation. |

## Iteration 3 Verification

| Check | Result |
|---|---|
| Publication-first/canonical-merge RED | 2/2 failed as expected: Save remained enabled during publication, and the returned category ID was not installed after a concurrent title edit. |
| New regression GREEN | headed/Xvfb 2/2 passed. |
| Combined existing + new headed rerun | 3/3 passed, including publication network-failure recovery. |
| Focused unit test | `src/lib/admin/guarded-query.test.ts`: 1 file, 2/2 passed. |
| `npm run lint` | Passed. |
| Final main-tree source scan | 264 text files, 35 binaries skipped, 0 findings, including the iteration-3 report. |
| `git diff --check` | Passed. |
| `next-env.d.ts` | Restored to `./.next/types/routes.d.ts`; clean. |
| Protected baseline | Pre-commit comparison passed; final completion comparison passed after fast-forward. |

## Iteration 2 Verification

| Check | Result |
|---|---|
| Slow-save/publication RED | Failed as expected because publication remained enabled during the delayed save. |
| Slow-save/publication GREEN | headed/Xvfb 1/1 passed. |
| Combined save-pending + slow-success headed rerun | 2/2 passed. |
| Encrypted PKCS#8 RED | Self-test failed because encrypted fixture exited 0 instead of 1. |
| Scanner self-test GREEN | Passed: encrypted and unencrypted private keys finding=1; assignments finding=1; clean=0; Git/read failures=2. |
| Focused unit tests | 2 files, 60/60 passed. |
| `npm run lint` | Passed. |
| Worktree source scan | 255 text files, 0 findings. |
| Final main-tree source scan | 264 text files, 35 binaries skipped, 0 findings, including REVIEW/REVIEW-FIX artifacts. |
| `git diff --check` | Passed. |
| `next-env.d.ts` | Restored to `./.next/types/routes.d.ts`; clean. |
| Protected baseline | Every pre-commit comparison passed; final completion comparison required after fast-forward. |

The long full Playwright suite was intentionally not rerun in this fixer iteration.

## Root Final Verification

The root completion pass subsequently ran the full suite and final repository checks:

| Check | Result |
|---|---|
| full headed Playwright/Xvfb | 476 collected, 453 passed, 23 conditional skips, 0 failed |
| corrected GET logout contract | 4/4 projects passed; valid GET keeps the session and the authenticated redirect chain ends at `/admin` |
| `npm run test:unit` | 5 files, 106/106 passed |
| `npm run lint` | Passed |
| production smoke | public/login 200, protected redirect non-disclosing, probe GET/POST 404, headed login/logout, 0 CSP violations |
| protected baseline | tracked patch/index/hash and protected untracked file-list/hash matched at completion |

## Remaining Issues

No review finding was skipped. Application high/critical findings remain closed. Public deployment is still blocked on the provider controls recorded in the audit: final-domain TLS/HSTS and canonical-origin validation, production secret rotation/injection, private TLS least-privilege PostgreSQL, backup/restore evidence, runtime pruning, proxy/WAF limits, monitoring, and independent infrastructure testing. Five moderate dependency advisories remain temporarily accepted because available forced fixes are incompatible downgrades.

`260711-fwf-REVIEW.md` remains the pre-fix iteration-3 historical snapshot. This all-fixed report and the root final verification close its remaining warning.

---

_Fixed: 2026-07-11T07:29:54Z_  
_Fixer: the agent (gsd-code-fixer)_  
_Iteration: 3_

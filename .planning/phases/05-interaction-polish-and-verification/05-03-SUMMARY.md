---
phase: 05-interaction-polish-and-verification
plan: "03"
subsystem: release-operations
tags: [postgresql, backup, restore, runbook, security, deployment-readiness]

requires:
  - phase: 05-interaction-polish-and-verification
    plan: "01"
    provides: "Release scripts, liveness/readiness endpoints, CI verification, and explicit provider-neutral boundaries"
  - phase: security-audit
    provides: "Application audit status and the external public-exposure blocking gates"
provides:
  - "Blank-valued production/runtime and browser-test environment boundary with final HTTPS origin requirements"
  - "Authoritative Node 22/PostgreSQL setup, verification, production, health, rollback, and launch-gate README"
  - "Provider-neutral PostgreSQL logical backup, encrypted off-host storage, isolated restore, smoke, evidence, and cleanup runbook"
affects: [phase-5-release-evidence, deployment-operations, database-recovery, public-exposure]

tech-stack:
  added: []
  patterns:
    - "Production rollout follows migration before single-admin bootstrap before build/start, using only existing package scripts."
    - "Data recovery verifies checksum and manifest before restoring into a newly isolated database; forward-fix remains preferred."
    - "Repository documentation preserves public_exposure: blocked_pending_provider_controls until external provider evidence exists."

key-files:
  created:
    - README.md
    - docs/operations/postgres-backup-restore.md
    - .planning/phases/05-interaction-polish-and-verification/05-03-SUMMARY.md
  modified:
    - .env.example

key-decisions:
  - "Treat ADMIN_SITE_ORIGIN as a required final absolute HTTPS production value while keeping PLAYWRIGHT_ADMIN_PASSWORD test-only and out of the production runtime."
  - "Keep all release guidance provider-neutral and explicitly leave TLS, proxy/WAF, secrets, private database, monitoring, restore drill, and independent infrastructure testing as external blockers."
  - "Use custom-format pg_dump plus GnuPG encryption, SHA-256 integrity evidence, and a fresh isolated pg_restore target; prefer migration forward-fix over destructive production restore."

patterns-established:
  - "Operational docs reference package scripts and route contracts directly instead of inventing provider-specific wrappers."
  - "Recovery evidence records source/target metadata, checksum, RPO/RTO, smoke results, cleanup, and two-person verification without recording credentials or content."

requirements-completed: [QUAL-05]

coverage:
  - id: D1
    description: "The environment template separates blank-valued production runtime inputs from the browser-test-only plaintext password"
    requirement: QUAL-05
    verification:
      - kind: other
        ref: "Node blank-value environment contract check"
        status: pass
      - kind: other
        ref: "npm run security:scan"
        status: pass
    human_judgment: false
  - id: D2
    description: "The root README provides one current setup-to-production path with exact scripts, health semantics, safe rollback, and explicit external launch blockers"
    requirement: QUAL-05
    verification:
      - kind: other
        ref: "README required-token, package-script, link, and command-order contract checks"
        status: pass
      - kind: other
        ref: "git diff --check"
        status: pass
    human_judgment: false
  - id: D3
    description: "The PostgreSQL runbook covers TLS least privilege, encrypted checksummed backup, isolated restore, application smoke, audit evidence, failure handling, and cleanup"
    requirement: QUAL-05
    verification:
      - kind: other
        ref: "Recovery runbook tooling/transport/storage/restore/evidence/cleanup/boundary contract checks"
        status: pass
      - kind: other
        ref: "npm run security:scan"
        status: pass
    human_judgment: false

duration: 10min
completed: 2026-07-11
status: complete
---

# Phase 05 Plan 03: Provider-Neutral Release Operations Summary

**Secret-free operator onboarding and a checksum-gated PostgreSQL recovery drill that keep every infrastructure control explicitly blocked until externally proven**

## Performance

- **Duration:** 10min
- **Started:** 2026-07-11T11:57:33Z
- **Completed:** 2026-07-11T12:07:55Z
- **Tasks:** 2
- **Files modified:** 3 operator-facing files plus this summary

## Accomplishments

- Split `.env.example` into blank-valued production runtime and browser-test-only sections, requiring the final absolute HTTPS admin origin without storing any value.
- Added an authoritative root README covering Node 22/npm/PostgreSQL setup, Argon2 hash handling, migrations, idempotent admin bootstrap, verification, build/start, liveness/readiness, deployment smoke, rollback, and public launch gates.
- Added a provider-neutral PostgreSQL runbook for TLS/least-privilege logical backup, GnuPG encryption, checksum/off-host retention, fresh isolated restore, Prisma/application smoke, evidence, cleanup, cadence, and escalation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Document the complete setup, production, verification, and rollback path** - `877f76b` (docs)
2. **Task 2: Add a provider-neutral PostgreSQL backup and recovery drill** - `1977e6e` (docs)

**Plan metadata:** committed separately after this summary.

## Files Created/Modified

- `.env.example` - Keeps all values blank, marks five production runtime requirements, and isolates the Playwright-only plaintext password.
- `README.md` - Documents the exact repository scripts and operator path from checkout through public-release preparation without choosing a provider.
- `docs/operations/postgres-backup-restore.md` - Defines backup, encryption, integrity, isolated recovery, validation, evidence, cleanup, cadence, and failure procedures.

## Verification Results

| Check | Result |
| --- | --- |
| README required-token contract | PASS — all eight planned script/route/link tokens present |
| README package-script contract | PASS — every documented `npm run` target exists in `package.json` |
| Environment blank-value and production-order contract | PASS — all six values blank; migrate precedes bootstrap, build, and start |
| Recovery content contract | PASS — tooling, TLS/least privilege, encryption, checksum, isolation, smoke, evidence, cleanup, failure, and blocker groups present |
| Secret/provider-neutral boundary | PASS — no non-empty sensitive assignment, authenticated URL, provider CLI, live domain, or credential |
| `npm run security:scan` | PASS — 281 text files, 35 binary files skipped, 0 findings |
| `git diff --check` | PASS |

The runbook itself was not executed against a production provider. That is intentional and remains a blocking D-14 launch gate, not missing repository work.

## Decisions Made

- Required production `ADMIN_SITE_ORIGIN` to be the final absolute HTTPS origin at build and runtime; local/CI Playwright plaintext stays outside the production runtime.
- Documented the current custom single-admin/Argon2 path exactly, including local dotenv dollar escaping and idempotent bootstrap behavior.
- Kept the recovery procedure on standard PostgreSQL/GnuPG/checksum tools and placeholders rather than adding a provider CLI, deployment file, dependency, or live credential.
- Required backup integrity and an isolated restore to pass before any production recovery can be separately authorized; application rollback alone never authorizes schema rollback.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- An additional local concept assertion initially searched for the English phrase `least privilege` while the runbook correctly used the Chinese term `最小权限`. The assertion was corrected to match the document language; planned token checks and the source-security scan did not fail.

## Authentication Gates

None.

## Known Stubs

- `.env.example` intentionally contains six blank assignments. These are the required secret-free operator template, not unwired product values; production and local values remain external by design.

## User Setup Required

Production operator work remains intentionally external: select the provider, inject/rotate secrets, configure final TLS/Host/proxy/WAF/database/monitoring controls, execute the recovery drill, and perform independent infrastructure testing. No provider, domain, database, or credential was selected in this plan.

## Next Phase Readiness

The repository now has current onboarding and recovery instructions for the remaining Phase 5 evidence and closeout plans. Public exposure remains blocked until the external provider controls and a real isolated recovery drill have fresh PASS evidence.

## Self-Check: PASSED

- Verified `.env.example`, `README.md`, `docs/operations/postgres-backup-restore.md`, and this summary exist.
- Verified Task 1 commit `877f76b` and Task 2 commit `1977e6e` exist in git history.
- Verified all three coverage deliverables classify as automated PASS with no schema errors.
- Verified the final source scan includes this summary and reports 281 text files, 35 binary files skipped, and 0 findings.
- Verified no new network endpoint, auth path, file-access implementation, schema, dependency, provider choice, domain, credential, or unrelated artifact was introduced.

---
*Phase: 05-interaction-polish-and-verification*
*Completed: 2026-07-11*

---
phase: "06-brand-homepage-and-secure-authoring-experience-upgrade-with-"
reviewed: "2026-07-11T17:53:46Z"
review_round: 3
previous_reviewed: "2026-07-11T17:37:01Z"
depth: deep
files_reviewed: 11
files_reviewed_list:
  - "src/lib/media/media-service.ts"
  - "src/lib/media/media-service.test.ts"
  - "src/lib/media/media-url.ts"
  - "src/lib/media/media-url.test.ts"
  - "src/lib/auth/session.ts"
  - "src/lib/auth/session.test.ts"
  - "src/lib/admin/post-mutations.ts"
  - "src/lib/admin/post-mutations.test.ts"
  - "src/app/api/admin/media/route.ts"
  - "src/app/api/admin/media/route.test.ts"
  - "src/lib/auth/admin.ts"
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 06: Backend Code Review Report

**Reviewed:** 2026-07-11T17:53:46Z
**Review Round:** 3 (targeted final re-review)
**Depth:** deep
**Files Reviewed:** 11 narrowly scoped repair files and direct callers/tests
**Status:** clean

## Review History

| Round | Reviewed | Scope | Critical | Warning | Info | Status |
|---|---|---:|---:|---:|---:|---|
| 1 | 2026-07-11T16:56:39Z | 31 files | 0 | 5 | 1 | issues_found |
| 2 | 2026-07-11T17:37:01Z | 28 repair files/callers | 2 | 1 | 0 | issues_found |
| 3 | 2026-07-11T17:53:46Z | 11 targeted repair files/callers | 0 | 0 | 0 | clean |

## Original Finding Disposition

| Original finding | Disposition | Re-review evidence |
|---|---|---|
| WR-01: tone headings break TOC anchors | **Resolved** | Public headings and IDs now come from the transformed Markdown AST; tone/entity/image/duplicate-heading tests assert that every TOC ID is rendered. |
| WR-02: publication accepts missing managed assets | **Resolved** | Missing assets raise body/cover field errors and abort the post transaction; concurrent reclamation is now detected by conditional exposure plus a count-triggered re-read. |
| WR-03: newly exposed media is backdated | **Resolved** | Transactions create one current exposedAt; E2E verifies it differs from historical publishedAt. |
| WR-04: unsupported directives pass compatibility | **Resolved** | Compatibility and server input reject block/leaf, non-tone, and attributed directives. |
| WR-05: abandoned uploads grow without bound | **Resolved** | Quota, grace-period reclamation, rate limiting, and decode permits remain in place; reclamation now scans every post through the Markdown AST and deletes only rows that are still private and old. |
| IN-01: source-string-only wiring test | **Resolved** | Behavioral mutation tests and database E2E verify rollback, field mapping, and exposure timestamps. |

## Narrative Findings (AI reviewer)

### Summary

The final repair closes all three Round 2 findings. No new correctness, security, or robustness issue was found in the explicitly bounded scope.

**Current counts:** Critical 0, Warning 0, Info 0.

## Round 2 Finding Disposition

| Round 2 finding | Disposition | Final evidence |
|---|---|---|
| CR-01: raw-source prefilter can delete referenced media | **Resolved** | reclaimAbandonedPrivateMedia selects every post's bodyMarkdown and coverImage, then derives references with collectManagedMediaIds. Decimal and hexadecimal entity destinations are retained by AST parsing and covered by reclamation tests. |
| CR-02: exposure/reclamation TOCTOU | **Resolved** | Exposure updates only rows still having publicAt null. A short update triggers a re-read: missing IDs throw ManagedMediaNotFoundError and roll back the caller transaction, while rows concurrently made public are accepted. Reclamation deletes only rows still having publicAt null and older than the cutoff, so the media row determines the safe winner of either interleaving. |
| WR-01: stale session cleanup deletes a refreshed session | **Resolved** | Time-based deletion now repeats the expiresAt/createdAt/lastSeenAt invalidity predicates, and allowlist deletion repeats the unauthorized-email predicate. The interleaving regression verifies that a refreshed row no longer matches cleanup. |

## Verification Performed

- Targeted unit tests: 5 files, 36 tests passed (media URL/service, session, post mutation, media upload route).
- Targeted ESLint over all 11 reviewed files: passed.
- Read-only interleaving analysis confirmed both safe outcomes: reclamation wins and exposure re-read aborts the post transaction, or exposure wins and reclamation's publicAt-null delete no longer matches/retries.
- Repository-wide tsc was attempted but remains blocked by out-of-scope existing errors in admin-authoring.spec.ts:1110 and skeleton.spec.ts:14,24; neither touches this review scope.

## Round 1 Historical Record

Round 1 reviewed 31 files and recorded **Critical 0 / Warning 5 / Info 1**:

- WR-01 — tone-formatted headings produced broken TOC anchors.
- WR-02 — publication committed when managed assets were absent.
- WR-03 — new media received a false historical publicAt.
- WR-04 — unsupported directives passed import compatibility.
- WR-05 — abandoned private uploads lacked quota/reclamation.
- IN-01 — media wiring was asserted only through source text.

The two disposition tables above are the authoritative final status; the original issue text remains in review history through the Round 1 and Round 2 records.

---

_Reviewed: 2026-07-11T17:53:46Z_
_Reviewer: generic-agent workaround (gsd-code-reviewer instructions injected)_
_Depth: deep_

---
phase: 06
slug: brand-homepage-and-secure-authoring-experience-upgrade-with-
status: blocked
threats_open: 2
asvs_level: 3
block_on: high
register_authored_at_plan_time: false
created: 2026-07-12
---

# Phase 06 — Security

> Retroactive STRIDE audit. The four Phase 6 plans contain no `<threat_model>`. Four `06-0x-SUMMARY.md` artifacts now exist and were checked; none declares a distinct `## Threat Flags` section. This register was reconstructed and incrementally revalidated from the implemented trust boundaries. Implementation and dependency source were treated as mitigation evidence; focused tests were used only as regression confirmation, not as substitutes for code.

## Gate Result

- Result: **OPEN_THREATS**
- Threats: **46 total · 41 closed · 5 open**
- Blocking gate: **2 open critical/high threats** (`T-06-38`, `T-06-39`)
- Non-blocking tracking: **3 open medium/low threats** (`T-06-32`, `T-06-40`, `T-06-41`)
- `threats_open` is therefore **2** at `block_on: high`.
- The final implementation recheck left `T-06-10`, `T-06-27`, `T-06-31`, and `T-06-44` through `T-06-46` closed. No threat status changed, so the totals remain **46 / 41 / 5 / 2** (total / closed / all open / blocking open).

## Trust Boundaries

| Boundary | Description | Data crossing |
|----------|-------------|---------------|
| B-01 Admin browser → mutation routes | Cookie-authenticated, state-changing media and post requests | Origin, session cookie, multipart bytes, JSON/Markdown |
| B-02 Untrusted image → native decoder | User-selected JPEG/PNG/WebP enters Sharp/libvips | Compressed bytes, claimed MIME, dimensions, metadata |
| B-03 Application → PostgreSQL | Prisma persists sessions, posts, taxonomy, and normalized media bytes | Credentials, Markdown, publication state, binary media |
| B-04 Private media → public media | Publishing makes referenced managed bytes anonymously readable and cacheable | Managed IDs, `publicAt`, WebP bytes, ETag |
| B-05 Local file → admin editor | A local `.md`/`.markdown` file is decoded, parsed as YAML/Markdown, and inserted into React/Tiptap state | UTF-8, YAML nodes, Markdown grammar, URLs |
| B-06 Stored Markdown → public DOM | Database Markdown is parsed, highlighted, sanitized, and rendered for anonymous readers | Markdown AST/HAST, links, images, directives, code |
| B-07 Reader browser → external image host | Allowlisted HTTPS image URLs are loaded directly by the reader's browser | Reader IP, site origin referrer, remote bytes |
| B-08 Repository/runtime → dependencies/provider | Native and JS dependencies plus deployment controls complete the runtime boundary | Package artifacts, TLS/Host/WAF/secrets/database/backup evidence |

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation / L3 evidence | Status |
|-----------|----------|-----------|----------|-------------|--------------------------|--------|
| T-06-01 | Spoofing | Admin media upload | critical | mitigate | `POST` calls `requireAdmin()` before trusting headers, reading the body, decoding, or storing; session lookup verifies a hashed random token, expiry, and the configured single-admin email (`src/app/api/admin/media/route.ts:131-167`; `src/lib/auth/session.ts:19-29,103-151`). | closed |
| T-06-02 | Tampering | CSRF on admin mutations | high | mitigate | Exact HTTP(S) Origin validation runs before authentication and body processing on media and post routes; missing, malformed, or mismatched Origin fails closed (`src/lib/auth/csrf.ts:7-58`; `src/app/api/admin/media/route.ts:131-149`; `src/app/api/admin/posts/[operation]/route.ts:44-63`). | closed |
| T-06-03 | Denial of service | Upload request body | high | mitigate | Rejects non-multipart and encoded bodies, requires a positive safe `Content-Length`, caps declared and streamed bytes at 11 MiB, checks actual length, and only then invokes `formData()` (`src/app/api/admin/media/route.ts:16,28-122,148-150`). | closed |
| T-06-04 | Tampering | Multipart shape | medium | mitigate | Exactly one `file` part is accepted and its image payload is capped at 10 MiB before `arrayBuffer()` (`src/app/api/admin/media/route.ts:151-166`). | closed |
| T-06-05 | Tampering | MIME/polyglot upload | high | mitigate | Declared MIME must be JPEG/PNG/WebP, magic bytes must match it, Sharp must agree on decoded format, and output is newly encoded WebP rather than served input bytes (`src/lib/media/image-ingest.ts:13-22,43-107,122-186`). | closed |
| T-06-06 | Denial of service | Image decode/pixel bomb | high | mitigate | Input bytes, per-edge dimensions, total pixels, page count, output dimensions, and output bytes are bounded on both metadata and transcode decoder instances (`src/lib/media/image-ingest.ts:7-11,110-177`). | closed |
| T-06-07 | Elevation of privilege | SVG/active-image execution | critical | mitigate | SVG and other formats cannot pass the MIME/signature allowlist; corrupt/polyglot inputs must decode and are flattened through a fixed WebP encoder; delivery always uses `image/webp` plus `nosniff` (`src/lib/media/image-ingest.ts:13-22,92-186`; `src/app/media/[mediaId]/route.ts:43-49`). | closed |
| T-06-08 | Information disclosure | EXIF/XMP/ICC metadata | high | mitigate | The pipeline applies orientation and emits a fresh `.webp()` buffer without any metadata-preservation call; only normalized output bytes and derived dimensions/digest are passed to persistence (`src/lib/media/image-ingest.ts:131-186`; `src/lib/media/media-service.ts:79-109`). | closed |
| T-06-09 | Tampering | Media deduplication | medium | mitigate | SHA-256 is computed over normalized output bytes and is unique in both Prisma schema and migration. Inside a retrying Serializable transaction, storage returns an existing digest match or creates a new row; it never replaces existing bytes, and a concurrent unique conflict is retried against current state (`src/lib/media/image-ingest.ts:180-186`; `src/lib/media/media-service.ts:50-125`; `prisma/schema.prisma:118-130`; `prisma/migrations/20260711000000_add_media_assets/migration.sql:1-17`). | closed |
| T-06-10 | Denial of service | Aggregate upload/storage abuse | high | mitigate | After authentication the route applies a process-local 20-attempt/minute boundary per admin before trusting upload headers or reading the body, admits at most two process-local file-materialization/Sharp jobs, and releases the permit in `finally`. Persistent storage uses a database-wide 512 MiB aggregate quota with digest deduplication and create in one retrying Serializable transaction; old unreferenced private assets are reclaimed before decode. Fleet-wide rate, slow-client, and concurrency controls are not claimed here and remain part of provider blocker `T-06-38` (`src/lib/media/media-guard.ts:3-71`; `src/app/api/admin/media/route.ts:155-199`; `src/lib/media/media-service.ts:8-12,50-125,190-238`). | closed |
| T-06-11 | Information disclosure | Private media | critical | mitigate | `publicAt = null` requires admin authentication; anonymous private, missing, malformed, and wrong-MIME assets return the same empty 404 with `private, no-store` (`src/app/media/[mediaId]/route.ts:33-41,52-89`). | closed |
| T-06-12 | Tampering | Public/private state rollback | high | mitigate | The only runtime exposure write updates rows where `publicAt` is null; no writer resets a public row to private, and reclamation can delete only rows that are still private. Public exposure is therefore monotonic (`src/lib/media/media-service.ts:127-188,190-238`; repository search of non-generated runtime media writes). | closed |
| T-06-13 | Elevation of privilege | Media IDOR | high | mitigate | Managed IDs must match the canonical CUID-shaped route, private reads require the single administrator, and anonymous callers receive no ownership/existence distinction (`src/lib/media/media-url.ts:4-39`; `src/app/media/[mediaId]/route.ts:52-89`). | closed |
| T-06-14 | Information disclosure | Media enumeration | medium | mitigate | IDs are non-sequential Prisma CUIDs; malformed, missing, and anonymous-private results share status, empty body, and no-store headers (`prisma/schema.prisma:118-127`; `src/app/media/[mediaId]/route.ts:33-41,52-89`). | closed |
| T-06-15 | Information disclosure | Private/public cache crossover | high | mitigate | Private and all 404 responses are `private, no-store`; only monotonic-public assets get one-year immutable caching, so a private response cannot be shared or later overwrite a public cache entry (`src/app/media/[mediaId]/route.ts:33-49,69-98`). | closed |
| T-06-16 | Tampering | Public media cache integrity | medium | mitigate | Strong ETag is the SHA-256 of immutable normalized bytes; matching `If-None-Match` returns 304 without `Content-Length`, while MIME and `nosniff` remain fixed (`src/app/media/[mediaId]/route.ts:91-115`). | closed |
| T-06-17 | Tampering | Post/media publication consistency | high | mitigate | Post publication/edit, managed-media existence validation, and `publicAt` update execute on the same Prisma transaction. A fresh transaction-local `exposedAt` is used instead of an older post timestamp; `updateMany` still only changes `publicAt: null`, so failure rolls back the post and exposure remains monotonic (`src/lib/admin/post-mutations.ts:602-675,728-800`; `src/lib/media/media-service.ts:130-163`). | closed |
| T-06-18 | Tampering | Managed-media referential integrity | medium | mitigate | `markMediaPublic` resolves every parsed canonical ID before updating and throws with the missing set. The transaction caller maps missing body/cover IDs to bounded field errors and aborts the post write; both editor and root/list publication controls surface those errors (`src/lib/media/media-service.ts:130-163`; `src/lib/admin/post-mutations.ts:506-543,645-650,773-778`; `src/components/admin/AdminPublishControls.tsx:29-55,125-166`). | closed |
| T-06-19 | Elevation of privilege | Server-side request forgery | critical | mitigate | URL policy permits only canonical managed or HTTPS/relative destinations, and runtime display is direct browser `<img>` output; covers set `unoptimized`, so the application never fetches an author-supplied URL (`src/lib/security/url-policy.ts:11-66`; `src/lib/markdown/public-render.tsx:329-332`; `src/components/public/content/PostVisualBlock.tsx:14-23`; repository runtime fetch search). | closed |
| T-06-20 | Denial of service | Markdown import file read | medium | mitigate | The editor checks `file.size` against the shared 1 MiB constant before calling `arrayBuffer()`, and the parser independently rechecks decoded byte length before UTF-8/YAML/Markdown work (`src/components/admin/PostEditorShell.tsx:436-454`; `src/lib/admin/markdown-import.ts:9,249-269`). | closed |
| T-06-21 | Tampering | Markdown encoding/control bytes | low | mitigate | Fatal UTF-8 decoding, BOM/newline normalization, and explicit NUL rejection occur before YAML/Markdown parsing (`src/lib/admin/markdown-import.ts:40-45,261-269`). | closed |
| T-06-22 | Denial of service | YAML aliases/duplicate keys | high | mitigate | Frontmatter is within the 1 MiB file bound, duplicate keys are rejected, aliases are disabled with `maxAliasCount: 0`, parser errors are collapsed, and only a mapping is accepted (`src/lib/admin/markdown-import.ts:48-94,249-269`). | closed |
| T-06-23 | Elevation of privilege | YAML prototype/tag injection | high | mitigate | No frontmatter object is merged into application state: code reads explicit known fields with strict scalar/array types and constructs a new return object. Local dependency-source tracing confirmed `yaml` materializes `__proto__` as an own key and alias resolution is disabled (`src/lib/admin/markdown-import.ts:96-162,307-327`; `node_modules/yaml/dist/nodes/Alias.js:24`; `node_modules/yaml/dist/nodes/addPairToJSMap.js`). | closed |
| T-06-24 | Tampering | Import publishes or overwrites an existing post | high | mitigate | Publication fields are never read from frontmatter, the result contains draft fields only, state changes occur only after full parsing/compatibility checks, and the import control is rendered only in create mode (`src/lib/admin/markdown-import.ts:315-327`; `src/components/admin/PostEditorShell.tsx:435-490,673-702`). | closed |
| T-06-25 | Elevation of privilege | Raw HTML/MDX stored XSS | critical | mitigate | Import compatibility rejects raw HTML/MDX, while the public boundary independently strips/skips raw nodes, never loads `rehype-raw`, allowlists elements, and runs `rehype-sanitize`. Heading IDs come only from semantic AST text in an `article-heading-*` namespace, not author HTML attributes (`src/lib/admin/wysiwyg/compatibility.ts:31-96,445-503`; `src/lib/markdown/markdown-policy.ts:15-46`; `src/lib/markdown/public-render.tsx:43-64,100-162,394-412`). | closed |
| T-06-26 | Tampering | Tone directive attribute/class injection | high | mitigate | Server post validation parses directives and rejects container/leaf forms, unknown text tones, and every directive attribute. Public rendering independently clears attributes and sanitizer permits only four generated class names (`src/lib/admin/post-input.ts:37-81,198-212`; `src/lib/markdown/markdown-policy.ts:1-13`; `src/lib/markdown/remark-text-tone.ts:17-46`; `src/lib/markdown/public-render.tsx:43-61`). | closed |
| T-06-27 | Elevation of privilege | Unsafe image/link protocols | critical | mitigate | Image destinations reject control/space/quote/backslash forms, network-path URLs, non-HTTPS explicit schemes, `data:` and `blob:`. External images must begin with canonical lowercase `https://`; the case-insensitive explicit-scheme detector routes uppercase variants such as `HTTPS://` to rejection instead of treating them as relative paths. Import and server post validation reuse this policy, while public links/images additionally pass the sanitizer protocol schema (`src/lib/security/url-policy.ts:6-65,83-129`; `src/lib/admin/markdown-import.ts:289-310`; `src/lib/admin/post-input.ts:153-213`; `src/lib/markdown/public-render.tsx:43-64,365-377`). | closed |
| T-06-28 | Denial of service | Syntax highlighting | medium | mitigate | Both alias and bundled-language lookups use own-property checks, so prototype keys fall back to plain fenced code. Each Shiki conversion is also caught independently, and the component emits a readable `<pre><code>` fallback for a failed or unsupported grammar (`src/lib/markdown/public-render.tsx:185-203,236-275,331-356`). | closed |
| T-06-29 | Denial of service | Server Markdown/taxonomy processing | medium | mitigate | After CSRF and authentication, the route enforces JSON/no content encoding and a 2 MiB declared plus streamed byte limit before fatal UTF-8 decode/JSON parse. Strict Zod schemas cap title, slug, excerpt, cover, IDs, series order, tag counts/names, unknown fields, and body at 1 MiB UTF-8 before remark/directive work (`src/app/api/admin/posts/[operation]/route.ts:55-145,147-182`; `src/lib/admin/post-input.ts:26-32,83-123,125-234,238-259`). | closed |
| T-06-30 | Spoofing | Session token/cookie | high | mitigate | Tokens use 32 random bytes, only an HMAC-SHA256 digest is stored, lookup is expiry/email constrained, and production cookies are HttpOnly, Secure, SameSite=Lax, path-only (`src/lib/auth/session.ts:19-44,77-151`). | closed |
| T-06-31 | Spoofing / Elevation of privilege | Stolen-session replay | high | mitigate | Sessions have a seven-day absolute lifetime and two-hour idle cutoff. Expiry deletion repeats the invalid time predicates, email-mismatch deletion repeats the mismatched relation predicate, and `lastSeenAt` refresh repeats all valid-time predicates. A stale reader therefore rejects its own request without deleting or reviving a session concurrently refreshed/corrected by another request (`src/lib/auth/session.ts:9-11,32-44,104-186`; `prisma/schema.prisma:38-49`). | closed |
| T-06-32 | Elevation of privilege | CSP defense in depth | medium | mitigate | CSP blocks objects, frames, foreign connections, and base changes, but production `script-src` still contains `'unsafe-inline'`; it is not an independent nonce/hash defense if a future rendering bypass introduces inline script (`next.config.ts:37-49`). | open — below high threshold (non-blocking) |
| T-06-33 | Information disclosure / Elevation of privilege | Global browser headers | high | mitigate | Global CSP, HSTS in production, `nosniff`, frame denial, strict-origin referrer policy, permissions policy, hidden framework header, and admin noindex are configured for all relevant routes (`next.config.ts:37-101`). | closed |
| T-06-34 | Information disclosure | Error oracle/stack leakage | medium | mitigate | Anonymous media failures are empty uniform 404s; expected upload failures expose bounded validation messages only; auth errors are generic, while unexpected faults are delegated rather than serialized with DB/decoder detail (`src/app/media/[mediaId]/route.ts:33-41`; `src/app/api/admin/media/route.ts:124-129,138-186`; post route lines 26-41,60-74). | closed |
| T-06-35 | Tampering | SQL/Prisma injection | high | mitigate | Runtime paths use typed Prisma selectors and structured `where`/`data`; no runtime raw SQL sink accepts request data. Storage/reclamation use retrying Serializable transactions, while post publication and media exposure share one transaction where atomicity matters (`src/lib/db/prisma.ts:1-22`; `src/lib/media/media-service.ts:50-125,127-238`; `src/lib/admin/post-mutations.ts:602-685,728-810`). | closed |
| T-06-36 | Tampering / Elevation of privilege | Dependency supply chain | high | mitigate | Runtime and development dependencies are exact-pinned in `package.json`, lockfile integrity is present, and 2026-07-12 registry audits reported 0 vulnerabilities for both all 841 dependencies and the production tree (`package.json`; `package-lock.json`; audit trail below). | closed |
| T-06-37 | Information disclosure | Committed secrets / executable sinks | high | mitigate | Scanner enumerates tracked and pending files, fails closed on git/read errors, detects common credentials and dangerous JS/TS sinks, and has exact-path/value-only suppression. The final repository gate passed 329 text files and skipped 43 binary files (`scripts/security-source-scan.mjs:15-135,137-269,389-405`; audit trail). | closed |
| T-06-38 | Spoofing / Tampering / Information disclosure | Production edge, secrets, private database | critical | transfer | No provider artifact proves canonical Host enforcement, trusted proxy behavior, TLS termination, WAF/rate limits, environment-secret custody, or private database exposure. Phase context explicitly says these provider-owned controls remain launch blockers (`06-CONTEXT.md`; `06-04-PLAN.md`). | open |
| T-06-39 | Repudiation / Denial of service | Restore, monitoring, incident response | high | transfer | No provider restore exercise, backup evidence, alerting/monitoring record, or operational ownership/SLA is present; Phase 6 explicitly requires these to remain blockers until evidence exists (`06-CONTEXT.md`; `06-04-PLAN.md`). | open |
| T-06-40 | Information disclosure | External HTTPS images | low | mitigate | Persistence and import accept external images only with canonical lowercase `https://`; uppercase HTTPS is rejected. For accepted lowercase external URLs, both Markdown images and unoptimized external covers set `no-referrer`. Their case-insensitive renderer predicates are defense in depth for legacy/in-memory values and do not broaden the canonical admission policy. The broader threat remains open because direct loading from any author-selected HTTPS host still discloses the reader's IP to that third party, with no host allowlist, proxy, privacy notice, or signed risk acceptance (`src/lib/security/url-policy.ts:21-31,34-66`; `src/lib/markdown/public-render.tsx:365-377`; `src/components/public/content/PostVisualBlock.tsx:14-26`; public image-render caller search). | open — below high threshold (non-blocking) |
| T-06-41 | Repudiation | Admin/media auditability | medium | mitigate | Mutation responses contain the admin email and models have timestamps, but uploads, media publication, edits, and deletes have no durable security audit event with actor/action/target/outcome (`src/lib/admin/post-mutations.ts:59-86,94-177`; `prisma/schema.prisma:16-130`). | open — below high threshold (non-blocking) |
| T-06-42 | Tampering | Private-media reclamation | high | mitigate | Reclamation selects only assets older than seven days with `publicAt: null`, parses every persisted post through the canonical media collector, and deletes only unreferenced IDs with age/private predicates repeated. Discovery and delete share a retrying Serializable transaction; public media is never eligible and any later publish must independently prove existence (`src/lib/media/media-service.ts:50-77,127-188,190-238`). | closed |
| T-06-43 | Tampering | Publishing stale/unsaved editor content | high | mitigate | Every user-edit/import path increments a revision and marks the form dirty; publication controls are disabled while dirty/importing/saving. Save completion clears dirty state only if the submitted revision is still current, so edits made during an in-flight save remain visibly unsaved and cannot be published accidentally (`src/components/admin/PostEditorShell.tsx:367-425,436-504,528-663,732-759`). | closed |
| T-06-44 | Tampering | Reclamation/publication TOCTOU | high | mitigate | If reclamation races publication, `markMediaPublic` updates only the private IDs observed, compares the affected count, then rereads every requested ID. A concurrent delete becomes `ManagedMediaNotFoundError` and rolls back the post; a concurrent public transition is accepted only when every asset now exists and is public. Reclamation also repeats `publicAt: null` at delete time, so the race fails closed in either lock order (`src/lib/media/media-service.ts:127-188,190-238`; `src/lib/admin/post-mutations.ts:506-543,645-650,773-778`). | closed |
| T-06-45 | Tampering | Entity-encoded managed-media references | high | mitigate | Markdown character references can decode into a canonical managed URL even when the raw source lacks that literal string. Reclamation no longer uses a raw SQL `contains` prefilter: it loads all persisted post bodies/covers and runs each through `collectManagedMediaIds`, whose remark AST supplies decoded destinations, before deleting (`src/lib/media/media-service.ts:190-238`; `src/lib/media/media-url.ts:42-97`). | closed |
| T-06-46 | Elevation of privilege / Tampering | Article heading identity and DOM clobbering | medium | mitigate | Heading text and IDs are derived once from the semantic Markdown AST, so encoded entities produce the same decoded text for heading, TOC, and fragment. IDs contain only normalized letters/numbers/hyphens, are prefixed `article-heading-`, and use deterministic duplicate counters; the renderer preserves this generated ID and sanitizer accepts it without exposing author HTML attributes (`src/lib/markdown/public-render.tsx:43-64,73-162,284-315,394-417`; `src/components/public/content/TableOfContents.tsx:50-61`). | closed |

*Status: `open` is blocking at critical/high; `open — below high threshold (non-blocking)` remains a required remediation but does not increment `threats_open`.*

## L3 End-to-End Verification

### Upload and media delivery

The verified order is: exact Origin check → DB-backed admin session → process-local per-admin attempt limit → content-type/encoding/declared length → streamed actual-length bound → multipart parse → exactly one file and file-size bound → old-private reclamation → process-local decode permit → MIME/signature/decode/pixel checks → orientation/resize/fixed WebP re-encode → Serializable deduplication/quota/create. No decoder or database write is reachable before CSRF and authentication succeed. The persistent 512 MiB quota is database-wide and concurrency-safe; the attempt/decode guards are deliberately described as process-local, while distributed rate, timeout, body, and slow-client enforcement remains blocked on `T-06-38` evidence.

On publication, managed IDs are derived from parsed Markdown image nodes and canonical cover URLs, every ID must exist, and the validation/post/`publicAt` writes share one transaction using the current exposure time. `markMediaPublic` verifies affected counts and rereads after contention, while reclamation repeats its private predicate inside a Serializable transaction, so a reclaim/public race either reaches public state or aborts publication. Reclamation parses all persisted posts, including entity-encoded destinations, and cannot select public or semantically referenced media.

### Markdown and editor rendering

The editor rejects an oversized import before reading it; the parser independently bounds bytes, fatal-decodes UTF-8, rejects NUL, disables aliases/duplicate YAML keys, reads only known typed fields, validates image URLs, and requires an atomic Tiptap round trip before replacing form state. Publication fields are not consumed.

Stored content reaches the public DOM through raw-HTML stripping, React Markdown with `skipHtml`, fixed element/component sets, server-side directive validation, directive attribute erasure, four-class tone allowlisting, and `rehype-sanitize`. Shiki only accepts own bundled-language keys and fails soft to readable fenced code. Headings and TOC fragments share one semantic AST-derived, entity-decoded `article-heading-*` identity, including deterministic duplicate suffixes; author text cannot emit an unprefixed shell ID. External image persistence/import also shares the canonical lowercase `https://` contract. The post route and strict schemas bound all work before persistence.

### Authentication, headers, database, and dependencies

Media and post mutation routes retain Origin-before-auth-before-body ordering. Sessions combine strong random/HMAC tokens and cookie flags with seven-day absolute and two-hour idle server-side expiry; invalid-time and unauthorized-email deletes repeat their invalidity predicates, while refresh repeats every valid-time predicate, so a stale request cannot delete or revive a concurrently refreshed session. Typed Prisma operations and transactions prevent request-driven SQL injection, quota races, reclamation/publication races, and partial publication state. Editor revision tracking prevents unsaved state from crossing the publication boundary. External-image admission requires canonical lowercase `https://`, uppercase HTTPS is rejected, and accepted external images receive `no-referrer`; the renderers' case-insensitive predicates are defense in depth only. Direct third-party loading still exposes reader IP (`T-06-40`). Browser CSP still permits inline script (`T-06-32`). Exact pins, lock integrity, the source scanner, and current registry audits do not replace the missing provider evidence in `T-06-38`/`T-06-39`.

## Accepted Risks Log

No accepted risks. No open threat was converted to accepted risk, and no owner sign-off was inferred from a product decision or planning note.

## Unregistered Flags

None. Four Phase 6 `06-0x-SUMMARY.md` files exist, but a direct scan found no explicit executor `## Threat Flags` entries to import. Their security notes are already represented by the register. Remediation-derived reclamation, dirty-state, TOCTOU, entity-encoding, and heading-identity boundaries are registered as `T-06-42` through `T-06-46`; all other traced surfaces, including provider evidence gaps, remain mapped above.

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Blocking Open | Run By |
|------------|---------------|--------|------|---------------|--------|
| 2026-07-12 | 41 | 30 | 11 | 4 | `gsd-security-auditor` generic-agent workaround |
| 2026-07-12 | 43 | 38 | 5 | 2 | `gsd-security-auditor` generic-agent workaround re-audit |
| 2026-07-12 | 46 | 41 | 5 | 2 | `gsd-security-auditor` generic-agent workaround final narrow L3 audit |
| 2026-07-12 | 46 | 41 | 5 | 2 | `Codex` final incremental L3 audit |

Evidence collected on 2026-07-12:

- Full source trace of every in-scope route/library plus auth, CSRF, session, headers, Prisma schema/migration, render callers, dependency source, and runtime write call sites.
- `npm audit --json`: 0 info/low/moderate/high/critical vulnerabilities across 841 total dependencies.
- `npm audit --omit=dev --json`: 0 info/low/moderate/high/critical vulnerabilities.
- `npm run security:scan`: passed; 342 text files scanned and 53 binary files skipped.
- Supplemental edge probes (not used in place of code evidence): YAML aliases throw with `maxAliasCount: 0`; a `__proto__` YAML key did not alter the result prototype; Shiki inherited language keys passed the current `in` test and made `codeToHast` throw.
- Implementation files were kept read-only; only this SECURITY.md was created. No commit was made.

Re-audit evidence collected after remediation on 2026-07-12:

- Re-traced media guard → bounded body → reclamation → decode permit → image ingest → Serializable dedup/quota/store and publication existence → monotonic `publicAt` → private/public delivery end to end.
- Re-traced bounded post JSON → strict field/body/directive policy → transactional publication → root/editor error mapping, plus import pre-read, editor revision/dirty state, Shiki fallback, session idle/absolute predicates, and all external-image render callers.
- `npm audit --json` and `npm audit --omit=dev --json`: 0 info/low/moderate/high/critical vulnerabilities across 841 dependencies.
- `npm run security:scan`: passed; 323 text files scanned and 43 binary files skipped.
- Tests were not used as mitigation evidence. Implementation files remained read-only; only this report was updated, and no commit was made.

Final narrow L3 evidence collected on 2026-07-12:

- Re-traced both reclaim/public lock orders through conditional `publicAt` writes/deletes, affected-count verification, current-state reread, transaction rollback, and Serializable retry behavior.
- Verified conditional invalid-time/email session deletion cannot remove a concurrently refreshed/corrected row; refresh still repeats absolute, idle, and expiry predicates.
- Verified all persisted posts are parsed for reclamation, removing raw-string entity-encoding bypasses; supplemental parser inspection confirmed character references become canonical AST destinations and heading entities become semantic text. This inspection supplements, but does not replace, the cited implementation evidence.
- Verified namespaced heading IDs and TOC fragments share one AST-assigned value. The URL policy accepts only lowercase `https://`; accepted external cover/Markdown images receive `no-referrer`, while their case-insensitive renderer predicates remain defense in depth and do not admit uppercase HTTPS.
- Implementation files remained read-only; only this report was updated, and no commit was made.

Final incremental evidence collected on 2026-07-12:

- Re-read the canonical URL policy and both persistence/import callers: only lowercase `https://` is accepted, while the case-insensitive explicit-scheme detector rejects uppercase variants rather than reclassifying them as relative.
- Re-read the semantic heading collector/render path: entity-decoded labels and rendered fragments share the same namespaced `article-heading-*` ID and deterministic duplicate counter.
- Re-traced Serializable digest-deduplication/quota/create, private-media reclamation, conditional publication exposure, affected-count verification, and current-state rereads for both race winners.
- Re-traced session token creation, absolute/idle expiry, conditional cleanup, allowlist cleanup, and conditional refresh; rechecked the process-local upload rate/decode boundaries separately from the database-wide persistent quota.
- Focused Vitest regression confirmation passed: 8 files, 102 tests. Targeted ESLint passed for the eight audited implementation files.
- `npm audit --json` and `npm audit --omit=dev --json` each reported 0 info/low/moderate/high/critical vulnerabilities across 841 dependencies. `npm run security:scan` passed with 329 text files scanned and 43 binary files skipped.
- Repository inventory found runbooks and explicit pending-gate statements, but no provider execution artifact for Host/TLS/proxy/WAF/secrets/private database or restore/monitoring/incident ownership. Therefore `T-06-38` and `T-06-39` remain blocking; referrer suppression does not close the reader-IP residual in `T-06-40`.
- Implementation files remained read-only; only this report was updated, and no commit was made.

## Sign-Off

- [x] All threats have a disposition.
- [x] Accepted-risks status is explicit (`none`).
- [ ] All critical/high threats are closed or owner-accepted.
- [ ] `threats_open: 0` confirmed.
- [ ] `status: verified` set in frontmatter.

**Approval:** blocked pending provider evidence for `T-06-38` and `T-06-39`; non-blocking remediation remains for `T-06-32`, `T-06-40`, and `T-06-41`.

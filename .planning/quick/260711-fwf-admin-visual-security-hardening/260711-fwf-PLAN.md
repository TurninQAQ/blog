---
quick_id: 260711-fwf
phase: quick-admin-visual-security-hardening
plan: "01"
type: execute
wave: 1
depends_on: []
status: completed
mode: quick-full
date: 2026-07-11
description: "统一管理员界面与首页视觉风格，并完成全站公网安全审计和必要加固"
autonomous: true
files_modified:
  - src/app/admin/admin.css
  - src/app/admin/layout.tsx
  - src/app/admin/login/page.tsx
  - src/components/admin/AdminNav.tsx
  - src/components/admin/AdminShell.tsx
  - src/components/admin/AdminPostList.tsx
  - src/components/admin/PostEditorShell.tsx
  - src/components/admin/DeletePostDialog.tsx
  - src/components/admin/TaxonomyPicker.tsx
  - src/components/admin/SeriesOrderInput.tsx
  - src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx
  - src/components/admin/wysiwyg/WysiwygToolbar.tsx
  - src/tests/e2e/admin-ui.spec.ts
  - src/lib/security/url-policy.ts
  - src/lib/security/url-policy.test.ts
  - next.config.ts
  - src/lib/admin/post-input.ts
  - src/lib/admin/guarded-query.ts
  - src/lib/admin/guarded-query.test.ts
  - src/lib/admin/post-queries.ts
  - src/app/admin/logout/route.ts
  - src/lib/skeleton/probe-gate.ts
  - src/tests/e2e/skeleton.spec.ts
  - src/tests/e2e/security-hardening.spec.ts
  - scripts/security-source-scan.mjs
  - scripts/security-production-smoke.mjs
  - docs/security/public-exposure-audit-2026-07-11.md
must_haves:
  truths:
    - "管理员登录、控制台、文章库和编辑器明显复用当前首页的纸白、墨黑、钴蓝、信号红与机械漫画框线语言，但长表单和正文编辑区保持安静、清晰、可长时间使用。"
    - "管理员端在 1440px、390px 和 320px 下无横向溢出，键盘焦点、模态框、44px 触控目标、错误关联和 reduced-motion 状态均可用。"
    - "每个返回草稿、正文或后台统计的查询函数都在任何 Prisma 读取前重新验证管理员会话，布局保护不再是唯一的数据保密边界。"
    - "生产环境始终关闭本地骨架读写探针；公网响应具备经过浏览器回归验证的 CSP、反点击劫持、MIME、防泄露和权限策略头，且不暴露 X-Powered-By。"
    - "管理员登出只把浏览器重定向到显式配置且经过严格验证的 ADMIN_SITE_ORIGIN；未配置时才回退到 request.url 自身 origin，绝不信任 Host、X-Forwarded-Host 或 trustHostHeader。"
    - "封面图只接受长度受限的 HTTPS URL；正文 Markdown 的图片目的地址在服务端只接受站内/相对路径或 HTTPS 外链，直接调用 API 也无法持久化 javascript、data、file、ftp、纯 HTTP 或协议相对图片。"
    - "全站安全报告覆盖认证、授权、CSRF、会话、输入、Markdown/XSS、公开草稿隔离、诊断路由、响应头、秘密、数据库边界、依赖和部署操作；只有复审确认没有未处置高危/严重项时才能标记通过，否则任务明确中止并进入重规划。"
    - "当前未提交的公开首页重设计及其测试、资产、设计文档和 STATE 变更保持原样且不进入本任务提交。"
  artifacts:
    - src/app/admin/admin.css
    - src/components/admin/AdminNav.tsx
    - src/tests/e2e/admin-ui.spec.ts
    - src/lib/security/url-policy.ts
    - src/lib/security/url-policy.test.ts
    - src/lib/admin/guarded-query.ts
    - src/lib/admin/guarded-query.test.ts
    - src/tests/e2e/security-hardening.spec.ts
    - scripts/security-source-scan.mjs
    - scripts/security-production-smoke.mjs
    - docs/security/public-exposure-audit-2026-07-11.md
  key_links:
    - "src/app/admin/layout.tsx imports src/app/admin/admin.css and places every admin route under one manga-admin-shell token scope without importing public shell/canvas components."
    - "src/components/admin/AdminNav.tsx uses the current pathname to connect the protected shell to /admin, /admin/posts and the public homepage with an aria-current state."
    - "src/lib/admin/post-queries.ts passes requireAdmin and a lazy Prisma callback to the behavior-tested guarded-query primitive; UnauthorizedAdminError propagates without running the callback, while the protected layout separately owns browser redirects through requireAdminPage."
    - "next.config.ts owns one static-compatible header policy, and scripts/security-production-smoke.mjs verifies the actual next start responses for /, /admin/login and /api/skeleton-probe."
    - "src/app/admin/logout/route.ts resolves /admin/login against a validated canonical ADMIN_SITE_ORIGIN without changing the existing POST CSRF check or session-destruction order."
    - "src/lib/security/url-policy.ts is shared by src/lib/admin/post-input.ts and WysiwygToolbar.tsx, and post-input applies it to both coverImage and every inline/reference-style bodyMarkdown image destination."
    - "A pre-work protected-path patch/index baseline and SHA-256 manifests for protected untracked assets must compare byte-for-byte before every commit and at completion."
    - "The security report cites executable evidence from the focused security tests, existing auth/mutation/public-content suites, npm audit and source/secret scans."
---

# Quick Task 260711-fwf: Admin Visual Unification and Public-Exposure Security Hardening

## Objective

Bring the admin experience into the already accepted light mecha-manga visual system without sacrificing writing ergonomics, then audit the entire application and close the concrete security gaps that matter before public exposure.

Success means the admin is visually related to the homepage, all existing authoring and publication behavior still works, application trust boundaries have direct automated coverage, and remaining deployment or dependency risks are explicitly recorded rather than hidden behind a blanket “secure” claim.

## Read First

- `AGENTS.md`
- `.planning/STATE.md`
- `.planning/quick/260710-kvr-implement-selected-option-1-light-mecha-/260710-kvr-PLAN.md`
- `.planning/quick/260710-kvr-implement-selected-option-1-light-mecha-/260710-kvr-SUMMARY.md`
- `docs/design/mecha-manga-option-1.png`
- `output/playwright/mecha-redesign/home-desktop-final.png`
- `output/playwright/mecha-redesign/home-mobile-final.png`
- `design-qa.md`
- `src/app/globals.css`
- `src/components/public/PublicShell.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/PostEditorShell.tsx`
- `src/lib/auth/admin.ts`
- `src/lib/auth/session.ts`
- `src/lib/auth/csrf.ts`
- `src/lib/auth/login-attempts.ts`
- `src/app/admin/logout/route.ts`
- `src/lib/admin/post-queries.ts`
- `src/lib/admin/post-mutations.ts`
- `src/lib/markdown/public-render.tsx`
- `src/app/api/skeleton-probe/route.ts`
- `next.config.ts`

## Scope and Preservation Guard

- Treat the current working-tree public redesign as the visual source of truth. Do not edit, restore, format, stage, or commit `src/app/globals.css`, `src/app/(public)/**`, `src/components/public/**`, `src/components/visual/SignalNetworkCanvas.tsx`, `src/lib/markdown/public-render.tsx`, the existing public Playwright files, `public/**`, `docs/design/**`, `design-qa.md`, `output/**`, or the current `.planning/STATE.md` changes.
- `src/tests/e2e/admin-authoring.spec.ts` already contains an uncommitted 44px toolbar assertion. Preserve it byte-for-byte and place new admin visual coverage in `src/tests/e2e/admin-ui.spec.ts`.
- Before reading implementation files, create a preservation directory outside the worktree with `PRESERVE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/260711-fwf-preserve.XXXXXX")` and retain its path for the whole run. For protected tracked paths (`.planning/STATE.md`, `src/app/globals.css`, `src/app/(public)`, `src/components/public`, `src/components/visual/SignalNetworkCanvas.tsx`, `src/lib/markdown/public-render.tsx`, `src/tests/e2e/admin-authoring.spec.ts`, `src/tests/e2e/public-content-library.spec.ts`, `src/tests/e2e/public-shell.spec.ts`), save `git diff --binary -- ...` as `tracked.patch`, `git ls-files -s -- ...` as `tracked.index`, and SHA-256 each baseline file into `tracked.sha256`. Hash `tracked.patch` and `tracked.index` themselves as well.
- Build a sorted SHA-256 plus path manifest for every file under the protected untracked roots `.planning/quick/260710-kvr-implement-selected-option-1-light-mecha-/`, `public/`, `docs/design/`, and `output/`, plus `design-qa.md`, `docs/release-acceptance-2026-07-10.md`, and `src/app/icon.png` when present. Also save the sorted protected untracked file list so newly added or removed files are detected, not only modified files.
- Before every commit and at completion, regenerate the tracked patch/index/file hashes and protected untracked list/hash manifest into fresh files, compare each baseline/current artifact with `cmp`, then run `sha256sum -c` against the baseline manifests. Any mismatch is a hard stop: do not stage, commit, restore, or absorb it; report the exact path as concurrent/unrelated work. Remove only the temporary preservation directory after the final successful comparison.
- Capture `git status --short` before implementation and before every commit; stage only the exact paths owned by the completed task. Never use a broad add command. If an owned path becomes concurrently modified outside this task, stop and report the overlap instead of absorbing it.
- Reuse the current dependency set. No package install, forced audit fix, auth-stack replacement, new upload service, middleware/proxy architecture, role system, or unrelated refactor is authorized.

## Sequential Execution and Context Budget

This remains one quick plan with three strict sequential boundaries because the visual, editor and public-exposure goals share one dirty working tree, but the executor must not load or edit later-task files early.

| Task | Bounded concern | Owned paths | Target context | Stop condition |
|---|---|---:|---:|---|
| 1 | Admin theme scope, login/header/navigation/library status, computed-color browser contract | 7 | 12% | Stop after focused tests, preservation comparison and an allowlisted commit. |
| 2 | Editor ergonomics/accessibility plus complete image-destination policy | 10 | 18% | Stop after RED/GREEN tests, preservation comparison and an allowlisted commit. |
| 3 | Auth/query, canonical logout, diagnostic and response-header boundaries; audit/remediation/retest/report | 11 | 20% | Stop after production smoke, full audit loop and preservation comparison, or halt for replanning on an unplanned high/critical finding. |

The total target is 50% context. At each boundary, write a compact implementation/verification note before proceeding and discard incidental detail from the previous concern. If a task needs an undeclared production path, exceeds its target materially, or uncovers a cross-subsystem fix, do not silently broaden it: halt and return the exact evidence for a revised plan.

<tasks>

<task type="auto">
  <name>Task 1: Establish the scoped light-mecha admin shell and visual contract</name>
  <files>src/app/admin/admin.css, src/app/admin/layout.tsx, src/app/admin/login/page.tsx, src/components/admin/AdminNav.tsx, src/components/admin/AdminShell.tsx, src/components/admin/AdminPostList.tsx, src/tests/e2e/admin-ui.spec.ts</files>
  <action>
    Write the shell/color portion of `admin-ui.spec.ts` first, then create `src/app/admin/admin.css`, import it only from the admin segment layout, and apply one `manga-admin-shell` scope. Set `color-scheme: light` and re-declare the accepted public palette inside that scope (`#f7f9fc`, `#ffffff`, `#edf3f9`, `#101217`, `#465160`, `#697586`, `#075fce`, `#df2532`, `#f2b72b`) so existing Tailwind `lab-*` utilities become light without changing global/public CSS.

    Explicitly override every remaining dark hard-coded admin descendant under the scope, rather than assuming token replacement is sufficient: `.lab-wysiwyg-shell`, toolbar/buttons/image form, canvas and actual `.ProseMirror` content, headings, blockquote, inline code, pre/code, tables, images, placeholders, code/table node wrappers/toolbars/edit states, field errors, destructive buttons, modal/backdrop, login decoration and alerts. The editor/article canvas must be white with graphite prose; code blocks remain intentionally dark ink, while the old `#070a0f` base and `#2ef2b5` green must not remain as general admin surface/accent colors. Use 2px ink framing, restrained hard shadows and cobalt/red/safety-yellow accents. Keep manga/screentone emphasis on the login card and admin header; do not mount public artwork, canvas, continuous motion or hero-level noise behind the editor. Add local mobile and reduced-motion rules.

    Add a small client `AdminNav` with “控制台”, “文章库”, and “查看站点” links, a pathname-derived `aria-current="page"`, 44px targets, and a compact mobile wrap. Compose it into `AdminShell` while preserving the POST logout form, session email, protected layout contract and server-rendered children. Add explicit class hooks to the login composition, but keep generic failure copy and the single-author boundary unchanged. Correct the misleading `AdminPostList` heading from “草稿库” to “文章库” and render explicit 草稿/已发布 plus 精选 badges from the existing DTO fields; do not change queries, DTOs, status semantics, or mutations.

    The browser contract must assert computed, not merely source, values on login, dashboard, list and new-editor routes: root light color scheme; paper base `rgb(247, 249, 252)`; white panels/editor canvas; ink text `rgb(16, 18, 23)`; cobalt accent `rgb(7, 95, 206)`; intentionally dark code blocks; no old dark base/green accent on ordinary inputs, panels, links or buttons. Also cover navigation/current state, the 文章库 heading with explicit status/featured badges, no horizontal overflow at 390/320 and static reduced-motion behavior. Reuse local fixtures without depending on arbitrary posts, and keep the dirty `admin-authoring.spec.ts` untouched.
  </action>
  <verify>
    <automated>npm run test:e2e -- src/tests/e2e/admin-ui.spec.ts --grep "admin shell|computed admin colors" --project=desktop --project=mobile --project=min-mobile --project=reduced-motion</automated>
    <automated>npm run lint</automated>
    <human-check>Capture login, dashboard, article library and editor at 1440x900, 390x844 and 320x720. Compare palette, typography, ink borders and shadow language to the current homepage; confirm the editing surface is visibly calmer than the hero.</human-check>
  </verify>
  <done>All admin routes inherit an isolated, computed-light visual system matching the homepage language; navigation and truthful article-library status cues work; responsive/reduced-motion shell checks pass; the seven owned paths are the only task changes; and the preservation baseline compares cleanly before the allowlisted commit.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Finish editor accessibility and close every supported image-input bypass</name>
  <files>src/components/admin/PostEditorShell.tsx, src/components/admin/DeletePostDialog.tsx, src/components/admin/TaxonomyPicker.tsx, src/components/admin/SeriesOrderInput.tsx, src/components/admin/wysiwyg/AdminWysiwygEditorClient.tsx, src/components/admin/wysiwyg/WysiwygToolbar.tsx, src/lib/security/url-policy.ts, src/lib/security/url-policy.test.ts, src/lib/admin/post-input.ts, src/tests/e2e/admin-ui.spec.ts</files>
  <behavior>
    - "Desktop long-editor save/publication actions remain reachable while mobile actions stay in document flow and do not cover content."
    - "Tag choices, toolbar controls and dialog controls are at least 44px; keyboard focus is visible; the delete dialog traps Tab, closes on Escape, locks scrolling and restores trigger focus."
    - "TextInput, excerpt, taxonomy, series-order and actual ProseMirror contenteditable controls expose stable aria-invalid/aria-describedby links to their own errors."
    - "Cover image accepts empty or at most 2048-character HTTPS external URLs and rejects all other schemes."
    - "Every inline and reference-style Markdown image destination is server-validated: site-root and relative internal paths plus HTTPS external URLs pass; protocol-relative, javascript, data, file, ftp, plain HTTP, malformed and oversized destinations fail."
    - "Authenticated direct create/edit API calls with an unsafe bodyMarkdown image return a bodyMarkdown field error and cause no post insert/update; supported internal/relative/HTTPS images persist."
  </behavior>
  <action>
    Extend `admin-ui.spec.ts` and create `url-policy.test.ts` first. Add a desktop-only sticky action cluster that remains reachable during a long edit and normal-flow mobile actions. Give the WYSIWYG toolbar real toolbar semantics; make tag choices and controls at least 44px with visible focus; and make `DeletePostDialog` focus the modal, trap Tab, close on Escape, lock body scrolling while open, and restore focus to its trigger. Preserve native unpublish confirmation and destructive-operation behavior.

    Wire field errors in every named owner, not through CSS alone. `PostEditorShell` owns stable ids and `aria-invalid`/`aria-describedby` for its reusable text input and excerpt; `TaxonomyPicker` owns them for select/new taxonomy/tag controls; `SeriesOrderInput` owns them for order; `AdminWysiwygEditorClient` applies them to the actual ProseMirror contenteditable when body errors change. Do not alter validation copy, DTOs or Markdown round-trip semantics.

    In `url-policy.ts`, implement a dependency-free, length-bounded policy with separate cover and Markdown-destination decisions. Cover images are empty or HTTPS external. Markdown images preserve site-root paths (but not `//host`), ordinary relative paths including `./` and `../`, and HTTPS external URLs. Reject control characters, malformed/oversized destinations and every other explicit or protocol-relative scheme. Scan the supported Markdown grammar for both inline images and reference-style image definitions, while ignoring escaped image markers, inline code and fenced code; unwrap angle-bracket destinations and optional titles before validating. Test multiple bypass spellings, duplicate references, code-fence false positives and all allowed path forms.

    Apply the policy server-side in `post-input.ts`: cover violations map to `coverImage`; any invalid image destination in `bodyMarkdown` maps to `bodyMarkdown`. Use the same destination predicate for immediate WYSIWYG image-form feedback, but treat client validation only as guidance. In `admin-ui.spec.ts`, authenticate and send direct create and edit requests containing unsafe Markdown image destinations; assert 400 field errors and query PostgreSQL to prove zero insert or unchanged prior body. Also prove root-relative, relative and HTTPS images persist, then clean fixtures. Do not fetch/proxy image URLs, add dependencies or weaken the existing final public sanitizer.
  </action>
  <verify>
    <automated>npm run test:unit -- src/lib/security/url-policy.test.ts</automated>
    <automated>npm run test:e2e -- src/tests/e2e/admin-ui.spec.ts --grep "editor accessibility|image destination" --project=desktop --project=mobile --project=min-mobile --project=reduced-motion</automated>
    <automated>npm run lint &amp;&amp; npm run build</automated>
    <human-check>At 200% zoom and with keyboard only, exercise the long editor, every error state, toolbar/image form, taxonomy choices and delete dialog; confirm visible focus and no covered content.</human-check>
  </verify>
  <done>Editor ergonomics and error semantics pass across all viewports; direct API bypass tests prove unsupported cover/body image destinations cannot write data; supported internal/relative/HTTPS Markdown images remain usable; only the ten owned paths changed; and preservation comparison passes before the allowlisted commit.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Audit, harden, production-smoke and re-audit the remaining trust boundaries</name>
  <files>next.config.ts, src/lib/admin/guarded-query.ts, src/lib/admin/guarded-query.test.ts, src/lib/admin/post-queries.ts, src/app/admin/logout/route.ts, src/lib/skeleton/probe-gate.ts, src/tests/e2e/skeleton.spec.ts, src/tests/e2e/security-hardening.spec.ts, scripts/security-source-scan.mjs, scripts/security-production-smoke.mjs, docs/security/public-exposure-audit-2026-07-11.md</files>
  <behavior>
    - "When authorization rejects, the guarded query propagates the same UnauthorizedAdminError and invokes its lazy content/Prisma callback zero times."
    - "All three exported admin content-query entry points wire requireAdmin as authorization and place every Prisma call inside the lazy callback; the DAL never redirects, while the protected layout retains requireAdminPage browser redirection."
    - "Production always returns 404 for skeleton GET/POST even with the legacy enabling flag, while development probe tests still pass."
    - "With an internal request URL and a valid external ADMIN_SITE_ORIGIN, GET/POST logout redirects to the canonical external /admin/login; invalid, credential-bearing or non-HTTP(S) configured values produce no redirect Location, and forwarded/Host headers never influence the target."
    - "Actual next start responses for /, /admin/login and /api/skeleton-probe carry the production CSP/HSTS/security policy, omit unsafe-eval and X-Powered-By, and admin responses carry noindex/noarchive."
    - "A real production Chromium login/logout flow observes POST /admin/logout, reaches /admin/login without a CSP violation, and the public HTTPS CSP contains no loopback host allowance."
    - "The final audit can report passed only after the post-remediation scan/retest has no open high/critical finding; otherwise it records blocked status and halts for replanning."
  </behavior>
  <action>
    Use an explicit audit -> remediation -> retest loop.

    **Audit gate A (before production changes):** create `security-source-scan.mjs`, then inventory tracked and pending non-ignored text through `git ls-files --cached --others --exclude-standard -z`. Read files as buffers and skip only NUL-containing binaries. Scan every remaining text file, including tests, Markdown, lockfiles and planning artifacts, for credential/private-key patterns. Scan executable sink syntax (`dangerouslySetInnerHTML=` assignments, actual `rehype-raw` import/require calls, `eval(` and `new Function(`) only in executable source extensions (`.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx`, `.mts`, `.cts`), so prose that names a sink is not treated as executable evidence while test code remains covered. The only initial credential allowlist is the exact dummy PostgreSQL fixture value in `src/tests/e2e/data-model-foundation.spec.ts`; do not add broad path exclusions. The script must exit 0 only for a clean scan, 1 for findings, and 2 for Git/read/tool failure so “no match” cannot mask an error. Run dependency audit, route/handler inventory and focused existing auth/mutation/public-Markdown tests, and open the audit report with evidence. If any new high/critical issue is outside the explicitly planned query/header/probe fixes or needs an undeclared production path, set the report status to blocked and halt for plan revision before changing production code.

    **RED and planned remediation:** add a pure `runGuardedQuery(authorize, read)` primitive. It must await `authorize` and call `read` only on success. Unit-test an `UnauthorizedAdminError` rejection with a Prisma/content spy at exactly zero calls and identical error propagation. In `post-queries.ts`, each public admin query entry point must immediately return `runGuardedQuery(requireAdmin, async () => ...)`, with all Prisma promise construction inside the callback. This deliberately chooses `requireAdmin`, not `requireAdminPage`: DAL failures are typed errors and never redirects; `src/app/admin/(protected)/layout.tsx` remains the browser redirect owner through `requireAdminPage`. Add source-wiring assertions plus existing unauthenticated page redirect coverage.

    Make `isSkeletonProbeEnabled()` unconditionally false in production and update its existing tests for both absent/truthy legacy flags. In `next.config.ts`, set `poweredByHeader: false`; emit a static-compatible CSP and the other planned security headers on all paths plus noindex/noarchive on admin. Production omits `unsafe-eval`, limits scripts to self plus the documented Next-compatible inline allowance, limits connections/forms to self, permits self/data/blob/HTTPS images, denies objects/base/framing, and emits HSTS without includeSubDomains/preload. Development may add unsafe-eval for React debugging. Keep the documented inline script/style residual risk in the audit rather than forcing nonce middleware and dynamic rendering.

    Resolve SEC-12 in `src/app/admin/logout/route.ts` without enabling `experimental.trustHostHeader`. At handler entry, resolve the redirect base: when `ADMIN_SITE_ORIGIN` is present, parse it as an absolute URL and accept it only when the protocol is HTTP or HTTPS, username/password are empty, and it is an origin value with root pathname and no query/hash; build `/admin/login` from that parsed origin. Never read or trust `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, or any equivalent header for the redirect base. When the variable is absent, retain a local/unconfigured fallback derived only from `new URL(request.url).origin`. If a configured value is relative, malformed, credential-bearing, non-HTTP(S), or contains non-origin components, return a generic 500 response with no `Location` and no session side effect rather than falling back to attacker-influenced input. Preserve GET as redirect-only. For every valid configuration, preserve POST ordering exactly: reject cross-origin first, destroy the session second, then return the already-resolved redirect response.

    Add direct route evidence for SEC-12 in `security-hardening.spec.ts`: an internal `http://localhost:<port>/admin/logout` request plus valid external `ADMIN_SITE_ORIGIN=https://blog.example` returns `Location: https://blog.example/admin/login`; malicious Host/forwarding headers cannot alter it; every invalid configured-origin class returns no 3xx and no Location; and the unconfigured local fallback stays on the request URL origin. For POST, prove hostile Origin still returns 403 without destroying the session and an allowed canonical Origin still destroys the session before redirecting.

    Create `security-production-smoke.mjs` to start the already-built app with `next start` on an unused loopback port, poll readiness, request `/`, `/admin/login`, and `/api/skeleton-probe`, and always terminate the child. Assert public/admin success, production probe 404, CSP/HSTS/nosniff/referrer/frame/permissions headers, admin robots policy, no production CSP unsafe-eval, no X-Powered-By, and no literal `localhost`, `127.0.0.1` or `[::1]` allowance in the public HTTPS CSP. Then drive a real headed production Chromium page with configured local canonical origin and seeded admin credentials: capture requests, prove login and logout are POSTs, click the actual logout control, reach `/admin/login`, and fail on any `securitypolicyviolation` event or CSP console error. A dev Playwright response or HTTP-only logout check is not acceptable evidence for these production behaviors.

    **Retest and audit gate B:** run unit, focused E2E, full E2E, build/production smoke, both npm audits and the all-text scanner. A network, subprocess, parser or scanner failure is a failed/blocked gate, never equivalent to “no findings.” SEC-12 is a mandatory remediation item: the report cannot pass until direct canonical-origin tests, headed production POST login/logout, zero CSP violations, and the no-loopback public CSP assertion all pass. Re-audit every public/admin route and bracket param; Server Actions/Route Handlers; login enumeration/brute force/concurrency; cookies/session/redirect targets; CSRF/origin; request/body/protocol validation; Prisma and published-only isolation; Markdown/XSS/metadata; diagnostic routes; headers; secrets/env; database boundary; dependencies; errors and client props. Record severity, path/test evidence and disposition in the report. Newly discovered or still-open high/critical findings must set `status: blocked` and halt for GSD replanning; do not make undeclared ad-hoc fixes and do not claim zero-open/readiness. Medium/low findings need a concrete mitigation, accepted-risk rationale or provider gate.

    Record the observed five moderate Next/PostCSS and Prisma CLI/Hono advisories without using a forced downgrade/override. Require production dev-tool pruning and upstream follow-up. Include the provider-dependent pre-publication gate: HTTPS/TLS/HSTS observation, canonical `ADMIN_SITE_ORIGIN`, random secret/hash rotation, private/TLS least-privilege PostgreSQL, backup restore drill, production env injection, runtime dev pruning, reverse-proxy request/body/time limits, WAF rate limiting, logs/alerts and diagnostic confirmation. Distinguish application audit from infrastructure penetration testing.

    Before the task commit/final result, run the complete tracked/untracked preservation comparison from this plan. Stage only these eleven task paths. The report may say `passed` only when SEC-12 is resolved and gate B is clean of high/critical application findings; otherwise leave source changes uncommitted if required by the halt, preserve evidence, and return the blocking finding for revision.
  </action>
  <verify>
    <automated>npm run test:unit -- src/lib/admin/guarded-query.test.ts src/lib/security/url-policy.test.ts</automated>
    <automated>npm run test:e2e -- src/tests/e2e/security-hardening.spec.ts src/tests/e2e/skeleton.spec.ts src/tests/e2e/admin-auth.spec.ts src/tests/e2e/admin-mutations.spec.ts --project=desktop</automated>
    <automated>npm run lint &amp;&amp; npm run test:unit &amp;&amp; npm run build &amp;&amp; node scripts/security-production-smoke.mjs</automated>
    <automated>npm run test:e2e</automated>
    <automated>npm audit --audit-level=high &amp;&amp; npm audit --omit=dev --audit-level=high</automated>
    <automated>node scripts/security-source-scan.mjs</automated>
    <automated>git diff --check</automated>
    <human-check>Review gate-B dispositions and provider blockers; in the production server verify CSP console behavior plus login, admin CRUD/publication, public search/detail/taxonomy/archive/series and 404 non-disclosure.</human-check>
  </verify>
  <done>Either (a) SEC-12 direct and headed-production evidence passes, audit gate B has no open high/critical application finding, every lower finding has a disposition, production smoke/full regressions pass, provider blockers are explicit and preservation comparison passes before the allowlisted commit; or (b) the report is marked blocked and execution halts with evidence for replanning, without an unsupported readiness/zero-open claim.</done>
</task>

</tasks>

<threat_model>

## Trust Boundaries

| Boundary | Untrusted transition |
|---|---|
| Public browser -> App Router/search/slug routes | Query text, route params, request headers and navigation reach server-rendered public data. |
| Browser -> login Server Action | Credentials and action requests cross into the single-admin authentication boundary. |
| Authenticated browser -> admin Route Handlers | JSON mutation bodies and cookies can create, edit, publish, feature or delete content. |
| Admin content -> public renderer/browser | Markdown, links and image URLs become public HTML, metadata and network requests. |
| App -> PostgreSQL/env | Draft content, sessions, login attempts and secrets cross the data/runtime boundary. |
| Build/deploy -> public internet | Framework headers, dependency tree, TLS, proxy limits and diagnostic configuration determine the exposed surface. |

## STRIDE Threat Register

| ID | Category | Component | Severity | Disposition | Evidence / mitigation |
|---|---|---|---|---|---|
| T-Q-01 | Spoofing / DoS | Admin login | high | mitigate | Retain generic errors, Argon2id verification and atomic global DB login bucket; regression-test rotated email/forwarding headers/concurrency; add edge rate limiting to deployment gate. |
| T-Q-02 | Information disclosure / Elevation | `post-queries.ts` | high | mitigate | Route each lazy Prisma read through `runGuardedQuery(requireAdmin, read)`; propagate `UnauthorizedAdminError` without redirect or callback execution, while the protected layout separately retains `requireAdminPage` redirect behavior. |
| T-Q-03 | Tampering / Information disclosure | Admin mutations/logout | high | mitigate | Retain exact-Origin rejection, SameSite cookie, POST-only session destruction and guard-before-body parsing; resolve SEC-12 with validated canonical-origin redirects that never trust Host/forwarding headers, plus direct and headed-production CSP tests. |
| T-Q-04 | XSS / data injection | Markdown, metadata and external images | high | mitigate | Retain raw-HTML stripping plus sanitize/no dangerous render API; add CSP, HTTPS cover policy and server validation of every inline/reference Markdown image destination, including direct-API bypass tests with zero writes. |
| T-Q-05 | Clickjacking / MIME / referrer leakage | Browser responses | medium | mitigate | Emit and browser-test CSP frame denial, X-Frame-Options DENY, nosniff, restrictive referrer/permissions policies and no power header. |
| T-Q-06 | Tampering / DoS | Skeleton probe | medium | mitigate | Production gate becomes unconditional; both read and write routes return 404 even if a legacy flag is set. |
| T-Q-07 | Information disclosure | Public content queries | high | mitigate | Preserve centralized PUBLISHED + non-null publishedAt boundary and existing draft/private-slug regression matrix. |
| T-Q-08 | Supply-chain tampering | Next/PostCSS and Prisma CLI/Hono | medium | accept | No compatible audit fix is currently available and forced output recommends major downgrades; document exploitability, fail on high/critical, prune dev tooling in production, monitor upstream. |
| T-Q-09 | DoS | Search/render/request volume | medium | transfer | Existing search bound is 120 characters and publishing is admin-only; deployment proxy/WAF must enforce body, rate, timeout and concurrency limits. |
| T-Q-10 | Secret/data loss | Env, PostgreSQL, backups | high | transfer | No tracked secret found; TLS/private networking, least privilege, rotation, backup/restore and monitoring are blocking deployment-provider controls. |
| T-Q-11 | Repudiation | Single-admin content changes | low | accept | Single-author scope makes per-user attribution unnecessary; retain timestamps and require provider/application logs and backups before exposure. |

</threat_model>

## Source Coverage Audit

| Source | Item | Task | Status |
|---|---|---|---|
| User goal | Admin matches current homepage while remaining usable | 1, 2 | COVERED |
| User goal | Whole-site public-internet security check | 2, 3 | COVERED |
| User goal | Necessary attack prevention, not report-only advice | 2, 3 | COVERED |
| Working-tree baseline | Preserve active public redesign and unrelated changes | 1, 2, 3 | COVERED |
| Existing decisions | Custom single-admin auth, guard-first mutations, safe Markdown, published-only queries | 2, 3 | COVERED |
| Current dependency evidence | Five moderate advisories; no high/critical and no safe compatible forced fix | 3 | COVERED |
| Execution finding SEC-12 | Canonical logout redirect behind a proxy without trusting Host headers | 3 | COVERED |

## Success Criteria

- Admin pages are visually cohesive with the accepted homepage at desktop/mobile sizes while editor readability, keyboard behavior and reduced-motion support remain strong.
- New tests fail before each changed security behavior and pass afterward; existing auth, authoring, mutation, public-content and Markdown security tests remain green.
- Production `next start` responses prove the effective CSP/HSTS/header policy and a headed POST login/logout flow with no CSP violation; SEC-12 canonical redirects ignore Host/forwarding headers; admin reads have typed local authorization with zero query callback on failure; diagnostics are production-closed; and supported cover/body image inputs reject unsafe protocols even through direct API calls.
- The audit report has evidence-backed dispositions and a deployment gate. It records `passed` only when the remediation/retest loop proves no unresolved high/critical application issue; otherwise it records `blocked` and execution halts for replanning.
- Tracked patch/index/hash baselines and protected-untracked SHA-256 manifests compare exactly before each commit and completion; only explicit task paths are staged.

## Output

After execution, create `.planning/quick/260711-fwf-admin-visual-security-hardening/260711-fwf-SUMMARY.md` with task commits, verification results, audit disposition counts, accepted risks, deployment blockers and preservation evidence. Set completion status only after audit gate B passes; if the gate halts, record incomplete/blocked status and the exact replanning evidence instead of claiming completion.

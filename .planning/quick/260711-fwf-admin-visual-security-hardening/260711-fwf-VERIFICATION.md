---
quick_id: 260711-fwf
phase: quick-admin-visual-security-hardening
verified: 2026-07-11T15:54:39+08:00
status: human_needed
score: 8/8 must-haves verified
behavior_unverified: 0
overrides_applied: 0
human_verification:
  - test: "在最终公网域名完成 TLS/HSTS、canonical ADMIN_SITE_ORIGIN、固定 Host、WAF/反代限制、秘密注入、数据库最小权限/TLS、备份恢复、日志告警和 probe 404 验收。"
    expected: "供应商与基础设施门禁全部留有可复核证据，原生登录/退出无 CSP 违规。"
    why_human: "这些控制依赖真实域名、反向代理、数据库和云供应商，仓库自动化无法证明。"
---

# Quick 260711-fwf Verification Report

**结论：** 8 项实现 truth 均有代码、自动化或实际浏览器证据；应用层 high/critical open 为 0。`human_needed` 仅表示最终域名和基础设施门禁仍待完成，不能将仓库审计通过解释为可立即暴露公网。

## Must-have truths

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | 后台复用首页 light-mecha 语言且编辑区安静 | VERIFIED | 管理段独立 `admin.css`；登录、控制台、文章库、编辑器在 1440/390/320 实际截图与首页并排复核；白色编辑画布、墨黑框线、钴蓝/信号红/安全黄一致。 |
| 2 | 响应式、焦点、弹窗、44px、错误关联、reduced-motion 可用 | VERIFIED | 四个 Playwright project 覆盖 overflow、sticky/static、toolbar/tag 尺寸、焦点环、字段 aria、dialog trap/Escape/scroll lock/focus return；200% 缩放无溢出。 |
| 3 | 后台内容查询在 Prisma 前重新鉴权 | VERIFIED | 三个 DAL 入口均通过 `runGuardedQuery(requireAdmin, lazyRead)`；单测证明授权失败时 read 为 0 且错误原样传播。 |
| 4 | 生产 probe 关闭且响应头完整 | VERIFIED | production 下 probe GET/POST 恒 404；实际 `next start` 验证 CSP/HSTS/frame/nosniff/referrer/permissions/admin robots，无 X-Powered-By。 |
| 5 | 退出只使用严格 canonical origin | VERIFIED | 配置 origin 拒绝 credentials/path/query/hash/非 HTTP(S)；Host/forwarded headers 不受信；无效配置在任何 session 副作用前 fail closed。 |
| 6 | cover 与 Markdown 图片地址由服务端强制 | VERIFIED | `unified` + `remark-parse` AST 覆盖 direct/reference/duplicate definition；50 条策略单测与 direct create/edit E2E 证明危险值 400 且零写入。 |
| 7 | 全站安全报告完整且无开放应用 high/critical | VERIFIED | 报告覆盖 auth/authz/CSRF/session/input/XSS/草稿隔离/probe/headers/secrets/DB/dependencies/deployment；复审 10/10 finding closed。 |
| 8 | 既有公开首页 dirty worktree 原样保留 | VERIFIED | 各提交按 allowlist 精确暂存；最终 tracked patch/index/hash、受保护 untracked file-list/hash 与任务基线一致；STATE 与公开 redesign 未进入任务提交。 |

## Final automated evidence

| Check | Result |
|---|---|
| `npm run lint` | passed |
| `npm run test:unit` | 5 files、106/106 passed |
| `npm run build` | passed |
| full headed Playwright/Xvfb | 476 collected、453 passed、23 conditional skips、0 failed |
| production smoke | public/login 200；protected non-disclosing redirect；probe GET/POST 404；headed login/logout；CSP violations 0 |
| scanner self-test | assignment、encrypted/unencrypted private key、clean/finding/Git/read exits all passed |
| final source scan | 265 text、35 binary skipped、0 finding |
| both npm audit high thresholds | exit 0；0 high/critical；5 moderate nodes |
| deep review remediation | 10 fixed、0 skipped；`REVIEW-FIX.md` status `all_fixed` |
| `git diff --check` | passed |
| protected worktree comparison | patch/index/hash/file-list all matched |

点击型 E2E 使用 headed Chromium/Xvfb，因为本机 Chromium 149 headless 的 actionability 超时可在空白按钮上独立复现。此环境问题不计为应用 finding。

## Security disposition

- 静态 CSP 保留 `unsafe-inline`；现有补偿控制是禁止 raw HTML/eval、服务端 Markdown AST 输入策略与末端 sanitizer。若要 nonce，需要单独规划动态渲染架构。
- 5 个 moderate 包节点来自 Next 内置 PostCSS 和 Prisma CLI/@hono 链；强制修复建议为不兼容降级，因此临时接受并要求持续跟踪。
- 30 天固定会话、HTTPS 外部图片隐私影响、未授权 App Router 求值产生的服务端错误日志均已记录为接受/运营控制项。
- 发布仍阻塞于最终域名 TLS/canonical Host、生产秘密、私有 TLS 最小权限数据库、恢复演练、运行时裁剪、反代/WAF、监控和独立基础设施测试。

---

_Verified: 2026-07-11T15:54:39+08:00_  
_Verifier: root final goal-backward pass_

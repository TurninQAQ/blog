---
release_date: 2026-07-11
last_updated: 2026-07-12
local_release: accepted
qual_05: passed
public_exposure: blocked_pending_provider_controls
---

# Hans‘s Blog v1 发布验收报告（2026-07-11，Phase 6 更新）

## 验收结论

**本地应用发布候选通过，公网发布仍被阻塞。** 当前 Hans‘s Blog 的公开阅读、单管理员 Markdown/WYSIWYG 写作、数据库托管媒体、安全边界、响应式布局和 reduced-motion 门禁均有可复验证据，因此 D-16 与 QUAL-05 在“仓库内应用就绪”范围内通过。此结论不代表生产基础设施已就绪，也不授权立即把站点暴露到公网。

公网状态继续保持 `blocked_pending_provider_controls`。`T-06-38`（生产边缘、秘密托管、私有数据库）与 `T-06-39`（恢复、监控、事件响应）缺少供应商 PASS 证据；两项关闭前不得把本地验收解释为公网放行。

## 当前证据来源

本报告保留 Phase 5 历史证据链接，但所有当前门禁数字、风险和视觉结论均以 2026-07-12 可复验的 Phase 6 工作树为准，不沿用 2026-07-10 或早期 Phase 6 快照计数：

- [05-01：发布运行与验证基础](../.planning/phases/05-interaction-polish-and-verification/05-01-SUMMARY.md)
- [05-02：当前作者工作流与 Phase 3 复核](../.planning/phases/05-interaction-polish-and-verification/05-02-SUMMARY.md)
- [05-03：供应商中立的发布与恢复操作](../.planning/phases/05-interaction-polish-and-verification/05-03-SUMMARY.md)
- [05-04：最终视觉矩阵与证据清单](../.planning/phases/05-interaction-polish-and-verification/05-04-SUMMARY.md)
- [Phase 3 当前 Tiptap 验证记录](../.planning/phases/03-markdown-authoring-workflow/03-VERIFICATION.md)
- [Phase 5 视觉证据清单](../output/playwright/phase5/evidence-manifest-2026-07-11.json)
- [Phase 6 五张当前视觉证据清单](../output/playwright/phase6/evidence-manifest-2026-07-11.json)
- [当前设计 QA](../design-qa.md)
- [公网暴露安全审计](security/public-exposure-audit-2026-07-11.md)
- [项目运行说明](../README.md)与[PostgreSQL 备份恢复 runbook](operations/postgres-backup-restore.md)

## D-09 / D-10 自动化门禁

| 门禁 | 2026-07-11 当前结果 | 判定 |
| --- | --- | --- |
| `npm run lint` | ESLint 退出 0 | PASS |
| `npm run test:unit` | Vitest 18 个文件，217/217 通过 | PASS |
| `npm run db:validate` | Prisma schema validation 通过 | PASS |
| `npm run db:generate` | Prisma Client generation 通过 | PASS |
| `npm run build` | Next.js production build 通过 | PASS |
| `npm audit --json` | 退出 0；841 dependencies；0 vulnerabilities | PASS |
| `npm audit --omit=dev --json` | 退出 0；0 vulnerabilities | PASS |
| `npm run security:scan` / self-test | 当前 tracked/pending 树 0 finding；两项均退出 0 | PASS |
| 完整 headed Playwright | 491 passed；32 个项目条件 skip；1 个隔离 timeout | CONDITIONAL PASS：精确用例复跑 3/3 |
| 完整 reduced-motion project | 122 passed；9 个项目条件 skip | PASS |
| 作者工作流聚焦回归 | desktop headed 18/18，通过标题派生 slug、摘要、GFM 表格持久化/重开和公共包隔离 | PASS |
| 生产安全 smoke | public/admin 200；受保护路由非泄露跳转；probe GET/POST 404；真实登录/POST 退出；CSP violation 0；2 条预期 guarded-query 服务端日志 | PASS |

32 个 skip 全部来自四项目矩阵中的项目条件，不是必测核心流失败。唯一 timeout 仍按原样披露；同一精确用例随后独立重复 3/3 通过，且完整 reduced-motion 项目 122/9 无失败，因此记录为隔离事件而非静默改写成 clean run。两种 npm audit JSON 视图均为 0 vulnerabilities。

## Phase 6 写入、会话与媒体边界

- **文章与导入：** 管理文章 Route Handler 在 JSON 解析前同时限制声明长度和实际流式读取为 2 MiB；正文按 UTF-8 独立限制为 1 MiB；本地 Markdown 导入在 `arrayBuffer()` 前及解析器内均限制为 1 MiB。未知字段、异常 directive/attribute、危险 URL 和不兼容 Markdown 均在持久化前失败。
- **管理员会话：** 32-byte 随机 token 仅以 HMAC-SHA256 hash 入库；cookie 为 HttpOnly/SameSite=Lax/生产 Secure；服务端执行 7 天绝对寿命和 2 小时 idle cutoff，并以条件更新/删除避免并发陈旧请求误删已刷新会话。
- **媒体输入：** 单次 multipart 请求 11 MiB、单图 10 MiB；只接受 JPEG/PNG/WebP，校验声明 MIME、magic bytes 与 Sharp 解码格式；单边 8192/2500 万像素，输出统一为最长边 2560、最大 5 MiB 的 WebP。
- **媒体资源：** 每管理员 20 次/分钟，每进程 2 个并发解码，数据库总配额 512 MiB；超过 7 天且仍为私有、没有被任何文章 AST 引用的媒体最多 25 条一批回收。
- **发布一致性：** 文章写入、站内媒体存在性与 `publicAt` 曝光同事务；条件更新、受影响计数复查、当前状态重读及 Serializable 回收保证并发删除时回滚文章、并发曝光时只接受完整公开状态。

## Phase 3 作者工作流复核

当前被接受的编辑器架构是 Tiptap Markdown-backed WYSIWYG 单画布，不是历史 UIW source/preview。2026-07-11 的[Phase 3 复核](../.planning/phases/03-markdown-authoring-workflow/03-VERIFICATION.md)对 14/14 个 Phase 3 要求给出当前实现证据，behavior unverified 为 0：

- 创建、编辑、草稿保存、列表和硬删除均通过受保护真实浏览器流程并核对 PostgreSQL；
- 标题到 slug 自动派生会在手工编辑 slug 后停止，摘要值精确持久化；
- 代码、GFM 表格、HTTPS 图片、分类、标签、系列与顺序均以 Markdown/关系数据持久化并可重开；
- 不兼容 Markdown 在进入视觉编辑前阻断，公开渲染继续剥离 raw HTML 并清洗；
- 公开路由、公开组件、共享 Markdown 与公开数据层不导入 UIW 或 `@tiptap/*`。

## 健康检查、CI 与运行就绪

- `GET /api/health` 是 no-store 的进程 liveness，只返回精确 `200 {"status":"ok"}`；desktop Playwright 健康契约 2/2 通过。
- `GET /api/health/ready` 只执行一次只读 `SELECT 1`；数据库可用时返回精确 ready，失败时返回不泄露细节的 `503 {"status":"unavailable"}`。
- [GitHub Actions 工作流](../.github/workflows/ci.yml)已通过本地 YAML/命令/供应商中立契约检查：一次性 PostgreSQL、运行时生成并遮蔽的管理员凭据、`verify:ci`、四项目 headed Playwright 和 production smoke 均为阻塞步骤，不执行部署。
- 第一次 GitHub-hosted 实际运行仍需在推送后观察；它是外部 CI 证据缺口，不改变本地命令已通过的事实，也不能代替生产域名验证。

## D-05 / D-06 / D-07 / D-11 Phase 6 当前视觉证据

Phase 5 的十张清单仍是历史基线；当前最终证据改由 [Phase 6 清单](../output/playwright/phase6/evidence-manifest-2026-07-11.json)承载。现场复算 5/5 文件存在，PNG 尺寸、字节数和 SHA-256 与清单一致；清单 SHA-256 为 `65d701613e0c99fe8ae3c4f9e31ecb5db850025134ab55783cf11fcb835a0d53`。

1. [Hans‘s Blog 首页 desktop](../output/playwright/phase6/prod-home-desktop.png)
2. [Hans‘s Blog 首页 390](../output/playwright/phase6/prod-home-390.png)
3. [Hans‘s Blog 首页 320](../output/playwright/phase6/prod-home-320.png)
4. [后台 WYSIWYG 编辑器 desktop](../output/playwright/phase6/prod-admin-editor.png)
5. [后台图片素材弹窗 desktop](../output/playwright/phase6/prod-admin-image-modal.png)

五张图片覆盖 orbital mecha 品牌首页的 desktop/390/320 布局，以及 Markdown-backed 编辑器和本地文件/拖放/粘贴/URL 图片入口。逐张检查未发现水平溢出、不可读控件、密码、session、数据库 URL 或无关私有文章；可见邮箱与站点配置中的公开联系/单管理员身份一致。完整交互与低动态证据仍由 491/32/1 的四项目矩阵、精确用例 3/3 复跑，以及 reduced-motion 122/9 独立全项目运行提供。

## D-12 缺陷与限制处置

### 已关闭缺陷

- **Reduced-motion 焦点描边竞态：已关闭。** Chromium 在后台 reduced-motion 规则的非零 `0.01ms` 全属性 transition 下，会短暂暴露 ink 3px 的 time-zero outline，再收敛为目标 cobalt 2px。修复只把 `src/app/admin/admin.css` 的 reduced-motion transition duration 改为 `0s`，原断言未放宽。修复前探针在 20 次中观察到 9 次立即不匹配、4 次 microtask 后仍不匹配，而下一 animation frame 为 0/20 不匹配；修复后原测试 headless 20/20、headed/Xvfb 20/20，通过完整 reduced-motion admin UI 12/12 和 lint，随后 05-04 全矩阵为 465 passed、23 conditional skips、0 failed。完整根因记录见[焦点竞态调试记录](../.planning/debug/resolved/admin-focus-outline-flake.md)。
- **GFM 验证断言过窄：已关闭。** 首版测试只接受恰好三个分隔短横线，实际序列化器合法输出更多短横线；断言改为 GFM 规定的至少三个，作者工作流 18/18 和完整矩阵均通过，产品实现未改变。
- **Reduced-motion 诊断谓词偏离实际契约：已关闭。** 首页 canvas 的正确降级是保持挂载但静态，而不是移除；05-04 以 reduced-motion state、pointer follow disabled、frame count 0 和无运行动画重新验证并通过。

### 当前开放应用缺陷

无。没有仍开放的 core-flow、mandatory-gate、P0/P1/P2 视觉问题或 high/critical 应用安全问题；任何后续必测门禁失败都会撤销本报告的本地 PASS。

### 已接受或转移的限制

- 依赖审计已关闭旧残余：完整与 production-only registry audit 均为 0 vulnerabilities；`verify:ci` 继续把 high/critical advisory 作为失败门禁。
- 旧的 30 天 session 接受项已关闭：当前为 7 天绝对寿命与 2 小时 idle cutoff，条件刷新/删除防止陈旧请求竞态；不再把旧边界列为残余风险。
- `T-06-32`（非阻塞）：静态 Next CSP 的 `script-src` 仍允许 inline script；同源脚本限制、输入验证和 HTML sanitizer 是补偿控制，nonce/全动态渲染需独立架构计划。
- `T-06-40`（非阻塞）：外部 HTTPS 封面和正文图片均使用 `no-referrer`，但直接第三方加载仍会暴露读者 IP；当前没有 host allowlist、图片代理、隐私提示或已签署接受。
- `T-06-41`（非阻塞）：上传、发布、编辑和删除尚无持久化 actor/action/target/outcome 安全审计事件；HTTP 响应中的 admin email 和模型时间戳不能替代 durable audit trail。
- 未授权后台读在响应上不泄露正文或异常，但 App Router 并行求值可能在服务端日志产生 `UnauthorizedAdminError` 堆栈；生产日志过滤、限速和告警属于 D-14 门禁。
- 本机 Chromium 149 headless 对普通按钮存在 actionability 环境异常；同一应用用例在 headed/Xvfb 稳定通过，因此发布矩阵明确采用 headed Chromium。
- 首次远程 GitHub Actions 运行、最终域名 smoke、真实恢复演练和基础设施测试尚未执行，均保留为外部证据缺口。

设计方向的最终 P0/P1/P2 对比结果见[设计 QA](../design-qa.md)。

## D-15 明确延期范围

以下项目继续延期，不在 v1 补做，也不由本报告扩展路线图：

- 评论与 reactions；
- 多作者账号、角色与权限；
- MDX / React 交互式 demo；
- 外部内容导入或同步；
- 专用搜索引擎或高级搜索服务。

## D-14 公网发布阻塞项（`T-06-38` / `T-06-39`）

以下每一项都需要最终供应商/运行环境的独立、可审计 PASS 证据；当前 `T-06-38` 与 `T-06-39` 均仍 open/blocking：

- **`T-06-38` / 最终 origin、TLS 与 Host：** 构建和运行注入同一个最终绝对 HTTPS `ADMIN_SITE_ORIGIN`，在真实域名验证 TLS/HSTS、规范跳转、secure cookie 与 POST 退出；反向代理只接受认可 Host 并拒绝伪造 Host。
- **秘密管理：** 轮换随机管理员密码、Argon2 hash 和至少 32 字符的 session secret，只通过 secret manager 注入，证明秘密不进入镜像、构建产物、日志或 CI 输出。
- **PostgreSQL：** 使用私网或严格 ACL、强制 TLS、最小权限应用账号和受控加密备份存储；生产连接、权限和网络边界须单独验证。
- **`T-06-39` / 恢复与响应：** 按[PostgreSQL 备份恢复 runbook](operations/postgres-backup-restore.md)完成一次 checksum 通过、全新隔离目标恢复、Prisma/应用 smoke 通过、证据归档和安全清理的真实恢复演练，并证明监控、告警、事件响应责任与 SLA。
- **反向代理 / WAF：** 限制 URL、header、body、slow client、读写超时和并发；对登录及后台写入接口配置边缘速率限制。
- **日志与告警：** 接入访问、认证失败、5xx、数据库异常和变更日志，配置可验证告警，并过滤敏感堆栈和秘密。
- **独立基础设施测试：** 对最终域名、网络、镜像和运行环境执行独立漏洞扫描或渗透测试；[应用安全审计](security/public-exposure-audit-2026-07-11.md)不能替代此项。

本报告不选择供应商、域名或秘密，不创建部署配置，也不把本地 `security:smoke` 冒充为最终公网验证。

## D-13 / D-16 证据完整性门禁

- 清单完整性：5/5 Phase 6 图像的 SHA-256、字节数和尺寸与当前 manifest 匹配；
- 本地 Markdown 目标：[可复用链接检查器](../scripts/verify-local-markdown-links.mjs)的 self-test 与这五份收尾文档检查均通过，0 broken；
- 源码/凭据扫描：最终仓库门禁扫描 329 个文本文件、跳过 43 个二进制文件，0 finding、退出 0；scanner self-test 通过；
- 完整 `verify:ci` 已通过：ESLint、217/217 单测、Prisma validate/generate、Next.js production build、源码扫描及两种依赖审计均退出 0；最终 `git diff --check` 同样退出 0。

因此 D-16 与 QUAL-05 的**本地应用验收为 PASS**。D-14 的公网状态仍为 **BLOCKED**，两者不能合并表述。

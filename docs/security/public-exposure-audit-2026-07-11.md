---
audit_date: 2026-07-11
last_updated: 2026-07-12
status: passed
gate_a: cleared
gate_b: passed
application_high_critical_open: 0
public_exposure: blocked_pending_provider_controls
---

# 公网暴露安全审计

## 结论状态

Gate A、修复后的 Gate B 与 Phase 6 应用复审均已通过。当前实现补齐了 Hans‘s Blog 品牌、受界限约束的文章/Markdown 写入、数据库托管媒体、七天绝对加两小时 idle 的管理员会话，以及 Markdown AST/TOC/指令边界。复审没有仍开放的 high/critical 应用问题；当前阻塞只来自必须由供应商举证的 `T-06-38` 与 `T-06-39`。

这里的 `passed` 只表示仓库内应用控制通过本轮审计，不表示可以立即暴露公网。`T-06-38` 要求最终边缘/TLS/Host、秘密托管和私有数据库证据；`T-06-39` 要求真实恢复演练、监控告警、事件响应和责任/SLA 证据。两项仍阻塞发布，本报告不替代基础设施漏洞扫描或渗透测试。

## Gate A 证据

| 检查 | 结果 | 证据 |
|---|---|---|
| 保全基线 | 通过 | tracked patch/index/hash 与受保护未跟踪文件清单、哈希全部逐字节一致 |
| 全文本源码/凭据扫描 | 通过 | 最终仓库门禁扫描 329 个文本文件、43 个二进制跳过；0 项发现；退出码 0；scanner self-test 通过 |
| 扫描器退出语义 | 通过 | 临时 Git fixture 证明 assignment、未加密/加密 PKCS#8 private key finding=1，clean=0，Git/read failure=2 |
| 依赖审计 | 通过 | `npm audit --json` 与 `npm audit --omit=dev --json` 均退出 0；841 dependencies，0 info/low/moderate/high/critical vulnerabilities |
| 图片 URL 策略单测 | 通过 | 50/50，覆盖 HTTPS、相对路径、协议混淆、Markdown inline/reference、CommonMark 容器/转义标签/重复定义与代码块绕过 |
| 认证与写入边界 | 通过 | headed/Xvfb：29 passed、1 个非 desktop 用例按项目条件跳过 |
| 公开内容与 Markdown | 通过 | 4/4，覆盖 published-only、统一 404、安全 Markdown/Shiki/TOC |
| Headless 点击环境 | 非应用问题 | Chromium 149 headless 在空白 data URL 按钮也会 actionability 超时；相同应用用例 headed/Xvfb 通过，不计为应用 finding |

## 路由与处理器清单

| Surface | 输入/数据边界 | Gate A 结论 |
|---|---|---|
| `/`, `/notes`, `/archive`, `/series`, `/search` | 查询字符串和数据库公开 DTO | 统一经 `src/lib/public/content-queries.ts`；搜索双层截断为 120 字符 |
| `/notes/[slug]` | `slug` 同时用于页面和 metadata | Prisma 参数化查询；仅返回 `PUBLISHED` 且 `publishedAt != null`，草稿/归档/不存在统一 404 |
| `/tags/[slug]`, `/categories/[slug]`, `/series/[slug]` | 路径参数进入关系查询 | 只返回至少含一篇已发布文章的实体；私有 taxonomy/series 统一 404 |
| `/admin/login` Server Action | 邮箱、密码、Origin/Host | Zod 校验、通用错误、Argon2id；Next Server Action 同源校验；数据库全局失败桶 |
| `/admin/(protected)/**` | 会话 cookie 与后台 DTO | 布局通过 `requireAdminPage` 重定向；三个 DAL 入口均在构造 Prisma promise 前执行 `requireAdmin` |
| `/api/admin/posts/[operation]` | Origin、operation、JSON body | Origin 先于 cookie/body；operation allowlist；`requireAdmin` 先于 `request.json()`；Zod/Prisma 事务 |
| `/api/admin/media` | Origin、session、multipart/image bytes | Origin 与管理员鉴权先于 body；声明及实际流式 body 上限 11 MiB；单文件 10 MiB；格式/像素/解码、速率、并发和 512 MiB 持久配额均受限 |
| `/media/[mediaId]` | 站内媒体 ID、private/public state | 私有媒体仅管理员可读且 no-store；公开媒体由事务单调设置 `publicAt` 后匿名读取并 immutable cache；缺失/私有匿名请求统一空 404 |
| `/admin/logout` | GET/POST | GET 只重定向不销毁；POST 先拒绝跨源、再销毁 token-hash 会话；重定向只使用严格校验的 `ADMIN_SITE_ORIGIN`，未配置时才使用 request URL origin |
| `/%5F%5Fskeleton`, `/api/skeleton-probe` | 本地诊断读写 | 生产无条件 404，遗留 `ENABLE_SKELETON_PROBE=true` 不能重开 GET/POST |

仓库中公开 App Router 文件不直接导入 Prisma；后台登录是唯一在 route/action 层直接查询管理员记录的入口。所有自定义 Route Handler 与 Server Action 均按公开 HTTP 入口审计。

## 信任边界复核

| 边界 | 现有控制 | 结果 |
|---|---|---|
| 登录枚举 | 错误文案统一；无替代账号/注册/重置入口；错误邮箱仍执行密码校验 | 通过 |
| 暴力破解与并发 | PostgreSQL 原子计数；15 分钟窗口；同一全局 admin bucket；转发头和提交邮箱不能轮换绕过 | 应用层通过；边缘 WAF 仍是部署门禁 |
| Cookie/session | 32-byte 随机 bearer；HMAC-SHA256 hash 后入库；HttpOnly、SameSite=Lax、生产 Secure；7 天绝对寿命、2 小时 idle cutoff；条件刷新/清理与 allowlist email 重验 | 通过，陈旧请求竞态 fail closed |
| CSRF/origin 与重定向 | Server Action 使用 Next 同源保护；自定义写路由在配置存在时只接受严格 canonical origin，未配置时只接受 request URL origin；共享解析器拒绝凭据/path/query/hash，Host/forwarded headers 从不进入信任集合；无效 canonical origin fail closed | 通过；反代仍必须固定 canonical host/origin |
| 请求与协议输入 | 操作 allowlist、严格 Zod DTO；文章请求声明/实际流式上限 2 MiB、正文 UTF-8 上限 1 MiB、导入预读/解析上限 1 MiB；媒体 multipart 11 MiB、原图 10 MiB | 应用 body 边界通过；URL、slow client、timeout 仍由反代门禁控制 |
| Prisma 与公开草稿隔离 | 公共查询共享 `PUBLISHED + publishedAt` 条件；路由无拼接 SQL；后台写入事务化；后台读在 DAL 内重新鉴权 | 通过 |
| Markdown/XSS/metadata | 图片地址使用与渲染一致的 `remark-parse` AST 语法并校验被图片引用的全部定义；raw HTML 预剥离、`skipHtml`、rehype-sanitize、无 `rehype-raw`/dangerous HTML/eval sink；metadata 经 Next API | 通过 |
| 诊断路由 | 本地 probe 有独立 gate；生产环境无条件禁用 | 通过 |
| 错误与 client props | 公开错误不呈现异常细节；私有正文只传给受保护编辑器；401/400 返回固定类型 | 响应边界通过；服务端未授权堆栈日志见 SEC-11 |
| 秘密与环境 | `.env*` 默认忽略、示例为空、服务端 env schema；扫描器覆盖 prefixed/snake/camel sensitive identifier、高熵值及 RSA/DSA/EC/OpenSSH/PGP、未加密和 `ENCRYPTED PRIVATE KEY` PEM header，并以临时 Git fixture 验证退出码 | 仓库通过；生产注入与轮换是部署阻塞项 |
| 数据库 | token hash、FK/cascade、唯一约束和查询索引；媒体 SHA-256 去重、Serializable 配额/回收、事务化 `publicAt`；回收解析全部文章 AST 并处理实体编码引用 | 代码层通过；私网/TLS/最小权限/备份恢复由 `T-06-38`/`T-06-39` 验证 |
| 响应头 | 全站 CSP/HSTS/anti-frame/nosniff/referrer/permissions policy；后台 noindex/noarchive；关闭 power header | 通过，静态 CSP 残余见 SEC-07 |
| 依赖 | 两种 registry audit 视图均为 0 vulnerabilities | SEC-04 已关闭 |

Next 官方建议 DAL 在靠近数据源的位置重新鉴权、只返回最小 DTO，并说明 Server Action 会比较 Origin 与 Host；本次 SEC-01 依此收紧：[Data Security](https://nextjs.org/docs/app/guides/data-security)。静态兼容 CSP 采用 Next 官方无 nonce 配置；nonce 会强制动态渲染，不在本任务范围：[Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)。

## Finding Register（Gate B 最终状态）

| ID | 严重度 | 范围 | 状态/处置 | 证据 |
|---|---|---|---|---|
| SEC-01 | high | application | mitigated / verified | 三个后台读入口现在通过 `runGuardedQuery(requireAdmin, lazyRead)`；授权失败原样传播且 read spy 为 0 |
| SEC-02 | medium | application | mitigated / verified | 实际 `next start` 响应具备 CSP/HSTS/anti-frame/nosniff/referrer/permissions，后台 noindex/noarchive，不含 X-Powered-By/生产 unsafe-eval |
| SEC-03 | medium | application | mitigated / verified | production 在 legacy flag 缺失或为 true 时，probe GET/POST 均为 404 |
| SEC-04 | medium | dependency | mitigated / verified | 通过 lockfile-compatible PostCSS 与 `@hono/node-server` override 清除旧 advisory；两种 registry audit 视图对 841 dependencies 均为 0 vulnerabilities |
| SEC-05 | medium | deployment | transferred / blocking gate | request body、URL、slow client、timeout、concurrency 与边缘速率限制需要 reverse proxy/WAF |
| SEC-06 | high | deployment | transferred / blocking gate | TLS、私有最小权限 PostgreSQL、生产秘密轮换/注入、备份恢复和监控尚未由供应商证明 |
| SEC-07 | medium | application residual | accepted with rationale | 静态 Next CSP 需要 inline script/style allowance；输入/HTML sanitizer 与同源脚本限制作为补偿控制，nonce/dynamic rendering 需单独架构计划 |
| SEC-08 | low | session | mitigated / verified | 会话最长 7 天、idle 2 小时；条件刷新和条件删除重复 expiry/absolute/idle/email 谓词，避免并发陈旧请求误删或复活 session |
| SEC-09 | low | repudiation | accepted / provider control | 单作者不需要角色归因；仍要求平台访问日志、变更日志告警与数据库备份 |
| SEC-10 | low | privacy | open / non-blocking (`T-06-40`) | 外部 HTTPS 封面与正文图片均使用 `no-referrer`，但读者浏览器直连任意作者选择的第三方 host 时仍会暴露 IP；尚无 host allowlist、代理或已签署接受 |
| SEC-11 | medium | operations | accepted / transferred | 每个未授权后台读响应不泄露正文或异常，但 App Router 并行求值会向服务端日志写一条 `UnauthorizedAdminError` 堆栈；反代限速、日志过滤与告警必须避免放大和路径信息暴露 |
| SEC-12 | medium | application/deployment integration | mitigated / verified | 退出路由只接受无凭据、无 path/query/hash 的绝对 HTTP(S) origin；忽略 Host/forwarded headers；无效配置为通用 500 且无会话副作用；未启用 `trustHostHeader` |
| SEC-13 | critical | application | mitigated / verified | Markdown 图片策略改为 `unified` + `remark-parse` AST 遍历；校验 direct image 及 imageReference 对应的全部 definition，含容器、转义标签和重复定义；direct create/edit 均证明拒绝且零写入 |
| SEC-14 | medium | application | mitigated / verified | CSRF 与退出复用同一严格 HTTP(S) origin 解析；配置存在时不再允许 request URL/Host origin，未配置时也不读取 Host；valid-session hostile Host+Origin mutation/logout 均为 403 且无副作用 |
| SEC-15 | medium | tooling | mitigated / verified | 凭据扫描器识别敏感 literal assignment 及未加密/加密 PKCS#8 等 PEM private-key header；内建临时 Git self-test 覆盖 reviewed 样例及 clean=0、finding=1、Git/read failure=2 |

最终统计：没有未处置的 high/critical 应用项，依赖漏洞总数为 0。Phase 6 当前有 46 个登记威胁：41 closed、5 open；其中只有供应商证据项 `T-06-38`（critical）与 `T-06-39`（high）阻塞公网发布，`T-06-32`、`T-06-40`、`T-06-41` 为明确披露的非阻塞跟踪项。

## Phase 6 当前边界与未关闭项

- **媒体：** 认证后每管理员 20 次/分钟、每进程 2 个并发解码；11 MiB multipart、10 MiB 输入、8192 单边/2500 万像素、2560 输出单边/5 MiB 输出；512 MiB 数据库配额；超过 7 天的未引用私有媒体最多 25 条一批回收。发布与 `publicAt` 曝光同事务，回收/发布竞态通过条件写入、计数复查和 Serializable 重试 fail closed。
- **会话：** 7 天绝对寿命与 2 小时 idle cutoff 同时生效；失效删除、email allowlist 删除和 `lastSeenAt` 刷新均重新约束当前数据库状态。
- **正文：** 文章 Route Handler 对声明与实际流式 JSON 均限 2 MiB；正文和 Markdown 导入分别在服务端解析/客户端预读前限 1 MiB UTF-8；严格 schema、directive grammar、raw HTML 清理和 sanitize 在持久化及公开渲染边界重复执行。
- **非阻塞：** `T-06-32` 为 CSP `script-src` 仍允许 inline script；`T-06-40` 为外部 HTTPS 图片直连仍暴露读者 IP；`T-06-41` 为上传、发布、编辑、删除没有持久化 actor/action/target/outcome 安全审计事件。

## 已授权的计划内修复

1. 新增纯 `runGuardedQuery(authorize, read)`，确保授权失败时 lazy Prisma/content callback 为零调用且同一 `UnauthorizedAdminError` 原样传播。
2. 三个后台读取入口使用 `runGuardedQuery(requireAdmin, async () => ...)`；DAL 不 redirect，受保护布局继续由 `requireAdminPage` 管浏览器跳转。
3. 生产环境无条件关闭 skeleton probe，即使遗留 flag 为真。
4. `next.config.ts` 关闭 power header，添加静态兼容 CSP、HSTS、frame/nosniff/referrer/permissions 与 admin robots；生产不含 `unsafe-eval`。
5. 使用真实 `next start` 响应验证 `/`、`/admin/login` 和 skeleton GET/POST。
6. 退出路由使用严格 canonical origin；无效配置 fail closed，Host/forwarded headers 不能影响目标，CSRF 拒绝与会话销毁顺序保持不变。
7. Markdown 图片策略使用与公开渲染相同的 CommonMark parser；所有 direct image 及被 imageReference 引用的定义（包括重复定义）都在持久化前校验，`rehype-sanitize` 继续作为独立末端防线。
8. CSRF 与退出复用严格 origin 解析；配置 canonical origin 后只接受该值，未配置时只使用 request URL origin，绝不把 Host/forwarded headers 加入信任集合。
9. 凭据扫描器解析完整敏感标识符和高熵 literal assignment；内建临时 Git fixture 使 reviewed 样例、clean/finding/tool/read error 退出语义可重复执行。

## SEC-12 发现、重规划与修复

首次真实 headed Chromium 生产退出在 `127.0.0.1` 页面收到内部 `localhost` 重定向，触发 CSP `form-action` 拦截。独立请求进一步证明即使伪造 `Host: blog.example` 和 `X-Forwarded-Host: public.example`，旧路由仍从 Next 内部 request URL 构造 `localhost:<port>` 目标。执行按计划中止，加入退出路由后才恢复。

修复后的路由在处理器入口先解析目标：显式配置必须是绝对 HTTP(S) origin，禁止 username/password、非根路径、query 和 hash；无效值直接返回固定 `Internal Server Error`（500），不设置 `Location`，也不执行 CSRF 或会话销毁。仅在环境变量未配置时使用 `new URL(request.url).origin` 的本地回退。目标不读取 Host、`X-Forwarded-Host`、`X-Forwarded-Proto`，也没有启用 `experimental.trustHostHeader`。

直接 `next start` 回归共 4 项：外部 canonical origin 在恶意 Host/forwarded headers 下仍精确跳转；未配置时只留在内部 request origin；relative、malformed、credentialed、non-HTTP(S)、path、query、hash 七类无效值全部为无 Location 的通用 500 且数据库 session 保留；恶意 Origin 先返回 403 并保留 session，合法 canonical Origin 随后清除 cookie/数据库 session 再返回 canonical 303。

## Gate B 证据

| 检查 | 最终结果 |
|---|---|
| SEC-12 RED | 预期 `https://blog.example/admin/login`，旧实现实际返回 `http://localhost:<port>/admin/login` |
| SEC-12 direct `next start` | 4 passed，覆盖 canonical/host spoof、fallback、7 类无效配置、CSRF 与 session 副作用 |
| `npm run test:unit` | 18 files、217 passed |
| focused headed security/auth/mutation/probe | 40 passed，1 个项目条件 skip，0 failed |
| full headed E2E | 491 passed、32 个项目条件 skip、1 个隔离 timeout；该精确用例随后独立重复 3/3 passed |
| full reduced-motion project | 122 passed、9 个项目条件 skip |
| `ADMIN_SITE_ORIGIN=https://blog.example npm run build` | 通过；公开 HTTPS CSP 不含 loopback host allowance |
| 真实生产 Chromium smoke | 登录 POST 与原生退出 POST 均观察到；最终 `/admin/login`；`securitypolicyviolation` 与 CSP console error 均为 0 |
| 生产 fetch smoke | public/admin 200；受保护路由不泄露并重定向；probe GET/POST 404；2 个未授权请求产生 2 条 guarded-query server log |
| `npm run lint` | 通过 |
| 两种 npm registry audit JSON | 退出 0；841 dependencies；0 info/low/moderate/high/critical vulnerabilities |
| 全文本扫描 | 329 个文本文件、43 个二进制跳过、0 finding；退出 0；scanner self-test 通过 |
| Phase 6 当前视觉证据 | 5/5 PNG 存在且 manifest 的尺寸、字节数与 SHA-256 匹配：desktop/390/320 首页、desktop 编辑器、图片弹窗 |
| CR-01 复审修复 | AST 策略单测 50/50；headed/Xvfb direct create/edit 零写入 E2E 1/1；修复后源码扫描 0 finding |
| WR-01 复审修复 | strict-origin 单测 10/10；重建后 headed/Xvfb canonical/invalid/Host-spoof/logout/mutation 回归 5/5 |
| WR-02 复审修复 | iteration 2 self-test 同时证明 unencrypted 与 `ENCRYPTED PRIVATE KEY` fixture 为 finding=1；assignment/clean/Git/read 语义保持；含当前 REVIEW/REVIEW-FIX 的最终 264-text/35-binary 树扫描 0 finding |
| WR-03 复审修复 | 正文 ProseMirror 获得 2px cobalt `:focus-visible` outline；headed/Xvfb computed-style 回归 1/1 |
| WR-04 复审修复 | create/edit/delete request-pending 从 fetch 前持续到 finally；同步 ref 阻止重复请求，删除期间禁止关闭；延迟/abort/unknown-error headed 回归 2/2 |
| WR-05 复审修复 | 保留真实 `role=toolbar`，六个命令使用 roving tabindex，并实现 ArrowLeft/ArrowRight/Home/End（含首尾循环）；headed 键盘回归 1/1 |
| WR-06 复审修复 | 编辑器把 `id` 及任意无对应可见控件的 server fieldError 汇总到 form alert；真实删除编辑目标后的 id-error headed 回归 1/1 |
| iteration 2 WR-01 | slow-success snapshot guard 保留保存后新 title/tag edits；save/refresh 序列化 publication，publication abort 显示错误并在 finally 解锁；headed 1/1 |
| iteration 3 WR-01 | publication pending/refresh 与 Save 双向串行；慢保存按字段和 taxonomy group 合并 canonical IDs，保留响应期间的新输入；focused headed 3/3，最终全量回归通过 |
| `git diff --check` | 通过 |
| 受保护路径逐字节比较 | tracked patch/index/hash、受保护未跟踪清单/hash 与 metadata 六项一致；全部 baseline SHA-256 校验通过 |

浏览器点击回归使用 headed Chromium/Xvfb，因为本机 Chromium 149 headless 对空白页普通按钮也会 actionability 超时；同一应用行为在 headed 环境稳定通过。该环境问题不计为应用 finding。

最终矩阵中的单次 isolated timeout 仍按原样披露，不计入 passed。只有因为同一精确用例随后独立重复 3/3 通过、完整 reduced-motion 项目 122/9 无失败，才将其记录为非复现隔离事件；若再次出现必须重新打开调查。

## 部署前门禁

即使应用 Gate B 通过，公网发布仍必须逐项完成。`T-06-38` 与 `T-06-39` 在取得供应商证据前均保持 open/blocking：

- **`T-06-38`：** 在构建与运行环境设置同一个最终 HTTPS `ADMIN_SITE_ORIGIN`，实测 TLS/HSTS/Host/代理信任/WAF；轮换管理员密码、Argon2 hash 与 session secret，并由 secret manager 注入；PostgreSQL 使用私网或严格 ACL、TLS 和最小权限应用账号。
- **`T-06-39`：** 完成一次可验证的隔离备份恢复演练，接入访问/认证失败/5xx/数据库异常监控告警，建立事件响应责任、升级路径和 SLA。
- 生产镜像/运行层裁剪开发工具，持续跟踪 Next/PostCSS 和 Prisma/Hono 上游修复；
- reverse proxy 限制 URL/header/body、读写超时、并发、slow client；WAF 对登录与写入接口增加速率限制；
- 配置访问/认证失败/5xx/数据库异常日志与告警，发布后再次确认诊断 GET/POST 为 404；
- 进行独立基础设施漏洞扫描或渗透测试；本报告不能替代该工作。

`T-06-32`、`T-06-40`、`T-06-41` 不阻塞本地候选，但没有被标记为已接受或已关闭；它们仍需后续架构/隐私/审计补强。

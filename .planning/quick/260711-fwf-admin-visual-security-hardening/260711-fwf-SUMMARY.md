---
quick_id: 260711-fwf
status: completed
completed: 2026-07-11
application_security: passed
public_exposure: blocked_pending_provider_controls
---

# 管理后台视觉统一与公网安全加固总结

管理员登录、控制台、文章库和编辑器已统一为首页的 light-mecha 视觉语言：纸白底、墨黑框线、钴蓝主色、信号红与安全黄点缀。编辑画布保持白色和低噪声，桌面、390px、320px 与 reduced-motion 均无横向溢出。

应用层安全审计与三轮深度复审已完成。后台查询在数据访问层重新鉴权；生产诊断探针强制关闭；全站加入 CSP、HSTS、反点击劫持、MIME、Referrer、Permissions Policy 与后台 noindex；退出与 CSRF 使用严格 canonical origin；Markdown 图片通过 CommonMark AST 在服务端校验；源码凭据扫描器覆盖敏感赋值和加密/未加密私钥头。复审累计 10 项 finding 全部修复，0 skipped，当前无开放的应用 high/critical。

## 主要提交

- `c8381e6`、`021efb0`、`fa8d2de`：后台视觉、编辑器可访问性与输入策略、全站安全加固。
- `78f60ba`、`9a670ba`、`a6f54e3`：CommonMark 图片绕过与 canonical Origin/CSRF 修复。
- `b10d1b1`、`8a6cefc`、`166c8e4`：凭据扫描器及可执行自测。
- `51921af`、`8041e6b`、`8a8cf65`、`1c719e2`：焦点、请求锁、工具栏键盘语义与表单错误可见性。
- `b97aa07`、`82678a1`：慢保存保护、保存/发布双向串行化和 taxonomy canonical merge。
- `df592da`：修正 GET logout 历史测试，使其验证真实的保留会话重定向链。

## 验证

- `npm run lint`：通过。
- `npm run test:unit`：5 files、106 passed。
- `npm run build`：通过。
- headed Chromium/Xvfb 全量 Playwright：476 collected、453 passed、23 条项目条件 skip、0 failed。
- 生产 smoke：公开页和登录页 200；未授权后台重定向且不泄露；probe GET/POST 404；登录与原生 POST 退出成功；CSP violation 0。
- `npm audit --audit-level=high` 与 `npm audit --omit=dev --audit-level=high`：退出 0，0 high/critical，5 个 moderate 包节点。
- 凭据扫描器 self-test：clean/finding/Git/read error 退出语义与敏感赋值、加密/未加密私钥样例全部通过。
- 最终源码扫描：265 个文本文件、35 个含 NUL 二进制跳过、0 finding。
- 视觉 QA：1440x900、390x844、320x720 与 200% 缩放通过；键盘焦点可见，编辑器正文为 2px cobalt focus ring；新浏览器上下文 console/pageerror 为 0。
- 受保护的公开首页、STATE、既有测试和资产未进入本任务提交；执行与收尾的 patch/index/hash/file-list 比较均通过。

本机 Chromium 149 的 headless 点击 actionability 问题可在空白按钮复现，因此点击型回归使用 headed Chromium/Xvfb；这不计为应用 finding。

## 发布门禁

仓库内应用控制已通过，但网站仍不能直接暴露公网。上线前必须完成：

- 最终 HTTPS 域名在构建与运行环境使用同一个 `ADMIN_SITE_ORIGIN`，实测 TLS/HSTS、退出跳转，并拒绝未知 Host；
- 轮换随机管理员密码、Argon2 hash 和 session secret，通过 secret manager 注入；
- PostgreSQL 使用私网或严格 ACL、TLS、最小权限账号，并完成备份恢复演练；
- 裁剪生产运行时，持续跟踪 Next/PostCSS 与 Prisma/Hono 的 5 个 moderate advisories；
- 由反代限制 URL/header/body、超时、并发和 slow client，并通过 WAF 对登录及写接口限速；
- 配置访问、认证失败、5xx、数据库异常日志和告警，发布后复验 probe 404；
- 完成独立基础设施漏洞扫描或渗透测试。

完整 finding、接受项与部署检查表见 `docs/security/public-exposure-audit-2026-07-11.md`。

# 发布验收报告

日期：2026-07-10

## 结论

本地发布验收通过。公开阅读、内容组织、搜索、单管理员认证、文章管理、可视化 Markdown 编辑、响应式布局和低动态降级均已通过自动化与真实浏览器检查，可进入部署准备。

本结论针对当前代码和本地 PostgreSQL 环境，不代表已经完成云平台部署，也不宣称通过完整 WCAG 或真实读屏软件认证。

## 本轮修复

- 修复首页 390px 宽度下标题末字孤行，改为均衡换行。
- 更新首页索引中的过时占位文案，使其与已经接入的真实内容一致。
- 将移动端文章目录改为默认折叠，避免长目录阻挡正文。
- 公开渲染时将 Markdown 正文标题层级下移，保证文章页面只有一个 `h1`，不修改数据库中的原始 Markdown。
- 将编辑器工具栏、图片、代码块和表格操作按钮提升到至少 44px 触控尺寸。
- 新增基于现有 Lucide 终端图标的站点图标，消除 `/favicon.ico` 控制台错误。
- 修正公开内容测试对空数据库的错误假设，并为跨 16 次页面导航的长链路用例设置合理超时。

## 自动化门禁

| 门禁 | 结果 |
| --- | --- |
| `npm run lint` | 通过 |
| `npm run test:unit` | 44/44 通过 |
| `npm run db:validate` | Prisma schema 有效 |
| `npm run build` | Next.js 生产构建通过 |
| `npm run test:e2e` | 373 通过，23 按设备条件跳过，0 失败 |

端到端测试覆盖桌面 1440px、移动端 390px、最小移动端 320px 和低动态模式，包括认证防护、限流、创建/编辑/删除、发布/取消发布、精选、分类/标签/系列、图片/代码/表格编辑、公开列表、文章详情、搜索、归档、相关文章、键盘导航和视觉特效降级。

## 浏览器验收

1. 首页桌面与移动端：品牌、CTA、内容入口、精选内容、统计和阅读预览均正常，无横向溢出。
2. 公开阅读：文章元数据、代码、表格、图片、目录和标题语义正常；移动目录默认折叠。
3. 搜索与列表：真实已发布内容可检索，草稿不泄漏。
4. 管理后台：登录、退出、新建文章和可视化编辑器正常；编辑区在 1440px 下为 1342px，在 390px 和 320px 下无页面溢出。
5. 低动态模式：Canvas 帧数保持为 0，鼠标跟随关闭，扫描线动画关闭，静态视觉仍完整。
6. 控制台：生产模式验收页面无错误和警告。

验收截图：

- [首页桌面](../output/playwright/phase5/12-home-desktop-final.png)
- [首页 390px](../output/playwright/phase5/13-home-390-final.png)
- [首页 320px](../output/playwright/phase5/14-home-320-final.png)
- [文章桌面](../output/playwright/phase5/15-article-desktop-final.png)
- [文章 390px](../output/playwright/phase5/16-article-390-final.png)
- [低动态首页](../output/playwright/phase5/17-home-reduced-motion-final.png)
- [管理员登录](../output/playwright/phase5/18-admin-login-final.png)
- [编辑器桌面](../output/playwright/phase5/19-admin-editor-desktop-final.png)
- [编辑器 390px](../output/playwright/phase5/20-admin-editor-390-final.png)
- [编辑器 320px](../output/playwright/phase5/21-admin-editor-320-final.png)
- [移动导航](../output/playwright/phase5/22-mobile-navigation-final.png)
- [公开笔记列表](../output/playwright/phase5/23-notes-desktop-final.png)
- [搜索结果](../output/playwright/phase5/24-search-results-viewport-final.png)

## 非阻塞项

- 高并发测试期间 `pg` 会发出一次关于并行 `client.query()` 的未来弃用警告；当前功能和测试不受影响，升级到 `pg` 9 前应复查 Prisma PostgreSQL 适配器的并发调用方式。
- 真实读屏软件、不同操作系统字体渲染、Lighthouse 分数和公网弱网尚未单独测试；当前无障碍结论来自语义、键盘、焦点、触控尺寸、低动态自动化和截图检查。
- 当前文章中的外部图片依赖第三方 URL 可用性，部署后应使用稳定对象存储或自有 CDN。

## 部署前清单

- 配置生产 PostgreSQL，并执行已提交的 Prisma migrations。
- 在部署平台配置 `.env.example` 中列出的生产环境变量，不提交 `.env.local`。
- 使用生产管理员邮箱和密码哈希运行一次 `npm run admin:bootstrap`。
- 使用 `npm run build` 构建，并由支持持久 Node.js 运行时的平台启动 Next.js。
- 启用 HTTPS、数据库备份和运行时日志，再执行一次管理员登录、发布文章和公开搜索冒烟测试。

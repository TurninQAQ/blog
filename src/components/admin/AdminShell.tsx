import type { ReactNode } from "react";
import {
  Database,
  FileText,
  KeyRound,
  LogOut,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import { AdminNav } from "@/components/admin/AdminNav";
import { siteConfig } from "@/config/site";

type AdminShellProps = {
  sessionEmail: string;
  children: ReactNode;
};

type StatusCard = {
  label: string;
  value: string;
  icon: ReactNode;
};

const statusCards: StatusCard[] = [
  {
    label: "数据模型",
    value: "PostgreSQL + Prisma 骨架已就绪",
    icon: <Database aria-hidden="true" className="h-4 w-4" />,
  },
  {
    label: "管理员会话",
    value: "基于 Prisma 的 Cookie 会话",
    icon: <KeyRound aria-hidden="true" className="h-4 w-4" />,
  },
  {
    label: "写入保护",
    value: "共享服务端保护边界已就绪",
    icon: <ShieldCheck aria-hidden="true" className="h-4 w-4" />,
  },
];

export function AdminShell({ sessionEmail, children }: AdminShellProps) {
  return (
    <div className="min-h-svh overflow-x-clip bg-lab-base text-lab-text">
      <header className="manga-admin-header bg-lab-surface">
        <div className="manga-admin-header-frame mx-auto w-full max-w-[1520px] px-4 sm:px-6">
          <div className="manga-admin-header-top flex min-h-16 items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[14px] font-semibold leading-[1.4] text-lab-accent">
                <Terminal aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span lang="en">{siteConfig.brand.en}</span>
              </p>
              <p className="mt-1 truncate text-[14px] font-normal leading-[1.4] text-lab-text-muted">
                当前登录{" "}
                <span className="font-mono text-lab-text">{sessionEmail}</span>
              </p>
            </div>

            <div className="manga-admin-header-actions">
              <div className="manga-admin-status-rail" aria-label="后台状态">
                <span>
                  <span aria-hidden="true" className="manga-admin-status-dot" />
                  写作舱在线
                </span>
                <span>AUTHOR / 01</span>
              </div>

              <form
                action="/admin/logout"
                method="post"
                className="manga-admin-logout shrink-0"
              >
                <button
                  type="submit"
                  aria-label="退出登录"
                  className="manga-admin-logout-button inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-hairline)] px-3 text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  <span className="manga-admin-logout-label">退出登录</span>
                </button>
              </form>
            </div>
          </div>

          <AdminNav />
        </div>
      </header>

      <main className="manga-admin-workspace mx-auto w-full max-w-[1520px] px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </div>
  );
}

export function AdminStatusPanel() {
  return (
    <section
      aria-labelledby="admin-status-heading"
      className="rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)] sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[68ch]">
          <p className="inline-flex min-h-11 items-center gap-2 rounded-lab border border-[var(--lab-border-active)] px-3 font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            已认证
          </p>
          <h2
            id="admin-status-heading"
            className="mt-6 text-[20px] font-semibold leading-[1.2] text-lab-text"
            lang="zh-Hans"
          >
            内容工作流尚未连接
          </h2>
          <p
            className="mt-3 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
            lang="zh-Hans"
          >
            数据模型和访问边界已就绪。Markdown 写作界面将在下一阶段接入。
          </p>
        </div>
        <FileText
          aria-hidden="true"
          className="hidden h-11 w-11 text-lab-accent md:block"
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {statusCards.map((card) => (
          <div
            key={card.label}
            className="min-h-[112px] rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base p-4 transition-colors duration-150 hover:border-[var(--lab-border-active)]"
          >
            <div className="flex items-center gap-2 text-lab-accent">
              {card.icon}
              <h3 className="text-[14px] font-normal leading-[1.4] text-lab-text">
                {card.label}
              </h3>
            </div>
            <p className="mt-3 text-[14px] font-normal leading-[1.4] text-lab-text-muted">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminEmptyState() {
  return (
    <div className="mb-8 max-w-[68ch]">
      <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
        管理后台
      </p>
      <h1
        className="mt-3 text-[28px] font-semibold leading-[1.2] text-lab-text max-[360px]:text-[20px]"
        lang="zh-Hans"
      >
        管理台访问边界已就绪
      </h1>
      <p
        className="mt-4 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
        lang="zh-Hans"
      >
        当前页面只验证登录、会话和受保护管理区。文章写作工作流将在后续阶段接入。
      </p>
    </div>
  );
}

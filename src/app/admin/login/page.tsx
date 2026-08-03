import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { siteConfig } from "@/config/site";
import { getAdminSession } from "@/lib/auth/admin";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    expired?: string | string[];
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasExpiredSession =
    params?.expired === "1" ||
    (Array.isArray(params?.expired) && params.expired.includes("1"));

  return (
    <main className="manga-admin-login relative flex min-h-svh items-center justify-center overflow-x-clip px-4 py-16 sm:px-6">
      <div
        aria-hidden="true"
        className="manga-admin-login-grid pointer-events-none absolute inset-0"
      />
      <section
        data-testid="admin-login-card"
        className="manga-admin-login-card relative w-full max-w-[420px] rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 sm:p-6"
      >
        <div className="manga-admin-login-rail" aria-hidden="true">
          <span>AUTHOR ACCESS</span>
          <span>SECURE BAY / 01</span>
        </div>

        <div className="manga-admin-login-identity flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
              <ShieldCheck aria-hidden="true" className="h-4 w-4" />
              <span lang="en">{siteConfig.brand.en}</span>
            </p>
            <p
              className="mt-2 text-[14px] font-normal leading-[1.4] text-lab-text-muted"
              lang="zh-Hans"
            >
              管理入口
            </p>
          </div>
          <KeyRound aria-hidden="true" className="h-6 w-6 text-lab-accent" />
        </div>

        <h1 className="mt-8 text-[28px] font-semibold leading-[1.2] text-lab-text">
          管理员登录
        </h1>
        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          管理入口仅供站点作者使用。
        </p>
        {hasExpiredSession ? (
          <p
            className="manga-admin-login-alert mt-4 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base p-3 text-[14px] font-normal leading-[1.4] text-lab-text-muted"
            lang="zh-Hans"
          >
            会话已过期。请重新登录。
          </p>
        ) : null}

        <AdminLoginForm />

        <Link
          href="/"
          className="manga-admin-login-home mt-6 inline-flex min-h-11 items-center rounded-lab border border-transparent text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
        >
          返回博客首页
        </Link>
      </section>
    </main>
  );
}

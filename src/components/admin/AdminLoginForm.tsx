"use client";

import { useActionState } from "react";
import { AlertTriangle, LoaderCircle, LogIn } from "lucide-react";

import { loginAdmin } from "@/app/admin/login/actions";

type AdminLoginState = {
  error: string | null;
};

const initialLoginState: AdminLoginState = {
  error: null,
};

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialLoginState,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="admin-email"
          className="text-[14px] font-normal leading-[1.4] text-lab-text"
        >
          邮箱
        </label>
        <input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={isPending}
          className="min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] font-normal leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted hover:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent disabled:cursor-not-allowed disabled:border-[var(--lab-border-hairline)] disabled:text-lab-muted"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="admin-password"
          className="text-[14px] font-normal leading-[1.4] text-lab-text"
        >
          密码
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isPending}
          className="min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base px-3 text-[16px] font-normal leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted hover:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent disabled:cursor-not-allowed disabled:border-[var(--lab-border-hairline)] disabled:text-lab-muted"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="flex min-h-11 items-start gap-2 rounded-lab border border-[rgba(255,92,122,0.38)] bg-[rgba(255,92,122,0.10)] p-3 text-[14px] font-normal leading-[1.4] text-[#FFC1CC]"
          lang="zh-Hans"
        >
          <AlertTriangle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          <span>{state.error}</span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="lab-action-glow inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-active)] bg-[rgba(46,242,181,0.10)] px-4 text-[14px] font-normal leading-[1.4] text-lab-text transition-colors duration-150 hover:bg-[rgba(46,242,181,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent disabled:cursor-not-allowed disabled:border-[var(--lab-border-hairline)] disabled:bg-lab-surface disabled:text-lab-muted"
      >
        {isPending ? (
          <LoaderCircle
            aria-hidden="true"
            className="h-4 w-4 motion-safe:animate-spin motion-reduce:animate-none"
          />
        ) : (
          <LogIn aria-hidden="true" className="h-4 w-4" />
        )}
        <span>{isPending ? "正在验证..." : "登录管理后台"}</span>
      </button>
    </form>
  );
}

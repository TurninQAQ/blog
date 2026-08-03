import Link from "next/link";

export default function PublicNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
        404
      </p>
      <h1 className="mt-4 text-[24px] font-semibold leading-[1.2] text-lab-text">
        内容暂时无法加载。请刷新页面或稍后再试。
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 w-fit items-center rounded-lab border border-[var(--lab-border-hairline)] px-4 text-[14px] leading-[1.4] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
      >
        返回首页
      </Link>
    </section>
  );
}

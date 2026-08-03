import Link from "next/link";

type PublicEmptyStateProps = {
  title: string;
  body: string;
};

export function PublicEmptyState({ title, body }: PublicEmptyStateProps) {
  return (
    <section className="rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/76 p-5 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)] sm:p-6">
      <h2
        className="text-[24px] font-semibold leading-[1.2] text-lab-text"
        lang="zh-Hans"
      >
        {title}
      </h2>
      <p
        className="mt-3 max-w-[68ch] text-[16px] leading-[1.5] text-lab-text-muted"
        lang="zh-Hans"
      >
        {body}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-lab border border-[var(--lab-border-hairline)] px-4 text-[14px] leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
      >
        返回博客首页
      </Link>
    </section>
  );
}

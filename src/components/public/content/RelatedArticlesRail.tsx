import Link from "next/link";
import { ArrowRight, Clock3, Folder, Tags } from "lucide-react";

import type { PublicRelatedPost } from "@/lib/public/content-queries";

type RelatedArticlesRailProps = {
  posts: PublicRelatedPost[];
  variant: "desktop" | "mobile";
};

function formatReadingMinutes(post: PublicRelatedPost) {
  return Math.max(1, Math.ceil(post.readingTime.minutes));
}

export function RelatedArticlesRail({
  posts,
  variant,
}: RelatedArticlesRailProps) {
  if (posts.length === 0) {
    return null;
  }

  const isDesktop = variant === "desktop";

  return (
    <section
      aria-labelledby={`related-articles-${variant}-heading`}
      data-testid={
        isDesktop ? "related-articles-desktop" : "related-articles-mobile"
      }
      className={
        isDesktop
          ? "manga-related mt-6 hidden border-t-2 border-lab-text pt-4 lg:block"
          : "manga-related border-t-2 border-lab-text pt-4 lg:hidden"
      }
    >
      <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
        继续阅读
      </p>
      <h2
        id={`related-articles-${variant}-heading`}
        className="mt-2 text-[24px] font-semibold leading-[1.2] text-lab-text"
      >
        相关笔记
      </h2>

      <ul className="mt-4 space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/notes/${post.slug}`}
              className="group flex min-h-[44px] min-w-[44px] flex-col rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-3 text-lab-text transition hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong"
            >
              <span className="break-words text-[16px] font-semibold leading-[1.5]">
                {post.title}
              </span>
              <span className="mt-2 line-clamp-2 text-[14px] leading-[1.4] text-lab-text-muted">
                {post.excerpt || "暂无摘要。"}
              </span>
              <span className="mt-3 flex flex-wrap gap-2 font-mono text-[14px] leading-[1.4] text-lab-muted">
                <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  预计阅读 {formatReadingMinutes(post)} 分钟
                </span>
                <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                  <Folder aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="min-w-0 truncate">
                    {post.category?.name ?? "未分类"}
                  </span>
                </span>
              </span>
              {post.tags.length > 0 ? (
                <span className="mt-2 inline-flex min-h-8 max-w-full items-center gap-1 self-start rounded-lab border border-[var(--lab-border-hairline)] px-2 font-mono text-[14px] leading-[1.4] text-lab-muted">
                  <Tags aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 truncate">{post.tags[0].name}</span>
                </span>
              ) : null}
              <span className="mt-3 inline-flex items-center gap-2 font-mono text-[14px] leading-[1.4] text-lab-accent">
                阅读笔记
                <ArrowRight
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

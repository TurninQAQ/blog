import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";

import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";
import type { PublicPostSummary } from "@/lib/public/content-queries";

export type PublicSeriesPostSummary = PublicPostSummary & {
  seriesOrder: number | null;
};

type SeriesDetailListProps = {
  posts: PublicSeriesPostSummary[];
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function formatReadingMinutes(post: PublicPostSummary) {
  return Math.max(1, Math.ceil(post.readingTime.minutes));
}

function getOrderedPosts(posts: PublicSeriesPostSummary[]) {
  return [...posts].sort((left, right) => {
    const leftOrder = left.seriesOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.seriesOrder ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
    );
  });
}

export function SeriesDetailList({ posts }: SeriesDetailListProps) {
  const orderedPosts = getOrderedPosts(posts);

  if (orderedPosts.length === 0) {
    return (
      <PublicEmptyState
        title="暂时没有公开系列笔记"
        body="这个系列暂时没有可以公开阅读的技术笔记。"
      />
    );
  }

  return (
    <section
      data-testid="series-detail-list"
      className="overflow-hidden rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/78 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)]"
    >
      <ol>
        {orderedPosts.map((post, index) => (
          <li
            key={post.id}
            data-testid={`series-post-${post.slug}`}
            className="border-b border-[var(--lab-border-hairline)] p-4 last:border-b-0"
          >
            <article className="grid gap-4 sm:grid-cols-[56px_minmax(0,1fr)]">
              <span className="flex size-11 items-center justify-center rounded-lab border border-[var(--lab-border-active)] font-mono text-[14px] leading-[1.4] text-lab-accent">
                {String(post.seriesOrder ?? index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <Link
                  href={`/notes/${post.slug}`}
                  className="inline-flex min-h-11 max-w-full items-center rounded-lab text-[24px] font-semibold leading-[1.2] text-lab-text transition-colors duration-150 hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                >
                  <span className="min-w-0 break-words">{post.title}</span>
                </Link>
                <p className="mt-2 line-clamp-2 text-[16px] leading-[1.5] text-lab-text-muted">
                  {post.excerpt || "暂无摘要。"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-[14px] leading-[1.4] text-lab-text-muted">
                  <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                    <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                    预计阅读 {formatReadingMinutes(post)} 分钟
                  </span>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

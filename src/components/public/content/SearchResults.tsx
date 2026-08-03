import Link from "next/link";
import { CalendarDays, Clock3, Folder, Tag } from "lucide-react";

import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";
import type { PublicPostSummary } from "@/lib/public/content-queries";

type SearchResultsProps = {
  query: string;
  results: PublicPostSummary[];
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

export function SearchResults({ query, results }: SearchResultsProps) {
  if (!query) {
    return (
      <PublicEmptyState
        title="搜索公开笔记"
        body="输入关键词后，公开笔记中的相关结果会显示在这里。"
      />
    );
  }

  if (results.length === 0) {
    return (
      <PublicEmptyState
        title="没有匹配结果"
        body="没有找到匹配的公开笔记。换一个关键词再试。"
      />
    );
  }

  return (
    <section
      data-testid="search-results"
      aria-label="搜索结果"
      className="overflow-hidden rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/78 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)]"
    >
      <ul>
        {results.map((post) => (
          <li
            key={post.id}
            data-testid={`search-result-${post.slug}`}
            className="border-b border-[var(--lab-border-hairline)] p-4 last:border-b-0"
          >
            <article className="min-w-0">
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
                <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                  <Folder aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="min-w-0 truncate">
                    {post.category?.name ?? "未分类"}
                  </span>
                </span>
              </div>

              {post.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2 font-mono text-[14px] leading-[1.4] text-lab-muted"
                    >
                      <Tag aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      <span className="min-w-0 truncate">{tag.name}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

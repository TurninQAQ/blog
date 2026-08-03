import { CalendarDays, Clock3, Folder, Tag } from "lucide-react";

import { PostVisualBlock } from "@/components/public/content/PostVisualBlock";
import type { PublicPostDetail } from "@/lib/public/content-queries";

type ArticleHeaderProps = {
  post: PublicPostDetail;
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

function formatReadingMinutes(post: PublicPostDetail) {
  return Math.max(1, Math.ceil(post.readingTime.minutes));
}

export function ArticleHeader({ post }: ArticleHeaderProps) {
  return (
    <header className="manga-article-header grid gap-8 border-b-2 border-lab-text pb-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <p className="manga-section-label font-mono text-[13px] font-semibold leading-[1.4] text-lab-accent">
          笔记
        </p>
        <h1
          className="mt-3 break-words text-[42px] font-black leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          {post.title}
        </h1>
        <p
          className="mt-6 max-w-[68ch] text-[16px] leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          {post.excerpt || "暂无摘要。"}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-[14px] leading-[1.4] text-lab-text-muted">
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
      </div>

      <div className="max-w-[360px] lg:max-w-none">
        <PostVisualBlock coverImage={post.coverImage} title={post.title} />
      </div>
    </header>
  );
}

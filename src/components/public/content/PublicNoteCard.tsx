import Link from "next/link";
import { CalendarDays, Clock3, Folder, Tag } from "lucide-react";

import { PostVisualBlock } from "@/components/public/content/PostVisualBlock";
import type { PublicPostSummary } from "@/lib/public/content-queries";

type PublicNoteCardProps = {
  post: PublicPostSummary;
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

export function PublicNoteCard({ post }: PublicNoteCardProps) {
  return (
    <li
      data-testid={`public-note-${post.slug}`}
      className="manga-note-card border-b-2 border-lab-text last:border-b-0"
    >
      <article className="grid gap-5 p-4 sm:p-5 md:grid-cols-[260px_minmax(0,1fr)]">
        <PostVisualBlock coverImage={post.coverImage} title={post.title} />

        <div className="min-w-0">
          <Link
            href={`/notes/${post.slug}`}
            className="flex min-h-11 items-center text-[25px] font-black leading-[1.15] text-lab-text transition-colors duration-150 hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
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
        </div>
      </article>
    </li>
  );
}

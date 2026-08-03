import { BookOpenText, Folder, Layers, Star, Tag } from "lucide-react";

import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";
import { PublicNoteList } from "@/components/public/content/PublicNoteList";
import type { PublicHomepageContent } from "@/lib/public/content-queries";

type FeaturedNotesModuleProps = {
  content: PublicHomepageContent;
};

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: typeof BookOpenText;
};

function joinNames(items: { name?: string; title?: string }[]) {
  const names = items
    .map((item) => item.name ?? item.title)
    .filter((value): value is string => Boolean(value));

  return names.length > 0 ? names.slice(0, 3).join("、") : "暂无公开数据";
}

function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <article className="manga-stat-card rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lab border border-[var(--lab-border-active)] bg-lab-surface text-lab-accent">
          <Icon aria-hidden="true" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[14px] leading-[1.4] text-lab-muted">
            {label}
          </p>
          <p className="mt-1 text-[24px] font-semibold leading-[1.2] text-lab-text">
            {value}
          </p>
        </div>
      </div>
      <p className="mt-3 break-words text-[14px] leading-[1.4] text-lab-text-muted">
        {detail}
      </p>
    </article>
  );
}

export function FeaturedNotesModule({ content }: FeaturedNotesModuleProps) {
  const { featuredPosts, stats } = content;

  return (
    <section
      data-testid="featured-notes-module"
      className="manga-featured-notes"
      aria-labelledby="featured-notes-heading"
    >
      <div className="manga-featured-heading max-w-[720px]">
        <p className="manga-section-label font-mono text-[13px] font-semibold leading-[1.4] text-lab-accent">
          内容模块
        </p>
        <h2
          id="featured-notes-heading"
          className="mt-3 text-[28px] font-black leading-[1.15] text-lab-text"
        >
          精选笔记
        </h2>
        <p
          className="mt-3 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          首页展示已经公开且被明确设为精选的技术笔记，并同步真实公开内容统计。
        </p>
      </div>

      {featuredPosts.length > 0 ? (
        <PublicNoteList posts={featuredPosts} />
      ) : (
        <PublicEmptyState
          title="还没有精选笔记"
          body="有公开精选内容后，这里会显示值得优先阅读的技术笔记。"
        />
      )}

      <section
        data-testid="homepage-public-stats"
        aria-label="公开内容统计"
        className="manga-stat-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        <StatCard
          label="公开笔记"
          value={String(stats.publishedPostCount)}
          detail="当前可以公开阅读的技术笔记"
          icon={BookOpenText}
        />
        <StatCard
          label="精选笔记"
          value={String(stats.featuredPostCount)}
          detail="首页明确展示的公开笔记"
          icon={Star}
        />
        <StatCard
          label="分类"
          value={String(stats.categories.length)}
          detail={joinNames(stats.categories)}
          icon={Folder}
        />
        <StatCard
          label="标签"
          value={String(stats.tags.length)}
          detail={joinNames(stats.tags)}
          icon={Tag}
        />
        <StatCard
          label="系列"
          value={String(stats.series.length)}
          detail={joinNames(stats.series)}
          icon={Layers}
        />
      </section>
    </section>
  );
}

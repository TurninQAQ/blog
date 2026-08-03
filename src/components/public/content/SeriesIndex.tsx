import Link from "next/link";
import { Layers } from "lucide-react";

import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";

export type PublicSeriesIndexItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
};

type SeriesIndexProps = {
  series: PublicSeriesIndexItem[];
};

export function SeriesIndex({ series }: SeriesIndexProps) {
  if (series.length === 0) {
    return (
      <PublicEmptyState
        title="暂时没有公开系列"
        body="暂时没有公开系列。系列会在同一主题的笔记形成顺序后出现。"
      />
    );
  }

  return (
    <section
      data-testid="series-index"
      className="overflow-hidden rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/78 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)]"
    >
      <ul>
        {series.map((item) => (
          <li
            key={item.id}
            className="border-b border-[var(--lab-border-hairline)] p-4 last:border-b-0"
          >
            <article className="grid gap-4 sm:grid-cols-[44px_minmax(0,1fr)]">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-lab border border-[var(--lab-border-active)] text-lab-accent"
              >
                <Layers className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <Link
                  href={`/series/${item.slug}`}
                  className="inline-flex min-h-11 max-w-full items-center rounded-lab text-[24px] font-semibold leading-[1.2] text-lab-text transition-colors duration-150 hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                >
                  <span className="min-w-0 break-words">{item.title}</span>
                </Link>
                <p
                  className="mt-2 max-w-[68ch] text-[16px] leading-[1.5] text-lab-text-muted"
                  lang="zh-Hans"
                >
                  {item.description?.trim() ||
                    "这个系列的公开技术笔记会按顺序显示。"}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

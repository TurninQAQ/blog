import Link from "next/link";
import {
  Archive,
  ArrowUpRight,
  BookOpenText,
  Layers,
  Search,
  type LucideIcon,
} from "lucide-react";
import { contentRoutes, type ContentRoute } from "@/config/routes";

const routeIcons = {
  notes: BookOpenText,
  series: Layers,
  archive: Archive,
  search: Search,
} satisfies Record<ContentRoute["key"], LucideIcon>;

export function ContentRouteStrip() {
  return (
    <section
      id="lab-index"
      className="manga-route-strip scroll-mt-24 border-y-2 border-lab-text bg-lab-base px-4 py-10 sm:px-6 lg:px-8"
      aria-labelledby="lab-index-heading"
    >
      <div className="mx-auto grid w-full max-w-[1280px] gap-7 lg:grid-cols-[260px_1fr]">
        <div>
          <p className="manga-section-label font-mono text-[13px] font-semibold leading-[1.4] text-lab-accent">
            内容入口
          </p>
          <h2
            id="lab-index-heading"
            className="mt-3 text-[26px] font-black leading-[1.15] text-lab-text"
          >
            博客索引
          </h2>
          <p
            className="mt-3 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
            lang="zh-Hans"
          >
            笔记、系列、归档和搜索已经连接到公开内容，方便按主题与时间回看技术记录。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {contentRoutes.map((route) => {
            const Icon = routeIcons[route.key];

            return (
              <article
                key={route.key}
                className="manga-route-card rounded-lab border-2 border-lab-text bg-lab-surface p-4"
              >
                <div className="flex min-h-11 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lab border-2 border-lab-accent bg-lab-surface text-lab-accent">
                    <Icon size={18} aria-hidden="true" strokeWidth={1.8} />
                  </span>
                  <Link
                    href={route.href}
                    className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-between gap-2 rounded-lab text-[16px] font-bold leading-[1.5] text-lab-text transition-colors duration-150 hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                  >
                    <span>{route.label}</span>
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      strokeWidth={2}
                    />
                  </Link>
                </div>
                <p className="mt-3 text-[14px] font-normal leading-[1.4] text-lab-text-muted">
                  {route.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

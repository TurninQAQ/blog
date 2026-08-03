import Link from "next/link";
import {
  Archive,
  BookOpenText,
  Layers,
  Search,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { contentRoutes, type ContentRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { MobileNav } from "./MobileNav";

const routeIcons = {
  notes: BookOpenText,
  series: Layers,
  archive: Archive,
  search: Search,
} satisfies Record<ContentRoute["key"], LucideIcon>;

export function SiteHeader() {
  return (
    <header className="manga-site-header sticky top-0 z-40 min-h-14 border-b border-[var(--lab-border-hairline)] bg-lab-base/94 backdrop-blur supports-[not(backdrop-filter:blur(12px))]:bg-lab-base md:min-h-16">
      <div className="mx-auto flex min-h-14 w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 md:min-h-16 lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-lab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
          aria-label="返回首页"
        >
          <span className="manga-brand-mark flex size-10 shrink-0 items-center justify-center rounded-lab border border-[var(--lab-border-active)] bg-lab-surface text-lab-accent">
            <Terminal size={20} aria-hidden="true" strokeWidth={1.8} />
          </span>
          <span className="min-w-0">
            <span
              className="block truncate text-[16px] font-semibold leading-[1.5] text-lab-text"
              lang="en"
            >
              {siteConfig.brand.en}
            </span>
            <span
              className="block truncate text-[14px] font-normal leading-[1.4] text-lab-text-muted"
              lang="zh-Hans"
            >
              {siteConfig.brand.zh}
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <nav aria-label="主导航">
            <ul className="flex items-center gap-1">
              {contentRoutes.map((route) => {
                const Icon = routeIcons[route.key];

                return (
                  <li key={route.key}>
                    <Link
                      href={route.href}
                      className="manga-nav-link flex min-h-11 items-center gap-2 rounded-lab px-3 text-[14px] font-normal leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:bg-lab-surface hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                    >
                      <Icon size={16} aria-hidden="true" strokeWidth={1.8} />
                      <span>{route.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Link
            href="/notes"
            className="manga-header-cta flex min-h-11 items-center rounded-lab border border-[var(--lab-border-active)] px-4 text-[14px] font-semibold leading-[1.4] text-lab-text transition-colors duration-150 hover:border-lab-accent hover:bg-lab-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
          >
            {siteConfig.hero.primaryCta}
          </Link>
        </div>

        <MobileNav routes={contentRoutes} />
      </div>
    </header>
  );
}

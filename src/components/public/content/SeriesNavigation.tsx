import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type {
  PublicSeriesNavigation,
  PublicSeriesNavigationItem,
} from "@/lib/public/content-queries";

type SeriesNavigationProps = {
  navigation: PublicSeriesNavigation;
};

type SeriesNavigationLinkProps = {
  direction: "previous" | "next";
  item: PublicSeriesNavigationItem;
};

function SeriesNavigationLink({
  direction,
  item,
}: SeriesNavigationLinkProps) {
  const isPrevious = direction === "previous";

  return (
    <Link
      href={`/notes/${item.slug}`}
      className="lab-action-glow flex min-h-[44px] min-w-[44px] items-center gap-3 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface px-4 py-3 text-lab-text transition hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong"
    >
      {isPrevious ? (
        <ChevronLeft className="h-4 w-4 shrink-0 text-lab-accent" aria-hidden />
      ) : null}
      <span className="min-w-0">
        <span className="block font-mono text-[14px] font-normal leading-[1.4] text-lab-text-muted">
          {isPrevious ? "上一篇" : "下一篇"}
        </span>
        <span className="mt-1 block [overflow-wrap:anywhere] text-[16px] font-semibold leading-[1.5] text-lab-text">
          {item.title}
        </span>
      </span>
      {!isPrevious ? (
        <ChevronRight
          className="ml-auto h-4 w-4 shrink-0 text-lab-accent"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}

export function SeriesNavigation({ navigation }: SeriesNavigationProps) {
  if (!navigation.previous && !navigation.next) {
    return null;
  }

  return (
    <nav
      aria-label="系列导航"
      data-testid="series-navigation"
      className="manga-series-navigation border-t-2 border-lab-text pt-5"
    >
      <h2 className="text-[24px] font-semibold leading-[1.2] text-lab-text">
        系列导航
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {navigation.previous ? (
          <SeriesNavigationLink
            direction="previous"
            item={navigation.previous}
          />
        ) : (
          <span className="hidden sm:block" aria-hidden />
        )}
        {navigation.next ? (
          <SeriesNavigationLink direction="next" item={navigation.next} />
        ) : null}
      </div>
    </nav>
  );
}

import type { PublicMarkdownHeading } from "@/lib/markdown/public-render";

type TableOfContentsProps = {
  headings: PublicMarkdownHeading[];
  variant: "desktop" | "mobile";
};

export function TableOfContents({ headings, variant }: TableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  const isDesktop = variant === "desktop";

  return (
    <nav
      aria-label="目录"
      data-testid={isDesktop ? "article-toc-desktop" : "article-toc-mobile"}
      className={
        isDesktop
          ? "manga-toc hidden lg:block"
          : "manga-toc rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 lg:hidden"
      }
    >
      {isDesktop ? (
        <TocContent headings={headings} />
      ) : (
        <details>
          <summary className="flex min-h-11 cursor-pointer items-center font-mono text-[14px] leading-[1.4] text-lab-accent">
            目录
          </summary>
          <TocLinks headings={headings} />
        </details>
      )}
    </nav>
  );
}

function TocContent({ headings }: { headings: PublicMarkdownHeading[] }) {
  return (
    <div className="sticky top-24 rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4">
      <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
        目录
      </p>
      <TocLinks headings={headings} />
    </div>
  );
}

function TocLinks({ headings }: { headings: PublicMarkdownHeading[] }) {
  return (
    <ol className="mt-3 space-y-1">
      {headings.map((heading) => (
        <li key={`${heading.id}-${heading.text}`}>
          <a
            href={`#${heading.id}`}
            className="flex min-h-11 items-center rounded-lab px-2 text-[14px] leading-[1.4] text-lab-text-muted transition-colors duration-150 hover:bg-lab-surface-strong/72 hover:text-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
            style={{ paddingLeft: `${Math.max(0, heading.depth - 2) * 12 + 8}px` }}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

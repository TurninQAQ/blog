import type { ReactNode } from "react";

import { ArticleHeader } from "@/components/public/content/ArticleHeader";
import { ArticleMarkdown } from "@/components/public/content/ArticleMarkdown";
import { RelatedArticlesRail } from "@/components/public/content/RelatedArticlesRail";
import { SeriesNavigation } from "@/components/public/content/SeriesNavigation";
import { TableOfContents } from "@/components/public/content/TableOfContents";
import type { PublicMarkdownHeading } from "@/lib/markdown/public-render";
import type {
  PublicPostDetail,
  PublicRelatedPost,
  PublicSeriesNavigation,
} from "@/lib/public/content-queries";

type ArticlePageProps = {
  headings: PublicMarkdownHeading[];
  markdown: ReactNode;
  post: PublicPostDetail;
  relatedPosts: PublicRelatedPost[];
  seriesNavigation: PublicSeriesNavigation;
};

export function ArticlePage({
  headings,
  markdown,
  post,
  relatedPosts,
  seriesNavigation,
}: ArticlePageProps) {
  return (
    <article
      data-testid="article-detail"
      className="manga-article-page mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-4 py-14 sm:px-6 lg:px-8"
    >
      <ArticleHeader post={post} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,720px)_280px]">
        <div className="min-w-0 space-y-8">
          <TableOfContents headings={headings} variant="mobile" />
          <ArticleMarkdown content={markdown} />
          <SeriesNavigation navigation={seriesNavigation} />
          <RelatedArticlesRail posts={relatedPosts} variant="mobile" />
        </div>

        <aside className="min-w-0">
          <TableOfContents headings={headings} variant="desktop" />
          <RelatedArticlesRail posts={relatedPosts} variant="desktop" />
        </aside>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticlePage } from "@/components/public/content/ArticlePage";
import { renderPublicMarkdown } from "@/lib/markdown/public-render";
import {
  getRelatedPublishedPosts,
  getPublishedPostBySlug,
  getSeriesNavigation,
} from "@/lib/public/content-queries";
import { createArticleMetadata } from "@/lib/seo/article-metadata";

type ArticleDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: ArticleDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return {};
  }

  return createArticleMetadata(post);
}

export default async function ArticleDetailPage({
  params,
}: ArticleDetailPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const rendered = await renderPublicMarkdown(post.bodyMarkdown);
  const [relatedPosts, seriesNavigation] = await Promise.all([
    getRelatedPublishedPosts(post),
    getSeriesNavigation(post.id),
  ]);

  return (
    <ArticlePage
      headings={rendered.headings}
      markdown={rendered.content}
      post={post}
      relatedPosts={relatedPosts}
      seriesNavigation={seriesNavigation}
    />
  );
}

import type { Metadata } from "next";

import type { PublicPostDetail } from "@/lib/public/content-queries";

export function createArticleMetadata(post: PublicPostDetail): Metadata {
  const keywords = [
    post.category?.name,
    post.series?.title,
    ...post.tags.map((tag) => tag.name),
  ].filter((value): value is string => Boolean(value));
  const images = post.coverImage
    ? [
        {
          url: post.coverImage,
          alt: post.title,
        },
      ]
    : undefined;

  return {
    title: post.title,
    description: post.excerpt,
    keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      tags: keywords,
      images,
    },
    twitter: {
      card: post.coverImage ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

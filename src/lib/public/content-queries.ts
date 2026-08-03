import readingTime, { type ReadTimeResults } from "reading-time";

import { PublicationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";

export type PublicTaxonomy = {
  id: string;
  name: string;
  slug: string;
};

export type PublicTaxonomyDetail = PublicTaxonomy & {
  description: string | null;
};

export type PublicSeries = {
  id: string;
  title: string;
  slug: string;
};

export type PublicSeriesDetail = PublicSeries & {
  description: string | null;
};

export type PublicPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: typeof PublicationStatus.PUBLISHED;
  coverImage: string | null;
  publishedAt: string;
  featured: boolean;
  category: PublicTaxonomy | null;
  series: PublicSeries | null;
  seriesOrder: number | null;
  tags: PublicTaxonomy[];
  readingTime: ReadTimeResults;
};

export type PublicPostDetail = PublicPostSummary & {
  bodyMarkdown: string;
};

export type PublicTaxonomyPosts = {
  taxonomy: PublicTaxonomyDetail;
  posts: PublicPostSummary[];
};

export type PublicArchiveMonthGroup = {
  key: string;
  label: string;
  posts: PublicPostSummary[];
};

export type PublicArchiveYearGroup = {
  year: number;
  months: PublicArchiveMonthGroup[];
};

export type PublicSeriesIndexEntry = PublicSeriesDetail;

export type PublicSeriesPosts = {
  series: PublicSeriesDetail;
  posts: PublicPostSummary[];
};

export type PublicSeriesNavigationItem = {
  title: string;
  slug: string;
  seriesOrder: number | null;
};

export type PublicSeriesNavigation = {
  previous: PublicSeriesNavigationItem | null;
  next: PublicSeriesNavigationItem | null;
};

export type PublicRelatedPost = PublicPostSummary;

export type PublicHomepageStats = {
  publishedPostCount: number;
  featuredPostCount: number;
  categories: PublicTaxonomy[];
  tags: PublicTaxonomy[];
  series: PublicSeries[];
};

export type PublicHomepageContent = {
  featuredPosts: PublicPostSummary[];
  stats: PublicHomepageStats;
};

const maxSearchQueryLength = 120;

const publishedPostWhere = {
  status: PublicationStatus.PUBLISHED,
  publishedAt: {
    not: null,
  },
} as const;

const publicPostInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  series: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};

type PublicPostRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyMarkdown: string;
  status: string;
  coverImage: string | null;
  publishedAt: Date | null;
  featured: boolean;
  category: PublicTaxonomy | null;
  series: PublicSeries | null;
  seriesOrder: number | null;
  tags: { tag: PublicTaxonomy }[];
};

function mapPublicPostSummary(post: PublicPostRecord): PublicPostSummary {
  if (!post.publishedAt || post.status !== PublicationStatus.PUBLISHED) {
    throw new Error("Public post mapper received an unpublished post");
  }

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: PublicationStatus.PUBLISHED,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt.toISOString(),
    featured: post.featured,
    category: post.category,
    series: post.series,
    seriesOrder: post.seriesOrder,
    tags: post.tags
      .map(({ tag }) => tag)
      .sort((left, right) => left.name.localeCompare(right.name)),
    readingTime: readingTime(post.bodyMarkdown),
  };
}

function mapPublicPostDetail(post: PublicPostRecord): PublicPostDetail {
  return {
    ...mapPublicPostSummary(post),
    bodyMarkdown: post.bodyMarkdown,
  };
}

function sortPublishedPostsByDate(posts: PublicPostSummary[]) {
  return [...posts].sort(
    (left, right) =>
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime(),
  );
}

function sortPublishedSeriesPosts(posts: PublicPostSummary[]) {
  return [...posts].sort((left, right) => {
    const leftOrder = left.seriesOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.seriesOrder ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (
      new Date(right.publishedAt).getTime() -
      new Date(left.publishedAt).getTime()
    );
  });
}

function sortSeriesNavigationItems(items: (PublicSeriesNavigationItem & {
  id: string;
  publishedAt: Date;
})[]) {
  return [...items].sort((left, right) => {
    const leftOrder = left.seriesOrder ?? Number.POSITIVE_INFINITY;
    const rightOrder = right.seriesOrder ?? Number.POSITIVE_INFINITY;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return right.publishedAt.getTime() - left.publishedAt.getTime();
  });
}

function relatedPriority(
  post: PublicPostSummary,
  currentPost: PublicPostSummary,
  currentTagIds: Set<string>,
) {
  if (currentPost.series && post.series?.id === currentPost.series.id) {
    return 3;
  }

  if (post.tags.some((tag) => currentTagIds.has(tag.id))) {
    return 2;
  }

  if (currentPost.category && post.category?.id === currentPost.category.id) {
    return 1;
  }

  return 0;
}

function sortRelatedPosts(
  posts: PublicPostSummary[],
  currentPost: PublicPostSummary,
) {
  const currentTagIds = new Set(currentPost.tags.map((tag) => tag.id));

  return posts
    .map((post) => ({
      post,
      priority: relatedPriority(post, currentPost, currentTagIds),
    }))
    .filter(({ priority }) => priority > 0)
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }

      return (
        new Date(right.post.publishedAt).getTime() -
        new Date(left.post.publishedAt).getTime()
      );
    })
    .map(({ post }) => post);
}

function getUtcMonthLabel(value: string) {
  return `${new Date(value).getUTCMonth() + 1}月`;
}

function normalizeSearchQuery(query: string) {
  return query.trim().slice(0, maxSearchQueryLength);
}

function uniqueTaxonomies(items: (PublicTaxonomy | null)[]) {
  const map = new Map<string, PublicTaxonomy>();

  for (const item of items) {
    if (item) {
      map.set(item.id, item);
    }
  }

  return [...map.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

function uniqueSeries(items: (PublicSeries | null)[]) {
  const map = new Map<string, PublicSeries>();

  for (const item of items) {
    if (item) {
      map.set(item.id, item);
    }
  }

  return [...map.values()].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

function groupPublishedPostsByArchiveMonth(
  posts: PublicPostSummary[],
): PublicArchiveYearGroup[] {
  const years = new Map<number, Map<number, PublicPostSummary[]>>();

  for (const post of sortPublishedPostsByDate(posts)) {
    const publishedAt = new Date(post.publishedAt);
    const year = publishedAt.getUTCFullYear();
    const month = publishedAt.getUTCMonth();
    const months = years.get(year) ?? new Map<number, PublicPostSummary[]>();
    const monthPosts = months.get(month) ?? [];

    monthPosts.push(post);
    months.set(month, monthPosts);
    years.set(year, months);
  }

  return [...years.entries()]
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map<PublicArchiveYearGroup>(([year, months]) => ({
      year,
      months: [...months.entries()]
        .sort(([leftMonth], [rightMonth]) => rightMonth - leftMonth)
        .map(([month, monthPosts]) => ({
          key: `${year}-${month}`,
          label: getUtcMonthLabel(monthPosts[0].publishedAt),
          posts: monthPosts,
        })),
    }));
}

export async function getPublishedPostList(): Promise<PublicPostSummary[]> {
  const posts = await prisma.post.findMany({
    where: publishedPostWhere,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: publicPostInclude,
  });

  return posts.map(mapPublicPostSummary);
}

export async function searchPublishedPosts(
  query: string,
): Promise<PublicPostSummary[]> {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const searchFilter = {
    contains: normalizedQuery,
    mode: "insensitive" as const,
  };
  const posts = await prisma.post.findMany({
    where: {
      ...publishedPostWhere,
      OR: [
        { title: searchFilter },
        { excerpt: searchFilter },
        { bodyMarkdown: searchFilter },
        {
          category: {
            is: {
              name: searchFilter,
            },
          },
        },
        {
          tags: {
            some: {
              tag: {
                name: searchFilter,
              },
            },
          },
        },
      ],
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 25,
    include: publicPostInclude,
  });

  return posts.map(mapPublicPostSummary);
}

export async function getHomepagePublicContent(): Promise<PublicHomepageContent> {
  const posts = await prisma.post.findMany({
    where: publishedPostWhere,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: publicPostInclude,
  });
  const summaries = posts.map(mapPublicPostSummary);
  const featuredPosts = summaries.filter((post) => post.featured).slice(0, 3);

  return {
    featuredPosts,
    stats: {
      publishedPostCount: summaries.length,
      featuredPostCount: featuredPosts.length,
      categories: uniqueTaxonomies(summaries.map((post) => post.category)),
      tags: uniqueTaxonomies(summaries.flatMap((post) => post.tags)),
      series: uniqueSeries(summaries.map((post) => post.series)),
    },
  };
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicPostDetail | null> {
  const post = await prisma.post.findFirst({
    where: {
      ...publishedPostWhere,
      slug,
    },
    include: publicPostInclude,
  });

  return post ? mapPublicPostDetail(post) : null;
}

export async function getPublishedPostsByTag(
  slug: string,
): Promise<PublicTaxonomyPosts | null> {
  const tag = await prisma.tag.findFirst({
    where: {
      slug,
      posts: {
        some: {
          post: publishedPostWhere,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      posts: {
        where: {
          post: publishedPostWhere,
        },
        select: {
          post: {
            include: publicPostInclude,
          },
        },
      },
    },
  });

  if (!tag) {
    return null;
  }

  const posts = sortPublishedPostsByDate(
    tag.posts.map(({ post }) => mapPublicPostSummary(post)),
  );

  if (posts.length === 0) {
    return null;
  }

  return {
    taxonomy: {
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
    },
    posts,
  };
}

export async function getPublishedPostsByCategory(
  slug: string,
): Promise<PublicTaxonomyPosts | null> {
  const category = await prisma.category.findFirst({
    where: {
      slug,
      posts: {
        some: publishedPostWhere,
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      posts: {
        where: publishedPostWhere,
        include: publicPostInclude,
      },
    },
  });

  if (!category) {
    return null;
  }

  const posts = sortPublishedPostsByDate(
    category.posts.map(mapPublicPostSummary),
  );

  if (posts.length === 0) {
    return null;
  }

  return {
    taxonomy: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
    },
    posts,
  };
}

export async function getPublishedArchiveGroups(): Promise<
  PublicArchiveYearGroup[]
> {
  const posts = await prisma.post.findMany({
    where: publishedPostWhere,
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    include: publicPostInclude,
  });

  return groupPublishedPostsByArchiveMonth(posts.map(mapPublicPostSummary));
}

export async function getPublishedSeriesIndex(): Promise<
  PublicSeriesIndexEntry[]
> {
  return prisma.series.findMany({
    where: {
      posts: {
        some: publishedPostWhere,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
    },
    orderBy: {
      title: "asc",
    },
  });
}

export async function getPublishedSeriesBySlug(
  slug: string,
): Promise<PublicSeriesPosts | null> {
  const series = await prisma.series.findFirst({
    where: {
      slug,
      posts: {
        some: publishedPostWhere,
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      posts: {
        where: publishedPostWhere,
        include: publicPostInclude,
      },
    },
  });

  if (!series) {
    return null;
  }

  const posts = sortPublishedSeriesPosts(series.posts.map(mapPublicPostSummary));

  if (posts.length === 0) {
    return null;
  }

  return {
    series: {
      id: series.id,
      title: series.title,
      slug: series.slug,
      description: series.description,
    },
    posts,
  };
}

export async function getSeriesNavigation(
  postId: string,
): Promise<PublicSeriesNavigation> {
  const currentPost = await prisma.post.findFirst({
    where: {
      ...publishedPostWhere,
      id: postId,
      seriesId: {
        not: null,
      },
    },
    select: {
      id: true,
      seriesId: true,
    },
  });

  if (!currentPost?.seriesId) {
    return {
      previous: null,
      next: null,
    };
  }

  const seriesPosts = await prisma.post.findMany({
    where: {
      ...publishedPostWhere,
      seriesId: currentPost.seriesId,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      seriesOrder: true,
      publishedAt: true,
    },
  });
  const orderedPosts = sortSeriesNavigationItems(
    seriesPosts.filter(
      (
        post,
      ): post is PublicSeriesNavigationItem & {
        id: string;
        publishedAt: Date;
      } => Boolean(post.publishedAt),
    ),
  );
  const currentIndex = orderedPosts.findIndex((post) => post.id === postId);

  if (currentIndex < 0) {
    return {
      previous: null,
      next: null,
    };
  }

  const previous = orderedPosts[currentIndex - 1] ?? null;
  const next = orderedPosts[currentIndex + 1] ?? null;

  return {
    previous: previous
      ? {
          title: previous.title,
          slug: previous.slug,
          seriesOrder: previous.seriesOrder,
        }
      : null,
    next: next
      ? {
          title: next.title,
          slug: next.slug,
          seriesOrder: next.seriesOrder,
        }
      : null,
  };
}

export async function getRelatedPublishedPosts(
  post: PublicPostSummary,
): Promise<PublicRelatedPost[]> {
  const tagIds = post.tags.map((tag) => tag.id);
  const relatedFilters = [
    post.series
      ? {
          seriesId: post.series.id,
        }
      : null,
    tagIds.length > 0
      ? {
          tags: {
            some: {
              tagId: {
                in: tagIds,
              },
            },
          },
        }
      : null,
    post.category
      ? {
          categoryId: post.category.id,
        }
      : null,
  ].filter((filter): filter is NonNullable<typeof filter> => Boolean(filter));

  if (relatedFilters.length === 0) {
    return [];
  }

  const relatedPosts = await prisma.post.findMany({
    where: {
      ...publishedPostWhere,
      id: {
        not: post.id,
      },
      OR: relatedFilters,
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 12,
    include: publicPostInclude,
  });

  return sortRelatedPosts(
    relatedPosts.map(mapPublicPostSummary),
    post,
  ).slice(0, 3);
}

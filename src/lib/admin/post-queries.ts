import "server-only";

import { PublicationStatus } from "@/generated/prisma/enums";
import { runGuardedQuery } from "@/lib/admin/guarded-query";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";

export type AdminPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  coverImage: string | null;
  updatedAt: string;
  createdAt: string;
  publishedAt: string | null;
  featured: boolean;
  seriesOrder: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  series: {
    id: string;
    title: string;
    slug: string;
  } | null;
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
};

export type AdminPostEditorPost = AdminPostSummary & {
  bodyMarkdown: string;
};

export type AdminTaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type AdminSeriesOption = {
  id: string;
  title: string;
  slug: string;
};

export type AdminDashboardData = {
  metrics: {
    drafts: number;
    recentlyEdited: number;
    categories: number;
    tags: number;
    series: number;
  };
  recentPosts: AdminPostSummary[];
  draftQueue: AdminPostSummary[];
};

const adminPostInclude = {
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

function mapPostSummary(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  coverImage: string | null;
  updatedAt: Date;
  createdAt: Date;
  publishedAt: Date | null;
  featured: boolean;
  seriesOrder: number | null;
  category: AdminPostSummary["category"];
  series: AdminPostSummary["series"];
  tags: { tag: AdminPostSummary["tags"][number] }[];
}): AdminPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: post.status,
    coverImage: post.coverImage,
    updatedAt: post.updatedAt.toISOString(),
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    featured: post.featured,
    seriesOrder: post.seriesOrder,
    category: post.category,
    series: post.series,
    tags: post.tags
      .map(({ tag }) => tag)
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}

function mapEditorPost(post: Parameters<typeof mapPostSummary>[0] & {
  bodyMarkdown: string;
  seriesOrder: number | null;
}): AdminPostEditorPost {
  return {
    ...mapPostSummary(post),
    bodyMarkdown: post.bodyMarkdown,
    seriesOrder: post.seriesOrder,
  };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  return runGuardedQuery(requireAdmin, async () => {
    const [recentPosts, draftQueue, drafts, categories, tags, series] =
      await Promise.all([
        prisma.post.findMany({
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: 5,
          include: adminPostInclude,
        }),
        prisma.post.findMany({
          where: {
            status: PublicationStatus.DRAFT,
          },
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: 5,
          include: adminPostInclude,
        }),
        prisma.post.count({
          where: {
            status: PublicationStatus.DRAFT,
          },
        }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.series.count(),
      ]);

    return {
      metrics: {
        drafts,
        recentlyEdited: recentPosts.length,
        categories,
        tags,
        series,
      },
      recentPosts: recentPosts.map(mapPostSummary),
      draftQueue: draftQueue.map(mapPostSummary),
    };
  });
}

export async function getAdminPostList() {
  return runGuardedQuery(requireAdmin, async () => {
    const posts = await prisma.post.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: adminPostInclude,
    });

    return posts.map(mapPostSummary);
  });
}

export async function getAdminPostEditorData(postId?: string) {
  return runGuardedQuery(requireAdmin, async () => {
    const [post, categories, tags, series] = await Promise.all([
      postId
        ? prisma.post.findUnique({
            where: {
              id: postId,
            },
            include: adminPostInclude,
          })
        : Promise.resolve(null),
      prisma.category.findMany({
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.tag.findMany({
        orderBy: [{ name: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.series.findMany({
        orderBy: [{ title: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          slug: true,
        },
      }),
    ]);

    return {
      post: post ? mapEditorPost(post) : null,
      categories,
      tags,
      series,
    };
  });
}

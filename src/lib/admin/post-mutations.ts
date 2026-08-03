import "server-only";

import { PublicationStatus } from "@/generated/prisma/enums";
import {
  AdminPostRequestError,
  AdminPostValidationError,
  duplicateCategoryMessage,
  duplicateSeriesMessage,
  duplicateSeriesOrderMessage,
  duplicateSlugMessage,
  duplicateTagMessage,
  missingCategoryMessage,
  missingSeriesMessage,
  missingTagMessage,
  normalizeTaxonomySlug,
  parseCreatePostInput,
  parseDeletePostInput,
  parseEditPostInput,
  parseFeaturePostInput,
  parsePublishPostInput,
  parseUnfeaturePostInput,
  parseUnpublishPostInput,
  type CreatePostInput,
  type EditPostInput,
} from "@/lib/admin/post-input";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import {
  ManagedMediaNotFoundError,
  markMediaPublic,
} from "@/lib/media/media-service";
import {
  collectManagedMediaIds,
  extractManagedMediaId,
} from "@/lib/media/media-url";
import {
  revalidatePublicPostPaths,
  type PublicPostPathSnapshot,
} from "@/lib/public/revalidate";

export const adminPostOperations = [
  "create",
  "edit",
  "delete",
  "publish",
  "unpublish",
  "feature",
  "unfeature",
] as const;

export type AdminPostOperation = (typeof adminPostOperations)[number];

type AdminPostMutationPost = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  publishedAt: string | null;
  featured: boolean;
  categoryId: string | null;
  seriesId: string | null;
  seriesOrder: number | null;
  tagIds: string[];
};

type AdminPostSavedResult = {
  operation: "create" | "edit";
  status: "saved";
  adminEmail: string;
  message: string;
  post: AdminPostMutationPost;
};

type AdminPostDeletedResult = {
  operation: "delete";
  status: "deleted";
  adminEmail: string;
  message: "草稿已删除";
  id: string;
};

type AdminPostPublicationResult = {
  operation: "publish" | "unpublish" | "feature" | "unfeature";
  status: "published" | "unpublished" | "featured" | "unfeatured";
  adminEmail: string;
  message: string;
  post: AdminPostMutationPost;
};

export type AdminPostMutationResult =
  | AdminPostSavedResult
  | AdminPostDeletedResult
  | AdminPostPublicationResult;

type LazyInputReader = () => Promise<unknown>;

async function readEmptyAdminPostInput() {
  return {};
}

function savedResponse(
  operation: "create" | "edit",
  adminEmail: string,
  post: {
    id: string;
    title: string;
    slug: string;
    status: string;
    updatedAt: Date;
    publishedAt: Date | null;
    featured: boolean;
    categoryId: string | null;
    seriesId: string | null;
    seriesOrder: number | null;
    tagIds: string[];
  },
  message: string,
): AdminPostSavedResult {
  return {
    operation,
    status: "saved",
    adminEmail,
    message,
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      featured: post.featured,
      categoryId: post.categoryId,
      seriesId: post.seriesId,
      seriesOrder: post.seriesOrder,
      tagIds: post.tagIds,
    },
  };
}

function publicationResponse({
  operation,
  status,
  message,
  adminEmail,
  post,
}: {
  operation: AdminPostPublicationResult["operation"];
  status: AdminPostPublicationResult["status"];
  message: string;
  adminEmail: string;
  post: {
    id: string;
    title: string;
    slug: string;
    status: string;
    updatedAt: Date;
    publishedAt: Date | null;
    featured: boolean;
    categoryId: string | null;
    seriesId: string | null;
    seriesOrder: number | null;
    tagIds: string[];
  };
}): AdminPostPublicationResult {
  return {
    operation,
    status,
    adminEmail,
    message,
    post: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString() ?? null,
      featured: post.featured,
      categoryId: post.categoryId,
      seriesId: post.seriesId,
      seriesOrder: post.seriesOrder,
      tagIds: post.tagIds,
    },
  };
}

async function readAdminPostInput(readInput: LazyInputReader) {
  try {
    return await readInput();
  } catch (error) {
    if (error instanceof AdminPostRequestError) {
      throw error;
    }

    throw new AdminPostValidationError({
      form: "请求内容无效。",
    });
  }
}

const postMutationSelect = {
  id: true,
  title: true,
  slug: true,
  status: true,
  updatedAt: true,
  publishedAt: true,
  featured: true,
  categoryId: true,
  seriesId: true,
  seriesOrder: true,
  bodyMarkdown: true,
  coverImage: true,
} as const;

const publicPathSnapshotSelect = {
  slug: true,
  status: true,
  publishedAt: true,
  featured: true,
  category: {
    select: {
      slug: true,
    },
  },
  series: {
    select: {
      slug: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          slug: true,
        },
      },
    },
  },
} as const;

async function assertSlugAvailable(slug: string, currentPostId?: string) {
  const existingPost = await prisma.post.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
    },
  });

  if (existingPost && existingPost.id !== currentPostId) {
    throw new AdminPostValidationError({
      slug: duplicateSlugMessage,
    });
  }
}

function draftWriteData(input: CreatePostInput | EditPostInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    bodyMarkdown: input.bodyMarkdown,
    coverImage: input.coverImage,
    featured: input.featured,
    status: PublicationStatus.DRAFT,
    publishedAt: null,
  };
}

function editablePostWriteData(
  input: CreatePostInput | EditPostInput,
  current?: PublicPostPathSnapshot | null,
) {
  const shouldStayPublished =
    current?.status === PublicationStatus.PUBLISHED &&
    current.publishedAt !== null;

  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    bodyMarkdown: input.bodyMarkdown,
    coverImage: input.coverImage,
    featured: input.featured,
    status: shouldStayPublished
      ? PublicationStatus.PUBLISHED
      : PublicationStatus.DRAFT,
    publishedAt: shouldStayPublished ? current.publishedAt : null,
  };
}

type TaxonomyWriteClient = Pick<
  typeof prisma,
  "category" | "tag" | "series" | "post" | "postTag"
>;

async function resolveCategoryInput(
  tx: TaxonomyWriteClient,
  input: CreatePostInput | EditPostInput,
) {
  if (input.newCategoryName.trim()) {
    const slug = normalizeTaxonomySlug(input.newCategoryName);
    const existingCategory = await tx.category.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingCategory) {
      throw new AdminPostValidationError({
        newCategoryName: duplicateCategoryMessage,
      });
    }

    const category = await tx.category.create({
      data: {
        name: input.newCategoryName,
        slug,
      },
      select: { id: true },
    });

    return category.id;
  }

  if (!input.categoryId) {
    return null;
  }

  const category = await tx.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AdminPostValidationError({
      categoryId: missingCategoryMessage,
    });
  }

  return category.id;
}

async function resolveTagInputs(
  tx: TaxonomyWriteClient,
  input: CreatePostInput | EditPostInput,
) {
  const tagIds = [...input.tagIds];

  if (tagIds.length > 0) {
    const existingTags = await tx.tag.findMany({
      where: {
        id: {
          in: tagIds,
        },
      },
      select: { id: true },
    });

    if (existingTags.length !== tagIds.length) {
      throw new AdminPostValidationError({
        tagIds: missingTagMessage,
      });
    }
  }

  for (const tagName of input.newTagNames) {
    const slug = normalizeTaxonomySlug(tagName);
    const existingTag = await tx.tag.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingTag) {
      throw new AdminPostValidationError({
        newTagNames: duplicateTagMessage,
      });
    }

    const tag = await tx.tag.create({
      data: {
        name: tagName,
        slug,
      },
      select: { id: true },
    });
    tagIds.push(tag.id);
  }

  return Array.from(new Set(tagIds));
}

async function resolveSeriesInput(
  tx: TaxonomyWriteClient,
  input: CreatePostInput | EditPostInput,
) {
  if (input.newSeriesName.trim()) {
    const slug = normalizeTaxonomySlug(input.newSeriesName);
    const existingSeries = await tx.series.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existingSeries) {
      throw new AdminPostValidationError({
        newSeriesName: duplicateSeriesMessage,
      });
    }

    const series = await tx.series.create({
      data: {
        title: input.newSeriesName,
        slug,
      },
      select: { id: true },
    });

    return series.id;
  }

  if (!input.seriesId) {
    return null;
  }

  const series = await tx.series.findUnique({
    where: { id: input.seriesId },
    select: { id: true },
  });

  if (!series) {
    throw new AdminPostValidationError({
      seriesId: missingSeriesMessage,
    });
  }

  return series.id;
}

async function validateSeriesOrderAvailable(
  tx: TaxonomyWriteClient,
  seriesId: string | null,
  seriesOrder: number | null,
  currentPostId?: string,
) {
  if (!seriesId || seriesOrder === null) {
    return;
  }

  const existingPost = await tx.post.findFirst({
    where: {
      seriesId,
      seriesOrder,
      id: currentPostId
        ? {
            not: currentPostId,
          }
        : undefined,
    },
    select: { id: true },
  });

  if (existingPost) {
    throw new AdminPostValidationError({
      seriesOrder: duplicateSeriesOrderMessage,
    });
  }
}

async function replacePostTags(
  tx: TaxonomyWriteClient,
  postId: string,
  tagIds: string[],
) {
  await tx.postTag.deleteMany({
    where: { postId },
  });

  await Promise.all(
    tagIds.map((tagId) =>
      tx.postTag.create({
        data: {
          postId,
          tagId,
        },
      }),
    ),
  );
}

async function readPostTagIds(tx: TaxonomyWriteClient, postId: string) {
  const postTags = await tx.postTag.findMany({
    where: { postId },
    select: { tagId: true },
  });

  return postTags.map((postTag) => postTag.tagId);
}

function missingPostError(): never {
  throw new AdminPostValidationError({
    id: "文章不存在。",
  });
}

async function exposeReferencedMedia(
  tx: Parameters<typeof markMediaPublic>[0],
  post: {
    bodyMarkdown: string;
    coverImage: string | null;
  },
  exposedAt: Date,
) {
  try {
    await markMediaPublic(tx, post, exposedAt);
  } catch (error) {
    if (!(error instanceof ManagedMediaNotFoundError)) {
      throw error;
    }

    const missingIds = new Set(error.missingIds);
    const bodyMediaIds = collectManagedMediaIds({
      bodyMarkdown: post.bodyMarkdown,
      coverImage: null,
    });
    const coverMediaId = extractManagedMediaId(post.coverImage);
    const fieldErrors: {
      bodyMarkdown?: string;
      coverImage?: string;
    } = {};

    if (bodyMediaIds.some((id) => missingIds.has(id))) {
      fieldErrors.bodyMarkdown =
        "正文引用的站内图片不存在，请重新上传或移除后再发布。";
    }

    if (coverMediaId && missingIds.has(coverMediaId)) {
      fieldErrors.coverImage =
        "封面引用的站内图片不存在，请重新上传或移除后再发布。";
    }

    throw new AdminPostValidationError(fieldErrors);
  }
}

function isRecordWithCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

function mapPrismaWriteError(error: unknown): never {
  if (isRecordWithCode(error) && error.code === "P2002") {
    throw new AdminPostValidationError({
      slug: duplicateSlugMessage,
    });
  }

  throw error;
}

async function createDraftPost(input: unknown, adminEmail: string) {
  const parsedInput = parseCreatePostInput(input);
  await assertSlugAvailable(parsedInput.slug);

  try {
    const post = await prisma.$transaction(async (tx) => {
      const categoryId = await resolveCategoryInput(tx, parsedInput);
      const tagIds = await resolveTagInputs(tx, parsedInput);
      const seriesId = await resolveSeriesInput(tx, parsedInput);
      const seriesOrder = seriesId ? parsedInput.seriesOrder : null;

      await validateSeriesOrderAvailable(tx, seriesId, seriesOrder);

      const createdPost = await tx.post.create({
        data: {
          ...draftWriteData(parsedInput),
          categoryId,
          seriesId,
          seriesOrder,
        },
        select: postMutationSelect,
      });

      await replacePostTags(tx, createdPost.id, tagIds);

      return {
        ...createdPost,
        tagIds,
      };
    });

    return savedResponse("create", adminEmail, post, "草稿已保存");
  } catch (error) {
    mapPrismaWriteError(error);
  }
}

async function editDraftPost(input: unknown, adminEmail: string) {
  const parsedInput = parseEditPostInput(input);
  await assertSlugAvailable(parsedInput.slug, parsedInput.id);

  try {
    const { next, post, previous } = await prisma.$transaction(async (tx) => {
      const exposedAt = new Date();
      const previousPost = await tx.post.findUnique({
        where: {
          id: parsedInput.id,
        },
        select: publicPathSnapshotSelect,
      });

      if (!previousPost) {
        missingPostError();
      }

      const categoryId = await resolveCategoryInput(tx, parsedInput);
      const tagIds = await resolveTagInputs(tx, parsedInput);
      const seriesId = await resolveSeriesInput(tx, parsedInput);
      const seriesOrder = seriesId ? parsedInput.seriesOrder : null;

      await validateSeriesOrderAvailable(
        tx,
        seriesId,
        seriesOrder,
        parsedInput.id,
      );

      const updatedPost = await tx.post.update({
        where: {
          id: parsedInput.id,
        },
        data: {
          ...editablePostWriteData(parsedInput, previousPost),
          categoryId,
          seriesId,
          seriesOrder,
        },
        select: postMutationSelect,
      });

      if (
        updatedPost.status === PublicationStatus.PUBLISHED &&
        updatedPost.publishedAt
      ) {
        await exposeReferencedMedia(tx, updatedPost, exposedAt);
      }

      await replacePostTags(tx, updatedPost.id, tagIds);

      const nextPost = await tx.post.findUnique({
        where: {
          id: updatedPost.id,
        },
        select: publicPathSnapshotSelect,
      });

      if (!nextPost) {
        missingPostError();
      }

      return {
        next: nextPost,
        post: {
          ...updatedPost,
          tagIds,
        },
        previous: previousPost,
      };
    });

    revalidatePublicPostPaths(previous, next);

    return savedResponse(
      "edit",
      adminEmail,
      post,
      post.status === PublicationStatus.PUBLISHED ? "文章已保存" : "草稿已保存",
    );
  } catch (error) {
    if (isRecordWithCode(error) && error.code === "P2025") {
      missingPostError();
    }

    mapPrismaWriteError(error);
  }
}

async function deleteDraftPost(input: unknown, adminEmail: string) {
  const parsedInput = parseDeletePostInput(input);

  try {
    const previous = await prisma.post.findUnique({
      where: { id: parsedInput.id },
      select: publicPathSnapshotSelect,
    });

    if (!previous) {
      missingPostError();
    }

    await prisma.post.delete({
      where: {
        id: parsedInput.id,
      },
    });
    revalidatePublicPostPaths(previous, null);
  } catch (error) {
    if (isRecordWithCode(error) && error.code === "P2025") {
      missingPostError();
    }

    throw error;
  }

  return {
    operation: "delete",
    status: "deleted",
    adminEmail,
    message: "草稿已删除",
    id: parsedInput.id,
  } satisfies AdminPostDeletedResult;
}

async function mutatePostPublicationState({
  adminEmail,
  input,
  message,
  operation,
  parseInput,
  status,
  updateData,
}: {
  adminEmail: string;
  input: unknown;
  message: string;
  operation: AdminPostPublicationResult["operation"];
  parseInput: (input: unknown) => { id: string };
  status: AdminPostPublicationResult["status"];
  updateData: (current: PublicPostPathSnapshot, exposedAt: Date) => {
    status?: PublicationStatus;
    publishedAt?: Date | string | null;
    featured?: boolean;
  };
}) {
  const parsedInput = parseInput(input);

  try {
    const { next, post, previous } = await prisma.$transaction(async (tx) => {
      const exposedAt = new Date();
      const previousPost = await tx.post.findUnique({
        where: {
          id: parsedInput.id,
        },
        select: publicPathSnapshotSelect,
      });

      if (!previousPost) {
        missingPostError();
      }

      const updatedPost = await tx.post.update({
        where: {
          id: parsedInput.id,
        },
        data: updateData(previousPost, exposedAt),
        select: postMutationSelect,
      });

      if (
        updatedPost.status === PublicationStatus.PUBLISHED &&
        updatedPost.publishedAt
      ) {
        await exposeReferencedMedia(tx, updatedPost, exposedAt);
      }

      const tagIds = await readPostTagIds(tx, updatedPost.id);
      const nextPost = await tx.post.findUnique({
        where: {
          id: updatedPost.id,
        },
        select: publicPathSnapshotSelect,
      });

      if (!nextPost) {
        missingPostError();
      }

      return {
        next: nextPost,
        post: {
          ...updatedPost,
          tagIds,
        },
        previous: previousPost,
      };
    });

    revalidatePublicPostPaths(previous, next);

    return publicationResponse({
      operation,
      status,
      message,
      adminEmail,
      post,
    });
  } catch (error) {
    if (isRecordWithCode(error) && error.code === "P2025") {
      missingPostError();
    }

    throw error;
  }
}

async function publishPost(input: unknown, adminEmail: string) {
  return mutatePostPublicationState({
    adminEmail,
    input,
    message: "文章已发布",
    operation: "publish",
    parseInput: parsePublishPostInput,
    status: "published",
    updateData: (current, exposedAt) => ({
      status: PublicationStatus.PUBLISHED,
      publishedAt: current.publishedAt ?? exposedAt,
    }),
  });
}

async function unpublishPost(input: unknown, adminEmail: string) {
  return mutatePostPublicationState({
    adminEmail,
    input,
    message: "文章已取消发布",
    operation: "unpublish",
    parseInput: parseUnpublishPostInput,
    status: "unpublished",
    updateData: () => ({
      status: PublicationStatus.DRAFT,
    }),
  });
}

async function featurePost(input: unknown, adminEmail: string) {
  return mutatePostPublicationState({
    adminEmail,
    input,
    message: "文章已设为精选",
    operation: "feature",
    parseInput: parseFeaturePostInput,
    status: "featured",
    updateData: () => ({
      featured: true,
    }),
  });
}

async function unfeaturePost(input: unknown, adminEmail: string) {
  return mutatePostPublicationState({
    adminEmail,
    input,
    message: "文章已取消精选",
    operation: "unfeature",
    parseInput: parseUnfeaturePostInput,
    status: "unfeatured",
    updateData: () => ({
      featured: false,
    }),
  });
}

export async function runGuardedPostMutation(
  operation: AdminPostOperation,
  readInput: LazyInputReader = readEmptyAdminPostInput,
): Promise<AdminPostMutationResult> {
  const adminSession = await requireAdmin();

  const input = await readAdminPostInput(readInput);

  if (operation === "publish") {
    return publishPost(input, adminSession.email);
  }

  if (operation === "unpublish") {
    return unpublishPost(input, adminSession.email);
  }

  if (operation === "feature") {
    return featurePost(input, adminSession.email);
  }

  if (operation === "unfeature") {
    return unfeaturePost(input, adminSession.email);
  }

  if (operation === "create") {
    return createDraftPost(input, adminSession.email);
  }

  if (operation === "edit") {
    return editDraftPost(input, adminSession.email);
  }

  return deleteDraftPost(input, adminSession.email);
}

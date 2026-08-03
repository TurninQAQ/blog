import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  markMediaPublic: vi.fn(),
  requireAdmin: vi.fn(),
  revalidate: vi.fn(),
  prisma: {
    $transaction: vi.fn(),
    post: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/media/media-service", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/media/media-service")
  >();

  return {
    ...original,
    markMediaPublic: mocks.markMediaPublic,
  };
});
vi.mock("@/lib/public/revalidate", () => ({
  revalidatePublicPostPaths: mocks.revalidate,
}));

import { PublicationStatus } from "@/generated/prisma/enums";
import { AdminPostValidationError } from "@/lib/admin/post-input";
import { ManagedMediaNotFoundError } from "@/lib/media/media-service";
import { runGuardedPostMutation } from "./post-mutations";

const mediaId = "cm1234567890abcdefghijklm";
const publishedAt = new Date("2026-01-01T00:00:00.000Z");
const now = new Date("2026-07-12T08:00:00.000Z");

function pathSnapshot(status = PublicationStatus.PUBLISHED) {
  return {
    slug: "published-post",
    status,
    publishedAt: status === PublicationStatus.PUBLISHED ? publishedAt : null,
    featured: false,
    category: null,
    series: null,
    tags: [],
  };
}

function mutationPost(
  status = PublicationStatus.PUBLISHED,
  bodyMarkdown = `![asset](/media/${mediaId}.webp)`,
  coverImage: string | null = null,
) {
  return {
    id: "post-1",
    title: "Published post",
    slug: "published-post",
    status,
    updatedAt: now,
    publishedAt: status === PublicationStatus.PUBLISHED ? publishedAt : null,
    featured: false,
    categoryId: null,
    seriesId: null,
    seriesOrder: null,
    bodyMarkdown,
    coverImage,
  };
}

function transactionWithPost(updatedPost: ReturnType<typeof mutationPost>) {
  const findUnique = vi
    .fn()
    .mockResolvedValueOnce(pathSnapshot())
    .mockResolvedValueOnce(pathSnapshot());
  const tx = {
    category: { findUnique: vi.fn(), create: vi.fn() },
    tag: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    series: { findUnique: vi.fn(), create: vi.fn() },
    post: {
      findUnique,
      findFirst: vi.fn(),
      update: vi.fn().mockResolvedValue(updatedPost),
    },
    postTag: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    mediaAsset: {},
  };

  mocks.prisma.$transaction.mockImplementation(
    async (action: (client: typeof tx) => Promise<unknown>) => action(tx),
  );

  return tx;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.resetAllMocks();
  mocks.requireAdmin.mockResolvedValue({
    adminUserId: "admin-1",
    email: "admin@example.com",
  });
  mocks.prisma.post.findUnique.mockResolvedValue(null);
  mocks.markMediaPublic.mockResolvedValue(1);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("managed media publication transaction", () => {
  it("surfaces missing body and cover assets as field errors and skips revalidation", async () => {
    const updatedPost = mutationPost(
      PublicationStatus.PUBLISHED,
      `![asset](/media/${mediaId}.webp)`,
      `/media/${mediaId}.webp`,
    );
    transactionWithPost(updatedPost);
    mocks.markMediaPublic.mockRejectedValue(
      new ManagedMediaNotFoundError([mediaId]),
    );

    let error: unknown;
    try {
      await runGuardedPostMutation("publish", async () => ({ id: "post-1" }));
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(AdminPostValidationError);
    expect((error as AdminPostValidationError).fieldErrors).toEqual({
      bodyMarkdown:
        "正文引用的站内图片不存在，请重新上传或移除后再发布。",
      coverImage:
        "封面引用的站内图片不存在，请重新上传或移除后再发布。",
    });
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });

  it("uses one current exposure time when editing a historically published post", async () => {
    const updatedPost = mutationPost();
    transactionWithPost(updatedPost);

    await runGuardedPostMutation("edit", async () => ({
      id: "post-1",
      title: "Published post",
      slug: "published-post",
      excerpt: "",
      bodyMarkdown: updatedPost.bodyMarkdown,
      coverImage: null,
      featured: false,
      categoryId: null,
      newCategoryName: "",
      tagIds: [],
      newTagNames: [],
      seriesId: null,
      newSeriesName: "",
      seriesOrder: null,
    }));

    expect(mocks.markMediaPublic).toHaveBeenCalledWith(
      expect.any(Object),
      updatedPost,
      now,
    );
    expect(mocks.markMediaPublic.mock.calls[0][2]).not.toEqual(publishedAt);
    expect(mocks.revalidate).toHaveBeenCalledOnce();
  });
});

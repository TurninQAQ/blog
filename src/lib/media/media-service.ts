import "server-only";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";

import type { IngestedMediaImage } from "./image-ingest";
import { collectManagedMediaIds } from "./media-url";

export const MEDIA_STORAGE_QUOTA_BYTES = 512 * 1024 * 1024;
export const PRIVATE_MEDIA_GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
export const PRIVATE_MEDIA_RECLAIM_BATCH_SIZE = 25;

const MAX_SERIALIZABLE_ATTEMPTS = 3;

export type MediaAssetClient = Pick<Prisma.TransactionClient, "mediaAsset">;
export type MediaStoreClient = Pick<PrismaClient, "$transaction">;
export type MediaReclaimClient = Pick<PrismaClient, "$transaction">;

type MediaStorageStatus = 503 | 507;

export class MediaStorageBoundaryError extends Error {
  status: MediaStorageStatus;

  constructor(message: string, status: MediaStorageStatus) {
    super(message);
    this.name = "MediaStorageBoundaryError";
    this.status = status;
  }
}

export class ManagedMediaNotFoundError extends Error {
  missingIds: string[];

  constructor(missingIds: string[]) {
    super("Referenced managed media does not exist.");
    this.name = "ManagedMediaNotFoundError";
    this.missingIds = missingIds;
  }
}

const storedMediaSelect = {
  id: true,
  mimeType: true,
  byteLength: true,
  width: true,
  height: true,
  publicAt: true,
  createdAt: true,
} as const;

function isSerializableRetry(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code?: unknown }).code === "P2002" ||
      (error as { code?: unknown }).code === "P2034")
  );
}

async function runSerializableTransaction<T>(
  client: MediaStoreClient | MediaReclaimClient,
  action: (tx: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 1; attempt <= MAX_SERIALIZABLE_ATTEMPTS; attempt += 1) {
    try {
      return await client.$transaction(action, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (!isSerializableRetry(error) || attempt === MAX_SERIALIZABLE_ATTEMPTS) {
        throw error;
      }
    }
  }

  throw new Error("Unreachable serializable transaction state.");
}

export async function storeMediaAsset(
  client: MediaStoreClient,
  image: IngestedMediaImage,
) {
  try {
    return await runSerializableTransaction(client, async (tx) => {
      const existing = await tx.mediaAsset.findUnique({
        where: { sha256: image.sha256 },
        select: storedMediaSelect,
      });

      if (existing) {
        return existing;
      }

      const aggregate = await tx.mediaAsset.aggregate({
        _sum: { byteLength: true },
      });
      const storedBytes = aggregate._sum.byteLength ?? 0;

      if (storedBytes + image.byteLength > MEDIA_STORAGE_QUOTA_BYTES) {
        throw new MediaStorageBoundaryError(
          "媒体存储空间已达到 512 MiB 上限。",
          507,
        );
      }

      return tx.mediaAsset.create({
        data: image,
        select: storedMediaSelect,
      });
    });
  } catch (error) {
    if (error instanceof MediaStorageBoundaryError) {
      throw error;
    }

    if (isSerializableRetry(error)) {
      throw new MediaStorageBoundaryError(
        "媒体存储正忙，请稍后重试。",
        503,
      );
    }

    throw error;
  }
}

export async function markMediaPublic(
  client: MediaAssetClient,
  post: {
    bodyMarkdown: string;
    coverImage: string | null;
  },
  exposedAt: Date,
) {
  const mediaIds = collectManagedMediaIds(post);

  if (mediaIds.length === 0) {
    return 0;
  }

  const existingMedia = await client.mediaAsset.findMany({
    where: { id: { in: mediaIds } },
    select: { id: true, publicAt: true },
  });
  const existingIds = new Set(existingMedia.map((media) => media.id));
  const missingIds = mediaIds.filter((id) => !existingIds.has(id));

  if (missingIds.length > 0) {
    throw new ManagedMediaNotFoundError(missingIds);
  }

  const privateIds = existingMedia
    .filter((media) => media.publicAt === null)
    .map((media) => media.id);

  if (privateIds.length === 0) {
    return 0;
  }

  const result = await client.mediaAsset.updateMany({
    where: {
      id: { in: privateIds },
      publicAt: null,
    },
    data: { publicAt: exposedAt },
  });

  if (result.count !== privateIds.length) {
    const currentMedia = await client.mediaAsset.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, publicAt: true },
    });
    const currentIds = new Set(currentMedia.map((media) => media.id));
    const concurrentlyMissingIds = mediaIds.filter(
      (id) => !currentIds.has(id),
    );

    if (concurrentlyMissingIds.length > 0) {
      throw new ManagedMediaNotFoundError(concurrentlyMissingIds);
    }

    if (currentMedia.some((media) => media.publicAt === null)) {
      throw new Error("Managed media exposure did not reach a public state.");
    }
  }

  return result.count;
}

export async function reclaimAbandonedPrivateMedia(
  client: MediaReclaimClient,
  now = new Date(),
) {
  const cutoff = new Date(now.getTime() - PRIVATE_MEDIA_GRACE_PERIOD_MS);

  return runSerializableTransaction(client, async (tx) => {
    const candidates = await tx.mediaAsset.findMany({
      where: {
        publicAt: null,
        createdAt: { lt: cutoff },
      },
      orderBy: { createdAt: "asc" },
      take: PRIVATE_MEDIA_RECLAIM_BATCH_SIZE,
      select: { id: true },
    });

    if (candidates.length === 0) {
      return 0;
    }

    const posts = await tx.post.findMany({
      select: {
        bodyMarkdown: true,
        coverImage: true,
      },
    });
    const referencedIds = new Set(
      posts.flatMap(collectManagedMediaIds),
    );
    const unreferencedIds = candidates
      .map(({ id }) => id)
      .filter((id) => !referencedIds.has(id));

    if (unreferencedIds.length === 0) {
      return 0;
    }

    const result = await tx.mediaAsset.deleteMany({
      where: {
        id: { in: unreferencedIds },
        publicAt: null,
        createdAt: { lt: cutoff },
      },
    });

    return result.count;
  });
}

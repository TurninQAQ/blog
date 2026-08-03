import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  MEDIA_STORAGE_QUOTA_BYTES,
  PRIVATE_MEDIA_RECLAIM_BATCH_SIZE,
  MediaStorageBoundaryError,
  markMediaPublic,
  reclaimAbandonedPrivateMedia,
  storeMediaAsset,
  type MediaAssetClient,
  type MediaReclaimClient,
  type MediaStoreClient,
} from "./media-service";

const mediaId = "cm1234567890abcdefghijklm";
const secondMediaId = "cm1234567890abcdefghijkln";
const thirdMediaId = "cm1234567890abcdefghijklo";
const image = {
  data: Uint8Array.from([1, 2, 3, 4]),
  mimeType: "image/webp" as const,
  byteLength: 4,
  width: 2,
  height: 2,
  sha256: "a".repeat(64),
};

function storedMedia(id = mediaId) {
  return {
    id,
    mimeType: "image/webp",
    byteLength: 4,
    width: 2,
    height: 2,
    publicAt: null,
    createdAt: new Date("2026-07-11T00:00:00.000Z"),
  };
}

function transactionClient(tx: object) {
  const transaction = vi.fn(
    async (action: (transaction: object) => Promise<unknown>) => action(tx),
  );

  return {
    client: { $transaction: transaction } as unknown as MediaStoreClient,
    transaction,
  };
}

describe("storeMediaAsset", () => {
  it("deduplicates normalized bytes before charging the persistent quota", async () => {
    const findUnique = vi.fn().mockResolvedValue(storedMedia());
    const aggregate = vi.fn();
    const create = vi.fn();
    const { client, transaction } = transactionClient({
      mediaAsset: { findUnique, aggregate, create },
    });

    await expect(storeMediaAsset(client, image)).resolves.toMatchObject({
      id: mediaId,
    });

    expect(aggregate).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(transaction).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ isolationLevel: "Serializable" }),
    );
  });

  it("rejects a new asset when total database bytes would exceed quota", async () => {
    const create = vi.fn();
    const { client } = transactionClient({
      mediaAsset: {
        findUnique: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({
          _sum: {
            byteLength: MEDIA_STORAGE_QUOTA_BYTES - image.byteLength + 1,
          },
        }),
        create,
      },
    });

    await expect(storeMediaAsset(client, image)).rejects.toBeInstanceOf(
      MediaStorageBoundaryError,
    );
    await expect(storeMediaAsset(client, image)).rejects.toMatchObject({
      status: 507,
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("stores a new asset below quota", async () => {
    const create = vi.fn().mockResolvedValue(storedMedia());
    const { client } = transactionClient({
      mediaAsset: {
        findUnique: vi.fn().mockResolvedValue(null),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { byteLength: MEDIA_STORAGE_QUOTA_BYTES - image.byteLength },
        }),
        create,
      },
    });

    await expect(storeMediaAsset(client, image)).resolves.toMatchObject({
      id: mediaId,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: image }),
    );
  });
});

describe("markMediaPublic", () => {
  it("validates all referenced IDs and exposes only null publicAt rows", async () => {
    const alreadyPublicAt = new Date("2026-07-10T01:02:03.000Z");
    const findMany = vi.fn().mockResolvedValue([
      { id: mediaId, publicAt: null },
      { id: secondMediaId, publicAt: alreadyPublicAt },
    ]);
    const updateMany = vi.fn().mockResolvedValue({ count: 1 });
    const client = {
      mediaAsset: { findMany, updateMany },
    } as unknown as MediaAssetClient;
    const exposedAt = new Date("2026-07-11T01:02:03.000Z");

    await expect(
      markMediaPublic(
        client,
        {
          bodyMarkdown: `![asset](/media/${mediaId}.webp)`,
          coverImage: `/media/${secondMediaId}.webp`,
        },
        exposedAt,
      ),
    ).resolves.toBe(1);

    expect(findMany).toHaveBeenCalledWith({
      where: { id: { in: [secondMediaId, mediaId] } },
      select: { id: true, publicAt: true },
    });
    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: [mediaId] },
        publicAt: null,
      },
      data: { publicAt: exposedAt },
    });
  });

  it("fails before exposure when any referenced asset is missing", async () => {
    const updateMany = vi.fn();
    const client = {
      mediaAsset: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: mediaId, publicAt: null }]),
        updateMany,
      },
    } as unknown as MediaAssetClient;

    await expect(
      markMediaPublic(
        client,
        {
          bodyMarkdown: `![asset](/media/${mediaId}.webp)`,
          coverImage: `/media/${secondMediaId}.webp`,
        },
        new Date(),
      ),
    ).rejects.toMatchObject({
      missingIds: [secondMediaId],
    });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("fails when reclamation deletes a private row between validation and exposure", async () => {
    const findMany = vi
      .fn()
      .mockResolvedValueOnce([{ id: mediaId, publicAt: null }])
      .mockResolvedValueOnce([]);
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });

    await expect(
      markMediaPublic(
        {
          mediaAsset: { findMany, updateMany },
        } as unknown as MediaAssetClient,
        {
          bodyMarkdown: `![asset](/media/${mediaId}.webp)`,
          coverImage: null,
        },
        new Date(),
      ),
    ).rejects.toMatchObject({ missingIds: [mediaId] });
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it("continues safely when another publisher exposes the row first", async () => {
    const concurrentPublicAt = new Date("2026-07-11T01:02:02.000Z");
    const findMany = vi
      .fn()
      .mockResolvedValueOnce([{ id: mediaId, publicAt: null }])
      .mockResolvedValueOnce([
        { id: mediaId, publicAt: concurrentPublicAt },
      ]);
    const updateMany = vi.fn().mockResolvedValue({ count: 0 });

    await expect(
      markMediaPublic(
        {
          mediaAsset: { findMany, updateMany },
        } as unknown as MediaAssetClient,
        {
          bodyMarkdown: `![asset](/media/${mediaId}.webp)`,
          coverImage: null,
        },
        new Date(),
      ),
    ).resolves.toBe(0);
    expect(findMany).toHaveBeenCalledTimes(2);
  });

  it("does not issue a query when a post references no managed asset", async () => {
    const findMany = vi.fn();
    const updateMany = vi.fn();

    await expect(
      markMediaPublic(
        { mediaAsset: { findMany, updateMany } } as unknown as MediaAssetClient,
        {
          bodyMarkdown: "![external](https://example.com/image.webp)",
          coverImage: null,
        },
        new Date(),
      ),
    ).resolves.toBe(0);
    expect(findMany).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });
});

describe("reclaimAbandonedPrivateMedia", () => {
  it("deletes only old private candidates that no post or draft references", async () => {
    const findManyMedia = vi.fn().mockResolvedValue([
      { id: mediaId },
      { id: secondMediaId },
    ]);
    const findManyPosts = vi.fn().mockResolvedValue([
      {
        bodyMarkdown: `![kept](/media/${mediaId}.webp)`,
        coverImage: null,
      },
    ]);
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const { client } = transactionClient({
      mediaAsset: {
        findMany: findManyMedia,
        deleteMany,
      },
      post: { findMany: findManyPosts },
    });

    await expect(
      reclaimAbandonedPrivateMedia(
        client as unknown as MediaReclaimClient,
        new Date("2026-07-12T00:00:00.000Z"),
      ),
    ).resolves.toBe(1);

    expect(findManyMedia).toHaveBeenCalledWith(
      expect.objectContaining({
        take: PRIVATE_MEDIA_RECLAIM_BATCH_SIZE,
        where: expect.objectContaining({ publicAt: null }),
      }),
    );
    expect(findManyPosts).toHaveBeenCalledWith({
      select: {
        bodyMarkdown: true,
        coverImage: true,
      },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [secondMediaId] },
        publicAt: null,
        createdAt: expect.objectContaining({ lt: expect.any(Date) }),
      },
    });
  });

  it("does not delete public or referenced candidates", async () => {
    const deleteMany = vi.fn();
    const { client } = transactionClient({
      mediaAsset: {
        findMany: vi.fn().mockResolvedValue([{ id: mediaId }]),
        deleteMany,
      },
      post: {
        findMany: vi.fn().mockResolvedValue([
          {
            bodyMarkdown: "draft body",
            coverImage: `/media/${mediaId}.webp`,
          },
        ]),
      },
    });

    await expect(
      reclaimAbandonedPrivateMedia(
        client as unknown as MediaReclaimClient,
      ),
    ).resolves.toBe(0);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("keeps references whose Markdown destinations use decimal or hexadecimal entities", async () => {
    const deleteMany = vi.fn();
    const findManyPosts = vi.fn().mockResolvedValue([
      {
        bodyMarkdown: [
          `![decimal](/media/${mediaId}&#46;webp)`,
          `![hexadecimal](/media/${secondMediaId}&#x2e;webp)`,
        ].join("\n\n"),
        coverImage: null,
      },
    ]);
    const { client } = transactionClient({
      mediaAsset: {
        findMany: vi.fn().mockResolvedValue([
          { id: mediaId },
          { id: secondMediaId },
        ]),
        deleteMany,
      },
      post: { findMany: findManyPosts },
    });

    await expect(
      reclaimAbandonedPrivateMedia(
        client as unknown as MediaReclaimClient,
      ),
    ).resolves.toBe(0);
    expect(findManyPosts).toHaveBeenCalledWith({
      select: {
        bodyMarkdown: true,
        coverImage: true,
      },
    });
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("still deletes an unreferenced candidate when encoded references exist", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const { client } = transactionClient({
      mediaAsset: {
        findMany: vi.fn().mockResolvedValue([
          { id: mediaId },
          { id: secondMediaId },
          { id: thirdMediaId },
        ]),
        deleteMany,
      },
      post: {
        findMany: vi.fn().mockResolvedValue([
          {
            bodyMarkdown: [
              `![decimal](/media/${mediaId}&#46;webp)`,
              `![hexadecimal](/media/${secondMediaId}&#x2E;webp)`,
            ].join("\n\n"),
            coverImage: null,
          },
        ]),
      },
    });

    await expect(
      reclaimAbandonedPrivateMedia(
        client as unknown as MediaReclaimClient,
      ),
    ).resolves.toBe(1);
    expect(deleteMany).toHaveBeenCalledWith({
      where: {
        id: { in: [thirdMediaId] },
        publicAt: null,
        createdAt: expect.objectContaining({ lt: expect.any(Date) }),
      },
    });
  });
});

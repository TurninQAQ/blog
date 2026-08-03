import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  requireAdmin: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: { mediaAsset: { findUnique: mocks.findUnique } },
}));
vi.mock("@/lib/auth/admin", () => ({
  UnauthorizedAdminError: class UnauthorizedAdminError extends Error {},
  requireAdmin: mocks.requireAdmin,
}));

import { UnauthorizedAdminError } from "@/lib/auth/admin";
import { GET } from "./route";

const id = "cm1234567890abcdefghijklm";
const context = { params: Promise.resolve({ mediaId: `${id}.webp` }) };

function media(publicAt: Date | null) {
  return {
    id,
    mimeType: "image/webp",
    byteLength: 3,
    width: 10,
    height: 8,
    sha256: "a".repeat(64),
    publicAt,
  };
}

function mockStoredMedia(publicAt: Date | null) {
  mocks.findUnique
    .mockResolvedValueOnce(media(publicAt))
    .mockResolvedValueOnce({ data: Uint8Array.from([1, 2, 3]) });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /media/[mediaId]", () => {
  it("serves public media immutably with ETag and nosniff", async () => {
    mockStoredMedia(new Date());

    const response = await GET(
      new Request(`http://localhost/media/${id}.webp`),
      context,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=31536000, immutable",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("etag")).toBe(`\"${"a".repeat(64)}\"`);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      Uint8Array.from([1, 2, 3]),
    );
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it("returns 304 for a matching public ETag", async () => {
    mocks.findUnique.mockResolvedValue(media(new Date()));

    const response = await GET(
      new Request(`http://localhost/media/${id}.webp`, {
        headers: { "if-none-match": `\"${"a".repeat(64)}\"` },
      }),
      context,
    );

    expect(response.status).toBe(304);
    expect(await response.text()).toBe("");
    expect(mocks.findUnique).toHaveBeenCalledTimes(1);
  });

  it("serves a private asset only to an authenticated admin with no-store", async () => {
    mockStoredMedia(null);
    mocks.requireAdmin.mockResolvedValue({ email: "admin@example.com" });

    const response = await GET(
      new Request(`http://localhost/media/${id}.webp`),
      context,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("etag")).toBeNull();
  });

  it("returns the same empty 404 for anonymous private, missing and malformed IDs", async () => {
    mocks.findUnique.mockResolvedValue(media(null));
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedAdminError());

    const privateResponse = await GET(
      new Request(`http://localhost/media/${id}.webp`),
      context,
    );
    mocks.findUnique.mockResolvedValue(null);
    const missingResponse = await GET(
      new Request(`http://localhost/media/${id}.webp`),
      context,
    );
    const malformedResponse = await GET(
      new Request("http://localhost/media/not-a-cuid.webp"),
      { params: Promise.resolve({ mediaId: "not-a-cuid.webp" }) },
    );

    for (const response of [
      privateResponse,
      missingResponse,
      malformedResponse,
    ]) {
      expect(response.status).toBe(404);
      expect(await response.text()).toBe("");
    }
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  csrf: vi.fn(),
  requireAdmin: vi.fn(),
  enforceRateLimit: vi.fn(),
  runWithDecodePermit: vi.fn(),
  ingest: vi.fn(),
  reclaim: vi.fn(),
  store: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/csrf", () => ({
  rejectCrossOriginAdminRequest: mocks.csrf,
}));
vi.mock("@/lib/auth/admin", () => ({
  UnauthorizedAdminError: class UnauthorizedAdminError extends Error {},
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/lib/media/image-ingest", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/media/image-ingest")
  >();

  return {
    ...original,
    ingestMediaImage: mocks.ingest,
  };
});
vi.mock("@/lib/media/media-guard", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/media/media-guard")
  >();

  return {
    ...original,
    enforceMediaUploadRateLimit: mocks.enforceRateLimit,
    runWithMediaDecodePermit: mocks.runWithDecodePermit,
  };
});
vi.mock("@/lib/media/media-service", async (importOriginal) => {
  const original = await importOriginal<
    typeof import("@/lib/media/media-service")
  >();

  return {
    ...original,
    reclaimAbandonedPrivateMedia: mocks.reclaim,
    storeMediaAsset: mocks.store,
  };
});
vi.mock("@/lib/db/prisma", () => ({ prisma: {} }));

import { UnauthorizedAdminError } from "@/lib/auth/admin";
import { MediaImageError } from "@/lib/media/image-ingest";
import { MediaUploadBoundaryError } from "@/lib/media/media-guard";
import { MediaStorageBoundaryError } from "@/lib/media/media-service";
import { POST } from "./route";

async function multipartRequest() {
  const form = new FormData();
  form.set(
    "file",
    new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "note.png", {
      type: "image/png",
    }),
  );
  const encoded = new Request("http://localhost", {
    method: "POST",
    body: form,
  });
  const body = await encoded.arrayBuffer();
  const headers = new Headers(encoded.headers);
  headers.set("content-length", String(body.byteLength));
  headers.set("origin", "http://localhost");

  return new Request("http://localhost/api/admin/media", {
    method: "POST",
    headers,
    body,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.csrf.mockReturnValue(null);
  mocks.requireAdmin.mockResolvedValue({
    adminUserId: "admin-1",
    email: "admin@example.com",
  });
  mocks.runWithDecodePermit.mockImplementation(
    (decode: () => Promise<unknown>) => decode(),
  );
  mocks.reclaim.mockResolvedValue(0);
  mocks.ingest.mockResolvedValue({
    data: Uint8Array.from([1, 2, 3]),
    mimeType: "image/webp",
    byteLength: 3,
    width: 10,
    height: 8,
    sha256: "a".repeat(64),
  });
  mocks.store.mockResolvedValue({
    id: "cm1234567890abcdefghijklm",
    mimeType: "image/webp",
    byteLength: 3,
    width: 10,
    height: 8,
    publicAt: null,
    createdAt: new Date(),
  });
});

describe("POST /api/admin/media", () => {
  it("checks CSRF and admin auth before parsing and storing an upload", async () => {
    const response = await POST(await multipartRequest());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      id: "cm1234567890abcdefghijklm",
      url: "/media/cm1234567890abcdefghijklm.webp",
      mimeType: "image/webp",
      width: 10,
      height: 8,
    });
    expect(mocks.csrf).toHaveBeenCalledOnce();
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith("admin-1");
    expect(mocks.reclaim).toHaveBeenCalledOnce();
    expect(mocks.runWithDecodePermit).toHaveBeenCalledOnce();
    expect(mocks.ingest).toHaveBeenCalledOnce();
    expect(mocks.store).toHaveBeenCalledOnce();
    expect(mocks.requireAdmin.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.enforceRateLimit.mock.invocationCallOrder[0],
    );
    expect(mocks.enforceRateLimit.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.ingest.mock.invocationCallOrder[0],
    );
  });

  it("stops at CSRF before admin auth or upload parsing", async () => {
    mocks.csrf.mockReturnValue(new Response("forbidden", { status: 403 }));

    const response = await POST(
      new Request("http://localhost/api/admin/media", { method: "POST" }),
    );

    expect(response.status).toBe(403);
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
    expect(mocks.ingest).not.toHaveBeenCalled();
  });

  it("stops at admin auth before trusting upload headers", async () => {
    mocks.requireAdmin.mockRejectedValue(new UnauthorizedAdminError());

    const response = await POST(
      new Request("http://localhost/api/admin/media", { method: "POST" }),
    );

    expect(response.status).toBe(401);
    expect(mocks.ingest).not.toHaveBeenCalled();
  });

  it("rejects a non-multipart authenticated request", async () => {
    const response = await POST(
      new Request("http://localhost/api/admin/media", {
        method: "POST",
        headers: {
          "content-length": "2",
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );

    expect(response.status).toBe(415);
    expect(mocks.ingest).not.toHaveBeenCalled();
  });

  it("maps the authenticated per-admin rate boundary before decoding", async () => {
    mocks.enforceRateLimit.mockImplementation(() => {
      throw new MediaUploadBoundaryError(
        "图片上传过于频繁，请稍后重试。",
        429,
        17,
      );
    });

    const response = await POST(await multipartRequest());

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("17");
    expect(mocks.ingest).not.toHaveBeenCalled();
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it("maps image validation failures without storing bytes", async () => {
    mocks.ingest.mockRejectedValue(
      new MediaImageError("图片内容无效。", 400),
    );

    const response = await POST(await multipartRequest());

    expect(response.status).toBe(400);
    expect(mocks.store).not.toHaveBeenCalled();
  });

  it("maps persistent storage quota failures without exposing internals", async () => {
    mocks.store.mockRejectedValue(
      new MediaStorageBoundaryError(
        "媒体存储空间已达到 512 MiB 上限。",
        507,
      ),
    );

    const response = await POST(await multipartRequest());

    expect(response.status).toBe(507);
    await expect(response.json()).resolves.toEqual({
      error: "媒体存储空间已达到 512 MiB 上限。",
    });
  });
});

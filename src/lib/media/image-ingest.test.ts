import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  MAX_IMAGE_INPUT_BYTES,
  MediaImageError,
  ingestMediaImage,
} from "./image-ingest";

async function createPng(width = 16, height = 12) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 16, g: 90, b: 140, alpha: 0.75 },
    },
  })
    .png()
    .toBuffer();
}

describe("ingestMediaImage", () => {
  it("decodes, bounds, strips metadata and emits a WebP digest", async () => {
    const input = await sharp({
      create: {
        width: 3200,
        height: 1600,
        channels: 3,
        background: "#2563eb",
      },
    })
      .jpeg()
      .withMetadata({ orientation: 1 })
      .toBuffer();

    const result = await ingestMediaImage(input, "image/jpeg");
    const metadata = await sharp(result.data).metadata();

    expect(result.mimeType).toBe("image/webp");
    expect(result.width).toBe(2560);
    expect(result.height).toBe(1280);
    expect(result.byteLength).toBe(result.data.byteLength);
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(metadata.format).toBe("webp");
    expect(metadata.exif).toBeUndefined();
    expect(metadata.icc).toBeUndefined();
    expect(metadata.xmp).toBeUndefined();
  });

  it("rejects an oversized input before decoding", async () => {
    const oversized = Buffer.alloc(MAX_IMAGE_INPUT_BYTES + 1);

    await expect(
      ingestMediaImage(oversized, "image/png"),
    ).rejects.toMatchObject({ status: 413 });
  });

  it.each([
    ["image/svg+xml", Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>")],
    ["image/gif", Buffer.from("GIF89a", "ascii")],
  ])("rejects unsupported %s input", async (mimeType, input) => {
    await expect(ingestMediaImage(input, mimeType)).rejects.toBeInstanceOf(
      MediaImageError,
    );
  });

  it("rejects a declared MIME type that disagrees with magic bytes", async () => {
    const png = await createPng();

    await expect(ingestMediaImage(png, "image/jpeg")).rejects.toMatchObject({
      status: 400,
    });
  });

  it("rejects corrupt data even when its signature and MIME look valid", async () => {
    const corruptPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
    ]);

    await expect(
      ingestMediaImage(corruptPng, "image/png"),
    ).rejects.toBeInstanceOf(MediaImageError);
  });

  it("rejects an image whose edge exceeds 8192 pixels", async () => {
    const png = await createPng(8193, 1);

    await expect(ingestMediaImage(png, "image/png")).rejects.toMatchObject({
      status: 400,
    });
  });
});

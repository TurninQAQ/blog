import "server-only";

import { createHash } from "node:crypto";

import sharp from "sharp";

export const MAX_IMAGE_INPUT_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_OUTPUT_BYTES = 5 * 1024 * 1024;
export const MAX_IMAGE_EDGE = 8192;
export const MAX_IMAGE_PIXELS = 25_000_000;
export const MAX_IMAGE_OUTPUT_EDGE = 2560;

const supportedMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;

type SupportedMimeType = (typeof supportedMimeTypes)[number];
type SupportedImageFormat = "jpeg" | "png" | "webp";

const formatByMimeType: Record<SupportedMimeType, SupportedImageFormat> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export type IngestedMediaImage = {
  data: Uint8Array<ArrayBuffer>;
  mimeType: "image/webp";
  byteLength: number;
  width: number;
  height: number;
  sha256: string;
};

export class MediaImageError extends Error {
  status: 400 | 413;

  constructor(message: string, status: 400 | 413 = 400) {
    super(message);
    this.name = "MediaImageError";
    this.status = status;
  }
}

function detectImageFormat(input: Uint8Array): SupportedImageFormat | null {
  if (
    input.length >= 3 &&
    input[0] === 0xff &&
    input[1] === 0xd8 &&
    input[2] === 0xff
  ) {
    return "jpeg";
  }

  if (
    input.length >= 8 &&
    input[0] === 0x89 &&
    input[1] === 0x50 &&
    input[2] === 0x4e &&
    input[3] === 0x47 &&
    input[4] === 0x0d &&
    input[5] === 0x0a &&
    input[6] === 0x1a &&
    input[7] === 0x0a
  ) {
    return "png";
  }

  if (
    input.length >= 12 &&
    input[0] === 0x52 &&
    input[1] === 0x49 &&
    input[2] === 0x46 &&
    input[3] === 0x46 &&
    input[8] === 0x57 &&
    input[9] === 0x45 &&
    input[10] === 0x42 &&
    input[11] === 0x50
  ) {
    return "webp";
  }

  return null;
}

function isSupportedMimeType(value: string): value is SupportedMimeType {
  return (supportedMimeTypes as readonly string[]).includes(value);
}

function invalidImage(): never {
  throw new MediaImageError("图片内容无效或已损坏。");
}

export async function ingestMediaImage(
  input: Uint8Array,
  declaredMimeType: string,
): Promise<IngestedMediaImage> {
  if (input.byteLength > MAX_IMAGE_INPUT_BYTES) {
    throw new MediaImageError("图片不能超过 10 MiB。", 413);
  }

  if (!isSupportedMimeType(declaredMimeType)) {
    throw new MediaImageError("仅支持 JPEG、PNG 或 WebP 图片。");
  }

  const detectedFormat = detectImageFormat(input);

  if (!detectedFormat || detectedFormat !== formatByMimeType[declaredMimeType]) {
    throw new MediaImageError("图片类型与文件内容不一致。");
  }

  let metadata: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;

  try {
    metadata = await sharp(input, {
      animated: true,
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
    }).metadata();
  } catch {
    invalidImage();
  }

  if (
    metadata.format !== detectedFormat ||
    !metadata.width ||
    !metadata.height ||
    (metadata.pages ?? 1) !== 1
  ) {
    invalidImage();
  }

  const orientedWidth = metadata.autoOrient.width;
  const orientedHeight = metadata.autoOrient.height;

  if (
    orientedWidth > MAX_IMAGE_EDGE ||
    orientedHeight > MAX_IMAGE_EDGE ||
    orientedWidth * orientedHeight > MAX_IMAGE_PIXELS
  ) {
    throw new MediaImageError("图片尺寸不能超过 8192 像素或 2500 万像素。");
  }

  let output: Awaited<
    ReturnType<ReturnType<ReturnType<typeof sharp>["webp"]>["toBuffer"]>
  >;

  try {
    output = await sharp(input, {
      failOn: "error",
      limitInputPixels: MAX_IMAGE_PIXELS,
    })
      .rotate()
      .resize({
        width: MAX_IMAGE_OUTPUT_EDGE,
        height: MAX_IMAGE_OUTPUT_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
        alphaQuality: 90,
        effort: 4,
      })
      .toBuffer({ resolveWithObject: true });
  } catch {
    invalidImage();
  }

  if (
    output.info.format !== "webp" ||
    !output.info.width ||
    !output.info.height
  ) {
    invalidImage();
  }

  if (output.data.byteLength > MAX_IMAGE_OUTPUT_BYTES) {
    throw new MediaImageError("处理后的图片不能超过 5 MiB。", 413);
  }

  return {
    data: new Uint8Array(output.data),
    mimeType: "image/webp",
    byteLength: output.data.byteLength,
    width: output.info.width,
    height: output.info.height,
    sha256: createHash("sha256").update(output.data).digest("hex"),
  };
}

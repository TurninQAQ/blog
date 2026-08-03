import { NextResponse } from "next/server.js";

import { UnauthorizedAdminError, requireAdmin } from "@/lib/auth/admin";
import { rejectCrossOriginAdminRequest } from "@/lib/auth/csrf";
import { prisma } from "@/lib/db/prisma";
import {
  MAX_IMAGE_INPUT_BYTES,
  MediaImageError,
  ingestMediaImage,
} from "@/lib/media/image-ingest";
import {
  MediaUploadBoundaryError,
  enforceMediaUploadRateLimit,
  runWithMediaDecodePermit,
} from "@/lib/media/media-guard";
import { buildManagedMediaUrl } from "@/lib/media/media-url";
import {
  MediaStorageBoundaryError,
  reclaimAbandonedPrivateMedia,
  storeMediaAsset,
} from "@/lib/media/media-service";

export const runtime = "nodejs";

const MAX_MULTIPART_BYTES = 11 * 1024 * 1024;

class MediaRequestError extends Error {
  status: 400 | 411 | 413 | 415;

  constructor(message: string, status: 400 | 411 | 413 | 415) {
    super(message);
    this.name = "MediaRequestError";
    this.status = status;
  }
}

function readDeclaredContentLength(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!/^multipart\/form-data\s*;/i.test(contentType)) {
    throw new MediaRequestError("请使用 multipart/form-data 上传图片。", 415);
  }

  if (request.headers.has("content-encoding")) {
    throw new MediaRequestError("媒体上传不支持压缩请求体。", 415);
  }

  const value = request.headers.get("content-length");

  if (!value) {
    throw new MediaRequestError("媒体上传必须提供 Content-Length。", 411);
  }

  if (!/^[1-9]\d*$/.test(value)) {
    throw new MediaRequestError("Content-Length 无效。", 400);
  }

  const length = Number(value);

  if (!Number.isSafeInteger(length)) {
    throw new MediaRequestError("Content-Length 无效。", 400);
  }

  if (length > MAX_MULTIPART_BYTES) {
    throw new MediaRequestError("上传请求不能超过 11 MiB。", 413);
  }

  return length;
}

async function readBoundedRequestBody(
  request: Request,
  declaredLength: number,
) {
  if (!request.body) {
    throw new MediaRequestError("上传请求中没有图片。", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      byteLength += value.byteLength;

      if (byteLength > MAX_MULTIPART_BYTES) {
        await reader.cancel();
        throw new MediaRequestError("上传请求不能超过 11 MiB。", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (byteLength !== declaredLength) {
    throw new MediaRequestError("上传请求长度与 Content-Length 不一致。", 400);
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return body;
}

async function parseBoundedFormData(request: Request, declaredLength: number) {
  const body = await readBoundedRequestBody(request, declaredLength);

  try {
    return await new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body,
    }).formData();
  } catch {
    throw new MediaRequestError("上传表单无效。", 400);
  }
}

function errorResponse(
  error:
    | MediaRequestError
    | MediaImageError
    | MediaUploadBoundaryError
    | MediaStorageBoundaryError,
) {
  const headers = new Headers();

  if (
    error instanceof MediaUploadBoundaryError &&
    error.retryAfterSeconds !== null
  ) {
    headers.set("Retry-After", String(error.retryAfterSeconds));
  }

  return NextResponse.json(
    { error: error.message },
    { status: error.status, headers },
  );
}

export async function POST(request: Request) {
  const csrfFailure = rejectCrossOriginAdminRequest(request);

  if (csrfFailure) {
    return csrfFailure;
  }

  let adminSession: Awaited<ReturnType<typeof requireAdmin>>;

  try {
    adminSession = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return new NextResponse(error.message, { status: 401 });
    }

    throw error;
  }

  try {
    enforceMediaUploadRateLimit(adminSession.adminUserId);

    const declaredLength = readDeclaredContentLength(request);
    const formData = await parseBoundedFormData(request, declaredLength);
    const files = formData.getAll("file");

    if (files.length !== 1 || !(files[0] instanceof File)) {
      throw new MediaRequestError("请选择一张图片。", 400);
    }

    const file = files[0];

    if (file.size > MAX_IMAGE_INPUT_BYTES) {
      throw new MediaImageError("图片不能超过 10 MiB。", 413);
    }

    await reclaimAbandonedPrivateMedia(prisma);

    const image = await runWithMediaDecodePermit(async () =>
      ingestMediaImage(
        new Uint8Array(await file.arrayBuffer()),
        file.type,
      ),
    );
    const media = await storeMediaAsset(prisma, image);

    return NextResponse.json(
      {
        id: media.id,
        url: buildManagedMediaUrl(media.id),
        mimeType: media.mimeType,
        byteLength: media.byteLength,
        width: media.width,
        height: media.height,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof MediaRequestError ||
      error instanceof MediaImageError ||
      error instanceof MediaUploadBoundaryError ||
      error instanceof MediaStorageBoundaryError
    ) {
      return errorResponse(error);
    }

    throw error;
  }
}

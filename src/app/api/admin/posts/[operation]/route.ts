import { NextResponse } from "next/server.js";

import {
  AdminPostRequestError,
  AdminPostValidationError,
} from "@/lib/admin/post-input";
import { UnauthorizedAdminError } from "@/lib/auth/admin";
import { rejectCrossOriginAdminRequest } from "@/lib/auth/csrf";
import {
  adminPostOperations,
  runGuardedPostMutation,
  type AdminPostOperation,
} from "@/lib/admin/post-mutations";

export const runtime = "nodejs";
export const MAX_ADMIN_POST_REQUEST_BYTES = 2 * 1024 * 1024;

type AdminPostMutationRouteContext = {
  params: Promise<{
    operation: string;
  }>;
};

function isAdminPostOperation(
  operation: string,
): operation is AdminPostOperation {
  return (adminPostOperations as readonly string[]).includes(operation);
}

function unauthorizedResponse(error: UnauthorizedAdminError) {
  return new NextResponse(error.message, { status: 401 });
}

function notFoundResponse() {
  return new NextResponse(null, { status: 404 });
}

function validationResponse(error: AdminPostValidationError) {
  return NextResponse.json(
    {
      error: error.message,
      fieldErrors: error.fieldErrors,
    },
    { status: 400 },
  );
}

function requestErrorResponse(error: AdminPostRequestError) {
  return NextResponse.json(
    { error: error.message },
    { status: error.status },
  );
}

function readDeclaredContentLength(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new AdminPostRequestError(
      "文章操作必须使用 application/json。",
      415,
    );
  }

  if (request.headers.has("content-encoding")) {
    throw new AdminPostRequestError("文章操作不支持压缩请求体。", 415);
  }

  const value = request.headers.get("content-length");

  if (value === null) {
    return null;
  }

  if (!/^(?:0|[1-9]\d*)$/.test(value)) {
    throw new AdminPostRequestError("Content-Length 无效。", 400);
  }

  const length = Number(value);

  if (!Number.isSafeInteger(length)) {
    throw new AdminPostRequestError("Content-Length 无效。", 400);
  }

  if (length > MAX_ADMIN_POST_REQUEST_BYTES) {
    throw new AdminPostRequestError("文章请求不能超过 2 MiB。", 413);
  }

  return length;
}

async function readBoundedAdminPostJson(request: Request) {
  const declaredLength = readDeclaredContentLength(request);

  if (!request.body) {
    throw new AdminPostRequestError("请求内容无效。", 400);
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

      if (byteLength > MAX_ADMIN_POST_REQUEST_BYTES) {
        await reader.cancel();
        throw new AdminPostRequestError("文章请求不能超过 2 MiB。", 413);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (declaredLength !== null && byteLength !== declaredLength) {
    throw new AdminPostRequestError(
      "请求长度与 Content-Length 不一致。",
      400,
    );
  }

  const body = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(body);
    return JSON.parse(text) as unknown;
  } catch {
    throw new AdminPostRequestError("请求内容无效。", 400);
  }
}

export async function POST(
  request: Request,
  { params }: AdminPostMutationRouteContext,
) {
  const csrfFailure = rejectCrossOriginAdminRequest(request);

  if (csrfFailure) {
    return csrfFailure;
  }

  const { operation } = await params;

  if (!isAdminPostOperation(operation)) {
    return notFoundResponse();
  }

  try {
    return NextResponse.json(
      await runGuardedPostMutation(operation, () =>
        readBoundedAdminPostJson(request),
      ),
    );
  } catch (error) {
    if (error instanceof UnauthorizedAdminError) {
      return unauthorizedResponse(error);
    }

    if (error instanceof AdminPostValidationError) {
      return validationResponse(error);
    }

    if (error instanceof AdminPostRequestError) {
      return requestErrorResponse(error);
    }

    throw error;
  }
}

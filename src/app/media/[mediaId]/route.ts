import { NextResponse } from "next/server.js";

import { UnauthorizedAdminError, requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db/prisma";
import { extractManagedMediaId } from "@/lib/media/media-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaRouteContext = {
  params: Promise<{
    mediaId: string;
  }>;
};

const mediaSelect = {
  id: true,
  mimeType: true,
  byteLength: true,
  width: true,
  height: true,
  sha256: true,
  publicAt: true,
} as const;

async function readMediaData(id: string) {
  return prisma.mediaAsset.findUnique({
    where: { id },
    select: { data: true },
  });
}

function notFoundResponse() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function mediaHeaders(cacheControl: string, byteLength: number) {
  return {
    "Cache-Control": cacheControl,
    "Content-Length": String(byteLength),
    "Content-Type": "image/webp",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function GET(request: Request, { params }: MediaRouteContext) {
  const { mediaId: mediaParam } = await params;
  const id = extractManagedMediaId(`/media/${mediaParam}`);

  if (!id) {
    return notFoundResponse();
  }

  const media = await prisma.mediaAsset.findUnique({
    where: { id },
    select: mediaSelect,
  });

  if (!media || media.mimeType !== "image/webp") {
    return notFoundResponse();
  }

  if (!media.publicAt) {
    try {
      await requireAdmin();
    } catch (error) {
      if (error instanceof UnauthorizedAdminError) {
        return notFoundResponse();
      }

      throw error;
    }

    const stored = await readMediaData(id);

    if (!stored) {
      return notFoundResponse();
    }

    return new NextResponse(new Uint8Array(stored.data), {
      headers: mediaHeaders("private, no-store", media.byteLength),
    });
  }

  const etag = `"${media.sha256}"`;
  const headers = {
    ...mediaHeaders(
      "public, max-age=31536000, immutable",
      media.byteLength,
    ),
    ETag: etag,
  };

  if (request.headers.get("if-none-match") === etag) {
    const { "Content-Length": _contentLength, ...notModifiedHeaders } = headers;
    void _contentLength;
    return new NextResponse(null, {
      status: 304,
      headers: notModifiedHeaders,
    });
  }

  const stored = await readMediaData(id);

  if (!stored) {
    return notFoundResponse();
  }

  return new NextResponse(new Uint8Array(stored.data), { headers });
}

import "server-only";

export const MEDIA_UPLOAD_RATE_WINDOW_MS = 60_000;
export const MEDIA_UPLOAD_RATE_LIMIT = 20;
export const MAX_CONCURRENT_MEDIA_DECODES = 2;

type MediaBoundaryStatus = 429 | 503;

export class MediaUploadBoundaryError extends Error {
  status: MediaBoundaryStatus;
  retryAfterSeconds: number | null;

  constructor(
    message: string,
    status: MediaBoundaryStatus,
    retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "MediaUploadBoundaryError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const uploadAttempts = new Map<string, number[]>();
let activeDecodes = 0;

export function enforceMediaUploadRateLimit(
  adminUserId: string,
  now = Date.now(),
) {
  const windowStart = now - MEDIA_UPLOAD_RATE_WINDOW_MS;
  const recentAttempts = (uploadAttempts.get(adminUserId) ?? []).filter(
    (attemptAt) => attemptAt > windowStart,
  );

  if (recentAttempts.length >= MEDIA_UPLOAD_RATE_LIMIT) {
    const retryAfterMilliseconds =
      recentAttempts[0] + MEDIA_UPLOAD_RATE_WINDOW_MS - now;

    uploadAttempts.set(adminUserId, recentAttempts);
    throw new MediaUploadBoundaryError(
      "图片上传过于频繁，请稍后重试。",
      429,
      Math.max(1, Math.ceil(retryAfterMilliseconds / 1000)),
    );
  }

  recentAttempts.push(now);
  uploadAttempts.set(adminUserId, recentAttempts);
}

export async function runWithMediaDecodePermit<T>(
  decode: () => Promise<T>,
): Promise<T> {
  if (activeDecodes >= MAX_CONCURRENT_MEDIA_DECODES) {
    throw new MediaUploadBoundaryError(
      "图片处理任务繁忙，请稍后重试。",
      503,
      1,
    );
  }

  activeDecodes += 1;

  try {
    return await decode();
  } finally {
    activeDecodes -= 1;
  }
}

export function resetMediaUploadBoundariesForTests() {
  uploadAttempts.clear();
  activeDecodes = 0;
}

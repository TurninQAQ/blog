import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  MAX_CONCURRENT_MEDIA_DECODES,
  MEDIA_UPLOAD_RATE_LIMIT,
  MEDIA_UPLOAD_RATE_WINDOW_MS,
  MediaUploadBoundaryError,
  enforceMediaUploadRateLimit,
  resetMediaUploadBoundariesForTests,
  runWithMediaDecodePermit,
} from "./media-guard";

beforeEach(() => {
  resetMediaUploadBoundariesForTests();
});

describe("media upload rate boundary", () => {
  it("limits each administrator independently within the fixed window", () => {
    for (let attempt = 0; attempt < MEDIA_UPLOAD_RATE_LIMIT; attempt += 1) {
      expect(() =>
        enforceMediaUploadRateLimit("admin-a", 10_000 + attempt),
      ).not.toThrow();
    }

    expect(() =>
      enforceMediaUploadRateLimit("admin-a", 20_000),
    ).toThrowError(MediaUploadBoundaryError);
    expect(() =>
      enforceMediaUploadRateLimit("admin-b", 20_000),
    ).not.toThrow();
  });

  it("admits uploads again after the rate window expires", () => {
    for (let attempt = 0; attempt < MEDIA_UPLOAD_RATE_LIMIT; attempt += 1) {
      enforceMediaUploadRateLimit("admin-a", attempt);
    }

    expect(() =>
      enforceMediaUploadRateLimit(
        "admin-a",
        MEDIA_UPLOAD_RATE_WINDOW_MS + MEDIA_UPLOAD_RATE_LIMIT,
      ),
    ).not.toThrow();
  });
});

describe("media decode concurrency boundary", () => {
  it("rejects work above the fixed per-process decode limit", async () => {
    const releases: Array<() => void> = [];
    const pending = Array.from(
      { length: MAX_CONCURRENT_MEDIA_DECODES },
      () =>
        runWithMediaDecodePermit(
          () =>
            new Promise<void>((resolve) => {
              releases.push(resolve);
            }),
        ),
    );

    await expect(
      runWithMediaDecodePermit(async () => undefined),
    ).rejects.toMatchObject({ status: 503 });

    for (const release of releases) {
      release();
    }
    await Promise.all(pending);

    await expect(
      runWithMediaDecodePermit(async () => "available"),
    ).resolves.toBe("available");
  });
});

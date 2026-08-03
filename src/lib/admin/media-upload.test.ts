import { afterEach, describe, expect, it, vi } from "vitest";

import {
  AdminImageUploadError,
  uploadAdminImage,
  validateAdminImageFile,
} from "@/lib/admin/media-upload";

function imageFile(type = "image/png", size = 3) {
  return new File([new Uint8Array(size)], "image.png", { type });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("admin image upload client", () => {
  it("accepts only bounded JPEG, PNG, and WebP files", () => {
    expect(() => validateAdminImageFile(imageFile())).not.toThrow();
    expect(() => validateAdminImageFile(imageFile("image/svg+xml"))).toThrow(
      AdminImageUploadError,
    );
    expect(() => validateAdminImageFile(imageFile("image/png", 0))).toThrow(
      /不能为空/,
    );
    expect(() =>
      validateAdminImageFile(imageFile("image/png", 10 * 1024 * 1024 + 1)),
    ).toThrow(/10 MiB/);
  });

  it("accepts only a matching managed URL and positive integer dimensions", async () => {
    const id = "c123456789012345678901234";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json(
          {
            id,
            url: `/media/${id}.webp`,
            width: 640,
            height: 480,
          },
          { status: 201 },
        ),
      ),
    );

    await expect(uploadAdminImage(imageFile())).resolves.toMatchObject({
      id,
      width: 640,
      height: 480,
    });
  });

  it.each([
    {
      id: "c123456789012345678901234",
      url: "/media/caaaaaaaaaaaaaaaaaaaaaaaa.webp",
      width: 1,
      height: 1,
    },
    {
      id: "c123456789012345678901234",
      url: "https://evil.example/image.webp",
      width: 1,
      height: 1,
    },
    {
      id: "c123456789012345678901234",
      url: "/media/c123456789012345678901234.webp",
      width: Number.NaN,
      height: 1,
    },
  ])("rejects malformed successful responses %#", async (payload) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json(payload, { status: 201 })),
    );

    await expect(uploadAdminImage(imageFile())).rejects.toThrow(
      /无效结果/,
    );
  });

  it("surfaces a plain-text same-origin rejection instead of a generic failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("管理员请求来源不被允许。", {
          status: 403,
          headers: { "content-type": "text/plain; charset=utf-8" },
        }),
      ),
    );

    await expect(uploadAdminImage(imageFile())).rejects.toThrow(
      "管理员请求来源不被允许。",
    );
  });
});

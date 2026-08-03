import { describe, expect, it } from "vitest";

import {
  buildManagedMediaUrl,
  collectManagedMediaIds,
  extractManagedMediaId,
} from "./media-url";

const firstId = "cm1234567890abcdefghijklm";
const secondId = "cmabcdefghij1234567890klm";

describe("managed media URLs", () => {
  it("round-trips the canonical managed URL", () => {
    const url = buildManagedMediaUrl(firstId);

    expect(url).toBe(`/media/${firstId}.webp`);
    expect(extractManagedMediaId(url)).toBe(firstId);
  });

  it.each([
    `/media/${firstId}.png`,
    `/media/${firstId}.webp?download=1`,
    `/media/${firstId}.webp#preview`,
    `https://blog.example/media/${firstId}.webp`,
    "/media/not-a-cuid.webp",
    `/media/${firstId}/extra.webp`,
  ])("rejects a non-canonical managed URL %s", (url) => {
    expect(extractManagedMediaId(url)).toBeNull();
  });

  it("extracts only referenced managed images and the managed cover", () => {
    const markdown = [
      `![inline](/media/${firstId}.webp)`,
      "![external](https://example.com/image.webp)",
      "![referenced][asset]",
      "![unused label][unused]",
      "",
      `[asset]: /media/${secondId}.webp`,
      `[unused]: https://example.com/unused.webp`,
      `[not-used]: /media/cmzzzzzzzzzzzzzzzzzzzzzzz.webp`,
    ].join("\n");

    expect(
      collectManagedMediaIds({
        bodyMarkdown: markdown,
        coverImage: `/media/${firstId}.webp`,
      }),
    ).toEqual([firstId, secondId]);
  });

  it("ignores managed-looking text outside Markdown image destinations", () => {
    expect(
      collectManagedMediaIds({
        bodyMarkdown: [
          `[/media/${firstId}.webp](/media/${secondId}.webp)`,
          `\`/media/${firstId}.webp\``,
          `/media/${secondId}.webp`,
        ].join("\n"),
        coverImage: null,
      }),
    ).toEqual([]);
  });
});

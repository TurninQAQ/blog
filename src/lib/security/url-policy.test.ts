import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_URL_LENGTH,
  hasOnlyAllowedMarkdownImageDestinations,
  hasOnlyAllowedMarkdownLinkDestinations,
  isAllowedCoverImageUrl,
  isAllowedMarkdownImageDestination,
  isAllowedMarkdownLinkDestination,
} from "./url-policy";

describe("isAllowedCoverImageUrl", () => {
  it("accepts empty values and bounded HTTPS URLs", () => {
    const prefix = "https://example.com/";
    const maximumLengthUrl = `${prefix}${"a".repeat(
      MAX_IMAGE_URL_LENGTH - prefix.length,
    )}`;

    expect(isAllowedCoverImageUrl(undefined)).toBe(true);
    expect(isAllowedCoverImageUrl(null)).toBe(true);
    expect(isAllowedCoverImageUrl("   ")).toBe(true);
    expect(isAllowedCoverImageUrl("https://example.com/cover.png")).toBe(true);
    expect(isAllowedCoverImageUrl(maximumLengthUrl)).toBe(true);
    expect(
      isAllowedCoverImageUrl(
        "/media/cm1234567890abcdefghijklm.webp",
      ),
    ).toBe(true);
  });

  it.each([
    "/images/cover.png",
    "/media/cm1234567890abcdefghijklm.png",
    "/media/cm1234567890abcdefghijklm.webp?download=1",
    "/media/not-a-cuid.webp",
    "../images/cover.png",
    "//attacker.example/cover.png",
    "http://example.com/cover.png",
    "HTTPS://EXAMPLE.COM/cover.png",
    "javascript:alert(1)",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "file:///etc/passwd",
    "ftp://example.com/cover.png",
    "https:example.com/cover.png",
    "https://",
    "https://example.com/cover\n.png",
  ])("rejects unsupported or malformed cover URL %s", (value) => {
    expect(isAllowedCoverImageUrl(value)).toBe(false);
  });

  it("rejects an oversized cover URL", () => {
    expect(
      isAllowedCoverImageUrl(
        `https://example.com/${"a".repeat(MAX_IMAGE_URL_LENGTH)}`,
      ),
    ).toBe(false);
  });
});

describe("isAllowedMarkdownImageDestination", () => {
  it.each([
    "/images/root.png",
    "./images/current.png",
    "../images/parent.png",
    "images/relative.png",
    "assets/diagram.svg?theme=light&size=2#preview",
    "https://example.com/image.png",
  ])("accepts supported image destination %s", (value) => {
    expect(isAllowedMarkdownImageDestination(value)).toBe(true);
  });

  it.each([
    "",
    "//attacker.example/image.png",
    "\\\\attacker.example\\image.png",
    "http://example.com/image.png",
    "HTTPS://EXAMPLE.COM/image.png",
    "JaVaScRiPt:alert(1)",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "file:///etc/passwd",
    "ftp://example.com/image.png",
    "mailto:owner@example.com",
    "https:example.com/image.png",
    "https://",
    "images/control\u0000.png",
  ])("rejects unsafe image destination %s", (value) => {
    expect(isAllowedMarkdownImageDestination(value)).toBe(false);
  });

  it("rejects an oversized Markdown destination", () => {
    expect(
      isAllowedMarkdownImageDestination(
        `images/${"a".repeat(MAX_IMAGE_URL_LENGTH)}`,
      ),
    ).toBe(false);
  });
});

describe("hasOnlyAllowedMarkdownImageDestinations", () => {
  it("accepts inline, angle-wrapped and reference images in every supported path form", () => {
    const markdown = String.raw`
![root](/images/root.png)
![relative](../images/relative.png "Relative image")
![angle](<https://example.com/image_(1).png> 'External image')
![referenced][diagram]
![collapsed][]
![shortcut]

[diagram]: ./images/diagram.svg "Diagram"
[collapsed]: /images/collapsed.png
[shortcut]: https://example.com/shortcut.png
`;

    expect(hasOnlyAllowedMarkdownImageDestinations(markdown)).toBe(true);
  });

  it.each([
    "![script](javascript:alert(1))",
    "![escaped scheme](javascript\\:alert\\(1\\))",
    "![entity scheme](javascript&colon;alert(1))",
    "![data](<data:image/svg+xml;base64,PHN2Zz4=>)",
    "![http](HTTP://example.com/image.png)",
    "![protocol relative](//attacker.example/image.png)",
    "![backslash relative](\\\\attacker.example\\image.png)",
    "![empty]()",
    "![malformed](https://)",
  ])("rejects inline bypass %s", (markdown) => {
    expect(hasOnlyAllowedMarkdownImageDestinations(markdown)).toBe(false);
  });

  it("rejects unsafe reference definitions, including duplicate definitions", () => {
    const unsafeReference = `
![diagram][asset]

[asset]: javascript:alert(1)
`;
    const unsafeDuplicate = `
![diagram][asset]

[asset]: /images/safe.png
[asset]: data:image/svg+xml;base64,PHN2Zz4=
`;

    expect(hasOnlyAllowedMarkdownImageDestinations(unsafeReference)).toBe(
      false,
    );
    expect(hasOnlyAllowedMarkdownImageDestinations(unsafeDuplicate)).toBe(
      false,
    );
  });

  it.each([
    [
      "block-quoted definition",
      [
        "> ![alt][x]",
        ">",
        "> [x]: //attacker.example/pixel.png",
      ].join("\n"),
    ],
    [
      "escaped closing bracket in a label",
      String.raw`![alt][foo\]]

[foo\]]: javascript:alert(1)`,
    ],
    [
      "nested container definition",
      [
        "> - ![nested][asset]",
        ">",
        ">   [asset]: data:image/png;base64,unsafe",
      ].join("\n"),
    ],
    [
      "unsafe duplicate in a container",
      [
        "> ![duplicate][asset]",
        ">",
        "> [asset]: /images/safe.png",
        "> [asset]: //attacker.example/duplicate.png",
      ].join("\n"),
    ],
  ])("rejects %s parsed by CommonMark", (_description, markdown) => {
    expect(hasOnlyAllowedMarkdownImageDestinations(markdown)).toBe(false);
  });

  it("ignores escaped image markers, inline code and fenced code", () => {
    const markdown = [
      String.raw`\![escaped](javascript:alert(1))`,
      "",
      "`![inline code](data:image/png;base64,unsafe)`",
      "",
      "```md",
      "![fenced](file:///etc/passwd)",
      "```",
      "",
      "~~~md",
      "![tilde fenced](ftp://example.com/image.png)",
      "~~~",
      "",
      "![not rendered as an image](/images/image.png \"title)",
    ].join("\n");

    expect(hasOnlyAllowedMarkdownImageDestinations(markdown)).toBe(true);
  });

  it("still validates an image immediately after ignored code", () => {
    const markdown = [
      "`![ignored](javascript:alert(1))`",
      "",
      "![validated](javascript:alert(1))",
    ].join("\n");

    expect(hasOnlyAllowedMarkdownImageDestinations(markdown)).toBe(false);
  });
});

describe("Markdown link destinations", () => {
  it.each([
    "https://example.com/path",
    "http://example.com/path",
    "mailto:owner@example.com",
    "/notes/local",
    "../relative/page",
    "#section",
  ])("accepts safe link destination %s", (value) => {
    expect(isAllowedMarkdownLinkDestination(value)).toBe(true);
  });

  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "file:///etc/passwd",
    "vbscript:msgbox(1)",
    "//attacker.example/path",
    "https://example.com/control\u0000path",
  ])("rejects unsafe link destination %s", (value) => {
    expect(isAllowedMarkdownLinkDestination(value)).toBe(false);
  });

  it("checks inline and referenced links after Markdown decoding", () => {
    expect(
      hasOnlyAllowedMarkdownLinkDestinations(
        "[safe](https://example.com) and [local](/notes/local)",
      ),
    ).toBe(true);

    for (const markdown of [
      "[script](javascript:alert(1))",
      "[entity](javascript&colon;alert(1))",
      "[reference][unsafe]\n\n[unsafe]: data:text/html,unsafe",
    ]) {
      expect(hasOnlyAllowedMarkdownLinkDestinations(markdown)).toBe(false);
    }
  });
});

import { describe, expect, it } from "vitest";

import {
  MarkdownImportError,
  parseMarkdownImport,
  slugifyPostTitle,
} from "@/lib/admin/markdown-import";

function markdownFile(source: string, fileName = "article.md") {
  return {
    bytes: new TextEncoder().encode(source),
    fileName,
  };
}

describe("Markdown draft import", () => {
  it("maps allowlisted frontmatter and removes a duplicate leading H1", () => {
    const result = parseMarkdownImport(
      markdownFile(`---
title: 安全上传设计
slug: secure-media-upload
description: 一份实现记录
cover: /media/c123456789012345678901234.webp
tags:
  - Next.js
  - Security
category: 架构
series: 构建日志
seriesOrder: 2
status: published
featured: true
---
# 安全上传设计

正文内容。
`),
    );

    expect(result).toEqual({
      bodyMarkdown: "正文内容。",
      categoryName: "架构",
      coverImage: "/media/c123456789012345678901234.webp",
      excerpt: "一份实现记录",
      seriesName: "构建日志",
      seriesOrder: 2,
      slug: "secure-media-upload",
      tagNames: ["Next.js", "Security"],
      title: "安全上传设计",
      normalizationNotes: [],
    });
  });

  it("uses the first non-code H1, then the filename, as title fallbacks", () => {
    const fromHeading = parseMarkdownImport(
      markdownFile(`\ufeff\`\`\`md\r
# 代码里的标题\r
\`\`\`\r
\r
# 真正标题\r
\r
正文。`, "ignored.md"),
    );
    const fromFilename = parseMarkdownImport(
      markdownFile("只有正文。", "release-notes_2026.markdown"),
    );

    expect(fromHeading.title).toBe("真正标题");
    expect(fromHeading.bodyMarkdown).toContain("# 代码里的标题");
    expect(fromHeading.bodyMarkdown).not.toContain("# 真正标题");
    expect(fromFilename.title).toBe("release notes 2026");
    expect(fromFilename.slug).toBe("release-notes-2026");
  });

  it("uses and removes a leading Setext H1 title", () => {
    const result = parseMarkdownImport(
      markdownFile("Setext title\n============\n\n正文。", "ignored.md"),
    );

    expect(result.title).toBe("Setext title");
    expect(result.slug).toBe("setext-title");
    expect(result.bodyMarkdown).toBe("正文。");
  });

  it("keeps a non-duplicate H1 when frontmatter provides another title", () => {
    const result = parseMarkdownImport(
      markdownFile(`---
title: 总览
---
# 第一章

正文。`),
    );

    expect(result.title).toBe("总览");
    expect(result.bodyMarkdown).toContain("# 第一章");
  });

  it("normalizes comma-separated tags and ignores publication fields", () => {
    const result = parseMarkdownImport(
      markdownFile(`---
title: Draft only
tags: React, Security, React
published: true
publishedAt: 2026-07-11
---
Body.
`),
    );

    expect(result.tagNames).toEqual(["React", "Security"]);
    expect(result).not.toHaveProperty("published");
    expect(result).not.toHaveProperty("featured");
  });

  it("imports hard breaks and ordinary colon prose", () => {
    const result = parseMarkdownImport(
      markdownFile(
        "# 类型说明\n\n第一行  \n第二行\n\n发布于 12:30，访问 localhost:3000，版本:beta。",
      ),
    );

    expect(result.bodyMarkdown).toBe(
      "第一行  \n第二行\n\n发布于 12:30，访问 localhost:3000，版本:beta。",
    );
  });

  it("imports underline syntax into an editable draft", () => {
    const result = parseMarkdownImport(
      markdownFile("# 下划线兼容性\n\n正文包含 ++需要强调的内容++。"),
    );

    expect(result.bodyMarkdown).toBe("正文包含 ++需要强调的内容++。");
  });

  it("canonicalizes equivalent Markdown spellings instead of rejecting the file", () => {
    const result = parseMarkdownImport(
      markdownFile([
        "# 兼容导入",
        "",
        "小节",
        "===",
        "",
        "* _条目_",
        "",
        "Visit https://example.com/path.",
        "",
        "first   ",
        "second",
      ].join("\n")),
    );

    expect(result.bodyMarkdown).toContain("# 小节");
    expect(result.bodyMarkdown).toContain("- *条目*");
    expect(result.bodyMarkdown).toContain("first  \nsecond");
    expect(result.normalizationNotes).toContain(
      "Markdown 写法已转换为编辑器兼容格式",
    );
  });

  it("downgrades unsupported text tones to safe editable Markdown", () => {
    const result = parseMarkdownImport(
      markdownFile(
        "# 颜色兼容\n\n:tone-purple[**重点**] 与 :tone-blue[蓝色]。",
      ),
    );

    expect(result.bodyMarkdown).toBe("**重点** 与 :tone-blue[蓝色]。");
    expect(result.normalizationNotes).toContain(
      "不支持的文字颜色已转为普通文字",
    );
  });

  it.each([
    ":tone-purple[<script>alert(1)</script>]",
    ":tone-purple[![unsafe](javascript:alert(1))]",
  ])("still rejects unsafe content inside a downgraded tone: %s", (body) => {
    expect(() =>
      parseMarkdownImport(markdownFile(`# 安全边界\n\n${body}`)),
    ).toThrow(MarkdownImportError);
  });

  it.each([
    ["wrong extension", markdownFile("Body", "article.txt")],
    ["nul byte", markdownFile("Title\0Body")],
    ["empty body", markdownFile("# Only title")],
    [
      "unsupported raw HTML",
      markdownFile("# Unsafe\n\n<script>alert(1)</script>"),
    ],
    [
      "unsafe cover URL",
      markdownFile("---\ntitle: Unsafe\ncover: javascript:alert(1)\n---\nBody"),
    ],
  ])("rejects %s atomically", (_name, input) => {
    expect(() => parseMarkdownImport(input)).toThrow(MarkdownImportError);
  });

  it("rejects oversized and invalid UTF-8 files", () => {
    expect(() =>
      parseMarkdownImport({
        bytes: new Uint8Array(1024 * 1024 + 1),
        fileName: "large.md",
      }),
    ).toThrow(/1 MiB/);
    expect(() =>
      parseMarkdownImport({
        bytes: new Uint8Array([0xc3, 0x28]),
        fileName: "invalid.md",
      }),
    ).toThrow(/UTF-8/);
  });

  it("rejects YAML aliases and invalid known field types", () => {
    expect(() =>
      parseMarkdownImport(
        markdownFile("---\ntitle: &name Alias\nexcerpt: *name\n---\nBody"),
      ),
    ).toThrow(/YAML|别名/);
    expect(() =>
      parseMarkdownImport(
        markdownFile("---\ntitle:\n  nested: value\n---\nBody"),
      ),
    ).toThrow(/title/);
  });
});

describe("post title slug", () => {
  it("keeps existing Latin behavior and gives Chinese titles a stable fallback", () => {
    expect(slugifyPostTitle("React Server Components")).toBe(
      "react-server-components",
    );
    expect(slugifyPostTitle("安全上传")).toMatch(/^u-[a-z0-9-]+$/);
  });
});

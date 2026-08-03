import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  MAX_POST_BODY_BYTES,
  MAX_POST_TAXONOMY_ITEMS,
  AdminPostValidationError,
  parseCreatePostInput,
  parsePublishPostInput,
} from "./post-input";

function validDraftInput() {
  return {
    title: "Bounded post",
    slug: "bounded-post",
    excerpt: "",
    bodyMarkdown: "# Body",
    coverImage: null,
    featured: false,
    categoryId: null,
    newCategoryName: "",
    tagIds: [],
    newTagNames: [],
    seriesId: null,
    newSeriesName: "",
    seriesOrder: null,
  };
}

function readValidationError(input: unknown) {
  try {
    parseCreatePostInput(input);
  } catch (error) {
    expect(error).toBeInstanceOf(AdminPostValidationError);
    return (error as AdminPostValidationError).fieldErrors;
  }

  throw new Error("Expected post input validation to fail.");
}

describe("post input resource boundaries", () => {
  it("rejects Markdown above the UTF-8 byte limit", () => {
    const bodyMarkdown = "你".repeat(Math.floor(MAX_POST_BODY_BYTES / 3) + 1);
    const errors = readValidationError({
      ...validDraftInput(),
      bodyMarkdown,
    });

    expect(errors.bodyMarkdown).toBe("正文不能超过 1 MiB。");
  });

  it("rejects oversized taxonomy arrays before database lookups", () => {
    const errors = readValidationError({
      ...validDraftInput(),
      tagIds: Array.from(
        { length: MAX_POST_TAXONOMY_ITEMS + 1 },
        (_, index) => `tag-${index}`,
      ),
    });

    expect(errors.tagIds).toContain(String(MAX_POST_TAXONOMY_ITEMS));
  });

  it("rejects unknown write fields instead of silently accepting them", () => {
    const errors = readValidationError({
      ...validDraftInput(),
      role: "admin",
    });

    expect(errors.form).toBe("请求包含未声明或无效的字段。");
  });

  it("keeps operation-only payloads strict and ID-bounded", () => {
    expect(() =>
      parsePublishPostInput({ id: "post-1", publishedAt: new Date() }),
    ).toThrowError(AdminPostValidationError);
    expect(() =>
      parsePublishPostInput({ id: "x".repeat(65) }),
    ).toThrowError(AdminPostValidationError);
  });

  it("allows only the four attribute-free text tone directives", () => {
    expect(() =>
      parseCreatePostInput({
        ...validDraftInput(),
        bodyMarkdown:
          ":tone-blue[Blue] :tone-red[Red] :tone-green[Green] :tone-amber[Amber]",
      }),
    ).not.toThrow();

    for (const bodyMarkdown of [
      "::tone-blue[Leaf]",
      ":::tone-blue\nBlock\n:::",
      ":tone-blue[Text]{#unsafe .injected}",
      ":tone-purple[Unknown]",
      ":TONE-blue[Uppercase]",
    ]) {
      const errors = readValidationError({
        ...validDraftInput(),
        bodyMarkdown,
      });

      expect(errors.bodyMarkdown).toBe(
        "正文只支持无属性的蓝、红、绿、琥珀文字颜色标记。",
      );
    }
  });

  it("allows ordinary colon prose and bare tone-looking words", () => {
    expect(() =>
      parseCreatePostInput({
        ...validDraftInput(),
        bodyMarkdown:
          "发布于 12:30，访问 localhost:3000 与 http://localhost:3000/path，版本:beta，说明:tone-blue，字段:type[string]。",
      }),
    ).not.toThrow();
  });

  it("accepts underline Markdown through server-side validation", () => {
    expect(() =>
      parseCreatePostInput({
        ...validDraftInput(),
        bodyMarkdown: "正文包含 ++服务端安全保存的下划线++。",
      }),
    ).not.toThrow();
  });

  it("rejects unsafe Markdown links at the server validation boundary", () => {
    for (const bodyMarkdown of [
      "[script](javascript:alert(1))",
      "[data][unsafe]\n\n[unsafe]: data:text/html,unsafe",
      "[file](file:///etc/passwd)",
    ]) {
      const errors = readValidationError({
        ...validDraftInput(),
        bodyMarkdown,
      });

      expect(errors.bodyMarkdown).toBe("正文包含不安全的链接地址。");
    }
  });
});

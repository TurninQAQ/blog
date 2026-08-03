import { describe, expect, it } from "vitest";
import type { JSONContent } from "@tiptap/core";

import {
  markdownToDocument,
  normalizeMarkdownRoundTrip,
  documentToMarkdown,
} from "@/lib/admin/wysiwyg/markdown-adapter";

type WysiwygDocumentNode = Omit<JSONContent, "content"> & {
  content?: WysiwygDocumentNode[];
};

function findTextNode(
  node: WysiwygDocumentNode,
  text: string,
): WysiwygDocumentNode | undefined {
  if (node.text === text) {
    return node;
  }

  return node.content
    ?.map((child) => findTextNode(child, text))
    .find(Boolean);
}

function hasNodeType(node: WysiwygDocumentNode, type: string): boolean {
  return node.type === type || Boolean(node.content?.some((child) => hasNodeType(child, type)));
}

function findNodesByType(
  node: WysiwygDocumentNode,
  type: string,
): WysiwygDocumentNode[] {
  return [
    ...(node.type === type ? [node] : []),
    ...(node.content?.flatMap((child) => findNodesByType(child, type)) ?? []),
  ];
}

describe("markdown adapter", () => {
  it("round-trips the supported grammar without dropping structure", () => {
    const markdown = [
      "# 标题",
      "",
      "段落里有 `inline`。",
      "",
      "**加粗** 和 *斜体*，还有 [链接](https://example.com)。",
      "",
      "> 引用块",
      "",
      "- 列表项一",
      "- 列表项二",
      "",
      "1. 第一步",
      "2. 第二步",
      "",
      "![架构图](/images/arch.png)",
      "",
      "```ts",
      "const answer = 42;",
      "```",
      "",
      "| 列 | 值 |",
      "| --- | --- |",
      "| a | 1 |",
    ].join("\n");
    const canonicalMarkdown = [
      "# 标题",
      "",
      "段落里有 `inline`。",
      "",
      "**加粗** 和 *斜体*，还有 [链接](https://example.com)。",
      "",
      "> 引用块",
      "",
      "- 列表项一",
      "- 列表项二",
      "",
      "1. 第一步",
      "2. 第二步",
      "",
      "![架构图](/images/arch.png)",
      "",
      "```ts",
      "const answer = 42;",
      "```",
      "",
      "| 列 | 值 |",
      "| --- | --- |",
      "| a | 1 |",
    ].join("\n");

    const document = markdownToDocument(markdown) as WysiwygDocumentNode;
    const serialized = documentToMarkdown(document);
    const topLevelNodes = document.content ?? [];

    expect(document).toMatchObject({ type: "doc" });
    expect(topLevelNodes.map((node) => node.type)).toEqual(
      expect.arrayContaining([
        "heading",
        "blockquote",
        "bulletList",
        "orderedList",
        "codeBlock",
        "table",
      ]),
    );
    expect(topLevelNodes.find((node) => node.type === "heading")).toMatchObject(
      {
        type: "heading",
        attrs: expect.objectContaining({ level: 1 }),
      },
    );
    expect(
      topLevelNodes.find((node) => node.type === "codeBlock"),
    ).toMatchObject({
      type: "codeBlock",
      attrs: expect.objectContaining({ language: "ts" }),
    });
    expect(normalizeMarkdownRoundTrip(serialized)).toBe(canonicalMarkdown);
  });

  it("normalizes confirmed table padding and separator widths", () => {
    const markdown = [
      "| 左   | 右   | 中   | 普通   |",
      "| :----- | ----: | :-----: | ----- |",
      "| a  b   | c   | d   | e   |",
    ].join("\n");

    expect(normalizeMarkdownRoundTrip(markdown)).toBe(
      [
        "| 左 | 右 | 中 | 普通 |",
        "| :--- | ---: | :---: | --- |",
        "| a  b | c | d | e |",
      ].join("\n"),
    );
  });

  it("normalizes confirmed one-column tables", () => {
    const markdown = ["| a   |", "| ----- |", "| b   |"].join("\n");

    expect(normalizeMarkdownRoundTrip(markdown)).toBe(
      ["| a |", "| --- |", "| b |"].join("\n"),
    );
  });

  it("preserves escaped pipes inside confirmed table cells", () => {
    const markdown = ["| 列 | 值 |", "| ----- | --- |", "| a \\| b | c |"].join(
      "\n",
    );

    expect(normalizeMarkdownRoundTrip(markdown)).toBe(
      ["| 列 | 值 |", "| --- | --- |", "| a \\| b | c |"].join("\n"),
    );
  });

  it("does not normalize standalone pipe-delimited paragraphs", () => {
    expect(normalizeMarkdownRoundTrip("|x|")).toBe("|x|");
  });

  it("normalizes confirmed tables without outer pipes", () => {
    expect(normalizeMarkdownRoundTrip("a | b\n--- | ---\n1 | 2")).toBe(
      ["| a | b |", "| --- | --- |", "| 1 | 2 |"].join("\n"),
    );
  });

  it("does not normalize table-looking lines inside fenced code blocks", () => {
    const markdown = [
      "```",
      "```js",
      "| a   | b   |",
      "| ----- | --- |",
      "| 1   | 2   |",
      "```",
    ].join("\n");

    expect(normalizeMarkdownRoundTrip(markdown)).toBe(markdown);
  });

  it("normalizes repeated blank lines to the editor canonical form", () => {
    expect(normalizeMarkdownRoundTrip("a\n\n\nb")).toBe("a\n\nb");
  });

  it.each(["第一行  \n第二行", "第一行\\\n第二行"])(
    "round-trips hard breaks from %j",
    (markdown) => {
      const document = markdownToDocument(markdown) as WysiwygDocumentNode;

      expect(hasNodeType(document, "hardBreak")).toBe(true);
      expect(normalizeMarkdownRoundTrip(documentToMarkdown(document))).toBe(
        normalizeMarkdownRoundTrip(markdown),
      );
    },
  );

  it("preserves fenced code blocks and gfm tables during round-trip", () => {
    const markdown = [
      "```ts",
      "const value = 1;",
      "```",
      "",
      "| 名称 | 数值 |",
      "| --- | --- |",
      "| alpha | 1 |",
    ].join("\n");

    const serialized = documentToMarkdown(markdownToDocument(markdown));

    expect(normalizeMarkdownRoundTrip(serialized)).toBe(
      normalizeMarkdownRoundTrip(markdown),
    );
  });

  it("round-trips H1-H4, bold, and both list styles", () => {
    const markdown = [
      "# 一级",
      "",
      "## 二级",
      "",
      "### 三级",
      "",
      "#### 四级",
      "",
      "**重点**",
      "",
      "- 无序",
      "",
      "1. 有序",
    ].join("\n");
    const document = markdownToDocument(markdown) as WysiwygDocumentNode;

    expect(
      document.content
        ?.filter((node) => node.type === "heading")
        .map((node) => node.attrs?.level),
    ).toEqual([1, 2, 3, 4]);
    expect(findTextNode(document, "重点")?.marks).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "bold" })]),
    );
    expect(document.content?.map((node) => node.type)).toEqual(
      expect.arrayContaining(["bulletList", "orderedList"]),
    );
    expect(normalizeMarkdownRoundTrip(documentToMarkdown(document))).toBe(
      markdown,
    );
  });

  it("round-trips fixed text tones, including tone plus bold", () => {
    const markdown = [
      ":tone-blue[蓝色正文]",
      "",
      ":tone-red[**红色重点**]",
      "",
      ":tone-green[绿色正文] 与 :tone-amber[琥珀正文]",
    ].join("\n");
    const document = markdownToDocument(markdown) as WysiwygDocumentNode;
    const blueText = findTextNode(document, "蓝色正文");
    const redText = findTextNode(document, "红色重点");

    expect(blueText?.marks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "textTone",
          attrs: expect.objectContaining({ tone: "blue" }),
        }),
      ]),
    );
    expect(redText?.marks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "bold" }),
        expect.objectContaining({
          type: "textTone",
          attrs: expect.objectContaining({ tone: "red" }),
        }),
      ]),
    );
    expect(normalizeMarkdownRoundTrip(documentToMarkdown(document))).toBe(
      markdown,
    );
  });

  it("round-trips underline marks without losing visual semantics", () => {
    const markdown = "普通文字与 ++下划线++。";
    const document = markdownToDocument(markdown) as WysiwygDocumentNode;

    expect(findTextNode(document, "下划线")?.marks).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "underline" })]),
    );
    expect(normalizeMarkdownRoundTrip(documentToMarkdown(document))).toBe(
      markdown,
    );
  });

  it("preserves a direct block image inside an ordered list item", () => {
    const markdown = [
      "1. item",
      "",
      "  ![diagram](/media/example)",
      "2. next",
    ].join("\n");
    const document = markdownToDocument(markdown);
    const serialized = documentToMarkdown(document);

    expect(normalizeMarkdownRoundTrip(serialized)).toBe(
      normalizeMarkdownRoundTrip(markdown),
    );
  });

  it("keeps ordered-list block-image structure after serialization", () => {
    const markdown = [
      "1. item",
      "",
      "  ![diagram](/media/example)",
      "2. next",
    ].join("\n");
    const document = markdownToDocument(markdown);
    const reparsed = markdownToDocument(documentToMarkdown(document));

    expect(reparsed).toEqual(document);
  });

  it("round-trips extended GFM nodes without losing their semantics", () => {
    const markdown = [
      "##### 五级标题",
      "",
      "###### 六级标题",
      "",
      "---",
      "",
      "~~删除内容~~ 与 H~2~O",
      "",
      "- [ ] 待办",
      "- [x] 已完成",
    ].join("\n");
    const document = markdownToDocument(markdown) as WysiwygDocumentNode;
    const serialized = documentToMarkdown(document);
    const taskItems = findNodesByType(document, "taskItem");

    expect(hasNodeType(document, "horizontalRule")).toBe(true);
    expect(hasNodeType(document, "taskList")).toBe(true);
    expect(findTextNode(document, "删除内容")?.marks).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "strike" })]),
    );
    expect(findTextNode(document, "2")?.marks).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "strike" })]),
    );
    expect(
      document.content
        ?.filter((node) => node.type === "heading")
        .map((node) => node.attrs?.level),
    ).toEqual([5, 6]);
    expect(taskItems.map((node) => node.attrs?.checked)).toEqual([false, true]);
    expect(markdownToDocument(serialized)).toEqual(document);
  });

  it.each([
    "标题\n===",
    "* first\n* second",
    "+ first\n+ second",
    "1) first\n2) second",
    "_italic_ and __bold__",
    "Visit https://example.com/path.",
    "Read [the guide][guide].\n\n[guide]: https://example.com/guide",
    "~~~js\nconst value = 1;\n~~~",
    "    const value = 1;",
    "- first\n\n- second",
    "first   \nsecond",
    "- first  \n  second",
  ])("keeps the parsed document stable when canonicalizing %j", (markdown) => {
    const document = markdownToDocument(markdown);

    expect(markdownToDocument(documentToMarkdown(document))).toEqual(document);
  });
});

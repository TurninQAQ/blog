import { describe, expect, it } from "vitest";

import { scanMarkdownCompatibility } from "@/lib/admin/wysiwyg/compatibility";

describe("markdown compatibility scan", () => {
  it("accepts supported markdown", () => {
    const result = scanMarkdownCompatibility(
      [
        "# 标题",
        "",
        "段落里有 `inline`、**加粗**、*斜体* 和 [链接](https://example.com)。",
        "",
        "We import data and export results in prose.",
        "",
        "Use `<div>` safely.",
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
        "```html",
        "<div></div>",
        "```",
        "",
        "> ```html",
        "> <div></div>",
        "> ```",
        "",
        "```",
        "```js",
        "<br/>",
        "<!-- note -->",
        "```",
        "",
        "| 列 | 值 |",
        "| --- | --- |",
        "| a | 1 |",
      ].join("\n"),
    );

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it("accepts underline syntax supported by the visual editor", () => {
    expect(scanMarkdownCompatibility("普通文字与 ++下划线++。")).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it.each([
    "++**粗体下划线**++",
    "++*斜体下划线*++",
    "++[链接下划线](https://example.com)++",
  ])("accepts underline wrapped around another supported mark: %s", (markdown) => {
    expect(scanMarkdownCompatibility(markdown)).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it("does not treat escaped underline delimiters as a safe normalization", () => {
    const result = scanMarkdownCompatibility("\\++字面加号++");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "lossy-roundtrip",
    );
  });

  it("rejects ambiguous plus runs that change document structure", () => {
    const result = scanMarkdownCompatibility("x ++++++++++ y");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "lossy-roundtrip",
    );
  });

  it("accepts direct block images inside ordered list items", () => {
    const markdown = [
      "1. item",
      "",
      "  ![diagram](/media/example)",
      "2. next",
    ].join("\n");

    expect(scanMarkdownCompatibility(markdown)).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it("accepts supported table rows with trailing spaces", () => {
    const result = scanMarkdownCompatibility(
      ["| 列 | 值 |  ", "| --- | --- |  ", "| a | 1 |  "].join("\n"),
    );

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it("accepts supported one-column table rows with trailing spaces", () => {
    const result = scanMarkdownCompatibility(
      ["| a |  ", "| --- |  ", "| b |  "].join("\n"),
    );

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it.each([
    "import data before parsing.",
    "export data after parsing.",
    "{todo}",
  ])("accepts normal prose from %s", (markdown) => {
    const result = scanMarkdownCompatibility(markdown);

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it("rejects raw html", () => {
    const result = scanMarkdownCompatibility("# 标题\n\n<div>bad</div>");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain("raw-html");
  });

  it.each(["blue", "red", "green", "amber"])(
    "accepts the fixed %s text tone directive",
    (tone) => {
      const result = scanMarkdownCompatibility(
        `:tone-${tone}[安全色调与 **加粗**]`,
      );

      expect(result).toEqual({ compatible: true, issues: [] });
    },
  );

  it("rejects unknown text tone directives", () => {
    const result = scanMarkdownCompatibility(":tone-purple[未知颜色]");

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(
      "unsupported-mark",
    );
  });

  it.each([
    ":tone-blue[文字]{#unsafe}",
    ":tone-red[文字]{.injected}",
    ":tone-green[文字]{onclick=alert}",
  ])("rejects attributed text tone directive %s", (markdown) => {
    const result = scanMarkdownCompatibility(markdown);

    expect(result.compatible).toBe(false);
    expect(result.issues).toContainEqual({
      code: "unsupported-mark",
      message: "Text tone directives cannot have attributes.",
    });
  });

  it.each([
    "::tone-blue[leaf]",
    ":::tone-blue\ncontainer\n:::",
    "::note[leaf]",
    ":::note\ncontainer\n:::",
  ])("rejects leaf and container directive %s", (markdown) => {
    const result = scanMarkdownCompatibility(markdown);

    expect(result.compatible).toBe(false);
    expect(result.issues).toContainEqual({
      code: "unsupported-node",
      message: "Block directives are not supported by the WYSIWYG editor.",
    });
  });

  it("keeps ordinary colon prose without mislabeling it as a color", () => {
    const result = scanMarkdownCompatibility(
      "发布于 12:30，访问 localhost:3000，版本:beta，说明:tone-blue。",
    );

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it("keeps directive-looking field notation inside ordinary prose", () => {
    expect(scanMarkdownCompatibility("字段:type[string]。")).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it.each([":note[unsupported]", ":TONE-purple[uppercase]"])(
    "reports explicit custom directive %s without a color error",
    (markdown) => {
      const result = scanMarkdownCompatibility(markdown);

      expect(result.compatible).toBe(false);
      expect(result.issues).toContainEqual({
        code: "unsupported-mark",
        message:
          "Custom text directives are not supported by the WYSIWYG editor.",
      });
      expect(result.issues.map((issue) => issue.message)).not.toContain(
        "Only the blue, red, green, and amber text tones are supported.",
      );
    },
  );

  it("ignores directive-looking syntax inside code", () => {
    const result = scanMarkdownCompatibility(
      [
        "`:tone-blue[text]{#unsafe}`",
        "",
        "```md",
        ":::tone-blue",
        "container",
        ":::",
        "```",
      ].join("\n"),
    );

    expect(result).toEqual({ compatible: true, issues: [] });
  });

  it.each(["<br/>", "<hr/>", "<!-- note -->"])(
    "rejects raw html syntax from %s",
    (markdown) => {
      const result = scanMarkdownCompatibility(markdown);

      expect(result.compatible).toBe(false);
      expect(result.issues.map((issue) => issue.code)).toContain("raw-html");
    },
  );

  it("accepts task lists without losing checked state", () => {
    expect(
      scanMarkdownCompatibility("- [ ] 待办\n- [x] 已完成"),
    ).toEqual({ compatible: true, issues: [] });
  });

  it("rejects ordered task lists instead of silently converting them", () => {
    const result = scanMarkdownCompatibility(
      "1. [ ] 待办\n2. [x] 已完成",
    );

    expect(result.compatible).toBe(false);
    expect(result.issues).toContainEqual({
      code: "task-list",
      message:
        "Ordered task lists are not supported by the WYSIWYG editor.",
    });
  });

  it("rejects task lists mixed with regular items instead of splitting them", () => {
    const result = scanMarkdownCompatibility("- [ ] 待办\n- 普通项目");

    expect(result.compatible).toBe(false);
    expect(result.issues).toContainEqual({
      code: "task-list",
      message:
        "Task lists cannot mix task items with regular list items in the WYSIWYG editor.",
    });
  });

  it.each([
    ["footnote", "段落引用[^note]\n\n[^note]: 注释"],
    ["definition-list", "术语\n: 定义"],
    ["mdx-like", "<Demo.Widget value=\"1\" />"],
    ["mdx-like", "import Demo from './Demo'"],
    ["mdx-like", 'import { Demo } from "./Demo"'],
    ["mdx-like", 'import "./style.css"'],
    ["mdx-like", "export const x = 1"],
    ["mdx-like", "export async function loader() {}"],
    ["mdx-like", "export default Demo"],
    ["mdx-like", "export default function Demo() {}"],
    ["mdx-like", "export default { name: 'Demo' }"],
    ["mdx-like", 'export { Demo } from "./Demo"'],
    ["mdx-like", "{1 + 1}"],
    ["mdx-like", "{\n  1 + 1\n}"],
    ["mdx-like", "> {1 + 1}"],
    ["mdx-like", "> {\n>   1 + 1\n> }"],
    ["definition-list", "> term\n> : def"],
    ["definition-list", "> > term\n> > : def"],
  ] as const)("rejects %s syntax", (code, markdown) => {
    const result = scanMarkdownCompatibility(markdown);

    expect(result.compatible).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain(code);
  });

  it.each([
    ["Setext heading", "标题\n==="],
    ["asterisk bullets", "* first\n* second"],
    ["plus bullets", "+ first\n+ second"],
    ["parenthesized ordered list", "1) first\n2) second"],
    ["underscore emphasis", "_italic_ and __bold__"],
    ["autolink", "Visit https://example.com/path."],
    [
      "reference link",
      "Read [the guide][guide].\n\n[guide]: https://example.com/guide",
    ],
    ["tilde fence", "~~~js\nconst value = 1;\n~~~"],
    ["indented code", "    const value = 1;"],
    ["loose list", "- first\n\n- second"],
    ["HTML entity", "Tom &amp; Jerry"],
    ["three-space hard break", "first   \nsecond"],
    ["hard break in list", "- first  \n  second"],
  ])("accepts canonicalizable %s", (_name, markdown) => {
    expect(scanMarkdownCompatibility(markdown)).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it.each([
    "~~gone~~",
    "H~2~O",
    "---",
    "##### h5",
    "###### h6",
  ])("accepts extended editor syntax from %s", (markdown) => {
    expect(scanMarkdownCompatibility(markdown)).toEqual({
      compatible: true,
      issues: [],
    });
  });

  it.each(["a  \nb", "a\\\nb"])(
    "accepts markdown hard break syntax from %j",
    (markdown) => {
      expect(scanMarkdownCompatibility(markdown)).toEqual({
        compatible: true,
        issues: [],
      });
    },
  );
});

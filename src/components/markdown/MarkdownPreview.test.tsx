import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MarkdownPreview } from "@/components/markdown/MarkdownPreview";

describe("Markdown preview underline", () => {
  it("renders underline syntax without transforming code or enabling raw HTML", () => {
    const html = renderToStaticMarkup(
      <MarkdownPreview
        markdown={[
          "预览 ++下划线++。",
          "组合 ++**粗体下划线** 与 [链接](https://example.com)++。",
          "转义 \\++字面加号++。",
          "",
          "`++inline code++`",
          "",
          "```",
          "++fenced code++",
          "```",
          "",
          "<u>raw injection</u>",
        ].join("\n")}
      />,
    );

    expect(html).toContain("<u>下划线</u>");
    expect(html).toContain("<u><strong>粗体下划线</strong> 与 ");
    expect(html).toMatch(/<u><strong>粗体下划线<\/strong> 与 <a[^>]*>链接<\/a><\/u>/);
    expect(html.match(/<u>/g)).toHaveLength(2);
    expect(html).toContain("++inline code++");
    expect(html).toContain("++fenced code++");
    expect(html).toContain("++字面加号++");
    expect(html).not.toContain("<u>raw injection</u>");
  });

  it("keeps strikethrough and task-list state in the preview", () => {
    const html = renderToStaticMarkup(
      <MarkdownPreview
        markdown={"~~删除内容~~\n\n- [ ] 待办\n- [x] 已完成"}
      />,
    );

    expect(html).toContain("<del>删除内容</del>");
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(1);
  });
});

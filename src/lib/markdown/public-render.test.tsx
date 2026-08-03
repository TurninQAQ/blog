import { renderToStaticMarkup } from "react-dom/server";
import { codeToHast } from "shiki";
import { describe, expect, it, vi } from "vitest";

import { renderPublicMarkdown } from "@/lib/markdown/public-render";

vi.mock("shiki", async (importOriginal) => {
  const original = await importOriginal<typeof import("shiki")>();

  return {
    ...original,
    codeToHast: vi.fn(original.codeToHast),
  };
});

describe("public Markdown text tones", () => {
  it.each(["blue", "red", "green", "amber"] as const)(
    "renders the fixed %s tone with one fixed class",
    async (tone) => {
      const rendered = await renderPublicMarkdown(
        `:tone-${tone}[安全色调与 **加粗**]`,
      );
      const html = renderToStaticMarkup(rendered.content);

      expect(html).toContain(`class="lab-text-tone-${tone}"`);
      expect(html).toContain("<strong>加粗</strong>");
    },
  );

  it("drops directive attributes and never renders unknown classes", async () => {
    const rendered = await renderPublicMarkdown(
      [
        ":tone-blue[固定颜色]{#unsafe .injected onclick=alert}",
        "",
        ":tone-purple[未知颜色]{.injected onclick=alert}",
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain('class="lab-text-tone-blue"');
    expect(html).not.toContain("injected");
    expect(html).not.toContain("onclick");
    expect(html).not.toContain("unsafe");
    expect(html).not.toContain("lab-text-tone-purple");
  });

  it("keeps raw HTML disabled beside tone directives", async () => {
    const rendered = await renderPublicMarkdown(
      ":tone-green[安全内容]\n\n<span class=\"lab-text-tone-red\">注入</span>",
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain('class="lab-text-tone-green"');
    expect(html).toContain("注入");
    expect(html).not.toContain("lab-text-tone-red");
  });

  it("preserves comparison symbols and code while raw HTML stays disabled", async () => {
    const rendered = await renderPublicMarkdown(
      [
        "范围是 1 < 2 > 0。",
        "",
        "`a < b > c`",
        "",
        "````ts",
        "const comparison = left < right > fallback;",
        "```",
        "const stillInsideFence = true;",
        "````",
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain("范围是 1 &lt; 2 &gt; 0。");
    expect(html).toContain("<code>a &lt; b &gt; c</code>");
    expect(html).toContain("const comparison = left &lt; right &gt; fallback;");
    expect(html).toContain("const stillInsideFence = true;");
  });

  it("preserves ordinary colon prose and non-tone directives literally", async () => {
    const rendered = await renderPublicMarkdown(
      "发布于 12:30，访问 localhost:3000，版本:beta，说明:tone-blue，字段:type[string]，:TONE-blue[字面]。",
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain(
      "发布于 12:30，访问 localhost:3000，版本:beta，说明:tone-blue，字段:type[string]，:TONE-blue[字面]。",
    );
    expect(html).not.toContain("lab-text-tone-blue");
  });

  it("renders Markdown hard breaks without allowing raw HTML breaks", async () => {
    const rendered = await renderPublicMarkdown(
      "保留这一行  \n强制换行\n\n原始<br>同段",
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toMatch(/保留这一行<br\/>\s*强制换行/);
    expect(html.match(/<br\/>/g)).toHaveLength(1);
    expect(html).toContain("原始同段");
  });

  it("renders strikethrough and task-list state", async () => {
    const rendered = await renderPublicMarkdown(
      "~~删除内容~~\n\n- [ ] 待办\n- [x] 已完成",
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain("<del>删除内容</del>");
    expect(html.match(/type="checkbox"/g)).toHaveLength(2);
    expect(html.match(/checked=""/g)).toHaveLength(1);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
  });

  it("derives TOC labels and rendered IDs from the same transformed AST", async () => {
    const rendered = await renderPublicMarkdown(
      [
        "# :tone-blue[A &amp; **B** [Docs](https://example.com) ![Diagram](/diagram.webp)]",
        "",
        "## Duplicate",
        "",
        "## Duplicate",
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(rendered.headings).toEqual([
      {
        depth: 1,
        id: "article-heading-a-b-docs-diagram",
        text: "A & B Docs Diagram",
      },
      { depth: 2, id: "article-heading-duplicate", text: "Duplicate" },
      { depth: 2, id: "article-heading-duplicate-1", text: "Duplicate" },
    ]);

    for (const heading of rendered.headings) {
      expect(html).toContain(`id="${heading.id}"`);
    }

    expect(html).toContain('class="lab-text-tone-blue"');
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('alt="Diagram"');
  });

  it("namespaces author headings away from page shell IDs", async () => {
    const rendered = await renderPublicMarkdown("# Main Content");
    const html = renderToStaticMarkup(rendered.content);

    expect(rendered.headings[0]?.id).toBe("article-heading-main-content");
    expect(html).toContain('id="article-heading-main-content"');
    expect(html).not.toContain('id="main-content"');
  });

  it.each(["__proto__", "constructor", "toString"])(
    "treats inherited Shiki key %s as plain fenced code",
    async (language) => {
      const rendered = await renderPublicMarkdown(
        [`\`\`\`${language}`, "const safe = true;", "\`\`\`"].join("\n"),
      );
      const html = renderToStaticMarkup(rendered.content);

      expect(html).toContain('class="lab-code-block"');
      expect(html).toContain("const safe = true;");
      expect(html).not.toContain('class="shiki');
    },
  );

  it("falls back to readable fenced code when Shiki throws", async () => {
    vi.mocked(codeToHast).mockRejectedValueOnce(
      new Error("synthetic grammar failure"),
    );

    const rendered = await renderPublicMarkdown(
      ["```ts", "const stillReadable = true;", "```"].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain('class="lab-code-block"');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain("const stillReadable = true;");
    expect(html).not.toContain('class="shiki');
  });

  it("suppresses referrers only for external HTTPS images", async () => {
    const rendered = await renderPublicMarkdown(
      [
        "![external](https://images.example.com/diagram.webp)",
        "",
        "![managed](/media/c123456789012345678901234.webp)",
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toMatch(
      /<img[^>]+referrerPolicy="no-referrer"[^>]+src="https:\/\/images\.example\.com\/diagram\.webp"/,
    );
    expect(html).toMatch(
      /<img[^>]+src="\/media\/c123456789012345678901234\.webp"/,
    );
    expect(html).not.toMatch(
      /<img[^>]+referrerPolicy="no-referrer"[^>]+src="\/media\//,
    );
  });
});

describe("public Markdown underline", () => {
  it("renders underline syntax without transforming code or enabling raw HTML", async () => {
    const rendered = await renderPublicMarkdown(
      [
        "公开 ++下划线++。",
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
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(html).toContain("<u>下划线</u>");
    expect(html).toContain("<u><strong>粗体下划线</strong> 与 ");
    expect(html).toMatch(/<u><strong>粗体下划线<\/strong> 与 <a[^>]*>链接<\/a><\/u>/);
    expect(html.match(/<u>/g)).toHaveLength(2);
    expect(html).toContain("++inline code++");
    expect(html).toContain("++fenced code++");
    expect(html).toContain("++字面加号++");
    expect(html).toContain("raw injection");
    expect(html).not.toContain("<u>raw injection</u>");
  });
});

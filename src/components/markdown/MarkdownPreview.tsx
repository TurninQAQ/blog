import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";

import {
  markdownPreviewAllowedElements,
  markdownPreviewDisallowedRawHtmlPolicy,
  textToneClassNames,
} from "@/lib/markdown/markdown-policy";
import { remarkTextTone } from "@/lib/markdown/remark-text-tone";
import { remarkUnderline } from "@/lib/markdown/remark-underline";

type MarkdownPreviewProps = {
  markdown: string;
};

const previewSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  attributes: {
    ...defaultSchema.attributes,
    input: [
      ...(defaultSchema.attributes?.input ?? []),
      ["checked", true],
    ],
    span: [["className", ...textToneClassNames]],
  },
};

const previewComponents = {
  a({ children, href, ...props }) {
    return (
      <a
        href={href}
        rel="noreferrer"
        target={href?.startsWith("http") ? "_blank" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="lab-markdown-table-scroll">
        <table {...props}>{children}</table>
      </div>
    );
  },
} satisfies Components;

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return (
      <div className="lab-markdown-preview">
        <p className="text-lab-muted">预览会随着输入实时更新。</p>
      </div>
    );
  }

  return (
    <div className="lab-markdown-preview">
      <ReactMarkdown
        allowedElements={[...markdownPreviewAllowedElements]}
        components={previewComponents}
        rehypePlugins={[
          rehypeSlug,
          [rehypeSanitize, previewSanitizeSchema],
        ]}
        remarkPlugins={[
          remarkGfm,
          remarkDirective,
          remarkTextTone,
          remarkUnderline,
        ]}
        skipHtml={markdownPreviewDisallowedRawHtmlPolicy.skipHtml}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

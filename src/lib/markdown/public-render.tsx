import {
  Children,
  Fragment,
  createElement,
  isValidElement,
  type ComponentPropsWithoutRef,
  type JSX,
  type ReactNode,
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { MarkdownAsync, type Components } from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { bundledLanguages, codeToHast, type BundledLanguage } from "shiki";

import {
  markdownPreviewAllowedElements,
  markdownPreviewDisallowedRawHtmlPolicy,
  textToneClassNames,
} from "@/lib/markdown/markdown-policy";
import { remarkTextTone } from "@/lib/markdown/remark-text-tone";
import { remarkUnderline } from "@/lib/markdown/remark-underline";

export type PublicMarkdownHeading = {
  depth: number;
  id: string;
  text: string;
};

export type PublicMarkdownResult = {
  content: ReactNode;
  headings: PublicMarkdownHeading[];
};

const publicMarkdownAllowedElements = [
  ...markdownPreviewAllowedElements,
  "img",
] as const;

const markdownSanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "u"],
  // Heading IDs are generated from normalized text above, never copied from
  // author-supplied HTML attributes, so no clobber prefix is required.
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    h1: [...(defaultSchema.attributes?.h1 ?? []), ["id"]],
    h2: [...(defaultSchema.attributes?.h2 ?? []), ["id"]],
    h3: [...(defaultSchema.attributes?.h3 ?? []), ["id"]],
    h4: [...(defaultSchema.attributes?.h4 ?? []), ["id"]],
    h5: [...(defaultSchema.attributes?.h5 ?? []), ["id"]],
    h6: [...(defaultSchema.attributes?.h6 ?? []), ["id"]],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      ["src"],
      ["alt"],
      ["title"],
    ],
    input: [
      ...(defaultSchema.attributes?.input ?? []),
      ["checked", true],
    ],
    span: [["className", ...textToneClassNames]],
  },
};

const languageAliases: Record<string, BundledLanguage> = {
  js: "javascript",
  shell: "bash",
  sh: "bash",
  ts: "typescript",
};

type MarkdownTreeNode = {
  type?: string;
  depth?: number;
  value?: string;
  alt?: string;
  data?: {
    hProperties?: Record<string, unknown>;
  };
  children?: MarkdownTreeNode[];
};

function extractText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }

      if (isValidElement<{ children?: ReactNode }>(child)) {
        return extractText(child.props.children);
      }

      return "";
    })
    .join("");
}

function extractMarkdownText(node: MarkdownTreeNode): string {
  if (node.type === "image" || node.type === "imageReference") {
    return node.alt ?? "";
  }

  if (typeof node.value === "string") {
    return node.value;
  }

  return (node.children ?? []).map(extractMarkdownText).join("");
}

function normalizeHeadingText(node: MarkdownTreeNode) {
  return extractMarkdownText(node).replace(/\s+/g, " ").trim();
}

function createHeadingId(text: string, counts: Map<string, number>) {
  const normalized =
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  const base = `article-heading-${normalized}`;
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);

  return count === 0 ? base : `${base}-${count}`;
}

function createHeadingCollector(headings: PublicMarkdownHeading[]) {
  const counts = new Map<string, number>();

  function collect(node: MarkdownTreeNode) {
    if (node.type === "heading" && typeof node.depth === "number") {
      const text = normalizeHeadingText(node);

      if (text) {
        const id = createHeadingId(text, counts);
        node.data = {
          ...node.data,
          hProperties: {
            ...node.data?.hProperties,
            id,
          },
        };
        headings.push({ depth: node.depth, id, text });
      }
    }

    for (const child of node.children ?? []) {
      collect(child);
    }
  }

  return function remarkCollectPublicHeadings() {
    return (tree: MarkdownTreeNode) => {
      collect(tree);
    };
  };
}

function normalizeLanguage(className?: string): BundledLanguage | null {
  const rawLanguage = className?.match(/language-([^\s]+)/)?.[1];

  if (!rawLanguage) {
    return null;
  }

  const language = rawLanguage.toLowerCase();
  const normalized = Object.prototype.hasOwnProperty.call(
    languageAliases,
    language,
  )
    ? languageAliases[language]
    : language;

  return Object.prototype.hasOwnProperty.call(bundledLanguages, normalized)
    ? (normalized as BundledLanguage)
    : null;
}

function createCodeKey(language: BundledLanguage, code: string) {
  return `${language}\0${code}`;
}

async function renderHighlightedCode(code: string, language: BundledLanguage) {
  const tree = await codeToHast(code, {
    lang: language,
    theme: "github-dark",
  });

  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre({ children, className, ...props }) {
        return createElement(
          "pre",
          {
            ...props,
            className: [className, "lab-code-block"]
              .filter(Boolean)
              .join(" "),
          },
          children,
        );
      },
    },
  }) as JSX.Element;
}

async function collectHighlightedCode(markdown: string) {
  const highlightedCode = new Map<string, JSX.Element>();
  let fenceLanguage: BundledLanguage | null = null;
  let fenceLines: string[] = [];

  for (const line of markdown.split("\n")) {
    const fenceMatch = /^\s*(```|~~~)\s*([^\s`]*)?/.exec(line);

    if (fenceMatch) {
      if (fenceLanguage) {
        const code = fenceLines.join("\n");

        try {
          highlightedCode.set(
            createCodeKey(fenceLanguage, code),
            await renderHighlightedCode(code, fenceLanguage),
          );
        } catch {
          // Highlighting is progressive enhancement. The renderer below keeps
          // the original fenced code readable when a grammar fails to load.
        }

        fenceLanguage = null;
        fenceLines = [];
        continue;
      }

      fenceLanguage = normalizeLanguage(
        fenceMatch[2] ? `language-${fenceMatch[2]}` : undefined,
      );
      fenceLines = [];
      continue;
    }

    if (fenceLanguage) {
      fenceLines.push(line);
    }
  }

  return highlightedCode;
}

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  children?: ReactNode;
  node?: unknown;
};

function createPublicMarkdownComponents(
  highlightedCode: Map<string, JSX.Element>,
): Components {
  function createHeadingComponent(
    tag: keyof Pick<
      JSX.IntrinsicElements,
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    >,
  ) {
    const Heading = tag;

    return function PublicHeading({
      children,
      className,
      node,
      ...props
    }: ComponentPropsWithoutRef<typeof tag> & {
      children?: ReactNode;
      node?: unknown;
    }) {
      void node;

      return createElement(
        Heading,
        {
          ...props,
          className: ["scroll-mt-24", className].filter(Boolean).join(" "),
        },
        children,
      );
    };
  }

  return {
    a({ children, href, node, ...props }) {
      void node;

      return createElement(
        "a",
        {
          ...props,
          href,
          rel: "noreferrer",
          target: href?.startsWith("http") ? "_blank" : undefined,
        },
        children,
      );
    },
    code: (function PublicCode({
      children,
      className,
      node,
      ...props
    }: MarkdownCodeProps) {
      void node;
      const code = extractText(children).replace(/\n$/, "");
      const language = normalizeLanguage(className);
      const highlighted = language
        ? highlightedCode.get(createCodeKey(language, code))
        : null;

      if (highlighted) {
        return highlighted;
      }

      if (className?.match(/(?:^|\s)language-[^\s]+/)) {
        return createElement(
          "pre",
          { className: "lab-code-block" },
          createElement("code", { ...props, className }, children),
        );
      }

      return createElement("code", { ...props, className }, children);
    }) as Components["code"],
    h1: createHeadingComponent("h2"),
    h2: createHeadingComponent("h3"),
    h3: createHeadingComponent("h4"),
    h4: createHeadingComponent("h5"),
    h5: createHeadingComponent("h6"),
    h6: createHeadingComponent("h6"),
    img({ alt, node, src, ...props }) {
      void node;

      return createElement("img", {
        ...props,
        alt: alt ?? "",
        loading: "lazy",
        referrerPolicy:
          typeof src === "string" && /^https:\/\//i.test(src)
            ? "no-referrer"
            : undefined,
        src,
      });
    },
    pre({ children }) {
      return createElement(Fragment, null, children);
    },
    table({ children, node, ...props }) {
      void node;

      return createElement(
        "div",
        { className: "lab-markdown-table-scroll" },
        createElement("table", props, children),
      );
    },
  };
}

export async function renderPublicMarkdown(
  markdown: string,
): Promise<PublicMarkdownResult> {
  const headings: PublicMarkdownHeading[] = [];
  const highlightedCode = await collectHighlightedCode(markdown);
  const content = await MarkdownAsync({
    allowedElements: [...publicMarkdownAllowedElements],
    components: createPublicMarkdownComponents(highlightedCode),
    rehypePlugins: [[rehypeSlug], [rehypeSanitize, markdownSanitizeSchema]],
    remarkPlugins: [
      remarkGfm,
      remarkDirective,
      remarkTextTone,
      remarkUnderline,
      createHeadingCollector(headings),
    ],
    skipHtml: markdownPreviewDisallowedRawHtmlPolicy.skipHtml,
    children: markdown,
  });

  return {
    content,
    headings,
  };
}

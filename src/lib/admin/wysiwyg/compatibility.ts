import type { JSONContent } from "@tiptap/core";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import {
  documentToMarkdown,
  markdownToDocument,
} from "@/lib/admin/wysiwyg/markdown-adapter";
import {
  inspectTextToneDirective,
  isTextTone,
} from "@/lib/markdown/markdown-policy";

export type WysiwygCompatibilityCode =
  | "raw-html"
  | "task-list"
  | "footnote"
  | "definition-list"
  | "mdx-like"
  | "unsupported-node"
  | "unsupported-mark"
  | "lossy-roundtrip";

export type WysiwygCompatibilityIssue = {
  code: WysiwygCompatibilityCode;
  message: string;
};

type LexicalRule = {
  code: WysiwygCompatibilityCode;
  message: string;
  pattern: RegExp;
};

const lexicalRules: LexicalRule[] = [
  {
    code: "mdx-like",
    message: "MDX component syntax is not supported by the WYSIWYG editor.",
    pattern: /(^|[^`\\])<\/?[A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)*(?:\s[^>]*)?\/?>/,
  },
  {
    code: "mdx-like",
    message: "MDX module syntax is not supported by the WYSIWYG editor.",
    pattern:
      /^\s*(?:import\s+(?:(?:["'][^"'\n]+["'])|(?:[\w*$,\s{}]+)\s+from\s+["'][^"'\n]+["'])|export\s+(?:(?:\{[^}\n]*\})(?:\s+from\s+["'][^"'\n]+["'])?|default\s+[^\n]+|(?:async\s+)?(?:function|class)\s+\w+[^\n]*|(?:const|let|var)\s+\w+[^\n]*|\*\s+from\s+["'][^"'\n]+[""]))\s*;?\s*$/m,
  },
  {
    code: "mdx-like",
    message: "MDX expression syntax is not supported by the WYSIWYG editor.",
    pattern:
      /^\s*\{(?=[^}\n]*(?:[+\-*/%=&|?:<>]|\b(?:import|await|new|return|typeof|void)\b|\w\s*\(|=>))[^}\n]+\}\s*$/m,
  },
  {
    code: "mdx-like",
    message: "MDX expression syntax is not supported by the WYSIWYG editor.",
    pattern: /(?:^|\n)\s*\{\s*\n(?:[^\n]*\n)+?\s*\}\s*(?=\n|$)/,
  },
  {
    code: "raw-html",
    message: "Raw HTML is not supported by the WYSIWYG editor.",
    pattern: /<!--[\s\S]*?-->|<\/?[a-z][A-Za-z0-9-]*(?:\s[^>]*)?\/?>/,
  },
  {
    code: "footnote",
    message: "Footnote syntax is not supported by the WYSIWYG editor.",
    pattern: /\[\^[^\]\s]+\](?::|\b)/,
  },
  {
    code: "definition-list",
    message: "Definition list syntax is not supported by the WYSIWYG editor.",
    pattern: /(?:^|\n)[^\n]+\n\s*:\s+\S/,
  },
];

const allowedNodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "hardBreak",
  "horizontalRule",
  "blockquote",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "codeBlock",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
  "image",
]);

const allowedMarkTypes = new Set([
  "bold",
  "italic",
  "code",
  "link",
  "strike",
  "underline",
  "textTone",
]);

type MarkdownDirectiveNode = {
  type?: string;
  name?: string;
  ordered?: boolean;
  checked?: boolean | null;
  attributes?: Record<string, unknown>;
  children?: MarkdownDirectiveNode[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
};

function parseDirectiveTree(markdown: string) {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(markdown) as MarkdownDirectiveNode;
}

function scanDirectiveIssues(markdown: string): WysiwygCompatibilityIssue[] {
  let tree: MarkdownDirectiveNode;

  try {
    tree = parseDirectiveTree(markdown);
  } catch {
    return [
      {
        code: "lossy-roundtrip",
        message: "Markdown directives cannot be parsed safely.",
      },
    ];
  }

  const issues: WysiwygCompatibilityIssue[] = [];

  function scan(node: MarkdownDirectiveNode) {
    if (node.type === "list") {
      const listItems = (node.children ?? []).filter(
        (child) => child.type === "listItem",
      );
      const hasTaskItem = listItems.some(
        (item) => typeof item.checked === "boolean",
      );

      if (hasTaskItem && node.ordered) {
        addIssue(issues, {
          code: "task-list",
          message:
            "Ordered task lists are not supported by the WYSIWYG editor.",
        });
      }

      if (
        hasTaskItem &&
        listItems.some((item) => typeof item.checked !== "boolean")
      ) {
        addIssue(issues, {
          code: "task-list",
          message:
            "Task lists cannot mix task items with regular list items in the WYSIWYG editor.",
        });
      }
    } else if (
      node.type === "containerDirective" ||
      node.type === "leafDirective"
    ) {
      addIssue(issues, {
        code: "unsupported-node",
        message: "Block directives are not supported by the WYSIWYG editor.",
      });
    } else if (node.type === "textDirective") {
      const directive = inspectTextToneDirective(node, markdown);

      if (directive.kind === "literal" && directive.hasLabel) {
        addIssue(issues, {
          code: "unsupported-mark",
          message:
            "Custom text directives are not supported by the WYSIWYG editor.",
        });
      } else if (directive.kind === "invalid-tone") {
        addIssue(issues, {
          code: "unsupported-mark",
          message:
            "Only the blue, red, green, and amber text tones are supported.",
        });
      }

      if (
        directive.kind === "tone" &&
        Object.keys(node.attributes ?? {}).length > 0
      ) {
        addIssue(issues, {
          code: "unsupported-mark",
          message: "Text tone directives cannot have attributes.",
        });
      }
    }

    for (const child of node.children ?? []) {
      scan(child);
    }
  }

  scan(tree);

  return issues;
}

function isEscapedAt(text: string, index: number): boolean {
  let slashCount = 0;

  for (
    let cursor = index - 1;
    cursor >= 0 && text[cursor] === "\\";
    cursor -= 1
  ) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function maskLine(line: string): string {
  return "x".repeat(line.length);
}

function maskInlineCode(line: string): string {
  let maskedLine = "";
  let index = 0;

  while (index < line.length) {
    if (line[index] !== "`" || isEscapedAt(line, index)) {
      maskedLine += line[index];
      index += 1;
      continue;
    }

    let markerLength = 1;

    while (line[index + markerLength] === "`") {
      markerLength += 1;
    }

    const marker = "`".repeat(markerLength);
    const closingIndex = line.indexOf(marker, index + markerLength);

    if (closingIndex === -1) {
      maskedLine += line[index];
      index += 1;
      continue;
    }

    const codeSpanLength = closingIndex + markerLength - index;
    maskedLine += "x".repeat(codeSpanLength);
    index += codeSpanLength;
  }

  return maskedLine;
}

function stripBlockquoteMarkers(line: string): string {
  let remainingLine = line.trimStart();

  while (remainingLine.startsWith(">")) {
    remainingLine = remainingLine.slice(1);

    if (remainingLine.startsWith(" ")) {
      remainingLine = remainingLine.slice(1);
    }

    remainingLine = remainingLine.trimStart();
  }

  return remainingLine;
}

function stripBlockquoteMarkersFromMarkdown(markdown: string): string {
  return markdown
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map(stripBlockquoteMarkers)
    .join("\n");
}

function findFenceStart(line: string): { character: string; length: number } | null {
  const match = stripBlockquoteMarkers(line).match(/^(`{3,}|~{3,})/);

  if (!match) {
    return null;
  }

  return {
    character: match[1][0],
    length: match[1].length,
  };
}

function isFenceClose(
  line: string,
  fence: { character: string; length: number },
): boolean {
  const match = stripBlockquoteMarkers(line).match(
    /^(`{3,}|~{3,})(?:[ \t]*)$/,
  );

  return (
    !!match &&
    match[1][0] === fence.character &&
    match[1].length >= fence.length
  );
}

function maskMarkdownCode(markdown: string): string {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  let fence: { character: string; length: number } | null = null;

  return lines
    .map((line) => {
      const fenceStart = findFenceStart(line);

      if (fence) {
        const maskedLine = maskLine(line);

        if (isFenceClose(line, fence)) {
          fence = null;
        }

        return maskedLine;
      }

      if (fenceStart) {
        fence = fenceStart;

        return maskLine(line);
      }

      return maskInlineCode(line);
    })
    .join("\n");
}

function scanLexicalIssues(markdown: string): WysiwygCompatibilityIssue[] {
  const blockquoteStrippedMarkdown =
    stripBlockquoteMarkersFromMarkdown(markdown);
  const issues = lexicalRules
    .filter((rule) => rule.pattern.test(blockquoteStrippedMarkdown))
    .map(({ code, message }) => ({ code, message }));

  return issues;
}

function addIssue(
  issues: WysiwygCompatibilityIssue[],
  issue: WysiwygCompatibilityIssue,
) {
  if (
    !issues.some(
      (existingIssue) =>
        existingIssue.code === issue.code &&
        existingIssue.message === issue.message,
    )
  ) {
    issues.push(issue);
  }
}

function scanDocumentNode(
  node: JSONContent,
  issues: WysiwygCompatibilityIssue[],
) {
  if (node.type && !allowedNodeTypes.has(node.type)) {
    addIssue(issues, {
      code: "unsupported-node",
      message: `Unsupported WYSIWYG node: ${node.type}.`,
    });
  }

  if (
    node.type === "heading" &&
    (typeof node.attrs?.level !== "number" ||
      node.attrs.level < 1 ||
      node.attrs.level > 6)
  ) {
    addIssue(issues, {
      code: "unsupported-node",
      message:
        "Heading levels outside 1 through 6 are not supported by the WYSIWYG editor.",
    });
  }

  for (const mark of node.marks ?? []) {
    if (!mark.type || !allowedMarkTypes.has(mark.type)) {
      addIssue(issues, {
        code: "unsupported-mark",
        message: `Unsupported WYSIWYG mark: ${mark.type ?? "unknown"}.`,
      });
      continue;
    }

    if (mark.type === "textTone" && !isTextTone(mark.attrs?.tone)) {
      addIssue(issues, {
        code: "unsupported-mark",
        message: "Unsupported WYSIWYG text tone.",
      });
    }
  }

  for (const child of node.content ?? []) {
    scanDocumentNode(child, issues);
  }
}

function scanDocumentIssues(document: JSONContent): WysiwygCompatibilityIssue[] {
  const issues: WysiwygCompatibilityIssue[] = [];

  scanDocumentNode(document, issues);

  return issues;
}

export function scanMarkdownCompatibility(markdown: string): {
  compatible: boolean;
  issues: WysiwygCompatibilityIssue[];
} {
  const lexicalIssues = scanLexicalIssues(maskMarkdownCode(markdown));

  for (const issue of scanDirectiveIssues(markdown)) {
    addIssue(lexicalIssues, issue);
  }

  if (lexicalIssues.length > 0) {
    return {
      compatible: false,
      issues: lexicalIssues,
    };
  }

  let document: JSONContent;
  let reparsedDocument: JSONContent;
  let serialized: string;

  try {
    document = markdownToDocument(markdown);
    const documentIssues = scanDocumentIssues(document);

    if (documentIssues.length > 0) {
      return {
        compatible: false,
        issues: documentIssues,
      };
    }

    serialized = documentToMarkdown(document);
    reparsedDocument = markdownToDocument(serialized);
  } catch {
    return {
      compatible: false,
      issues: [
        {
          code: "lossy-roundtrip",
          message: "Markdown cannot be parsed by the WYSIWYG editor.",
        },
      ],
    };
  }

  const documentRoundTripIsStable =
    JSON.stringify(reparsedDocument) === JSON.stringify(document);

  if (!documentRoundTripIsStable) {
    return {
      compatible: false,
      issues: [
        {
          code: "lossy-roundtrip",
          message:
            "Markdown changes when parsed and serialized by the WYSIWYG editor.",
        },
      ],
    };
  }

  return {
    compatible: true,
    issues: [],
  };
}

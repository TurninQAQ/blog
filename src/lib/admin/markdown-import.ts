import { parseDocument } from "yaml";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

import { scanMarkdownCompatibility } from "@/lib/admin/wysiwyg/compatibility";
import {
  documentToMarkdown,
  markdownToDocument,
} from "@/lib/admin/wysiwyg/markdown-adapter";
import { inspectTextToneDirective } from "@/lib/markdown/markdown-policy";
import {
  hasOnlyAllowedMarkdownImageDestinations,
  hasOnlyAllowedMarkdownLinkDestinations,
  isAllowedCoverImageUrl,
} from "@/lib/security/url-policy";

export const MAX_MARKDOWN_IMPORT_BYTES = 1024 * 1024;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const markdownExtensionPattern = /\.(?:md|markdown)$/i;

export type MarkdownImportInput = {
  bytes: Uint8Array;
  fileName: string;
};

export type ImportedMarkdownDraft = {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  bodyMarkdown: string;
  tagNames: string[];
  categoryName: string;
  seriesName: string;
  seriesOrder: number | null;
  normalizationNotes: string[];
};

export class MarkdownImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarkdownImportError";
  }
}

type Frontmatter = Record<string, unknown>;

type MarkdownDirectiveNode = {
  type?: string;
  name?: string;
  children?: MarkdownDirectiveNode[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
};

function findClosingBracket(source: string, contentStart: number) {
  let depth = 1;

  for (let index = contentStart; index < source.length; index += 1) {
    if (source[index] === "\\") {
      index += 1;
      continue;
    }

    if (source[index] === "[") {
      depth += 1;
    } else if (source[index] === "]") {
      depth -= 1;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
}

function downgradeUnsupportedImportedTextTones(markdown: string): {
  markdown: string;
  changed: boolean;
} {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(markdown) as MarkdownDirectiveNode;
  const replacements: Array<{
    start: number;
    end: number;
    value: string;
  }> = [];

  function scan(node: MarkdownDirectiveNode) {
    if (node.type === "textDirective") {
      const directive = inspectTextToneDirective(node, markdown);
      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;

      if (
        directive.kind === "invalid-tone" &&
        typeof start === "number" &&
        typeof end === "number"
      ) {
        const source = markdown.slice(start, end);
        const labelStart = source.indexOf("[");
        const labelEnd =
          labelStart >= 0 ? findClosingBracket(source, labelStart + 1) : -1;

        if (labelEnd >= 0) {
          const inner = downgradeUnsupportedImportedTextTones(
            source.slice(labelStart + 1, labelEnd),
          );
          replacements.push({ start, end, value: inner.markdown });
          return;
        }
      }
    }

    for (const child of node.children ?? []) {
      scan(child);
    }
  }

  scan(tree);

  if (replacements.length === 0) {
    return { markdown, changed: false };
  }

  let normalized = markdown;

  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    normalized =
      normalized.slice(0, replacement.start) +
      replacement.value +
      normalized.slice(replacement.end);
  }

  return { markdown: normalized, changed: true };
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new MarkdownImportError("Markdown 文件必须使用有效的 UTF-8 编码。");
  }
}

function parseFrontmatter(source: string): {
  body: string;
  frontmatter: Frontmatter;
} {
  if (!source.startsWith("---\n")) {
    return { body: source, frontmatter: {} };
  }

  const closingMatch = /\n(?:---|\.\.\.)[ \t]*(?:\n|$)/.exec(source.slice(4));

  if (!closingMatch || closingMatch.index === undefined) {
    throw new MarkdownImportError("Markdown frontmatter 缺少结束分隔线。");
  }

  const frontmatterEnd = 4 + closingMatch.index;
  const bodyStart = frontmatterEnd + closingMatch[0].length;
  const yamlSource = source.slice(4, frontmatterEnd);

  try {
    const document = parseDocument(yamlSource, {
      uniqueKeys: true,
    });

    if (document.errors.length > 0) {
      throw document.errors[0];
    }

    const value = document.toJS({ maxAliasCount: 0 }) as unknown;

    if (value === null || value === undefined) {
      return { body: source.slice(bodyStart), frontmatter: {} };
    }

    if (typeof value !== "object" || Array.isArray(value)) {
      throw new Error("frontmatter must be a mapping");
    }

    return {
      body: source.slice(bodyStart),
      frontmatter: value as Frontmatter,
    };
  } catch {
    throw new MarkdownImportError(
      "Markdown frontmatter YAML 无效，或包含不允许的别名。",
    );
  }
}

function optionalString(frontmatter: Frontmatter, field: string) {
  const value = frontmatter[field];

  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw new MarkdownImportError(`frontmatter 字段 ${field} 必须是文本。`);
  }

  return value.trim();
}

function optionalFirstString(frontmatter: Frontmatter, fields: string[]) {
  for (const field of fields) {
    if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
      return optionalString(frontmatter, field);
    }
  }

  return "";
}

function parseTagNames(frontmatter: Frontmatter) {
  const value = frontmatter.tags;
  let names: string[];

  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (typeof value === "string") {
    names = value.split(",");
  } else if (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string")
  ) {
    names = value;
  } else {
    throw new MarkdownImportError(
      "frontmatter 字段 tags 必须是文本或文本数组。",
    );
  }

  return Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );
}

function parseSeriesOrder(frontmatter: Frontmatter) {
  const value = frontmatter.seriesOrder;

  if (value === undefined || value === null || value === "") {
    return null;
  }

  const number = typeof value === "string" ? Number(value.trim()) : value;

  if (typeof number !== "number" || !Number.isInteger(number) || number < 1) {
    throw new MarkdownImportError(
      "frontmatter 字段 seriesOrder 必须是正整数。",
    );
  }

  return number;
}

function plainHeadingText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .trim();
}

function findFirstTopLevelHeading(lines: string[]) {
  let fence: { marker: string; length: number } | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line);

    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      const length = fenceMatch[1].length;

      if (!fence) {
        fence = { marker, length };
      } else if (marker === fence.marker && length >= fence.length) {
        fence = null;
      }

      continue;
    }

    if (fence) {
      continue;
    }

    if (
      line.trim() &&
      /^\s{0,3}=+\s*$/.test(lines[index + 1] ?? "")
    ) {
      return {
        index,
        length: 2,
        title: plainHeadingText(line),
      };
    }

    const heading = /^\s{0,3}#\s+(.+?)\s*#*\s*$/.exec(line);

    if (heading) {
      return {
        index,
        length: 1,
        title: plainHeadingText(heading[1]),
      };
    }
  }

  return null;
}

function fileNameTitle(fileName: string) {
  return fileName
    .replace(markdownExtensionPattern, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeHeading(lines: string[], index: number, length: number) {
  const nextLines = [...lines];
  nextLines.splice(index, length);

  while (nextLines[index]?.trim() === "") {
    nextLines.splice(index, 1);
  }

  return nextLines;
}

export function slugifyPostTitle(title: string) {
  const normalized = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/['’‘]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  if (normalized) {
    return normalized;
  }

  const fallback = Array.from(title.trim())
    .map((character) => character.codePointAt(0)?.toString(36))
    .filter(Boolean)
    .join("-");

  return fallback ? `u-${fallback}` : "";
}

export function parseMarkdownImport({
  bytes,
  fileName,
}: MarkdownImportInput): ImportedMarkdownDraft {
  if (!markdownExtensionPattern.test(fileName)) {
    throw new MarkdownImportError("请选择 .md 或 .markdown 文件。");
  }

  if (bytes.byteLength > MAX_MARKDOWN_IMPORT_BYTES) {
    throw new MarkdownImportError("Markdown 文件不能超过 1 MiB。");
  }

  const decoded = decodeUtf8(bytes)
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n");

  if (decoded.includes("\0")) {
    throw new MarkdownImportError("Markdown 文件包含无效的 NUL 字符。");
  }

  const { body: rawBody, frontmatter } = parseFrontmatter(decoded);
  const lines = rawBody.split("\n");
  const heading = findFirstTopLevelHeading(lines);
  const frontmatterTitle = optionalString(frontmatter, "title");
  const title = frontmatterTitle || heading?.title || fileNameTitle(fileName);

  if (!title) {
    throw new MarkdownImportError("无法从 frontmatter、H1 或文件名解析标题。");
  }

  const shouldRemoveHeading =
    Boolean(heading) &&
    (!frontmatterTitle || heading?.title.trim() === frontmatterTitle.trim());
  const importedBodyMarkdown = (shouldRemoveHeading && heading
    ? removeHeading(lines, heading.index, heading.length)
    : lines
  )
    .join("\n")
    .trim();

  if (!importedBodyMarkdown) {
    throw new MarkdownImportError("导入后的 Markdown 正文不能为空。");
  }

  const downgradedTones = downgradeUnsupportedImportedTextTones(
    importedBodyMarkdown,
  );
  const normalizedBodyMarkdown = downgradedTones.markdown.trim();

  if (!hasOnlyAllowedMarkdownImageDestinations(normalizedBodyMarkdown)) {
    throw new MarkdownImportError("Markdown 正文包含不安全的图片地址。");
  }

  if (!hasOnlyAllowedMarkdownLinkDestinations(normalizedBodyMarkdown)) {
    throw new MarkdownImportError("Markdown 正文包含不安全的链接地址。");
  }

  const compatibility = scanMarkdownCompatibility(normalizedBodyMarkdown);

  if (!compatibility.compatible) {
    throw new MarkdownImportError(
      `Markdown 包含当前编辑器不支持的语法：${compatibility.issues
        .map((issue) => issue.message)
        .join(" ")}`,
    );
  }

  const bodyMarkdown = documentToMarkdown(
    markdownToDocument(normalizedBodyMarkdown),
  ).trim();
  const normalizationNotes: string[] = [];

  if (downgradedTones.changed) {
    normalizationNotes.push("不支持的文字颜色已转为普通文字");
  }

  if (bodyMarkdown !== normalizedBodyMarkdown) {
    normalizationNotes.push("Markdown 写法已转换为编辑器兼容格式");
  }

  const coverImage = optionalFirstString(frontmatter, ["coverImage", "cover"]);

  if (!isAllowedCoverImageUrl(coverImage)) {
    throw new MarkdownImportError("frontmatter 中的封面图地址不安全。");
  }

  const requestedSlug = optionalString(frontmatter, "slug").toLowerCase();

  return {
    title,
    slug: slugPattern.test(requestedSlug)
      ? requestedSlug
      : slugifyPostTitle(title),
    excerpt: optionalFirstString(frontmatter, ["excerpt", "description"]),
    coverImage,
    bodyMarkdown,
    tagNames: parseTagNames(frontmatter),
    categoryName: optionalString(frontmatter, "category"),
    seriesName: optionalString(frontmatter, "series"),
    seriesOrder: parseSeriesOrder(frontmatter),
    normalizationNotes,
  };
}

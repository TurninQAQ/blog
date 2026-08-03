export const textTones = ["blue", "red", "green", "amber"] as const;

export type TextTone = (typeof textTones)[number];

export function isTextTone(value: unknown): value is TextTone {
  return typeof value === "string" && textTones.includes(value as TextTone);
}

export function textToneClassName(tone: TextTone) {
  return `lab-text-tone-${tone}` as const;
}

type MarkdownTextDirectiveNode = {
  type?: string;
  name?: string;
  children?: unknown[];
  position?: {
    start?: { offset?: number };
  };
};

export function inspectTextToneDirective(
  node: MarkdownTextDirectiveNode,
  markdown: string,
):
  | { kind: "literal"; hasLabel: boolean }
  | { kind: "tone"; hasLabel: true; tone: TextTone }
  | { kind: "invalid-tone"; hasLabel: true } {
  const name = node.name ?? "";
  const start = node.position?.start?.offset;
  const previousCharacter =
    typeof start === "number" && start > 0 ? markdown[start - 1] : "";
  const hasDirectiveBoundary =
    typeof start === "number" &&
    (start === 0 || !/[\p{Letter}\p{Number}_]/u.test(previousCharacter));
  const hasLabel =
    hasDirectiveBoundary && markdown.startsWith(`:${name}[`, start);

  if (!hasLabel || (node.children?.length ?? 0) === 0) {
    return { kind: "literal", hasLabel };
  }

  if (!name.startsWith("tone-")) {
    return { kind: "literal", hasLabel: true };
  }

  const tone = name.slice("tone-".length);

  return isTextTone(tone)
    ? { kind: "tone", hasLabel: true, tone }
    : { kind: "invalid-tone", hasLabel: true };
}

export const textToneClassNames = textTones.map(textToneClassName);

export const markdownPreviewAllowedElements = [
  "a",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "input",
  "li",
  "ol",
  "p",
  "pre",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
] as const;

export const markdownPreviewDisallowedRawHtmlPolicy = {
  skipHtml: true,
  rehypeRaw: false,
  rawHtmlInjection: false,
} as const;

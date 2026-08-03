import { parseEntities } from "parse-entities";

type MarkdownTreeNode = {
  type?: string;
  value?: string;
  data?: {
    hName?: string;
  };
  children?: MarkdownTreeNode[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
};

type InlineSegment = {
  end: number;
  node: MarkdownTreeNode;
  start: number;
};

const protectedPlus = "\u0000";
const opaqueInlineNode = "\uFFFC";

function isMarkdownEscapablePunctuation(character: string | undefined) {
  if (!character) {
    return false;
  }

  const code = character.charCodeAt(0);

  return (
    (code >= 0x21 && code <= 0x2f) ||
    (code >= 0x3a && code <= 0x40) ||
    (code >= 0x5b && code <= 0x60) ||
    (code >= 0x7b && code <= 0x7e)
  );
}

function createUnderlineMask(node: MarkdownTreeNode, source: string) {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;

  if (
    typeof node.value !== "string" ||
    typeof start !== "number" ||
    typeof end !== "number"
  ) {
    return null;
  }

  const raw = source.slice(start, end);
  let escaped = "";

  for (let index = 0; index < raw.length; index += 1) {
    if (
      raw[index] === "\\" &&
      isMarkdownEscapablePunctuation(raw[index + 1])
    ) {
      index += 1;
      escaped += raw[index] === "+" ? protectedPlus : raw[index];
      continue;
    }

    escaped += raw[index];
  }

  let mask = "";

  parseEntities(escaped, {
    reference(value) {
      mask += value.replaceAll("+", protectedPlus);
    },
    text(value) {
      mask += value;
    },
  });

  return mask.replaceAll(protectedPlus, "+") === node.value ? mask : null;
}

function underline(children: MarkdownTreeNode[]): MarkdownTreeNode {
  return {
    type: "underline",
    data: { hName: "u" },
    children,
  };
}

function sliceSegments(
  segments: InlineSegment[],
  start: number,
  end: number,
) {
  const sliced: MarkdownTreeNode[] = [];

  for (const segment of segments) {
    const overlapStart = Math.max(start, segment.start);
    const overlapEnd = Math.min(end, segment.end);

    if (overlapStart >= overlapEnd) {
      continue;
    }

    if (segment.node.type === "text") {
      const value = segment.node.value ?? "";
      const text = value.slice(
        overlapStart - segment.start,
        overlapEnd - segment.start,
      );

      if (text) {
        sliced.push({ type: "text", value: text });
      }
    } else {
      sliced.push(segment.node);
    }
  }

  return sliced;
}

function trimUnderlineBoundaryWhitespace(children: MarkdownTreeNode[]) {
  const trimmed = children.map((child) => ({ ...child }));

  while (trimmed[0]?.type === "text") {
    const value = trimmed[0].value?.trimStart() ?? "";

    if (value) {
      trimmed[0].value = value;
      break;
    }

    trimmed.shift();
  }

  while (trimmed.at(-1)?.type === "text") {
    const last = trimmed.at(-1) as MarkdownTreeNode;
    const value = last.value?.trimEnd() ?? "";

    if (value) {
      last.value = value;
      break;
    }

    trimmed.pop();
  }

  return trimmed;
}

function wrapUnderlines(children: MarkdownTreeNode[], source: string) {
  const segments: InlineSegment[] = [];
  let mask = "";

  for (const node of children) {
    const start = mask.length;

    if (node.type === "text" && typeof node.value === "string") {
      mask +=
        createUnderlineMask(node, source) ??
        node.value.replaceAll("+", protectedPlus);
    } else {
      mask += opaqueInlineNode;
    }

    segments.push({ end: mask.length, node, start });
  }

  const output: MarkdownTreeNode[] = [];
  const pattern = /\+\+([\s\S]+?)\+\+/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(mask)) !== null) {
    output.push(...sliceSegments(segments, cursor, match.index));

    const underlinedChildren = trimUnderlineBoundaryWhitespace(
      sliceSegments(segments, match.index + 2, pattern.lastIndex - 2),
    );

    if (underlinedChildren.length > 0) {
      output.push(underline(underlinedChildren));
    }

    cursor = pattern.lastIndex;
  }

  output.push(...sliceSegments(segments, cursor, mask.length));
  return output;
}

function transformUnderline(node: MarkdownTreeNode, source: string) {
  if (!node.children) {
    return;
  }

  for (const child of node.children) {
    transformUnderline(child, source);
  }

  node.children = wrapUnderlines(node.children, source);
}

export function remarkUnderline() {
  return (tree: MarkdownTreeNode, file: { value?: unknown }) => {
    if (typeof file.value === "string") {
      transformUnderline(tree, file.value);
    }
  };
}

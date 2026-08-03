import { Editor, type JSONContent } from "@tiptap/core";

import { createWysiwygExtensions } from "@/lib/admin/wysiwyg/extensions";

type MarkdownEditor = Editor & {
  getMarkdown: () => string;
};

const emptyDocument: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

function createHeadlessEditor({
  content,
  contentType,
}: {
  content: string | JSONContent;
  contentType: "json" | "markdown";
}): MarkdownEditor {
  return new Editor({
    element: null,
    injectCSS: false,
    extensions: createWysiwygExtensions(),
    content,
    contentType,
  }) as MarkdownEditor;
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

function splitTableRow(line: string): string[] | null {
  const trimmedLine = line.trim();

  if (trimmedLine.length < 3) {
    return null;
  }

  const hasOuterStart = trimmedLine[0] === "|";
  const hasOuterEnd =
    trimmedLine[trimmedLine.length - 1] === "|" &&
    !isEscapedAt(trimmedLine, trimmedLine.length - 1);
  const startIndex = hasOuterStart ? 1 : 0;
  const endIndex = hasOuterEnd ? trimmedLine.length - 1 : trimmedLine.length;
  const cells: string[] = [];
  let cell = "";

  for (let index = startIndex; index < endIndex; index += 1) {
    const character = trimmedLine[index];

    if (character === "|" && !isEscapedAt(trimmedLine, index)) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += character;
  }

  cells.push(cell);

  return cells.length > 1 || (hasOuterStart && hasOuterEnd) ? cells : null;
}

function isSeparatorCell(cell: string): boolean {
  return /^:?-{3,}:?$/.test(cell.trim());
}

function isTableSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every(isSeparatorCell);
}

function normalizeSeparatorCell(cell: string): string {
  const trimmedCell = cell.trim();
  const leftMarker = trimmedCell.startsWith(":") ? ":" : "";
  const rightMarker = trimmedCell.endsWith(":") ? ":" : "";

  return `${leftMarker}---${rightMarker}`;
}

function normalizeTableRow(line: string, isSeparatorRow: boolean): string {
  const cells = splitTableRow(line) ?? [];
  const normalizedCells = cells.map((cell) =>
    isSeparatorRow ? normalizeSeparatorCell(cell) : cell.trim(),
  );

  return `| ${normalizedCells.join(" | ")} |`;
}

function getConfirmedTableBlockLength(
  lines: string[],
  startIndex: number,
): number {
  const headerCells = splitTableRow(lines[startIndex]);
  const separatorCells = splitTableRow(lines[startIndex + 1] ?? "");

  if (
    !headerCells ||
    !separatorCells ||
    headerCells.length !== separatorCells.length ||
    !isTableSeparatorRow(separatorCells)
  ) {
    return 0;
  }

  let length = 2;

  for (
    let index = startIndex + 2;
    index < lines.length;
    index += 1, length += 1
  ) {
    const rowCells = splitTableRow(lines[index]);

    if (!rowCells || rowCells.length !== headerCells.length) {
      break;
    }
  }

  return length;
}

function countTrailingBlankLines(lines: string[]): number {
  let count = 0;

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index] !== "") {
      break;
    }

    count += 1;
  }

  return count;
}

function findFenceStart(line: string): { character: string; length: number } | null {
  const match = line.trimStart().match(/^(`{3,}|~{3,})/);

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
  const match = line
    .trimStart()
    .match(/^(`{3,}|~{3,})(?:[ \t]*)$/);

  return (
    !!match &&
    match[1][0] === fence.character &&
    match[1].length >= fence.length
  );
}

function normalizeBackslashHardBreak(line: string): string {
  const lastIndex = line.length - 1;

  return lastIndex >= 0 &&
    line[lastIndex] === "\\" &&
    !isEscapedAt(line, lastIndex)
    ? `${line.slice(0, -1)}  `
    : line;
}

export function normalizeMarkdownRoundTrip(markdown: string): string {
  const lines = markdown
    .replace(/\r\n?/g, "\n")
    .trim()
    .split("\n");
  const normalizedLines: string[] = [];
  let fence: { character: string; length: number } | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();
    const openingFence = findFenceStart(line);

    if (fence) {
      normalizedLines.push(line);

      if (isFenceClose(line, fence)) {
        fence = null;
      }

      continue;
    }

    if (openingFence) {
      normalizedLines.push(line);
      fence = openingFence;
      continue;
    }

    if (trimmedLine === "") {
      if (countTrailingBlankLines(normalizedLines) < 1) {
        normalizedLines.push("");
      }

      continue;
    }

    const tableBlockLength = getConfirmedTableBlockLength(lines, index);

    if (tableBlockLength > 0) {
      while (countTrailingBlankLines(normalizedLines) > 1) {
        normalizedLines.pop();
      }

      for (let offset = 0; offset < tableBlockLength; offset += 1) {
        normalizedLines.push(
          normalizeTableRow(lines[index + offset], offset === 1),
        );
      }

      index += tableBlockLength - 1;
      continue;
    }

    normalizedLines.push(normalizeBackslashHardBreak(line));
  }

  return normalizedLines.join("\n");
}

export function markdownToDocument(markdown: string): JSONContent {
  const editor = createHeadlessEditor({
    content: markdown,
    contentType: "markdown",
  });

  try {
    return editor.getJSON();
  } finally {
    editor.destroy();
  }
}

export function documentToMarkdown(document: JSONContent): string {
  const editor = createHeadlessEditor({
    content: emptyDocument,
    contentType: "json",
  });

  try {
    editor.commands.setContent(document, {
      contentType: "json",
      emitUpdate: false,
    });

    return editor.getMarkdown();
  } finally {
    editor.destroy();
  }
}

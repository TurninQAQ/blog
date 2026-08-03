import type {
  JSONContent,
  MarkdownRendererHelpers,
  RenderContext,
} from "@tiptap/core";
import CodeBlock from "@tiptap/extension-code-block";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  getListMarker,
  ListItem,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableKit } from "@tiptap/extension-table";
import { Markdown } from "@tiptap/markdown";
import { ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { CodeBlockNodeView } from "@/components/admin/wysiwyg/nodes/CodeBlockNodeView";
import { TableNodeView } from "@/components/admin/wysiwyg/nodes/TableNodeView";
import { TextTone } from "@/lib/admin/wysiwyg/text-tone";

const WysiwygCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },
});

const WysiwygTable = Table.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView);
  },
});

function listItemPrefix(context: RenderContext) {
  if (context.parentType === "bulletList") {
    return "- ";
  }

  if (context.parentType === "orderedList") {
    const start = context.meta?.parentAttrs?.start || 1;
    const type = context.meta?.parentAttrs?.type as string | undefined;

    return getListMarker(type, start - 1 + context.index, ". ");
  }

  return "- ";
}

function renderListItem(
  node: JSONContent,
  helpers: MarkdownRendererHelpers,
  context: RenderContext,
) {
  if (!node.content?.length) {
    return "";
  }

  const [paragraph, ...children] = node.content;
  let markdown = `${listItemPrefix(context)}${helpers.renderChildren([
    paragraph,
  ])}`;

  children.forEach((child, index) => {
    const rendered =
      helpers.renderChild?.(child, index + 1) ??
      helpers.renderChildren([child]);
    const indented = rendered
      .split("\n")
      .map((line) => helpers.indent(line))
      .join("\n");
    const separator =
      child.type === "paragraph" || child.type === "image" ? "\n\n" : "\n";

    markdown += `${separator}${indented}`;
  });

  return markdown;
}

const WysiwygListItem = ListItem.extend({
  renderMarkdown: renderListItem,
});

export function createWysiwygExtensions() {
  return [
    TextTone,
    StarterKit.configure({
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      link: false,
      listItem: false,
    }),
    WysiwygListItem,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    WysiwygCodeBlock,
    Link.configure({
      openOnClick: false,
    }),
    Image,
    WysiwygTable,
    TableKit.configure({
      table: false,
    }),
    Placeholder.configure({
      placeholder: "开始写技术笔记",
    }),
    Markdown,
  ];
}

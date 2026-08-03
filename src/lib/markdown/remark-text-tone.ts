import {
  inspectTextToneDirective,
  textToneClassName,
} from "@/lib/markdown/markdown-policy";

type MarkdownTreeNode = {
  type?: string;
  name?: string;
  value?: string;
  attributes?: Record<string, unknown>;
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
  children?: MarkdownTreeNode[];
  position?: {
    start?: { offset?: number };
    end?: { offset?: number };
  };
};

const directiveNodeTypes = new Set([
  "containerDirective",
  "leafDirective",
  "textDirective",
]);

function replaceWithLiteralSource(node: MarkdownTreeNode, source: string) {
  const start = node.position?.start?.offset;
  const end = node.position?.end?.offset;

  if (typeof start !== "number" || typeof end !== "number") {
    return false;
  }

  node.type = "text";
  node.value = source.slice(start, end);
  delete node.name;
  delete node.attributes;
  delete node.data;
  delete node.children;

  return true;
}

function transformDirective(node: MarkdownTreeNode, source: string | null) {
  if (directiveNodeTypes.has(node.type ?? "")) {
    const directive = source
      ? inspectTextToneDirective(node, source)
      : { kind: "invalid-tone" as const, hasLabel: true as const };

    if (
      node.type === "textDirective" &&
      directive.kind === "literal" &&
      source !== null &&
      replaceWithLiteralSource(node, source)
    ) {
      return;
    }

    node.attributes = {};
    node.data =
      node.type === "textDirective" && directive.kind === "tone"
        ? {
            hName: "span",
            hProperties: {
              className: [textToneClassName(directive.tone)],
            },
          }
        : {
            hName: "span",
            hProperties: {},
          };
  }

  for (const child of node.children ?? []) {
    transformDirective(child, source);
  }
}

export function remarkTextTone() {
  return (tree: MarkdownTreeNode, file: { value?: unknown }) => {
    transformDirective(
      tree,
      typeof file.value === "string" ? file.value : null,
    );
  };
}

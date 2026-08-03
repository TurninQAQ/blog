import remarkParse from "remark-parse";
import { unified } from "unified";

const managedMediaIdPattern = /^c[a-z0-9]{24}$/;
const managedMediaUrlPattern = /^\/media\/(c[a-z0-9]{24})\.webp$/;

type MarkdownNode = {
  type: string;
  children?: MarkdownNode[];
  identifier?: string;
  url?: string;
};

function walkMarkdown(node: MarkdownNode, visit: (node: MarkdownNode) => void) {
  visit(node);

  for (const child of node.children ?? []) {
    walkMarkdown(child, visit);
  }
}

export function isManagedMediaId(value: string) {
  return managedMediaIdPattern.test(value);
}

export function buildManagedMediaUrl(id: string) {
  if (!isManagedMediaId(id)) {
    throw new Error("Invalid managed media ID.");
  }

  return `/media/${id}.webp`;
}

export function extractManagedMediaId(value: string | null | undefined) {
  if (typeof value !== "string") {
    return null;
  }

  return managedMediaUrlPattern.exec(value)?.[1] ?? null;
}

export function collectManagedMediaIds({
  bodyMarkdown,
  coverImage,
}: {
  bodyMarkdown: string;
  coverImage: string | null;
}) {
  const ids = new Set<string>();
  const coverId = extractManagedMediaId(coverImage);

  if (coverId) {
    ids.add(coverId);
  }

  const tree = unified().use(remarkParse).parse(bodyMarkdown) as MarkdownNode;
  const referencedLabels = new Set<string>();
  const definitions = new Map<string, string[]>();

  walkMarkdown(tree, (node) => {
    if (node.type === "image" && typeof node.url === "string") {
      const id = extractManagedMediaId(node.url);

      if (id) {
        ids.add(id);
      }
      return;
    }

    if (node.type === "imageReference" && typeof node.identifier === "string") {
      referencedLabels.add(node.identifier);
      return;
    }

    if (
      node.type === "definition" &&
      typeof node.identifier === "string" &&
      typeof node.url === "string"
    ) {
      const destinations = definitions.get(node.identifier) ?? [];
      destinations.push(node.url);
      definitions.set(node.identifier, destinations);
    }
  });

  for (const label of referencedLabels) {
    for (const destination of definitions.get(label) ?? []) {
      const id = extractManagedMediaId(destination);

      if (id) {
        ids.add(id);
      }
    }
  }

  return [...ids];
}

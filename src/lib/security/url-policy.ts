import remarkParse from "remark-parse";
import { unified } from "unified";

import { extractManagedMediaId } from "@/lib/media/media-url";

export const MAX_IMAGE_URL_LENGTH = 2048;

const controlCharacterPattern = /[\u0000-\u001f\u007f]/;
const explicitSchemePattern = /^[a-z][a-z\d+.-]*:/i;

function hasSafeUrlShape(value: string) {
  return (
    value.length <= MAX_IMAGE_URL_LENGTH &&
    !controlCharacterPattern.test(value) &&
    !/\s/.test(value) &&
    !/[<>"']/.test(value) &&
    !value.includes("\\")
  );
}

function isAbsoluteHttpsUrl(value: string) {
  if (!value.startsWith("https://")) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function isAbsoluteWebUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function isAllowedCoverImageUrl(
  value: string | null | undefined,
) {
  const destination = typeof value === "string" ? value.trim() : "";

  if (!destination) {
    return true;
  }

  return (
    hasSafeUrlShape(destination) &&
    (isAbsoluteHttpsUrl(destination) ||
      extractManagedMediaId(destination) !== null)
  );
}

export function isAllowedMarkdownImageDestination(value: string) {
  const destination = value.trim();

  if (!destination || !hasSafeUrlShape(destination)) {
    return false;
  }

  if (destination.startsWith("//")) {
    return false;
  }

  if (explicitSchemePattern.test(destination)) {
    return isAbsoluteHttpsUrl(destination);
  }

  return true;
}

export function isAllowedMarkdownLinkDestination(value: string) {
  const destination = value.trim();

  if (!destination || !hasSafeUrlShape(destination)) {
    return false;
  }

  if (destination.startsWith("//")) {
    return false;
  }

  if (!explicitSchemePattern.test(destination)) {
    return true;
  }

  if (/^mailto:/i.test(destination)) {
    try {
      const url = new URL(destination);
      return url.protocol === "mailto:" && url.pathname.length > 0;
    } catch {
      return false;
    }
  }

  return isAbsoluteWebUrl(destination);
}

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

export function hasOnlyAllowedMarkdownImageDestinations(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as MarkdownNode;
  const referencedLabels = new Set<string>();
  const definitions = new Map<string, string[]>();
  let directImagesAreAllowed = true;

  walkMarkdown(tree, (node) => {
    if (node.type === "image") {
      directImagesAreAllowed =
        directImagesAreAllowed &&
        typeof node.url === "string" &&
        isAllowedMarkdownImageDestination(node.url);
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

  if (!directImagesAreAllowed) {
    return false;
  }

  for (const label of referencedLabels) {
    if (
      definitions
        .get(label)
        ?.some((destination) => !isAllowedMarkdownImageDestination(destination))
    ) {
      return false;
    }
  }

  return true;
}

export function hasOnlyAllowedMarkdownLinkDestinations(markdown: string) {
  const tree = unified().use(remarkParse).parse(markdown) as MarkdownNode;
  const referencedLabels = new Set<string>();
  const definitions = new Map<string, string[]>();
  let directLinksAreAllowed = true;

  walkMarkdown(tree, (node) => {
    if (node.type === "link") {
      directLinksAreAllowed =
        directLinksAreAllowed &&
        typeof node.url === "string" &&
        isAllowedMarkdownLinkDestination(node.url);
      return;
    }

    if (node.type === "linkReference" && typeof node.identifier === "string") {
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

  if (!directLinksAreAllowed) {
    return false;
  }

  for (const label of referencedLabels) {
    if (
      definitions
        .get(label)
        ?.some((destination) => !isAllowedMarkdownLinkDestination(destination))
    ) {
      return false;
    }
  }

  return true;
}

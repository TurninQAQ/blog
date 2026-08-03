import "server-only";

import { revalidatePath } from "next/cache";

import { PublicationStatus } from "@/generated/prisma/enums";

export type PublicPostPathSnapshot = {
  slug: string;
  status: string;
  publishedAt: Date | string | null;
  featured: boolean;
  category: {
    slug: string;
  } | null;
  series: {
    slug: string;
  } | null;
  tags: {
    tag: {
      slug: string;
    };
  }[];
};

function isPublicSnapshot(snapshot: PublicPostPathSnapshot) {
  return (
    snapshot.status === PublicationStatus.PUBLISHED &&
    snapshot.publishedAt !== null
  );
}

function addSnapshotPaths(
  paths: Set<string>,
  snapshot: PublicPostPathSnapshot | null,
) {
  if (!snapshot || !isPublicSnapshot(snapshot)) {
    return;
  }

  paths.add(`/notes/${snapshot.slug}`);

  if (snapshot.category) {
    paths.add(`/categories/${snapshot.category.slug}`);
  }

  for (const { tag } of snapshot.tags) {
    paths.add(`/tags/${tag.slug}`);
  }

  if (snapshot.series) {
    paths.add(`/series/${snapshot.series.slug}`);
  }
}

export function getAffectedPublicPostPaths(
  previous: PublicPostPathSnapshot | null,
  next: PublicPostPathSnapshot | null,
) {
  const paths = new Set([
    "/",
    "/notes",
    "/archive",
    "/series",
    "/search",
  ]);

  addSnapshotPaths(paths, previous);
  addSnapshotPaths(paths, next);

  return [...paths];
}

export function revalidatePublicPostPaths(
  previous: PublicPostPathSnapshot | null,
  next: PublicPostPathSnapshot | null,
) {
  for (const path of getAffectedPublicPostPaths(previous, next)) {
    revalidatePath(path);
  }
}

import { notFound } from "next/navigation";

import { PublicNoteList } from "@/components/public/content/PublicNoteList";
import { TaxonomyPageHeader } from "@/components/public/content/TaxonomyPageHeader";
import { getPublishedPostsByTag } from "@/lib/public/content-queries";

type TagPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const data = await getPublishedPostsByTag(slug);

  if (!data) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <TaxonomyPageHeader
        type="tag"
        title={data.taxonomy.name}
        description={data.taxonomy.description}
      />
      <PublicNoteList posts={data.posts} />
    </section>
  );
}

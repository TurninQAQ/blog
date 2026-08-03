import { notFound } from "next/navigation";

import { SeriesDetailList } from "@/components/public/content/SeriesDetailList";
import { getPublishedSeriesBySlug } from "@/lib/public/content-queries";

type SeriesDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function SeriesDetailPage({
  params,
}: SeriesDetailPageProps) {
  const { slug } = await params;
  const data = await getPublishedSeriesBySlug(slug);

  if (!data) {
    notFound();
  }

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-[720px]" lang="zh-Hans">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          系列
        </p>
        <h1 className="mt-3 break-words text-[40px] font-semibold leading-[1.1] text-lab-text">
          {data.series.title}
        </h1>
        <p className="mt-6 max-w-[68ch] text-[16px] font-normal leading-[1.5] text-lab-text-muted">
          {data.series.description?.trim() ||
            "这个系列的公开技术笔记会按顺序显示。"}
        </p>
      </header>

      <SeriesDetailList posts={data.posts} />
    </section>
  );
}

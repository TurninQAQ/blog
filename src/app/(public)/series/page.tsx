import { SeriesIndex } from "@/components/public/content/SeriesIndex";
import { getPublishedSeriesIndex } from "@/lib/public/content-queries";

export const dynamic = "force-dynamic";

export default async function SeriesPage() {
  const series = await getPublishedSeriesIndex();

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          系列
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          系列
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          围绕同一主题整理公开技术笔记，按系列进入连续阅读。
        </p>
      </header>

      <SeriesIndex series={series} />
    </section>
  );
}

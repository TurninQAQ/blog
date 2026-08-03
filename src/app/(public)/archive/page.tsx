import { ArchiveTimeline } from "@/components/public/content/ArchiveTimeline";
import { getPublishedArchiveGroups } from "@/lib/public/content-queries";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const archiveGroups = await getPublishedArchiveGroups();

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          归档
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          归档
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          按发布时间回看公开技术笔记，顺着月份追踪实现记录。
        </p>
      </header>

      <ArchiveTimeline archiveGroups={archiveGroups} />
    </section>
  );
}

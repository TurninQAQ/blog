import { PublicEmptyState } from "@/components/public/content/PublicEmptyState";
import { PublicNoteList } from "@/components/public/content/PublicNoteList";
import { getPublishedPostList } from "@/lib/public/content-queries";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const posts = await getPublishedPostList();

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          笔记
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          笔记
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          按发布时间浏览公开技术笔记，快速扫描分类、标签和预计阅读时间。
        </p>
      </header>

      {posts.length > 0 ? (
        <PublicNoteList posts={posts} />
      ) : (
        <PublicEmptyState
          title="还没有已发布的笔记"
          body="暂时没有公开笔记。可以先回到博客首页查看其他入口。"
        />
      )}
    </section>
  );
}

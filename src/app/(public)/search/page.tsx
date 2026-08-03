import { SearchForm } from "@/components/public/content/SearchForm";
import { SearchResults } from "@/components/public/content/SearchResults";
import { searchPublishedPosts } from "@/lib/public/content-queries";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getQuery(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;

  return (query ?? "").trim().slice(0, 120);
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = getQuery(params.q);
  const results = await searchPublishedPosts(query);

  return (
    <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
      <header className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          搜索
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          搜索
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          通过标题、摘要、正文、标签或分类查找已经公开的技术笔记。
        </p>
      </header>

      <SearchForm query={query} />
      <SearchResults query={query} results={results} />
    </section>
  );
}

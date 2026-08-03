import { Search } from "lucide-react";

type SearchFormProps = {
  query: string;
};

export function SearchForm({ query }: SearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      className="rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/76 p-4 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)] sm:p-5"
    >
      <label
        htmlFor="public-search-query"
        className="block text-[16px] font-normal leading-[1.5] text-lab-text"
      >
        搜索公开笔记
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
        <div className="relative min-w-0">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lab-muted"
          />
          <input
            id="public-search-query"
            name="q"
            type="search"
            defaultValue={query}
            maxLength={120}
            placeholder="搜索标题、正文、标签或分类"
            className="min-h-11 w-full rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base py-2 pl-10 pr-3 text-[16px] leading-[1.5] text-lab-text outline-none transition-colors duration-150 placeholder:text-lab-muted focus:border-[var(--lab-border-active)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center rounded-lab border border-[var(--lab-border-active)] bg-lab-accent/10 px-4 text-[14px] leading-[1.4] text-lab-accent transition-colors duration-150 hover:bg-lab-accent/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
        >
          搜索
        </button>
      </div>
    </form>
  );
}

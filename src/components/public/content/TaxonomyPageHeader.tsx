import { Folder, Tag } from "lucide-react";

type TaxonomyPageHeaderProps = {
  type: "tag" | "category";
  title: string;
  description?: string | null;
};

const taxonomyCopy = {
  tag: {
    label: "标签",
    fallback: "这个标签下的公开技术笔记会显示在这里。",
    icon: Tag,
  },
  category: {
    label: "分类",
    fallback: "这个分类下的公开技术笔记会显示在这里。",
    icon: Folder,
  },
};

export function TaxonomyPageHeader({
  type,
  title,
  description,
}: TaxonomyPageHeaderProps) {
  const copy = taxonomyCopy[type];
  const Icon = copy.icon;

  return (
    <header
      data-testid="taxonomy-page-header"
      className="max-w-[720px]"
      lang="zh-Hans"
    >
      <p className="inline-flex min-h-11 items-center gap-2 rounded-lab border border-[var(--lab-border-active)] px-3 font-mono text-[14px] leading-[1.4] text-lab-accent">
        <Icon aria-hidden="true" className="h-4 w-4" />
        {copy.label}
      </p>
      <h1 className="mt-4 break-words text-[40px] font-semibold leading-[1.1] text-lab-text">
        {title}
      </h1>
      <p className="mt-4 max-w-[68ch] text-[16px] leading-[1.5] text-lab-text-muted">
        {description?.trim() || copy.fallback}
      </p>
    </header>
  );
}

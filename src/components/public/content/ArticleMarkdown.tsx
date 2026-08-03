import type { ReactNode } from "react";

type ArticleMarkdownProps = {
  content: ReactNode;
};

export function ArticleMarkdown({ content }: ArticleMarkdownProps) {
  return (
    <div
      data-testid="article-body"
      className="lab-markdown-preview lab-article-markdown manga-article-copy min-w-0"
    >
      {content}
    </div>
  );
}

import Link from "next/link";
import {
  FilePlus,
  Folder,
  ListOrdered,
  SquarePen,
  Tag,
} from "lucide-react";

import { AdminPublishControls } from "@/components/admin/AdminPublishControls";
import { DeletePostDialog } from "@/components/admin/DeletePostDialog";
import type { AdminPostSummary } from "@/lib/admin/post-queries";

type AdminPostListProps = {
  posts: AdminPostSummary[];
};

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function seriesLabel(post: AdminPostSummary) {
  if (!post.series) {
    return "无系列";
  }

  return post.seriesOrder
    ? `${post.series.title} #${post.seriesOrder}`
    : post.series.title;
}

function metadataLabel(post: AdminPostSummary) {
  const parts = [
    post.category ? post.category.name : "未分类",
    `${post.tags.length} 个标签`,
    seriesLabel(post),
  ];

  return parts.join(" · ");
}

function statusLabel(status: string) {
  if (status === "PUBLISHED") {
    return "已发布";
  }

  if (status === "ARCHIVED") {
    return "已归档";
  }

  return "草稿";
}

export function AdminPostList({ posts }: AdminPostListProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
            管理后台 / 文章
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.2] text-lab-text max-[360px]:text-[20px]">
            文章库
          </h1>
          <p className="mt-3 text-[16px] leading-[1.5] text-lab-text-muted">
            管理所有技术笔记，按最近编辑时间排序。
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-active)] bg-lab-accent px-4 text-[14px] font-semibold leading-[1.4] text-lab-base hover:bg-lab-text"
        >
          <FilePlus aria-hidden="true" className="h-4 w-4" />
          新建文章
        </Link>
      </header>

      <section
        data-testid="admin-post-library-panel"
        className="manga-admin-library-panel overflow-hidden rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface"
      >
        {posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <li
                key={post.id}
                data-testid={`post-row-${post.id}`}
                className="grid gap-4 border-b border-[var(--lab-border-hairline)] p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_260px_minmax(280px,auto)]"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    data-testid="admin-post-title"
                    className="block truncate text-[16px] font-semibold leading-[1.3] text-lab-text hover:text-lab-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 truncate font-mono text-[13px] leading-[1.4] text-lab-muted">
                    /{post.slug}
                  </p>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-[1.4] text-lab-text-muted">
                    {post.excerpt || "暂无摘要。"}
                  </p>
                </div>

                <div className="min-w-0 text-[14px] leading-[1.4] text-lab-text-muted">
                  <p className="font-mono text-[13px] text-lab-muted">
                    更新于 {formatDate(post.updatedAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      data-status={post.status.toLowerCase()}
                      className="manga-admin-post-status inline-flex min-h-8 items-center rounded-lab border px-2 font-semibold"
                    >
                      {statusLabel(post.status)}
                    </span>
                    {post.featured ? (
                      <span className="manga-admin-post-featured inline-flex min-h-8 items-center rounded-lab border px-2 font-semibold">
                        精选
                      </span>
                    ) : null}
                    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                      <Folder aria-hidden="true" className="h-3.5 w-3.5" />
                      {post.category?.name ?? "未分类"}
                    </span>
                    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                      <Tag aria-hidden="true" className="h-3.5 w-3.5" />
                      {post.tags.length} 个标签
                    </span>
                    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
                      <ListOrdered
                        aria-hidden="true"
                        className="h-3.5 w-3.5"
                      />
                      {seriesLabel(post)}
                    </span>
                  </div>
                  <p className="sr-only">{metadataLabel(post)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <AdminPublishControls
                    postId={post.id}
                    title={post.title}
                    status={post.status}
                    featured={post.featured}
                    compact
                  />
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-hairline)] px-3 text-[14px] leading-[1.4] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
                  >
                    <SquarePen aria-hidden="true" className="h-4 w-4" />
                    编辑
                  </Link>
                  <DeletePostDialog postId={post.id} title={post.title} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5 sm:p-6">
            <h2
              className="text-[20px] font-semibold leading-[1.2] text-lab-text"
              lang="zh-Hans"
            >
              还没有草稿
            </h2>
            <p
              className="mt-3 text-[16px] leading-[1.5] text-lab-text-muted"
              lang="zh-Hans"
            >
              创建第一篇技术笔记，先保存为草稿。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

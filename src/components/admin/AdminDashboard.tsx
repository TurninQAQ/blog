import Link from "next/link";
import type { ComponentType } from "react";
import {
  Clock3,
  FilePlus,
  FileText,
  Folder,
  ListOrdered,
  SquarePen,
  Tag,
} from "lucide-react";

import { DeletePostDialog } from "@/components/admin/DeletePostDialog";
import type { AdminDashboardData, AdminPostSummary } from "@/lib/admin/post-queries";

type AdminDashboardProps = {
  data: AdminDashboardData;
};

type Metric = {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
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

function PostRow({ post }: { post: AdminPostSummary }) {
  return (
    <li className="flex min-h-[96px] flex-col gap-3 border-b border-[var(--lab-border-hairline)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Link
          href={`/admin/posts/${post.id}`}
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
        <div className="mt-3 flex flex-wrap gap-2 text-[13px] leading-[1.4] text-lab-text-muted">
          <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
            <Folder aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{post.category?.name ?? "未分类"}</span>
          </span>
          <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
            <Tag aria-hidden="true" className="h-3.5 w-3.5" />
            {post.tags.length} 个标签
          </span>
          <span className="inline-flex min-h-8 max-w-full items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
            <ListOrdered
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="truncate">{seriesLabel(post)}</span>
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-[13px] leading-[1.4] text-lab-muted">
          {formatDate(post.updatedAt)}
        </span>
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
  );
}

function PostPanel({
  title,
  posts,
  emptyCopy,
}: {
  title: string;
  posts: AdminPostSummary[];
  emptyCopy: string;
}) {
  return (
    <section className="rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4 shadow-[inset_0_1px_0_rgba(232,240,248,0.04)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[20px] font-semibold leading-[1.2] text-lab-text">
          {title}
        </h2>
        <Clock3 aria-hidden="true" className="h-4 w-4 text-lab-accent" />
      </div>
      {posts.length > 0 ? (
        <ul className="mt-3">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[16px] leading-[1.5] text-lab-text-muted">
          {emptyCopy}
        </p>
      )}
    </section>
  );
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const metrics: Metric[] = [
    { label: "草稿", value: data.metrics.drafts, icon: FileText },
    {
      label: "最近编辑",
      value: data.metrics.recentlyEdited,
      icon: Clock3,
    },
    { label: "分类", value: data.metrics.categories, icon: Folder },
    { label: "标签", value: data.metrics.tags, icon: Tag },
    { label: "系列", value: data.metrics.series, icon: ListOrdered },
  ];
  const hasPosts = data.recentPosts.length > 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[14px] leading-[1.4] text-lab-accent">
            管理后台
          </p>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.2] text-lab-text max-[360px]:text-[20px]">
            写作控制台
          </h1>
          <p
            className="mt-3 text-[16px] leading-[1.5] text-lab-text-muted"
            lang="zh-Hans"
          >
            最近编辑的草稿和技术笔记都在这里。
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lab border border-[var(--lab-border-active)] bg-lab-accent px-4 text-[14px] font-semibold leading-[1.4] text-lab-base hover:bg-lab-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lab-accent"
        >
          <FilePlus aria-hidden="true" className="h-4 w-4" />
          新建文章
        </Link>
      </header>

      <section
        aria-label="管理内容指标"
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="min-h-[104px] rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-4"
            >
              <div className="flex items-center gap-2 text-lab-accent">
                <Icon aria-hidden={true} className="h-4 w-4" />
                <h2 className="text-[14px] font-normal leading-[1.4] text-lab-text-muted">
                  {metric.label}
                </h2>
              </div>
              <p className="mt-3 font-mono text-[28px] font-semibold leading-[1.2] text-lab-text">
                {metric.value}
              </p>
            </div>
          );
        })}
      </section>

      {!hasPosts ? (
        <section className="rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface p-5 sm:p-6">
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
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <PostPanel
          title="最近编辑"
          posts={data.recentPosts}
          emptyCopy="还没有编辑记录。"
        />
        <PostPanel
          title="草稿队列"
          posts={data.draftQueue}
          emptyCopy="草稿队列为空。"
        />
      </div>

      <div className="flex justify-end">
        <Link
          href="/admin/posts"
          className="inline-flex min-h-11 items-center justify-center rounded-lab border border-[var(--lab-border-hairline)] px-3 text-[14px] leading-[1.4] text-lab-text-muted hover:border-[var(--lab-border-active)] hover:bg-lab-surface-strong hover:text-lab-text"
        >
          全部文章
        </Link>
      </div>
    </div>
  );
}

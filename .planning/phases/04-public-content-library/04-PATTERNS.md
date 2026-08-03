# Phase 04: Public Content Library - Pattern Map

**Mapped:** 2026-07-06  
**Files analyzed:** 46 target files  
**Analogs found:** 44 / 46  

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | config | dependency transform | `package.json` | exact |
| `package-lock.json` | config | dependency transform | `package.json` | partial |
| `prisma/schema.prisma` | model | CRUD | `prisma/schema.prisma` | exact |
| `prisma/migrations/*_add_post_featured/migration.sql` | migration | CRUD | `prisma/migrations/20260703020348_init_content_admin/migration.sql` | exact |
| `src/lib/public/content-queries.ts` | service | CRUD, search, transform | `src/lib/admin/post-queries.ts` | role-match |
| `src/lib/public/revalidate.ts` | utility | event-driven | `src/lib/admin/post-mutations.ts` | partial |
| `src/lib/markdown/public-render.tsx` | utility/component | transform | `src/components/markdown/MarkdownPreview.tsx` + `src/lib/markdown/markdown-policy.ts` | role-match |
| `src/lib/seo/article-metadata.ts` | utility | transform | `src/app/layout.tsx` | partial |
| `src/app/(public)/page.tsx` | route | request-response | `src/app/(public)/page.tsx` | exact |
| `src/app/(public)/notes/page.tsx` | route | request-response, CRUD | `src/app/(public)/notes/page.tsx` + `src/app/admin/(protected)/posts/page.tsx` | role-match |
| `src/app/(public)/notes/[slug]/page.tsx` | route | request-response | `src/app/admin/(protected)/posts/[postId]/page.tsx` | role-match |
| `src/app/(public)/tags/[slug]/page.tsx` | route | request-response, CRUD | `src/app/admin/(protected)/posts/[postId]/page.tsx` | role-match |
| `src/app/(public)/categories/[slug]/page.tsx` | route | request-response, CRUD | `src/app/admin/(protected)/posts/[postId]/page.tsx` | role-match |
| `src/app/(public)/archive/page.tsx` | route | request-response, batch | `src/app/(public)/archive/page.tsx` | exact |
| `src/app/(public)/series/page.tsx` | route | request-response, CRUD | `src/app/(public)/series/page.tsx` | exact |
| `src/app/(public)/series/[slug]/page.tsx` | route | request-response, CRUD | `src/app/admin/(protected)/posts/[postId]/page.tsx` | role-match |
| `src/app/(public)/search/page.tsx` | route | request-response, search | `src/app/(public)/search/page.tsx` | exact |
| `src/components/public/content/PublicEmptyState.tsx` | component | request-response | `src/app/(public)/notes/page.tsx` | role-match |
| `src/components/public/content/PublicNoteList.tsx` | component | CRUD, transform | `src/components/admin/AdminPostList.tsx` | role-match |
| `src/components/public/content/PublicNoteCard.tsx` | component | CRUD, transform | `src/components/admin/AdminPostList.tsx` + `src/components/public/FeaturedNoteCard.tsx` | role-match |
| `src/components/public/content/PostVisualBlock.tsx` | component | transform, file-I/O | `src/components/public/ArticlePreviewShell.tsx` | partial |
| `src/components/public/content/ArticlePage.tsx` | component | request-response | `src/components/public/ArticlePreviewShell.tsx` | role-match |
| `src/components/public/content/ArticleHeader.tsx` | component | transform | `src/components/admin/AdminPostList.tsx` | role-match |
| `src/components/public/content/ArticleMarkdown.tsx` | component | transform | `src/components/markdown/MarkdownPreview.tsx` | role-match |
| `src/components/public/content/TableOfContents.tsx` | component | request-response, event-driven | `src/components/public/ContentRouteStrip.tsx` + `src/components/public/SiteHeader.tsx` | partial |
| `src/components/public/content/RelatedArticlesRail.tsx` | component | CRUD, transform | `src/components/public/FeaturedNoteCard.tsx` + `src/components/admin/AdminDashboard.tsx` | role-match |
| `src/components/public/content/SeriesNavigation.tsx` | component | request-response | `src/components/public/SiteHeader.tsx` | role-match |
| `src/components/public/content/TaxonomyPageHeader.tsx` | component | request-response | `src/app/(public)/notes/page.tsx` | role-match |
| `src/components/public/content/ArchiveTimeline.tsx` | component | batch, transform | `src/components/admin/AdminDashboard.tsx` | role-match |
| `src/components/public/content/SeriesIndex.tsx` | component | CRUD, transform | `src/components/public/ContentRouteStrip.tsx` | role-match |
| `src/components/public/content/SeriesDetailList.tsx` | component | CRUD, transform | `src/components/admin/AdminPostList.tsx` | role-match |
| `src/components/public/content/SearchForm.tsx` | component | request-response, event-driven | `src/components/admin/PostEditorShell.tsx` | partial |
| `src/components/public/content/SearchResults.tsx` | component | search, transform | `src/components/admin/AdminPostList.tsx` | role-match |
| `src/components/public/content/FeaturedNotesModule.tsx` | component | CRUD, transform | `src/app/(public)/page.tsx` + `src/components/public/FeaturedNoteCard.tsx` | role-match |
| `src/components/admin/AdminPublishControls.tsx` | component | event-driven, request-response | `src/components/admin/DeletePostDialog.tsx` | role-match |
| `src/components/admin/PostEditorShell.tsx` | component | event-driven, request-response | `src/components/admin/PostEditorShell.tsx` | exact |
| `src/components/admin/AdminPostList.tsx` | component | CRUD, event-driven | `src/components/admin/AdminPostList.tsx` | exact |
| `src/lib/admin/post-queries.ts` | service | CRUD, transform | `src/lib/admin/post-queries.ts` | exact |
| `src/lib/admin/post-input.ts` | utility | validation, transform | `src/lib/admin/post-input.ts` | exact |
| `src/lib/admin/post-mutations.ts` | service | CRUD, request-response | `src/lib/admin/post-mutations.ts` | exact |
| `src/app/globals.css` | config/style | transform | `src/app/globals.css` | exact |
| `src/tests/e2e/public-content-library.spec.ts` | test | request-response, CRUD | `src/tests/e2e/public-shell.spec.ts` + `src/tests/e2e/admin-authoring.spec.ts` | role-match |
| `src/tests/e2e/admin-mutations.spec.ts` | test | request-response, security | `src/tests/e2e/admin-mutations.spec.ts` | exact |
| `src/tests/e2e/admin-authoring.spec.ts` | test | CRUD, event-driven | `src/tests/e2e/admin-authoring.spec.ts` | exact |
| `src/tests/e2e/data-model-foundation.spec.ts` | test | model/config validation | `src/tests/e2e/data-model-foundation.spec.ts` | exact |
| `src/tests/e2e/public-shell.spec.ts` | test | request-response, responsive | `src/tests/e2e/public-shell.spec.ts` | exact |

## Pattern Assignments

### `src/lib/public/content-queries.ts` (service, CRUD/search/transform)

**Analog:** `src/lib/admin/post-queries.ts`

**Imports pattern** (lines 1-4):
```typescript
import "server-only";

import { PublicationStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
```

**Relation include/select pattern** (lines 62-88):
```typescript
const adminPostInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  series: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  tags: {
    select: {
      tag: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
};
```

**DTO mapping pattern** (lines 90-122):
```typescript
function mapPostSummary(post: {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  coverImage: string | null;
  updatedAt: Date;
  createdAt: Date;
  publishedAt: Date | null;
  seriesOrder: number | null;
  category: AdminPostSummary["category"];
  series: AdminPostSummary["series"];
  tags: { tag: AdminPostSummary["tags"][number] }[];
}): AdminPostSummary {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    status: post.status,
    coverImage: post.coverImage,
    updatedAt: post.updatedAt.toISOString(),
    createdAt: post.createdAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    seriesOrder: post.seriesOrder,
    category: post.category,
    series: post.series,
    tags: post.tags
      .map(({ tag }) => tag)
      .sort((left, right) => left.name.localeCompare(right.name)),
  };
}
```

**Query orchestration pattern** (lines 135-180):
```typescript
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [recentPosts, draftQueue, drafts, categories, tags, series] =
    await Promise.all([
      prisma.post.findMany({
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: adminPostInclude,
      }),
      prisma.post.findMany({
        where: {
          status: PublicationStatus.DRAFT,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        take: 5,
        include: adminPostInclude,
      }),
      prisma.post.count({
        where: {
          status: PublicationStatus.DRAFT,
        },
      }),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.series.count(),
    ]);

  return {
    metrics: {
      drafts,
      recentlyEdited: recentPosts.length,
      categories,
      tags,
      series,
    },
    recentPosts: recentPosts.map(mapPostSummary),
    draftQueue: draftQueue.map(mapPostSummary),
  };
}

export async function getAdminPostList() {
  const posts = await prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: adminPostInclude,
  });

  return posts.map(mapPostSummary);
}
```

**Apply to:** centralize all public list, detail, taxonomy, archive, series, search, related, featured, and statistics queries here. Public helpers must add `status: PublicationStatus.PUBLISHED` and `publishedAt: { not: null }`; do not call `prisma.post.findMany` directly from public page files.

---

### Public Route Pages (route, request-response)

**Targets:** `src/app/(public)/notes/page.tsx`, `src/app/(public)/archive/page.tsx`, `src/app/(public)/series/page.tsx`, `src/app/(public)/search/page.tsx`, `src/app/(public)/page.tsx`

**Analog:** existing public placeholder pages and admin server pages.

**Public page shell pattern** (`src/app/(public)/notes/page.tsx` lines 1-31):
```tsx
import Link from "next/link";

export default function NotesPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-[1120px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-[720px]">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          笔记
        </p>
        <h1
          className="mt-3 text-[40px] font-semibold leading-[1.1] text-lab-text"
          lang="zh-Hans"
        >
          笔记尚未发布
        </h1>
        <p
          className="mt-6 text-[16px] font-normal leading-[1.5] text-lab-text-muted"
          lang="zh-Hans"
        >
          写作工作流和内容系统接入后，已发布的技术笔记会出现在这里。
        </p>
```

**Server page data-loading pattern** (`src/app/admin/(protected)/posts/page.tsx` lines 1-7):
```tsx
import { AdminPostList } from "@/components/admin/AdminPostList";
import { getAdminPostList } from "@/lib/admin/post-queries";

export default async function AdminPostsPage() {
  const posts = await getAdminPostList();

  return <AdminPostList posts={posts} />;
}
```

**Homepage composition pattern** (`src/app/(public)/page.tsx` lines 1-7, 32-70):
```tsx
import { Archive, BookOpenText, Layers } from "lucide-react";
import { ArticlePreviewShell } from "@/components/public/ArticlePreviewShell";
import { ContentRouteStrip } from "@/components/public/ContentRouteStrip";
import { FeaturedNoteCard } from "@/components/public/FeaturedNoteCard";
import { HeroIdentity } from "@/components/public/HeroIdentity";
import { LabBackground } from "@/components/visual/LabBackground";

export default function Home() {
  return (
    <>
      <LabBackground enableCanvas>
        <HeroIdentity />
      </LabBackground>
      <ContentRouteStrip />

      <section
        className="px-4 py-16 sm:px-6 lg:px-8"
        aria-label="内容模块"
      >
        <div className="mx-auto w-full max-w-[1120px]">
          ...
        </div>
      </section>

      <ArticlePreviewShell />
    </>
  );
}
```

**Apply to:** keep public pages as server components, fetch through `src/lib/public/content-queries.ts`, render Chinese visible copy, and keep max widths/padding consistent with existing public pages.

---

### Dynamic Public Route Pages (route, request-response)

**Targets:** `src/app/(public)/notes/[slug]/page.tsx`, `src/app/(public)/tags/[slug]/page.tsx`, `src/app/(public)/categories/[slug]/page.tsx`, `src/app/(public)/series/[slug]/page.tsx`

**Analog:** `src/app/admin/(protected)/posts/[postId]/page.tsx`

**Dynamic params + 404 pattern** (lines 1-31):
```tsx
import { notFound } from "next/navigation";

import { PostEditorShell } from "@/components/admin/PostEditorShell";
import { getAdminPostEditorData } from "@/lib/admin/post-queries";

type EditAdminPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function EditAdminPostPage({
  params,
}: EditAdminPostPageProps) {
  const { postId } = await params;
  const { post, categories, tags, series } =
    await getAdminPostEditorData(postId);

  if (!post) {
    notFound();
  }

  return (
    <PostEditorShell
      mode="edit"
      post={post}
      categories={categories}
      tags={tags}
      series={series}
    />
  );
}
```

**Apply to:** use `params: Promise<{ slug: string }>` and `notFound()` for missing or unpublished content. The same 404 behavior must be used for draft, archived, unpublished, and nonexistent slugs.

---

### `src/lib/markdown/public-render.tsx` and `ArticleMarkdown.tsx` (transform)

**Analogs:** `src/components/markdown/MarkdownPreview.tsx`, `src/lib/markdown/markdown-policy.ts`, `src/app/globals.css`

**Markdown imports pattern** (`MarkdownPreview.tsx` lines 1-9):
```tsx
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import {
  markdownPreviewAllowedElements,
  markdownPreviewDisallowedRawHtmlPolicy,
} from "@/lib/markdown/markdown-policy";
```

**Component override pattern** (`MarkdownPreview.tsx` lines 15-35):
```tsx
const previewComponents = {
  a({ children, href, ...props }) {
    return (
      <a
        href={href}
        rel="noreferrer"
        target={href?.startsWith("http") ? "_blank" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="lab-markdown-table-scroll">
        <table {...props}>{children}</table>
      </div>
    );
  },
} satisfies Components;
```

**Safe renderer pattern** (`MarkdownPreview.tsx` lines 37-59):
```tsx
export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  if (!markdown.trim()) {
    return (
      <div className="lab-markdown-preview">
        <p className="text-lab-muted">预览会随着输入实时更新。</p>
      </div>
    );
  }

  return (
    <div className="lab-markdown-preview">
      <ReactMarkdown
        allowedElements={[...markdownPreviewAllowedElements]}
        components={previewComponents}
        rehypePlugins={[rehypeSlug, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        skipHtml={markdownPreviewDisallowedRawHtmlPolicy.skipHtml}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
```

**Raw HTML policy pattern** (`markdown-policy.ts` lines 1-31):
```typescript
export const markdownPreviewAllowedElements = [
  "a",
  "blockquote",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul",
] as const;

export const markdownPreviewDisallowedRawHtmlPolicy = {
  skipHtml: true,
  rehypeRaw: false,
  rawHtmlInjection: false,
} as const;
```

**Overflow style pattern** (`globals.css` lines 299-354):
```css
.lab-markdown-preview code {
  border: 1px solid var(--lab-border-hairline);
  border-radius: 8px;
  background: #070a0f;
  padding: 2px 6px;
  color: #e8f0f8;
  font-family: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
  font-size: 14px;
}

.lab-markdown-preview pre {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--lab-border-hairline);
  border-radius: 8px;
  background: #070a0f;
  padding: 16px;
}

.lab-markdown-preview pre code {
  display: block;
  width: max-content;
  min-width: 100%;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  line-height: 1.5;
}

.lab-markdown-table-scroll {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--lab-border-hairline);
  border-radius: 8px;
}
```

**Apply to:** public Markdown should keep the same `skipHtml`/sanitize/GFM policy, then add server-side Shiki code rendering and TOC extraction. Do not introduce `rehype-raw` or broad `dangerouslySetInnerHTML`.

---

### Public Content Components (component, transform)

**Targets:** `PublicNoteList`, `PublicNoteCard`, `PostVisualBlock`, `ArticlePage`, `ArticleHeader`, `TableOfContents`, `RelatedArticlesRail`, `SeriesNavigation`, `TaxonomyPageHeader`, `ArchiveTimeline`, `SeriesIndex`, `SeriesDetailList`, `SearchResults`, `FeaturedNotesModule`, `PublicEmptyState`

**Analogs:** `src/components/admin/AdminPostList.tsx`, `src/components/public/FeaturedNoteCard.tsx`, `src/components/public/ContentRouteStrip.tsx`, `src/components/public/ArticlePreviewShell.tsx`

**Repeated card/component props pattern** (`FeaturedNoteCard.tsx` lines 1-19):
```tsx
import type { LucideIcon } from "lucide-react";

export type FeaturedNoteCardProps = {
  title: string;
  label: string;
  description: string;
  state: string;
  icon: LucideIcon;
};

export function FeaturedNoteCard({
  title,
  label,
  description,
  state,
  icon: Icon,
}: FeaturedNoteCardProps) {
  return (
    <article className="lab-glow-card rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/78 p-5 transition-colors duration-150 hover:border-[var(--lab-border-active)]">
```

**Dense list row pattern** (`AdminPostList.tsx` lines 72-131):
```tsx
<section className="overflow-hidden rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface shadow-[inset_0_1px_0_rgba(232,240,248,0.04)]">
  {posts.length > 0 ? (
    <ul>
      {posts.map((post) => (
        <li
          key={post.id}
          data-testid={`post-row-${post.id}`}
          className="grid gap-4 border-b border-[var(--lab-border-hairline)] p-4 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_260px_auto]"
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
```

**Metadata chip pattern** (`AdminPostList.tsx` lines 97-118):
```tsx
<div className="min-w-0 text-[14px] leading-[1.4] text-lab-text-muted">
  <p className="font-mono text-[13px] text-lab-muted">
    更新于 {formatDate(post.updatedAt)}
  </p>
  <div className="mt-3 flex flex-wrap gap-2">
    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
      <Folder aria-hidden="true" className="h-3.5 w-3.5" />
      {post.category?.name ?? "未分类"}
    </span>
    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
      <Tag aria-hidden="true" className="h-3.5 w-3.5" />
      {post.tags.length} 个标签
    </span>
    <span className="inline-flex min-h-8 items-center gap-1 rounded-lab border border-[var(--lab-border-hairline)] px-2">
      <ListOrdered aria-hidden="true" className="h-3.5 w-3.5" />
      {seriesLabel(post)}
    </span>
  </div>
  <p className="sr-only">{metadataLabel(post)}</p>
</div>
```

**Public route icon/link pattern** (`ContentRouteStrip.tsx` lines 1-16, 44-70):
```tsx
import Link from "next/link";
import {
  Archive,
  BookOpenText,
  Layers,
  Search,
  type LucideIcon,
} from "lucide-react";
import { contentRoutes, type ContentRoute } from "@/config/routes";

const routeIcons = {
  notes: BookOpenText,
  series: Layers,
  archive: Archive,
  search: Search,
} satisfies Record<ContentRoute["key"], LucideIcon>;

<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {contentRoutes.map((route) => {
    const Icon = routeIcons[route.key];

    return (
      <div
        key={route.key}
        className="lab-glow-card rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/76 p-4"
      >
        <div className="flex min-h-11 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lab border border-[var(--lab-border-active)] text-lab-accent">
            <Icon size={18} aria-hidden="true" strokeWidth={1.8} />
          </span>
```

**Reading surface pattern** (`ArticlePreviewShell.tsx` lines 1-42):
```tsx
export function ArticlePreviewShell() {
  return (
    <section
      className="px-4 py-16 sm:px-6 lg:px-8"
      aria-label="阅读预览"
    >
      <div className="lab-reading-surface mx-auto w-full max-w-[840px] rounded-lab border border-[var(--lab-border-hairline)] bg-lab-surface/76 p-5 sm:p-6">
        <p className="font-mono text-[14px] font-normal leading-[1.4] text-lab-accent">
          阅读界面
        </p>
        <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] text-lab-text">
          阅读版式预览
        </h2>
        ...
        <pre className="mt-6 overflow-x-auto rounded-lab border border-[var(--lab-border-hairline)] bg-lab-base p-4 text-[14px] leading-[1.4] text-lab-text">
          <code>{`type DraftState = "sketch" | "review" | "ready";
```

**Apply to:** keep public library UI dense and scannable, use semantic `article`, `section`, `nav`, and `ul/li`, preserve `min-w-0`, `flex-wrap`, `truncate` or internal scroll patterns, and keep visible text Chinese-first.

---

### Admin Featured/Publish Controls (component + service, request-response)

**Targets:** `src/components/admin/AdminPublishControls.tsx`, `src/components/admin/PostEditorShell.tsx`, `src/components/admin/AdminPostList.tsx`, `src/lib/admin/post-input.ts`, `src/lib/admin/post-mutations.ts`, `src/lib/admin/post-queries.ts`

**Analogs:** `PostEditorShell.tsx`, `DeletePostDialog.tsx`, `post-input.ts`, `post-mutations.ts`, `post-queries.ts`

**Client fetch + router refresh pattern** (`PostEditorShell.tsx` lines 232-304):
```tsx
async function saveDraft() {
  const nextForm = {
    ...form,
    slug: form.slug.trim().toLowerCase(),
  };
  const nextErrors = validateDraft(nextForm);

  setStatus(null);
  setErrors(nextErrors);

  if (Object.keys(nextErrors).length > 0) {
    return;
  }

  const operation = savedPostId ? "edit" : "create";
  const response = await fetch(`/api/admin/posts/${operation}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      ...nextForm,
      id: savedPostId || undefined,
      categoryId: nextForm.categoryId || null,
      newCategoryName: nextForm.newCategoryName.trim(),
      tagIds: nextForm.tagIds,
      newTagNames: splitTaxonomyNames(nextForm.newTagNames),
      seriesId: nextForm.seriesId || null,
      newSeriesName: nextForm.newSeriesName.trim(),
    }),
  });

  ...
  setStatus("草稿已保存");
  startTransition(() => {
    router.refresh();
  });
}
```

**Confirmation dialog pattern** (`DeletePostDialog.tsx` lines 20-40, 54-118):
```tsx
async function deletePost() {
  setError(null);

  const response = await fetch("/api/admin/posts/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({ id: postId }),
  });

  if (!response.ok) {
    setError("删除失败，请重试。");
    return;
  }

  setOpen(false);
  startTransition(() => {
    router.refresh();
  });
}

{open ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-lab-base/78 px-4 py-8">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="w-full max-w-[480px] rounded-lab border border-[rgba(255,107,107,0.38)] bg-lab-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.46)]"
    >
```

**Zod validation pattern** (`post-input.ts` lines 102-137, 187-229):
```typescript
const baseDraftInputSchema = z.object({
  title: trimmedRequiredString("标题不能为空。"),
  slug: slugSchema,
  excerpt: optionalTrimmedString,
  bodyMarkdown: trimmedRequiredString("正文不能为空。"),
  coverImage: coverImageSchema,
  categoryId: optionalTaxonomyIdSchema,
  newCategoryName: optionalTrimmedString,
  tagIds: taxonomyIdsSchema,
  newTagNames: taxonomyNamesSchema,
  seriesId: optionalTaxonomyIdSchema,
  newSeriesName: optionalTrimmedString,
  seriesOrder: seriesOrderSchema,
}).superRefine((input, context) => {
  if (
    input.seriesOrder !== null &&
    !input.seriesId &&
    !input.newSeriesName.trim()
  ) {
    context.addIssue({
      code: "custom",
      path: ["seriesOrder"],
      message: "设置排序前请先选择系列。",
    });
  }
});

export function parseEditPostInput(input: unknown) {
  const result = editPostInputSchema.safeParse(input);

  if (!result.success) {
    throw validationErrorFromZod(result.error);
  }

  return result.data;
}
```

**Guard-first mutation dispatcher** (`post-mutations.ts` lines 513-534):
```typescript
export async function runGuardedPostMutation(
  operation: AdminPostOperation,
  readInput: LazyInputReader = readEmptyAdminPostInput,
): Promise<AdminPostMutationResult> {
  const adminSession = await requireAdmin();

  if (operation === "publish" || operation === "unpublish") {
    return boundaryResponse(operation, adminSession.email);
  }

  const input = await readAdminPostInput(readInput);

  if (operation === "create") {
    return createDraftPost(input, adminSession.email);
  }

  if (operation === "edit") {
    return editDraftPost(input, adminSession.email);
  }

  return deleteDraftPost(input, adminSession.email);
}
```

**Transaction + taxonomy write pattern** (`post-mutations.ts` lines 379-482):
```typescript
async function createDraftPost(input: unknown, adminEmail: string) {
  const parsedInput = parseCreatePostInput(input);
  await assertSlugAvailable(parsedInput.slug);

  try {
    const post = await prisma.$transaction(async (tx) => {
      const categoryId = await resolveCategoryInput(tx, parsedInput);
      const tagIds = await resolveTagInputs(tx, parsedInput);
      const seriesId = await resolveSeriesInput(tx, parsedInput);
      const seriesOrder = seriesId ? parsedInput.seriesOrder : null;

      await validateSeriesOrderAvailable(tx, seriesId, seriesOrder);

      const createdPost = await tx.post.create({
        data: {
          ...draftWriteData(parsedInput),
          categoryId,
          seriesId,
          seriesOrder,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          updatedAt: true,
          categoryId: true,
          seriesId: true,
          seriesOrder: true,
        },
      });

      await replacePostTags(tx, createdPost.id, tagIds);
```

**Apply to:** add `featured` to admin DTOs, editor state, validation, and save payload. Replace the publish/unpublish boundary response with real guarded mutations that parse `{ id }`, preserve `publishedAt` on republish, return to `DRAFT` on unpublish, and call public revalidation after successful writes. Keep request JSON reading after `requireAdmin()`.

---

### Prisma Schema, Migration, and Package Changes (model/config)

**Targets:** `prisma/schema.prisma`, `prisma/migrations/*_add_post_featured/migration.sql`, `package.json`, `package-lock.json`

**Analogs:** current schema, initial migration, package pins.

**Post model pattern** (`schema.prisma` lines 51-73):
```prisma
model Post {
  id           String            @id @default(cuid())
  title        String
  slug         String            @unique
  excerpt      String
  bodyMarkdown String
  coverImage   String?
  status       PublicationStatus @default(DRAFT)
  publishedAt  DateTime?
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  categoryId   String?
  seriesId     String?
  seriesOrder  Int?
  category     Category?         @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  series       Series?           @relation(fields: [seriesId], references: [id], onDelete: SetNull)
  tags         PostTag[]

  @@index([status])
  @@index([publishedAt])
  @@index([categoryId])
  @@index([seriesId, seriesOrder])
  @@unique([seriesId, seriesOrder])
}
```

**Migration column/index style** (`20260703020348_init_content_admin/migration.sql` lines 27-42, 102-118):
```sql
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "coverImage" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,
    "seriesId" TEXT,
    "seriesOrder" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");
CREATE INDEX "Post_status_idx" ON "Post"("status");
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt");
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");
CREATE INDEX "Post_seriesId_seriesOrder_idx" ON "Post"("seriesId", "seriesOrder");
CREATE UNIQUE INDEX "Post_seriesId_seriesOrder_key" ON "Post"("seriesId", "seriesOrder");
```

**Package pin pattern** (`package.json` lines 18-33):
```json
"dependencies": {
  "@node-rs/argon2": "2.0.2",
  "@prisma/adapter-pg": "7.8.0",
  "@prisma/client": "7.8.0",
  "@uiw/react-md-editor": "4.1.1",
  "lucide-react": "1.22.0",
  "motion": "12.42.0",
  "next": "16.2.9",
  "pg": "8.22.0",
  "react": "19.2.7",
  "react-dom": "19.2.7",
  "react-markdown": "10.1.0",
  "rehype-sanitize": "6.0.0",
  "rehype-slug": "6.0.0",
  "remark-gfm": "4.0.1",
  "zod": "4.4.3"
}
```

**Apply to:** add `featured Boolean @default(false)` near publication fields on `Post`, create a Prisma migration with a default false backfill, and install exact dependency pins from research only after the Shiki human verification checkpoint. Do not manually edit generated Prisma files; regenerate them.

---

### Tests (test, request-response/CRUD/security)

**Targets:** `src/tests/e2e/public-content-library.spec.ts`, `src/tests/e2e/admin-mutations.spec.ts`, `src/tests/e2e/admin-authoring.spec.ts`, `src/tests/e2e/data-model-foundation.spec.ts`, `src/tests/e2e/public-shell.spec.ts`

**Analogs:** current Playwright specs.

**Fixture cleanup/seed pattern** (`admin-authoring.spec.ts` lines 66-152):
```typescript
async function cleanupPhase3Posts() {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.post.deleteMany({
      where: {
        slug: {
          startsWith: "phase-3-",
        },
      },
    });
    await prisma.category.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: "phase-3-" } },
          { name: { startsWith: "第三阶段" } },
        ],
      },
    });
    ...
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPhase3Post({
  title,
  slug,
  excerpt = "",
  bodyMarkdown = "# Seeded draft",
  seriesId,
  seriesOrder,
  updatedAt,
}: SeedPostInput) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        bodyMarkdown,
        status: "DRAFT",
        seriesId,
        seriesOrder,
        updatedAt,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}
```

**Guard-first source assertion pattern** (`admin-mutations.spec.ts` lines 183-228):
```typescript
test("keeps the mutation dispatcher guard-first and the route body-free", () => {
  const dispatcher = readFileSync(
    "src/lib/admin/post-mutations.ts",
    "utf8",
  );
  const dispatcherBody = extractFunctionBody(
    dispatcher,
    "runGuardedPostMutation",
  )
    .replace(/\/\/.*$/gm, "")
    .trim();
  const firstExecutableStatement =
    dispatcherBody
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) ?? "";

  expect(firstExecutableStatement).toMatch(
    /^(await\s+requireAdmin\(\)|(?:const|let)\s+\w+\s*=\s*await\s+requireAdmin\(\))/,
  );

  const guardOffset = dispatcherBody.indexOf("requireAdmin");
  expect(guardOffset).toBeGreaterThanOrEqual(0);
  const beforeGuard = dispatcherBody.slice(0, guardOffset);
  expect(beforeGuard).not.toMatch(
    /request\.|\.json\(|formData\(|z\.|prisma\.post/,
  );
```

**Public empty-state and overflow pattern** (`public-shell.spec.ts` lines 203-221, 242-263):
```typescript
test("renders Chinese-first empty states for public content routes @homepage-routes", async ({
  page,
}) => {
  for (const route of contentRoutes) {
    await page.goto(route.path);

    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: route.heading }),
    ).toHaveAttribute("lang", "zh-Hans");
    await expect(page.locator("main")).toContainText(route.label);
    await expect(page.getByText(/写作工作流|内容系统|发布后/)).toBeVisible();
    await expect(page.getByText(/Loading|加载中/)).toHaveCount(0);
    await expect(page.locator("main").getByRole("button")).toHaveCount(0);
  }
});

const hasHorizontalOverflow = await page.evaluate(
  () =>
    document.documentElement.scrollWidth >
    document.documentElement.clientWidth,
);
expect(hasHorizontalOverflow).toBe(false);
```

**Markdown safety test pattern** (`admin-authoring.spec.ts` lines 536-590):
```typescript
test("renders safe Markdown preview without raw HTML execution or page overflow", async ({
  page,
}) => {
  await signInAdmin(page);
  await page.goto("/admin/posts/new");
  await fillDraftEditor(page, {
    title: "第三阶段预览样例",
    bodyMarkdown: [
      "# 第三阶段预览样例",
      "",
      "[safe link](https://example.com/docs)",
      "",
      ...
      '<script>window.__phase3_xss = true</script><strong>raw-html-fixture</strong>',
    ].join("\n"),
  });
  await showPreviewPane(page);

  const preview = page.getByLabel("正文预览");
  await expect(preview.locator("script")).toHaveCount(0);
  await expect(preview.locator("strong").filter({ hasText: "raw-html-fixture" })).toHaveCount(0);
  await expect(
    page.evaluate(() => Reflect.get(window, "__phase3_xss")),
  ).resolves.toBeUndefined();
  await assertNoHorizontalOverflow(page);
});
```

**Schema/package assertion pattern** (`data-model-foundation.spec.ts` lines 24-55, 57-86):
```typescript
test("package pins, scripts, and forbidden auth dependencies are correct", () => {
  const pkg = readJson<PackageJson>("package.json");

  expect(pkg.type).toBe("module");
  expect(pkg.dependencies).toMatchObject({
    "@node-rs/argon2": "2.0.2",
    "@prisma/adapter-pg": "7.8.0",
    "@prisma/client": "7.8.0",
    pg: "8.22.0",
    zod: "4.4.3",
  });
  ...
});

test("Prisma schema captures content taxonomy and single-admin sessions", () => {
  expect(existsSync(join(root, "prisma/schema.prisma"))).toBe(true);

  const schema = readText("prisma/schema.prisma");

  for (const declaration of [
    "enum PublicationStatus",
    "model AdminUser",
    "model AdminSession",
    "model Post",
    "model Tag",
    "model Category",
    "model Series",
    "model PostTag",
  ]) {
    expect(schema).toContain(declaration);
  }
```

**Apply to:** create Phase 4 fixtures with `phase-4-` prefixes, clean them before/after tests, verify drafts do not appear in detail, search, taxonomy, archive, series, related articles, or homepage modules, and keep no fake committed content.

## Shared Patterns

### Auth and CSRF

**Source:** `src/lib/auth/admin.ts`, `src/lib/auth/csrf.ts`, `src/app/api/admin/posts/[operation]/route.ts`, `src/lib/admin/post-mutations.ts`  
**Apply to:** admin publish/unpublish/featured mutations and any admin-only controls.

```typescript
// src/lib/auth/admin.ts lines 21-29
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new UnauthorizedAdminError();
  }

  return session;
}
```

```typescript
// src/lib/auth/csrf.ts lines 34-50
export function rejectCrossOriginAdminRequest(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return new NextResponse(FORBIDDEN_ORIGIN_MESSAGE, { status: 403 });
  }

  try {
    if (getExpectedOrigins(request).has(new URL(origin).origin)) {
      return null;
    }
  } catch {
    return new NextResponse(FORBIDDEN_ORIGIN_MESSAGE, { status: 403 });
  }

  return new NextResponse(FORBIDDEN_ORIGIN_MESSAGE, { status: 403 });
}
```

```typescript
// src/app/api/admin/posts/[operation]/route.ts lines 48-63
const csrfFailure = rejectCrossOriginAdminRequest(request);

if (csrfFailure) {
  return csrfFailure;
}

const { operation } = await params;

if (!isAdminPostOperation(operation)) {
  return notFoundResponse();
}

return NextResponse.json(
  await runGuardedPostMutation(operation, () => request.json()),
);
```

### Public Shell and Navigation

**Source:** `src/components/public/PublicShell.tsx`, `src/components/public/SiteHeader.tsx`, `src/config/routes.ts`, `src/config/site.ts`  
**Apply to:** all public pages and public content links.

```tsx
// src/components/public/PublicShell.tsx lines 5-18
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-shell min-h-svh bg-lab-base text-lab-text">
      <SiteHeader />
      <main
        id="main-content"
        className="relative z-10 mx-auto min-h-[calc(100svh-64px)] w-full"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
```

```typescript
// src/config/routes.ts lines 3-32
export const contentRoutes = [
  {
    key: "notes",
    href: "/notes",
    label: siteConfig.navigation.notes,
    description: "聚合技术写作、实现记录和踩坑复盘。",
    icon: "BookOpenText",
  },
  ...
] as const;
```

### Lab Design Tokens and Markdown Styling

**Source:** `src/app/globals.css`  
**Apply to:** public cards, rails, article body, code blocks, tables, empty states, and admin controls.

```css
/* lines 3-18 */
@theme {
  --color-lab-base: #070a0f;
  --color-lab-surface: #111822;
  --color-lab-surface-strong: #182232;
  --color-lab-text: #e8f0f8;
  --color-lab-text-muted: #a8b3c2;
  --color-lab-muted: #728096;
  --color-lab-accent: #2ef2b5;
  --radius-lab: 8px;
  --font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
}

:root {
  --lab-border-hairline: rgba(168, 179, 194, 0.18);
  --lab-border-active: rgba(46, 242, 181, 0.32);
}
```

```css
/* lines 391-420 */
@media (prefers-reduced-motion: reduce) {
  html:focus-within {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 80ms !important;
  }

  .lab-background__static::after {
    animation: none !important;
    transform: none;
  }
}
```

### Error Handling

**Source:** `src/app/api/admin/posts/[operation]/route.ts`, `src/lib/admin/post-mutations.ts`  
**Apply to:** admin API routes and mutation helpers.

```typescript
// src/app/api/admin/posts/[operation]/route.ts lines 64-74
} catch (error) {
  if (error instanceof UnauthorizedAdminError) {
    return unauthorizedResponse(error);
  }

  if (error instanceof AdminPostValidationError) {
    return validationResponse(error);
  }

  throw error;
}
```

```typescript
// src/lib/admin/post-mutations.ts lines 369-377
function mapPrismaWriteError(error: unknown): never {
  if (isRecordWithCode(error) && error.code === "P2002") {
    throw new AdminPostValidationError({
      slug: duplicateSlugMessage,
    });
  }

  throw error;
}
```

### Date Formatting and Metadata

**Source:** `src/components/admin/AdminPostList.tsx`, `src/components/admin/AdminDashboard.tsx`  
**Apply to:** public publish date, archive month grouping labels, reading-time metadata rows.

```typescript
// src/components/admin/AdminPostList.tsx lines 17-26
const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
```

### App Metadata

**Source:** `src/app/layout.tsx`  
**Apply to:** site defaults and public metadata helpers.

```tsx
// src/app/layout.tsx lines 1-7
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hans 的技术实验室",
  description: "记录技术笔记、系统草图和软件构建实验的个人技术实验室。",
};
```

## No Close Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/public/revalidate.ts` | utility | event-driven | No existing source imports or calls `revalidatePath`; use `src/lib/admin/post-mutations.ts` for guarded mutation/snapshot style and `04-RESEARCH.md` for the revalidation design. |
| `src/lib/seo/article-metadata.ts` | utility | transform | Only static app metadata exists; no dynamic `generateMetadata` helper exists in source. Use `src/app/layout.tsx` for copy/source style and `04-RESEARCH.md` for Next metadata API guidance. |

## Metadata

**Analog search scope:** `src/app`, `src/components`, `src/lib`, `src/tests/e2e`, `prisma`, `package.json`  
**Repo files scanned:** 99  
**Source/planning files inspected with line numbers:** 24 source/test/schema/config files plus 3 phase inputs  
**Pattern extraction date:** 2026-07-06  


import { readFile } from "node:fs/promises";
import { renderToStaticMarkup } from "react-dom/server";

import nextEnv from "@next/env";
import { expect, test, type Locator, type Page } from "@playwright/test";

import { PublicationStatus } from "../../generated/prisma/enums";

const phase4Prefix = "phase-4-";

async function getPrisma() {
  nextEnv.loadEnvConfig(process.cwd());
  const { prisma } = await import("../../lib/db/prisma");

  return prisma;
}

async function cleanupPhase4Fixtures() {
  const prisma = await getPrisma();

  await prisma.post.deleteMany({
    where: {
      slug: {
        startsWith: phase4Prefix,
      },
    },
  });
  await prisma.category.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: phase4Prefix } },
        { name: { startsWith: "第四阶段" } },
      ],
    },
  });
  await prisma.tag.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: phase4Prefix } },
        { name: { startsWith: "第四阶段" } },
      ],
    },
  });
  await prisma.series.deleteMany({
    where: {
      OR: [
        { slug: { startsWith: phase4Prefix } },
        { title: { startsWith: "第四阶段" } },
      ],
    },
  });
}

async function seedPhase4PublishedBoundaryFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段分类",
      slug: `${phase4Prefix}category`,
    },
  });
  const tag = await prisma.tag.create({
    data: {
      name: "第四阶段标签",
      slug: `${phase4Prefix}tag`,
    },
  });
  const series = await prisma.series.create({
    data: {
      title: "第四阶段系列",
      slug: `${phase4Prefix}series`,
    },
  });
  const baseBody = [
    "# 第四阶段发布边界",
    "",
    "这是一篇用于验证公开查询边界的技术笔记。",
    "",
    "```ts",
    "const visibility = 'published-only';",
    "```",
  ].join("\n");

  const publishedPost = await prisma.post.create({
    data: {
      title: "第四阶段已发布笔记",
      slug: `${phase4Prefix}published-note`,
      excerpt: "公开查询应该返回这篇笔记。",
      bodyMarkdown: baseBody,
      coverImage: "https://example.com/phase-4-cover.png",
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-07-06T09:00:00.000Z"),
      categoryId: category.id,
      seriesId: series.id,
      seriesOrder: 1,
      tags: {
        create: [
          {
            tag: {
              connect: {
                id: tag.id,
              },
            },
          },
        ],
      },
    },
  });

  const fallbackPost = await prisma.post.create({
    data: {
      title: "第四阶段无封面笔记",
      slug: `${phase4Prefix}fallback-note`,
      excerpt: "没有封面时应该显示技术实验室视觉块。",
      bodyMarkdown: baseBody,
      coverImage: null,
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-07-05T08:00:00.000Z"),
      categoryId: category.id,
      tags: {
        create: [
          {
            tag: {
              connect: {
                id: tag.id,
              },
            },
          },
        ],
      },
    },
  });

  const draftPost = await prisma.post.create({
    data: {
      title: "第四阶段草稿不应公开",
      slug: `${phase4Prefix}draft-note`,
      excerpt: "草稿不应该出现在公开查询里。",
      bodyMarkdown: baseBody,
      status: PublicationStatus.DRAFT,
      categoryId: category.id,
      tags: {
        create: [
          {
            tag: {
              connect: {
                id: tag.id,
              },
            },
          },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      title: "第四阶段缺少发布时间不应公开",
      slug: `${phase4Prefix}missing-published-at`,
      excerpt: "缺少 publishedAt 的 PUBLISHED 记录也不应该公开。",
      bodyMarkdown: baseBody,
      status: PublicationStatus.PUBLISHED,
      publishedAt: null,
      categoryId: category.id,
    },
  });

  return { category, draftPost, fallbackPost, publishedPost, series, tag };
}

async function seedPhase4ArticleDetailFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段详情分类",
      slug: `${phase4Prefix}article-category`,
    },
  });
  const tag = await prisma.tag.create({
    data: {
      name: "第四阶段详情标签",
      slug: `${phase4Prefix}article-tag`,
    },
  });
  const bodyMarkdown = [
    "# 文章总览",
    "",
    "## 编译管线",
    "",
    "这段正文用于验证公开文章详情页的 Markdown 版式。",
    "",
    ":tone-blue[蓝色说明] :tone-red[红色说明] :tone-green[绿色说明] :tone-amber[琥珀说明]",
    "",
    "[外部文档](https://example.com/docs)",
    "",
    "- 步骤一：收集输入",
    "- 步骤二：输出结果",
    "",
    "![架构图](https://example.com/phase-4-diagram.png)",
    "",
    "| 阶段 | 说明 |",
    "| --- | --- |",
    "| render | phase-four-table-cell-with-a-deliberately-long-unbroken-value-for-overflow-checks-phase-four-table-cell-with-a-deliberately-long-unbroken-value-for-overflow-checks |",
    "",
    "### 渲染边界",
    "",
    "#### 实现细节",
    "",
    "```ts",
    "const stablePipelineIdentifier = 'phase-four-article-detail-code-line-that-is-long-enough-to-scroll-inside-the-code-block-phase-four-article-detail-code-line-that-is-long-enough-to-scroll-inside-the-code-block';",
    "```",
    "",
    "<strong>raw-html-fixture</strong><script>window.__phase4_article_xss = true</script>",
  ].join("\n");

  const publishedPost = await prisma.post.create({
    data: {
      title: "第四阶段文章详情",
      slug: `${phase4Prefix}article-detail`,
      excerpt: "公开文章详情应该展示安全 Markdown、目录和元数据。",
      bodyMarkdown,
      coverImage: "https://example.com/phase-4-article-cover.png",
      status: PublicationStatus.PUBLISHED,
      publishedAt: new Date("2026-07-04T10:30:00.000Z"),
      categoryId: category.id,
      tags: {
        create: [
          {
            tag: {
              connect: {
                id: tag.id,
              },
            },
          },
        ],
      },
    },
  });

  const draftPost = await prisma.post.create({
    data: {
      title: "第四阶段详情草稿",
      slug: `${phase4Prefix}article-draft`,
      excerpt: "草稿详情不能公开。",
      bodyMarkdown,
      status: PublicationStatus.DRAFT,
      categoryId: category.id,
    },
  });

  const archivedPost = await prisma.post.create({
    data: {
      title: "第四阶段详情归档",
      slug: `${phase4Prefix}article-archived`,
      excerpt: "归档详情不能公开。",
      bodyMarkdown,
      status: PublicationStatus.ARCHIVED,
      publishedAt: new Date("2026-07-03T10:30:00.000Z"),
      categoryId: category.id,
    },
  });

  const unpublishedPost = await prisma.post.create({
    data: {
      title: "第四阶段详情未发布",
      slug: `${phase4Prefix}article-unpublished`,
      excerpt: "没有发布时间的文章不能公开。",
      bodyMarkdown,
      status: PublicationStatus.PUBLISHED,
      publishedAt: null,
      categoryId: category.id,
    },
  });

  return { archivedPost, category, draftPost, publishedPost, tag, unpublishedPost };
}

async function seedPhase4OrganizationFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段组织分类",
      slug: `${phase4Prefix}org-category`,
      description: "按分类浏览公开技术笔记。",
    },
  });
  const privateCategory = await prisma.category.create({
    data: {
      name: "第四阶段私有分类",
      slug: `${phase4Prefix}private-category`,
      description: "只有草稿内容的分类不应公开。",
    },
  });
  const tag = await prisma.tag.create({
    data: {
      name: "第四阶段组织标签",
      slug: `${phase4Prefix}org-tag`,
      description: "按标签浏览公开技术笔记。",
    },
  });
  const privateTag = await prisma.tag.create({
    data: {
      name: "第四阶段私有标签",
      slug: `${phase4Prefix}private-tag`,
      description: "只有草稿内容的标签不应公开。",
    },
  });
  const series = await prisma.series.create({
    data: {
      title: "第四阶段组织系列",
      slug: `${phase4Prefix}org-series`,
      description: "按照实现顺序阅读同一主题的公开笔记。",
    },
  });
  const privateSeries = await prisma.series.create({
    data: {
      title: "第四阶段私有系列",
      slug: `${phase4Prefix}private-series`,
      description: "只有草稿内容的系列不应公开。",
    },
  });
  const bodyMarkdown = [
    "# 第四阶段组织浏览",
    "",
    "这篇笔记用于验证公开组织页面不会泄漏草稿。",
  ].join("\n");
  const createPost = (data: {
    title: string;
    slug: string;
    excerpt: string;
    status: PublicationStatus;
    publishedAt?: Date | null;
    categoryId?: string;
    seriesId?: string;
    seriesOrder?: number;
    tagId?: string;
  }) =>
    prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        bodyMarkdown,
        status: data.status,
        publishedAt: data.publishedAt,
        categoryId: data.categoryId,
        seriesId: data.seriesId,
        seriesOrder: data.seriesOrder,
        tags: data.tagId
          ? {
              create: [
                {
                  tag: {
                    connect: {
                      id: data.tagId,
                    },
                  },
                },
              ],
            }
          : undefined,
      },
    });

  const seriesFirstPost = await createPost({
    title: "第四阶段系列第一篇",
    slug: `${phase4Prefix}org-series-01`,
    excerpt: "系列详情应该先显示第一篇。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-03T07:00:00.000Z"),
    categoryId: category.id,
    seriesId: series.id,
    seriesOrder: 1,
    tagId: tag.id,
  });
  const seriesSecondPost = await createPost({
    title: "第四阶段系列第二篇",
    slug: `${phase4Prefix}org-series-02`,
    excerpt: "系列详情应该后显示第二篇。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-02T07:00:00.000Z"),
    categoryId: category.id,
    seriesId: series.id,
    seriesOrder: 2,
    tagId: tag.id,
  });
  const categoryPost = await createPost({
    title: "第四阶段分类六月笔记",
    slug: `${phase4Prefix}org-category-june`,
    excerpt: "归档应该把这篇笔记放入六月。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-06-18T07:00:00.000Z"),
    categoryId: category.id,
    tagId: tag.id,
  });
  const draftSharedPost = await createPost({
    title: "第四阶段组织草稿不应公开",
    slug: `${phase4Prefix}org-draft`,
    excerpt: "草稿不应该出现在标签、分类、归档或系列页面。",
    status: PublicationStatus.DRAFT,
    publishedAt: null,
    categoryId: category.id,
    seriesId: series.id,
    seriesOrder: 3,
    tagId: tag.id,
  });
  const missingPublishedAtPost = await createPost({
    title: "第四阶段组织缺少发布时间不应公开",
    slug: `${phase4Prefix}org-missing-published-at`,
    excerpt: "缺少发布时间的 PUBLISHED 记录不应该公开。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: null,
    categoryId: category.id,
    tagId: tag.id,
  });
  const privateDraftPost = await createPost({
    title: "第四阶段私有组织草稿",
    slug: `${phase4Prefix}private-draft`,
    excerpt: "只有草稿的组织 slug 应该返回 404。",
    status: PublicationStatus.DRAFT,
    publishedAt: null,
    categoryId: privateCategory.id,
    seriesId: privateSeries.id,
    seriesOrder: 1,
    tagId: privateTag.id,
  });

  return {
    category,
    categoryPost,
    draftSharedPost,
    missingPublishedAtPost,
    privateCategory,
    privateDraftPost,
    privateSeries,
    privateTag,
    series,
    seriesFirstPost,
    seriesSecondPost,
    tag,
  };
}

async function seedPhase4SeriesNavigationFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段导航分类",
      slug: `${phase4Prefix}series-nav-category`,
    },
  });
  const tag = await prisma.tag.create({
    data: {
      name: "第四阶段导航标签",
      slug: `${phase4Prefix}series-nav-tag`,
    },
  });
  const series = await prisma.series.create({
    data: {
      title: "第四阶段导航系列",
      slug: `${phase4Prefix}series-nav`,
      description: "用于验证文章详情页的前后系列导航。",
    },
  });
  const bodyMarkdown = [
    "## 系列导航内容",
    "",
    "这篇笔记用于验证文章详情页内的系列导航。",
  ].join("\n");
  const createSeriesPost = (data: {
    title: string;
    slug: string;
    excerpt: string;
    status: PublicationStatus;
    publishedAt?: Date | null;
    seriesOrder: number;
  }) =>
    prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        bodyMarkdown,
        status: data.status,
        publishedAt: data.publishedAt,
        categoryId: category.id,
        seriesId: series.id,
        seriesOrder: data.seriesOrder,
        tags: {
          create: [
            {
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            },
          ],
        },
      },
    });

  const firstPost = await createSeriesPost({
    title: "第四阶段导航第一篇",
    slug: `${phase4Prefix}series-nav-01`,
    excerpt: "系列导航第一篇只应显示下一篇。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-01T08:00:00.000Z"),
    seriesOrder: 1,
  });
  const middlePost = await createSeriesPost({
    title: "第四阶段导航第二篇",
    slug: `${phase4Prefix}series-nav-02`,
    excerpt: "系列导航第二篇应显示上一篇和下一篇。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-02T08:00:00.000Z"),
    seriesOrder: 2,
  });
  const draftPost = await createSeriesPost({
    title: "第四阶段导航草稿不应链接",
    slug: `${phase4Prefix}series-nav-draft`,
    excerpt: "同系列草稿不应该成为前后导航目标。",
    status: PublicationStatus.DRAFT,
    publishedAt: null,
    seriesOrder: 3,
  });
  const lastPost = await createSeriesPost({
    title: "第四阶段导航第三篇",
    slug: `${phase4Prefix}series-nav-03`,
    excerpt: "系列导航第三篇只应显示上一篇。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-03T08:00:00.000Z"),
    seriesOrder: 4,
  });

  return { draftPost, firstPost, lastPost, middlePost, series };
}

async function seedPhase4SearchHomepageFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段检索分类",
      slug: `${phase4Prefix}search-category`,
      description: "用于验证公开搜索分类匹配。",
    },
  });
  const tag = await prisma.tag.create({
    data: {
      name: "第四阶段检索标签",
      slug: `${phase4Prefix}search-tag`,
      description: "用于验证公开搜索标签匹配。",
    },
  });
  const series = await prisma.series.create({
    data: {
      title: "第四阶段检索系列",
      slug: `${phase4Prefix}search-series`,
      description: "用于验证首页公开统计。",
    },
  });
  const searchableBody = [
    "## 数据库侧检索",
    "",
    "检索唯一词只应该命中已经发布的公开笔记。",
  ].join("\n");
  const createPost = (data: {
    title: string;
    slug: string;
    excerpt: string;
    status: PublicationStatus;
    publishedAt?: Date | null;
    featured?: boolean;
    bodyMarkdown?: string;
  }) =>
    prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        bodyMarkdown: data.bodyMarkdown ?? searchableBody,
        status: data.status,
        publishedAt: data.publishedAt,
        featured: data.featured ?? false,
        categoryId: category.id,
        seriesId: series.id,
        seriesOrder:
          data.featured && data.status === PublicationStatus.PUBLISHED
            ? 1
            : null,
        tags: {
          create: [
            {
              tag: {
                connect: {
                  id: tag.id,
                },
              },
            },
          ],
        },
      },
    });

  const featuredPost = await createPost({
    title: "第四阶段精选检索笔记",
    slug: `${phase4Prefix}search-featured`,
    excerpt: "检索唯一词会出现在公开结果摘要中。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-07T07:00:00.000Z"),
    featured: true,
  });
  const normalPost = await createPost({
    title: "第四阶段普通公开笔记",
    slug: `${phase4Prefix}search-normal`,
    excerpt: "这篇公开笔记用于验证真实首页统计。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-06T07:00:00.000Z"),
  });
  const draftPost = await createPost({
    title: "第四阶段检索草稿不应公开",
    slug: `${phase4Prefix}search-draft`,
    excerpt: "检索唯一词即使命中草稿也不能出现在公开搜索或首页精选。",
    status: PublicationStatus.DRAFT,
    publishedAt: null,
    featured: true,
    bodyMarkdown: `${searchableBody}\n\n检索唯一词草稿正文。`,
  });

  return { category, draftPost, featuredPost, normalPost, series, tag };
}

async function seedPhase4RelatedArticleFixtures() {
  const prisma = await getPrisma();
  const category = await prisma.category.create({
    data: {
      name: "第四阶段相关分类",
      slug: `${phase4Prefix}related-category`,
      description: "用于验证相关文章分类匹配。",
    },
  });
  const primaryTag = await prisma.tag.create({
    data: {
      name: "第四阶段相关标签",
      slug: `${phase4Prefix}related-tag`,
      description: "用于验证相关文章标签匹配。",
    },
  });
  const secondaryTag = await prisma.tag.create({
    data: {
      name: "第四阶段辅助标签",
      slug: `${phase4Prefix}related-secondary-tag`,
      description: "用于验证非匹配标签不会影响排序。",
    },
  });
  const series = await prisma.series.create({
    data: {
      title: "第四阶段相关系列",
      slug: `${phase4Prefix}related-series`,
      description: "用于验证相关文章系列优先级。",
    },
  });
  const bodyMarkdown = [
    "## 相关笔记内容",
    "",
    "这篇笔记用于验证相关文章排序和公开可见性。",
  ].join("\n");
  const createRelatedPost = (data: {
    title: string;
    slug: string;
    excerpt: string;
    status: PublicationStatus;
    publishedAt?: Date | null;
    categoryId?: string | null;
    seriesId?: string | null;
    seriesOrder?: number | null;
    tagIds?: string[];
  }) =>
    prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        bodyMarkdown,
        status: data.status,
        publishedAt: data.publishedAt,
        categoryId: data.categoryId ?? null,
        seriesId: data.seriesId ?? null,
        seriesOrder: data.seriesOrder ?? null,
        tags: data.tagIds?.length
          ? {
              create: data.tagIds.map((tagId) => ({
                tag: {
                  connect: {
                    id: tagId,
                  },
                },
              })),
            }
          : undefined,
      },
    });

  const currentPost = await createRelatedPost({
    title: "第四阶段相关当前笔记",
    slug: `${phase4Prefix}related-current`,
    excerpt: "当前文章不应该出现在相关文章里。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-08T08:00:00.000Z"),
    categoryId: category.id,
    seriesId: series.id,
    seriesOrder: 1,
    tagIds: [primaryTag.id],
  });
  const sameSeriesPost = await createRelatedPost({
    title: "第四阶段相关同系列",
    slug: `${phase4Prefix}related-series-match`,
    excerpt: "同系列应该排在最前。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-07T08:00:00.000Z"),
    categoryId: null,
    seriesId: series.id,
    seriesOrder: 2,
    tagIds: [secondaryTag.id],
  });
  const sharedTagPost = await createRelatedPost({
    title: "第四阶段相关同标签",
    slug: `${phase4Prefix}related-tag-match`,
    excerpt: "共享标签应该排在同系列之后。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-06T08:00:00.000Z"),
    categoryId: null,
    tagIds: [primaryTag.id],
  });
  const sharedCategoryPost = await createRelatedPost({
    title: "第四阶段相关同分类",
    slug: `${phase4Prefix}related-category-match`,
    excerpt: "共享分类应该排在共享标签之后。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: new Date("2026-07-05T08:00:00.000Z"),
    categoryId: category.id,
    tagIds: [secondaryTag.id],
  });
  const draftPost = await createRelatedPost({
    title: "第四阶段相关草稿不应公开",
    slug: `${phase4Prefix}related-draft`,
    excerpt: "草稿不应该出现在相关文章和最终公开面。",
    status: PublicationStatus.DRAFT,
    publishedAt: null,
    categoryId: category.id,
    seriesId: series.id,
    seriesOrder: 3,
    tagIds: [primaryTag.id],
  });
  const missingPublishedAtPost = await createRelatedPost({
    title: "第四阶段相关缺少发布时间不应公开",
    slug: `${phase4Prefix}related-missing-published-at`,
    excerpt: "缺少发布时间不应该出现在相关文章。",
    status: PublicationStatus.PUBLISHED,
    publishedAt: null,
    categoryId: category.id,
    tagIds: [primaryTag.id],
  });

  return {
    category,
    currentPost,
    draftPost,
    missingPublishedAtPost,
    primaryTag,
    sameSeriesPost,
    series,
    sharedCategoryPost,
    sharedTagPost,
  };
}

async function expectNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
}

async function expectInternalHorizontalScroll(locator: Locator) {
  await expect(locator).toBeVisible();

  const metrics = await locator.evaluate((element) => {
    const style = window.getComputedStyle(element);

    return {
      clientWidth: element.clientWidth,
      overflowX: style.overflowX,
      scrollWidth: element.scrollWidth,
    };
  });

  expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth);
  expect(["auto", "scroll"]).toContain(metrics.overflowX);
}

async function expectWebpAsset(page: Page, assetPath: string) {
  const response = await page.request.get(new URL(assetPath, page.url()).href);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\/webp(?:;|$)/);
  expect((await response.body()).byteLength).toBeGreaterThan(0);
}

async function expectDecodedImage(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const image = element as HTMLImageElement;

        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
}

function normalizePageText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

async function readPublicContentComponentSource(fileName: string) {
  return readFile(`src/components/public/content/${fileName}.tsx`, "utf8");
}

test.describe("public content library foundation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await cleanupPhase4Fixtures();
  });

  test.beforeEach(async () => {
    await cleanupPhase4Fixtures();
  });

  test.afterAll(async () => {
    await cleanupPhase4Fixtures();
    const prisma = await getPrisma();
    await prisma.$disconnect();
  });

  test("returns only published posts with reading metadata from the public query boundary", async () => {
    const { category, publishedPost, series, tag } =
      await seedPhase4PublishedBoundaryFixtures();
    const { getPublishedPostBySlug, getPublishedPostList } = await import(
      "../../lib/public/content-queries"
    );

    const list = await getPublishedPostList();
    const slugs = list.map((post) => post.slug);

    expect(slugs).toContain(publishedPost.slug);
    expect(slugs).not.toContain(`${phase4Prefix}draft-note`);
    expect(slugs).not.toContain(`${phase4Prefix}missing-published-at`);

    const detail = await getPublishedPostBySlug(publishedPost.slug);
    expect(detail).toMatchObject({
      id: publishedPost.id,
      title: "第四阶段已发布笔记",
      slug: `${phase4Prefix}published-note`,
      status: PublicationStatus.PUBLISHED,
      publishedAt: "2026-07-06T09:00:00.000Z",
      coverImage: "https://example.com/phase-4-cover.png",
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      series: {
        id: series.id,
        title: series.title,
        slug: series.slug,
      },
      tags: [
        {
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        },
      ],
    });
    expect(detail?.bodyMarkdown).toContain("visibility");
    expect(detail?.readingTime.minutes).toBeGreaterThan(0);
    expect(detail?.readingTime.text).toContain("min read");

    await expect(
      getPublishedPostBySlug(`${phase4Prefix}draft-note`),
    ).resolves.toBeNull();
    await expect(
      getPublishedPostBySlug(`${phase4Prefix}missing-published-at`),
    ).resolves.toBeNull();
  });

  test("renders /notes as a dense published-only list with metadata and visual treatments", async ({
    page,
  }) => {
    const { category, draftPost, fallbackPost, publishedPost, tag } =
      await seedPhase4PublishedBoundaryFixtures();

    await page.goto("/notes");

    await expect(
      page.getByRole("heading", { level: 1, name: "笔记" }),
    ).toBeVisible();

    const list = page.getByTestId("public-note-list");
    await expect(list).toBeVisible();

    const coveredRow = page.getByTestId(`public-note-${publishedPost.slug}`);
    await expect(
      coveredRow.getByRole("link", { name: publishedPost.title }),
    ).toHaveAttribute("href", `/notes/${publishedPost.slug}`);
    await expect(coveredRow).toContainText(publishedPost.excerpt);
    await expect(coveredRow).toContainText(category.name);
    await expect(coveredRow).toContainText(tag.name);
    await expect(coveredRow).toContainText("2026");
    await expect(coveredRow).toContainText(/预计阅读\s+1\s+分钟/);
    const coverImage = coveredRow.getByTestId("post-visual-cover");
    await expect(coverImage).toBeVisible();
    await expect(coverImage).toHaveAttribute("referrerpolicy", "no-referrer");

    const fallbackRow = page.getByTestId(`public-note-${fallbackPost.slug}`);
    await expect(
      fallbackRow.getByRole("link", { name: fallbackPost.title }),
    ).toHaveAttribute("href", `/notes/${fallbackPost.slug}`);
    await expect(fallbackRow).toContainText(fallbackPost.excerpt);
    const fallbackImage = fallbackRow.getByTestId("post-visual-fallback");
    await expect(fallbackImage).toBeVisible();
    await expectWebpAsset(page, "/images/mecha/note-fallback-orbital.webp");
    await expectDecodedImage(fallbackImage);

    await expect(page.getByText(draftPost.title)).toHaveCount(0);
    await expect(page.getByText(draftPost.excerpt)).toHaveCount(0);

    for (const row of [coveredRow, fallbackRow]) {
      const linkBox = await row.getByRole("link").first().boundingBox();
      expect(linkBox?.height ?? 0).toBeGreaterThanOrEqual(44);

      const visualBox = await row.getByTestId("post-visual-block").boundingBox();
      expect(visualBox?.height ?? 0).toBeGreaterThanOrEqual(120);
      expect(visualBox?.width ?? 0).toBeLessThanOrEqual(360);
    }

    await expectNoHorizontalOverflow(page);
  });

  test("defines a Chinese /notes empty state without admin links or publishing instructions", async () => {
    const [notesPageSource, emptyStateSource] = await Promise.all([
      readFile("src/app/(public)/notes/page.tsx", "utf8"),
      readFile(
        "src/components/public/content/PublicEmptyState.tsx",
        "utf8",
      ),
    ]);

    expect(notesPageSource).toContain("还没有已发布的笔记");
    expect(notesPageSource).toContain(
      "暂时没有公开笔记。可以先回到博客首页查看其他入口。",
    );
    expect(emptyStateSource).toContain('href="/"');
    expect(`${notesPageSource}\n${emptyStateSource}`).not.toMatch(
      /\/admin|写作工作流|内容系统接入|后台|管理|草稿|新建|发布流程/,
    );
  });

  test("renders published article detail with safe Markdown, metadata, reading time, and generated TOC", async ({
    page,
  }) => {
    const { category, publishedPost, tag } =
      await seedPhase4ArticleDetailFixtures();

    await page.goto(`/notes/${publishedPost.slug}`);

    await expect(
      page.getByRole("heading", { level: 1, name: publishedPost.title }),
    ).toBeVisible();
    await expect(page.getByText(publishedPost.excerpt)).toBeVisible();
    await expect(page.getByText(category.name)).toBeVisible();
    await expect(page.getByText(tag.name)).toBeVisible();
    await expect(page.getByText("2026/07/04")).toBeVisible();
    await expect(page.getByText(/预计阅读\s+1\s+分钟/)).toBeVisible();

    const article = page.getByTestId("article-detail");
    const body = page.getByTestId("article-body");
    await expect(article).toBeVisible();
    await expect(
      body.getByRole("heading", { name: "编译管线" }),
    ).toBeVisible();
    await expect(
      body.getByRole("heading", { name: "渲染边界" }),
    ).toBeVisible();
    await expect(body.getByRole("link", { name: "外部文档" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(body.getByText("步骤一：收集输入")).toBeVisible();
    await expect(body.getByRole("img", { name: "架构图" })).toBeVisible();
    await expect(body.locator(".lab-markdown-table-scroll table")).toBeVisible();
    await expect(body.locator("pre.shiki.lab-code-block")).toContainText(
      "stablePipelineIdentifier",
    );
    await expect(body.locator("script")).toHaveCount(0);
    await expect(page.getByText("raw-html-fixture")).toHaveCount(0);
    await expect(
      page.evaluate(() => Reflect.get(window, "__phase4_article_xss")),
    ).resolves.toBeUndefined();

    const toc = page.getByRole("navigation", { name: "目录" });
    if ((page.viewportSize()?.width ?? 1440) < 1024) {
      await toc.getByText("目录", { exact: true }).click();
    }
    await expect(toc.getByRole("link", { name: "编译管线" })).toHaveAttribute(
      "href",
      "#article-heading-编译管线",
    );
    await expect(toc.getByRole("link", { name: "渲染边界" })).toHaveAttribute(
      "href",
      "#article-heading-渲染边界",
    );

    expect(await page.title()).toContain(publishedPost.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      publishedPost.excerpt,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      publishedPost.title,
    );
  });

  test("uses the same 404 behavior for draft, archived, unpublished, and nonexistent article slugs", async ({
    page,
  }) => {
    const { archivedPost, draftPost, unpublishedPost } =
      await seedPhase4ArticleDetailFixtures();
    const slugs = [
      draftPost.slug,
      archivedPost.slug,
      unpublishedPost.slug,
      `${phase4Prefix}article-missing`,
    ];
    const pageTexts: string[] = [];

    for (const slug of slugs) {
      const response = await page.goto(`/notes/${slug}`);

      expect(response?.status()).toBe(404);
      await expect(
        page.getByText("内容暂时无法加载。请刷新页面或稍后再试。"),
      ).toBeVisible();
      await expect(
        page.locator("#main-content").getByRole("link", { name: "返回首页" }),
      ).toHaveAttribute("href", "/");
      await expect(
        page.getByText(/第四阶段详情草稿|第四阶段详情归档|第四阶段详情未发布/),
      ).toHaveCount(0);
      pageTexts.push(normalizePageText(await page.locator("body").innerText()));
    }

    expect(new Set(pageTexts).size).toBe(1);
  });

  test("places the article TOC in the desktop rail and mobile document flow", async ({
    page,
  }) => {
    const { publishedPost } = await seedPhase4ArticleDetailFixtures();

    await page.goto(`/notes/${publishedPost.slug}`);

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const body = page.getByTestId("article-body");
    const desktopToc = page.getByTestId("article-toc-desktop");
    const mobileToc = page.getByTestId("article-toc-mobile");

    if (viewportWidth >= 1024) {
      await expect(desktopToc).toBeVisible();
      await expect(mobileToc).toBeHidden();

      const bodyBox = await body.boundingBox();
      const tocBox = await desktopToc.boundingBox();
      expect(tocBox?.x ?? 0).toBeGreaterThan(
        (bodyBox?.x ?? 0) + (bodyBox?.width ?? 0),
      );
    } else {
      await expect(mobileToc).toBeVisible();
      await expect(desktopToc).toBeHidden();
      await expect(mobileToc.locator("details")).not.toHaveAttribute("open", "");

      const bodyBox = await body.boundingBox();
      const tocBox = await mobileToc.boundingBox();
      expect(tocBox?.y ?? 0).toBeLessThan(bodyBox?.y ?? 0);

      await mobileToc.getByText("目录", { exact: true }).click();
      await expect(mobileToc.locator("details")).toHaveAttribute("open", "");
      await expect(
        mobileToc.getByRole("link", { name: "编译管线" }),
      ).toBeVisible();
    }

    await expectNoHorizontalOverflow(page);
  });

  test("keeps article code and tables scrolling inside their own blocks", async ({
    page,
  }) => {
    const { publishedPost } = await seedPhase4ArticleDetailFixtures();

    await page.goto(`/notes/${publishedPost.slug}`);

    await expectInternalHorizontalScroll(page.locator("pre.lab-code-block").first());
    await expectInternalHorizontalScroll(
      page.locator(".lab-markdown-table-scroll").first(),
    );
    await expectNoHorizontalOverflow(page);
  });

  test("renders public Markdown with Shiki, table wrappers, generated TOC, and no raw HTML", async () => {
    const { renderPublicMarkdown } = await import(
      "../../lib/markdown/public-render"
    );

    const rendered = await renderPublicMarkdown(
      [
        "# Phase 4 Title",
        "",
        "## Phase 4 Heading",
        "",
        "[safe link](https://example.com/docs)",
        "",
        "| Key | Value |",
        "| --- | --- |",
        "| phase | 04 |",
        "",
        "```ts",
        "const highlighted: string = 'server-side';",
        "```",
        "",
        "<strong>raw-html-fixture</strong><script>window.__xss = true</script>",
      ].join("\n"),
    );
    const html = renderToStaticMarkup(rendered.content);

    expect(rendered.headings).toEqual([
      {
        depth: 1,
        id: "article-heading-phase-4-title",
        text: "Phase 4 Title",
      },
      {
        depth: 2,
        id: "article-heading-phase-4-heading",
        text: "Phase 4 Heading",
      },
    ]);
    expect(html).not.toContain("<h1");
    expect(html).toContain('<h2 id="article-heading-phase-4-title"');
    expect(html).toContain('<h3 id="article-heading-phase-4-heading"');
    expect(html).toContain('id="article-heading-phase-4-heading"');
    expect(html).toContain('class="lab-markdown-table-scroll"');
    expect(html).toContain('class="shiki');
    expect(html).toContain("highlighted");
    expect(html).not.toContain("raw-html-fixture");
    expect(html).not.toContain("<script");
  });

  test("derives article metadata from the public post DTO", async () => {
    const { category, publishedPost, tag } =
      await seedPhase4PublishedBoundaryFixtures();
    const { getPublishedPostBySlug } = await import(
      "../../lib/public/content-queries"
    );
    const { createArticleMetadata } = await import(
      "../../lib/seo/article-metadata"
    );

    const post = await getPublishedPostBySlug(publishedPost.slug);
    expect(post).not.toBeNull();

    const metadata = createArticleMetadata(post!);

    expect(metadata.title).toContain("第四阶段已发布笔记");
    expect(metadata.description).toBe("公开查询应该返回这篇笔记。");
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([tag.name, category.name]),
    );
    expect(metadata.openGraph).toMatchObject({
      title: "第四阶段已发布笔记",
      description: "公开查询应该返回这篇笔记。",
      type: "article",
      images: [
        {
          url: "https://example.com/phase-4-cover.png",
        },
      ],
    });
  });

  test("lists tag and category routes with published posts only", async ({
    page,
  }) => {
    const {
      category,
      categoryPost,
      draftSharedPost,
      missingPublishedAtPost,
      seriesFirstPost,
      seriesSecondPost,
      tag,
    } = await seedPhase4OrganizationFixtures();
    const routes = [
      { href: `/tags/${tag.slug}`, label: tag.name },
      { href: `/categories/${category.slug}`, label: category.name },
    ];

    for (const route of routes) {
      await page.goto(route.href);

      await expect(
        page.getByRole("heading", { level: 1, name: route.label }),
      ).toBeVisible();
      await expect(page.getByTestId("taxonomy-page-header")).toBeVisible();
      await expect(page.getByTestId("public-note-list")).toBeVisible();
      await expect(page.getByText(seriesFirstPost.title)).toBeVisible();
      await expect(page.getByText(seriesSecondPost.title)).toBeVisible();
      await expect(page.getByText(categoryPost.title)).toBeVisible();
      await expect(page.getByText(draftSharedPost.title)).toHaveCount(0);
      await expect(page.getByText(draftSharedPost.excerpt)).toHaveCount(0);
      await expect(page.getByText(missingPublishedAtPost.title)).toHaveCount(0);
      await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("groups archive by year and month without draft leakage", async ({
    page,
  }) => {
    const {
      categoryPost,
      draftSharedPost,
      missingPublishedAtPost,
      seriesFirstPost,
      seriesSecondPost,
    } = await seedPhase4OrganizationFixtures();

    await page.goto("/archive");

    await expect(
      page.getByRole("heading", { level: 1, name: "归档" }),
    ).toBeVisible();
    const archive = page.getByTestId("archive-timeline");
    await expect(archive).toBeVisible();
    await expect(archive.getByRole("heading", { name: "2026" })).toBeVisible();
    await expect(archive.getByText("7月")).toBeVisible();
    await expect(archive.getByText("6月")).toBeVisible();
    await expect(archive.getByText(seriesFirstPost.title)).toBeVisible();
    await expect(archive.getByText(seriesSecondPost.title)).toBeVisible();
    await expect(archive.getByText(categoryPost.title)).toBeVisible();
    await expect(page.getByText(draftSharedPost.title)).toHaveCount(0);
    await expect(page.getByText(missingPublishedAtPost.title)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("renders series index entries without counts or latest-update metadata", async ({
    page,
  }) => {
    const { draftSharedPost, series } = await seedPhase4OrganizationFixtures();

    await page.goto("/series");

    await expect(
      page.getByRole("heading", { level: 1, name: "系列" }),
    ).toBeVisible();
    const index = page.getByTestId("series-index");
    await expect(index).toBeVisible();
    await expect(index.getByRole("link", { name: series.title })).toHaveAttribute(
      "href",
      `/series/${series.slug}`,
    );
    await expect(index.getByText(series.description ?? "")).toBeVisible();
    await expect(index.getByText(/篇|最新|更新于|最近/)).toHaveCount(0);
    await expect(page.getByText(draftSharedPost.title)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("orders series detail posts by seriesOrder and hides drafts", async ({
    page,
  }) => {
    const { draftSharedPost, series, seriesFirstPost, seriesSecondPost } =
      await seedPhase4OrganizationFixtures();

    await page.goto(`/series/${series.slug}`);

    await expect(
      page.getByRole("heading", { level: 1, name: series.title }),
    ).toBeVisible();
    const list = page.getByTestId("series-detail-list");
    await expect(list).toBeVisible();

    const items = list.locator('[data-testid^="series-post-"]');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toContainText("01");
    await expect(items.nth(0)).toContainText(seriesFirstPost.title);
    await expect(items.nth(1)).toContainText("02");
    await expect(items.nth(1)).toContainText(seriesSecondPost.title);
    await expect(page.getByText(draftSharedPost.title)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("returns 404 for private-only taxonomy and series slugs", async ({
    page,
  }) => {
    const { privateCategory, privateDraftPost, privateSeries, privateTag } =
      await seedPhase4OrganizationFixtures();
    const routes = [
      `/tags/${privateTag.slug}`,
      `/categories/${privateCategory.slug}`,
      `/series/${privateSeries.slug}`,
    ];

    for (const route of routes) {
      const response = await page.goto(route);

      expect(response?.status()).toBe(404);
      await expect(
        page.getByText("内容暂时无法加载。请刷新页面或稍后再试。"),
      ).toBeVisible();
      await expect(
        page.locator("#main-content").getByRole("link", { name: "返回首页" }),
      ).toHaveAttribute("href", "/");
      await expect(page.getByText(privateDraftPost.title)).toHaveCount(0);
      await expect(page.getByText(privateDraftPost.excerpt)).toHaveCount(0);
    }
  });

  test("keeps authored H1-H4 strictly descending after semantic demotion", async ({
    page,
  }) => {
    const { publishedPost } = await seedPhase4ArticleDetailFixtures();

    await page.goto(`/notes/${publishedPost.slug}`);

    const fontSizes = await page
      .getByTestId("article-body")
      .locator(":scope > h2, :scope > h3, :scope > h4, :scope > h5")
      .evaluateAll((headings) =>
        headings.map((heading) =>
          Number.parseFloat(window.getComputedStyle(heading).fontSize),
        ),
      );

    expect(fontSizes).toHaveLength(4);
    expect(
      fontSizes.every(
        (size, index) => index === 0 || fontSizes[index - 1] > size,
      ),
    ).toBe(true);
  });

  test("keeps all public text tones above 4.5:1 contrast", async ({ page }) => {
    const { publishedPost } = await seedPhase4ArticleDetailFixtures();

    await page.goto(`/notes/${publishedPost.slug}`);

    for (const tone of ["blue", "red", "green", "amber"] as const) {
      const ratio = await page
        .locator(`.lab-text-tone-${tone}`)
        .first()
        .evaluate((element) => {
          function rgb(value: string): [number, number, number, number] {
            const channels = value.match(/[\d.]+/g)?.map(Number) ?? [];

            return [
              channels[0] ?? 0,
              channels[1] ?? 0,
              channels[2] ?? 0,
              channels[3] ?? 1,
            ];
          }

          function luminance([red, green, blue]: [number, number, number]) {
            const linear = [red, green, blue].map((channel) => {
              const normalized = channel / 255;

              return normalized <= 0.04045
                ? normalized / 12.92
                : ((normalized + 0.055) / 1.055) ** 2.4;
            });

            return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
          }

          const foreground = rgb(window.getComputedStyle(element).color);
          let background: [number, number, number, number] = [255, 255, 255, 1];
          let ancestor: Element | null = element;

          while (ancestor) {
            const candidate = rgb(
              window.getComputedStyle(ancestor).backgroundColor,
            );

            if (candidate[3] >= 1) {
              background = candidate;
              break;
            }

            ancestor = ancestor.parentElement;
          }

          const lighter = Math.max(
            luminance([foreground[0], foreground[1], foreground[2]]),
            luminance([background[0], background[1], background[2]]),
          );
          const darker = Math.min(
            luminance([foreground[0], foreground[1], foreground[2]]),
            luminance([background[0], background[1], background[2]]),
          );

          return (lighter + 0.05) / (darker + 0.05);
        });

      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  test("renders article series navigation with published previous and next neighbors only", async ({
    page,
  }) => {
    const { draftPost, firstPost, lastPost, middlePost } =
      await seedPhase4SeriesNavigationFixtures();

    await page.goto(`/notes/${middlePost.slug}`);

    const navigation = page.getByTestId("series-navigation");
    await expect(
      navigation.getByRole("heading", { name: "系列导航" }),
    ).toBeVisible();

    const previousLink = navigation.getByRole("link", {
      name: new RegExp(`上一篇\\s+${firstPost.title}`),
    });
    await expect(previousLink).toHaveAttribute(
      "href",
      `/notes/${firstPost.slug}`,
    );

    const nextLink = navigation.getByRole("link", {
      name: new RegExp(`下一篇\\s+${lastPost.title}`),
    });
    await expect(nextLink).toHaveAttribute("href", `/notes/${lastPost.slug}`);

    await expect(navigation.getByText(draftPost.title)).toHaveCount(0);
    await expect(
      navigation.locator(`a[href="/notes/${draftPost.slug}"]`),
    ).toHaveCount(0);

    for (const link of [previousLink, nextLink]) {
      const box = await link.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }

    await previousLink.focus();
    await expect(previousLink).toBeFocused();

    await expectNoHorizontalOverflow(page);
  });

  test("renders only applicable series neighbors at published series boundaries", async ({
    page,
  }) => {
    const { firstPost, lastPost, middlePost } =
      await seedPhase4SeriesNavigationFixtures();

    await page.goto(`/notes/${firstPost.slug}`);
    let navigation = page.getByTestId("series-navigation");
    await expect(
      navigation.getByRole("link", {
        name: new RegExp(`下一篇\\s+${middlePost.title}`),
      }),
    ).toHaveAttribute("href", `/notes/${middlePost.slug}`);
    await expect(navigation.getByText("上一篇")).toHaveCount(0);

    await page.goto(`/notes/${lastPost.slug}`);
    navigation = page.getByTestId("series-navigation");
    await expect(
      navigation.getByRole("link", {
        name: new RegExp(`上一篇\\s+${middlePost.title}`),
      }),
    ).toHaveAttribute("href", `/notes/${middlePost.slug}`);
    await expect(navigation.getByText("下一篇")).toHaveCount(0);
  });

  test("places mobile series navigation after article content in document flow", async ({
    page,
  }) => {
    const { middlePost } = await seedPhase4SeriesNavigationFixtures();

    await page.goto(`/notes/${middlePost.slug}`);

    const body = page.getByTestId("article-body");
    const navigation = page.getByTestId("series-navigation");
    await expect(navigation).toBeVisible();

    const bodyBox = await body.boundingBox();
    const navigationBox = await navigation.boundingBox();
    expect(navigationBox?.y ?? 0).toBeGreaterThan(
      (bodyBox?.y ?? 0) + (bodyBox?.height ?? 0),
    );
    await expectNoHorizontalOverflow(page);
  });

  test("renders /search with contextual published results and no draft leakage", async ({
    page,
  }) => {
    const { category, draftPost, featuredPost, tag } =
      await seedPhase4SearchHomepageFixtures();

    await page.goto("/search?q=检索唯一词");

    await expect(
      page.getByRole("heading", { level: 1, name: "搜索" }),
    ).toBeVisible();
    await expect(page.getByLabel("搜索公开笔记")).toHaveValue("检索唯一词");
    await expect(
      page.getByRole("button", { name: "搜索" }),
    ).toBeVisible();

    const results = page.getByTestId("search-results");
    await expect(results).toBeVisible();
    const row = page.getByTestId(`search-result-${featuredPost.slug}`);
    await expect(
      row.getByRole("link", { name: featuredPost.title }),
    ).toHaveAttribute("href", `/notes/${featuredPost.slug}`);
    await expect(row).toContainText(featuredPost.excerpt);
    await expect(row).toContainText("2026/07/07");
    await expect(row).toContainText(category.name);
    await expect(row).toContainText(tag.name);
    await expect(row).toContainText(/预计阅读\s+1\s+分钟/);

    await expect(page.getByText(draftPost.title)).toHaveCount(0);
    await expect(page.getByText(draftPost.excerpt)).toHaveCount(0);
    await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
    await expect(page.getByText(/后台|管理|草稿|发布流程/)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("renders Chinese no-query and no-result search states without admin instructions", async ({
    page,
  }) => {
    await seedPhase4SearchHomepageFixtures();

    await page.goto("/search");
    await expect(
      page.getByRole("heading", { level: 1, name: "搜索" }),
    ).toBeVisible();
    await expect(
      page.getByText("输入关键词后，公开笔记中的相关结果会显示在这里。"),
    ).toBeVisible();
    await expect(page.getByTestId("search-results")).toHaveCount(0);
    await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
    await expect(page.getByText(/后台|管理|草稿|发布流程/)).toHaveCount(0);

    await page.goto("/search?q=没有命中的关键词");
    await expect(
      page.getByText("没有找到匹配的公开笔记。换一个关键词再试。"),
    ).toBeVisible();
    await expect(page.getByTestId("search-results")).toHaveCount(0);
    await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
    await expect(page.getByText(/后台|管理|草稿|发布流程/)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("renders homepage featured posts from explicit flags and real public statistics", async ({
    page,
  }) => {
    const { category, draftPost, featuredPost, normalPost, series, tag } =
      await seedPhase4SearchHomepageFixtures();

    await page.goto("/");

    const featuredModule = page.getByTestId("featured-notes-module");
    await expect(
      featuredModule.getByRole("heading", { name: "精选笔记" }),
    ).toBeVisible();
    await expect(
      featuredModule.getByRole("link", { name: featuredPost.title }),
    ).toHaveAttribute("href", `/notes/${featuredPost.slug}`);
    await expect(featuredModule).toContainText(featuredPost.excerpt);
    await expect(featuredModule).toContainText(category.name);
    await expect(featuredModule).toContainText(tag.name);
    await expect(featuredModule).toContainText(/预计阅读\s+1\s+分钟/);
    await expect(featuredModule.getByText(normalPost.title)).toHaveCount(0);
    await expect(featuredModule.getByText(draftPost.title)).toHaveCount(0);

    const stats = page.getByTestId("homepage-public-stats");
    await expect(stats).toContainText("公开笔记");
    await expect(stats).toContainText("2");
    await expect(stats).toContainText("精选笔记");
    await expect(stats).toContainText("1");
    await expect(stats).toContainText("分类");
    await expect(stats).toContainText(category.name);
    await expect(stats).toContainText("标签");
    await expect(stats).toContainText(tag.name);
    await expect(stats).toContainText("系列");
    await expect(stats).toContainText(series.title);

    await expect(page.getByText(/内容系统待接入|系列模型待接入|归档数据待接入/)).toHaveCount(0);
    await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
    await expect(page.getByText(/后台|管理|草稿|发布流程/)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("ranks related articles by series, shared tags, then category without draft leakage", async ({
    page,
  }) => {
    const {
      currentPost,
      draftPost,
      missingPublishedAtPost,
      sameSeriesPost,
      sharedCategoryPost,
      sharedTagPost,
    } = await seedPhase4RelatedArticleFixtures();
    const queries: Record<string, unknown> = await import(
      "../../lib/public/content-queries"
    );

    expect("getRelatedPublishedPosts" in queries).toBe(true);
    const getRelatedPublishedPosts = queries.getRelatedPublishedPosts as (
      post: { id: string; category: { id: string } | null; series: { id: string } | null; tags: { id: string }[] },
    ) => Promise<{ title: string; slug: string }[]>;
    const current = await (queries.getPublishedPostBySlug as (
      slug: string,
    ) => Promise<{
      id: string;
      category: { id: string } | null;
      series: { id: string } | null;
      tags: { id: string }[];
    } | null>)(currentPost.slug);

    expect(current).not.toBeNull();
    await expect(getRelatedPublishedPosts(current!)).resolves.toEqual([
      expect.objectContaining({
        slug: sameSeriesPost.slug,
        title: sameSeriesPost.title,
      }),
      expect.objectContaining({
        slug: sharedTagPost.slug,
        title: sharedTagPost.title,
      }),
      expect.objectContaining({
        slug: sharedCategoryPost.slug,
        title: sharedCategoryPost.title,
      }),
    ]);

    await page.goto(`/notes/${currentPost.slug}`);

    const related = page.getByTestId(
      (page.viewportSize()?.width ?? 1440) >= 1024
        ? "related-articles-desktop"
        : "related-articles-mobile",
    );
    await expect(
      related.getByRole("heading", { name: "相关笔记" }),
    ).toBeVisible();
    const relatedLinks = related.getByRole("link");
    await expect(relatedLinks).toHaveCount(3);
    await expect(relatedLinks.nth(0)).toContainText(sameSeriesPost.title);
    await expect(relatedLinks.nth(1)).toContainText(sharedTagPost.title);
    await expect(relatedLinks.nth(2)).toContainText(sharedCategoryPost.title);
    await expect(related.getByText(currentPost.title)).toHaveCount(0);
    await expect(related.getByText(draftPost.title)).toHaveCount(0);
    await expect(related.getByText(missingPublishedAtPost.title)).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test("places related articles below desktop TOC and after series navigation on mobile", async ({
    page,
  }) => {
    const { currentPost } = await seedPhase4RelatedArticleFixtures();

    await page.goto(`/notes/${currentPost.slug}`);

    const viewportWidth = page.viewportSize()?.width ?? 1440;
    const body = page.getByTestId("article-body");
    const desktopToc = page.getByTestId("article-toc-desktop");
    const desktopRelated = page.getByTestId("related-articles-desktop");
    const mobileRelated = page.getByTestId("related-articles-mobile");
    const seriesNavigation = page.getByTestId("series-navigation");

    if (viewportWidth >= 1024) {
      await expect(desktopToc).toBeVisible();
      await expect(desktopRelated).toBeVisible();
      await expect(mobileRelated).toBeHidden();

      const tocBox = await desktopToc.boundingBox();
      const relatedBox = await desktopRelated.boundingBox();
      expect(relatedBox?.y ?? 0).toBeGreaterThan(
        (tocBox?.y ?? 0) + (tocBox?.height ?? 0),
      );
    } else {
      await expect(desktopRelated).toBeHidden();
      await expect(mobileRelated).toBeVisible();

      const bodyBox = await body.boundingBox();
      const seriesBox = await seriesNavigation.boundingBox();
      const relatedBox = await mobileRelated.boundingBox();
      expect(relatedBox?.y ?? 0).toBeGreaterThan(
        (seriesBox?.y ?? bodyBox?.y ?? 0) +
          (seriesBox?.height ?? bodyBox?.height ?? 0),
      );
    }

    await expectNoHorizontalOverflow(page);
  });

  test("keeps final public surfaces fresh and free of drafts across notes, taxonomy, archive, series, search, related, and homepage", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const {
      category,
      currentPost,
      draftPost,
      primaryTag,
      sameSeriesPost,
      series,
      sharedTagPost,
    } = await seedPhase4RelatedArticleFixtures();
    const prisma = await getPrisma();

    await prisma.post.update({
      where: {
        id: sameSeriesPost.id,
      },
      data: {
        featured: true,
      },
    });

    const publicRoutes = [
      "/notes",
      `/notes/${currentPost.slug}`,
      `/tags/${primaryTag.slug}`,
      `/categories/${category.slug}`,
      "/archive",
      `/series/${series.slug}`,
      "/search?q=第四阶段相关",
      "/",
    ];

    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.getByText(draftPost.title)).toHaveCount(0);
      await expect(page.getByText(draftPost.excerpt)).toHaveCount(0);
      await expect(page.locator('main a[href^="/admin"]')).toHaveCount(0);
    }

    await page.goto(`/notes/${currentPost.slug}`);
    const related = page.getByTestId(
      (page.viewportSize()?.width ?? 1440) >= 1024
        ? "related-articles-desktop"
        : "related-articles-mobile",
    );
    await expect(
      related.getByRole("link", { name: sharedTagPost.title }),
    ).toBeVisible();

    await prisma.post.update({
      where: {
        id: sharedTagPost.id,
      },
      data: {
        status: PublicationStatus.DRAFT,
      },
    });

    for (const route of publicRoutes) {
      await page.goto(route);
      await expect(page.getByText(sharedTagPost.title)).toHaveCount(0);
      await expect(page.getByText(sharedTagPost.excerpt)).toHaveCount(0);
      await expect(page.getByText(draftPost.title)).toHaveCount(0);
    }
  });

  test("defines organization display components with Chinese public copy", async () => {
    const [
      taxonomySource,
      archiveSource,
      seriesIndexSource,
      seriesDetailSource,
      seriesNavigationSource,
      relatedSource,
      searchFormSource,
      searchResultsSource,
      featuredModuleSource,
      emptyStateSource,
    ] = await Promise.all([
      readPublicContentComponentSource("TaxonomyPageHeader"),
      readPublicContentComponentSource("ArchiveTimeline"),
      readPublicContentComponentSource("SeriesIndex"),
      readPublicContentComponentSource("SeriesDetailList"),
      readPublicContentComponentSource("SeriesNavigation"),
      readPublicContentComponentSource("RelatedArticlesRail"),
      readPublicContentComponentSource("SearchForm"),
      readPublicContentComponentSource("SearchResults"),
      readPublicContentComponentSource("FeaturedNotesModule"),
      readPublicContentComponentSource("PublicEmptyState"),
    ]);

    expect(taxonomySource).toContain('data-testid="taxonomy-page-header"');
    expect(taxonomySource).toContain("标签");
    expect(taxonomySource).toContain("分类");
    expect(taxonomySource).not.toMatch(/后台|草稿|发布流程|admin/);

    expect(archiveSource).toContain('data-testid="archive-timeline"');
    expect(archiveSource).toContain("getUTCFullYear");
    expect(archiveSource).toContain("getUTCMonth");
    expect(archiveSource).toContain("PublicNoteList");
    expect(archiveSource).not.toContain("prisma.");

    expect(seriesIndexSource).toContain('data-testid="series-index"');
    expect(seriesIndexSource).toContain('href={`/series/${item.slug}`}');
    expect(seriesIndexSource).toContain("description");
    expect(seriesIndexSource).not.toMatch(
      /postCount|latestUpdatedAt|最新|更新于|最近|\bcount\b/i,
    );

    expect(seriesDetailSource).toContain('data-testid="series-detail-list"');
    expect(seriesDetailSource).toContain("seriesOrder");
    expect(seriesDetailSource).toContain('padStart(2, "0")');
    expect(seriesDetailSource).toContain('href={`/notes/${post.slug}`}');
    expect(seriesDetailSource).not.toMatch(/后台|草稿|发布流程|admin/);

    expect(seriesNavigationSource).toContain('data-testid="series-navigation"');
    expect(seriesNavigationSource).toContain("系列导航");
    expect(seriesNavigationSource).toContain("上一篇");
    expect(seriesNavigationSource).toContain("下一篇");
    expect(seriesNavigationSource).toContain("return null");
    expect(seriesNavigationSource).not.toMatch(/后台|草稿|发布流程|admin/);

    expect(relatedSource).toContain("related-articles-desktop");
    expect(relatedSource).toContain("related-articles-mobile");
    expect(relatedSource).toContain("相关笔记");
    expect(relatedSource).toContain('href={`/notes/${post.slug}`}');
    expect(relatedSource).not.toMatch(/后台|草稿|发布流程|admin/);

    expect(searchFormSource).toContain("搜索公开笔记");
    expect(searchFormSource).toContain("搜索标题、正文、标签或分类");
    expect(searchFormSource).toContain('method="get"');
    expect(searchFormSource).not.toMatch(/Fuse|client index|后台|草稿|发布流程|admin/);

    expect(searchResultsSource).toContain('data-testid="search-results"');
    expect(searchResultsSource).toContain("输入关键词后，公开笔记中的相关结果会显示在这里。");
    expect(searchResultsSource).toContain("没有找到匹配的公开笔记。换一个关键词再试。");
    expect(searchResultsSource).not.toMatch(/Fuse|client index|后台|草稿|发布流程|admin/);

    expect(featuredModuleSource).toContain('data-testid="featured-notes-module"');
    expect(featuredModuleSource).toContain('data-testid="homepage-public-stats"');
    expect(featuredModuleSource).toContain("精选笔记");
    expect(featuredModuleSource).not.toMatch(/内容系统待接入|系列模型待接入|归档数据待接入|后台|草稿|发布流程|admin/);

    expect(emptyStateSource).not.toMatch(/\/admin|后台|草稿|发布流程/);
  });
});

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

import { expect, test, type Page } from "@playwright/test";
import nextEnv from "@next/env";

const sameOriginHeaders = {
  Origin: "http://127.0.0.1:3000",
};

const requiredAuthoringEnv = [
  "ADMIN_EMAIL",
  "PLAYWRIGHT_ADMIN_PASSWORD",
  "DATABASE_URL",
] as const;

type RequiredAuthoringEnv = (typeof requiredAuthoringEnv)[number];

type SeedPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  bodyMarkdown?: string;
  seriesId?: string;
  seriesOrder?: number;
  updatedAt?: Date;
};

type Phase4AuthoringPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  bodyMarkdown?: string;
  status?: "DRAFT" | "PUBLISHED";
  publishedAt?: Date | null;
  featured?: boolean;
};

function loadLocalEnvFile() {
  nextEnv.loadEnvConfig(process.cwd());
}

function getRequiredAuthoringEnv() {
  loadLocalEnvFile();

  return Object.fromEntries(
    requiredAuthoringEnv.map((key) => {
      const value = process.env[key];
      expect(
        value,
        `${key} must be set in ignored .env.local before admin authoring tests run`,
      ).toBeTruthy();

      return [key, value as string];
    }),
  ) as Record<RequiredAuthoringEnv, string>;
}

async function signInAdmin(page: Page) {
  const env = getRequiredAuthoringEnv();

  await page.goto("/admin/login");
  await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
  await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登录管理后台" }).click();
  await page.waitForURL("**/admin");

  return env;
}

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
    await prisma.tag.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: "phase-3-" } },
          { name: { startsWith: "第三阶段" } },
        ],
      },
    });
    await prisma.series.deleteMany({
      where: {
        OR: [
          { slug: { startsWith: "phase-3-" } },
          { title: { startsWith: "第三阶段" } },
        ],
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupPhase4AuthoringPosts() {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.post.deleteMany({
      where: {
        slug: {
          startsWith: "phase-4-authoring-",
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

function slugifyFixtureName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized) {
    return normalized;
  }

  const fallback = Array.from(value.trim())
    .map((character) => character.codePointAt(0)?.toString(36))
    .filter(Boolean)
    .join("-");

  return fallback ? `u-${fallback}` : "";
}

function normalizeMarkdownForAssertion(markdown: string) {
  return markdown
    .replace(/\r\n?/g, "\n")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
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

async function seedPhase4AuthoringPost({
  title,
  slug,
  excerpt = "第四阶段后台精选测试摘要。",
  bodyMarkdown = "# 第四阶段后台精选\n\n正文。",
  status = "DRAFT",
  publishedAt = null,
  featured = false,
}: Phase4AuthoringPostInput) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        bodyMarkdown,
        status,
        publishedAt,
        featured,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPhase3Category(name: string) {
  const { prisma } = await import("../../lib/db/prisma");
  const slug = slugifyFixtureName(name);

  try {
    return await prisma.category.create({
      data: {
        name,
        slug,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPhase3Series(title: string) {
  const { prisma } = await import("../../lib/db/prisma");
  const slug = slugifyFixtureName(title);

  try {
    return await prisma.series.create({
      data: {
        title,
        slug,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findPhase3PostBySlug(slug: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { slug },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findPhase3PostWithTaxonomyBySlug(slug: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { slug },
      include: {
        category: true,
        series: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findPhase3PostById(id: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findPhase4AuthoringPostById(id: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}

function extractFunctionBody(source: string, functionName: string) {
  const start = source.indexOf(functionName);
  expect(start, `${functionName} should be defined`).toBeGreaterThanOrEqual(0);

  const open = source.indexOf("{", start);
  expect(open, `${functionName} should have a function body`).toBeGreaterThan(
    -1,
  );

  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(open + 1, index);
      }
    }
  }

  throw new Error(`${functionName} should have a balanced function body`);
}

async function fillDraftEditor(
  page: Page,
  {
    title,
    slug,
    excerpt,
    coverImage,
    bodyMarkdown,
  }: {
    title: string;
    slug?: string;
    excerpt?: string;
    coverImage?: string;
    bodyMarkdown: string;
  },
) {
  await page.getByLabel("标题", { exact: true }).fill(title);

  if (slug) {
    await page.getByLabel("URL 路径").fill(slug);
  }

  if (excerpt !== undefined) {
    await page.getByLabel("摘要").fill(excerpt);
  }

  if (coverImage !== undefined) {
    await page.getByLabel("封面图 URL").fill(coverImage);
  }

  const wysiwygCanvas = page.locator(".lab-wysiwyg-canvas .ProseMirror");

  if ((await wysiwygCanvas.count()) > 0 && (await wysiwygCanvas.isVisible())) {
    await wysiwygCanvas.click();
    await page.keyboard.press("Control+A");
    await page.keyboard.press("Backspace");
    await page.keyboard.type(bodyMarkdown);
    return;
  }

  await page.getByRole("textbox", { name: "正文" }).fill(bodyMarkdown);
}

async function expectDraftEditorToContain(page: Page, text: string) {
  const wysiwygCanvas = page.locator(".lab-wysiwyg-canvas .ProseMirror");

  if ((await wysiwygCanvas.count()) > 0 && (await wysiwygCanvas.isVisible())) {
    await expect(wysiwygCanvas).toContainText(text);
    return;
  }

  await expect(page.getByRole("textbox", { name: "正文" })).toHaveValue(
    new RegExp(text),
  );
}

function collectSourceFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const pathname = join(directory, entry);
    const stats = statSync(pathname);

    if (stats.isDirectory()) {
      return collectSourceFiles(pathname);
    }

    return /\.(ts|tsx|css)$/.test(pathname) ? [pathname] : [];
  });
}

test.describe("admin authoring workflow", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    getRequiredAuthoringEnv();
    await cleanupPhase3Posts();
    await cleanupPhase4AuthoringPosts();
  });

  test.afterAll(async () => {
    await cleanupPhase3Posts();
    await cleanupPhase4AuthoringPosts();
  });

  test("keeps draft mutation input lazy and guard-first", () => {
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

    const route = readFileSync(
      "src/app/api/admin/posts/[operation]/route.ts",
      "utf8",
    );
    const postStart = route.indexOf("POST");
    expect(postStart, "POST route handler should be defined").toBeGreaterThan(
      -1,
    );
    const postBody = route.slice(postStart).replace(/\s+/g, " ");
    const lazyReadCall = "readBoundedAdminPostJson(request)";

    expect(postBody).toContain(lazyReadCall);
    expect(postBody.replace(lazyReadCall, "")).not.toMatch(
      /request\.json|formData|prisma\.post/,
    );
  });

  test("renders the writing dashboard for an authenticated admin", async ({
    page,
  }) => {
    await signInAdmin(page);

    await expect(
      page.getByRole("heading", { name: "写作控制台" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "新建文章" })).toBeVisible();
    await expect(page.getByText("最近编辑的草稿和技术笔记都在这里。")).toBeVisible();
    const metrics = page.getByRole("region", { name: "管理内容指标" });
    await expect(
      metrics.getByRole("heading", { name: "最近编辑", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "草稿队列" })).toBeVisible();
    await expect(
      metrics.getByRole("heading", { name: "草稿", exact: true }),
    ).toBeVisible();
    await expect(
      metrics.getByRole("heading", { name: "分类", exact: true }),
    ).toBeVisible();
    await expect(
      metrics.getByRole("heading", { name: "标签", exact: true }),
    ).toBeVisible();
    await expect(
      metrics.getByRole("heading", { name: "系列", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /publish/i })).toHaveCount(0);
  });

  test("sets and unsets featured state from protected editor and list controls", async ({
    page,
  }) => {
    const post = await seedPhase4AuthoringPost({
      title: "第四阶段精选控制草稿",
      slug: "phase-4-authoring-feature-controls",
    });
    await signInAdmin(page);

    await page.goto(`/admin/posts/${post.id}`);
    await expect(
      page.getByRole("button", { name: "发布文章" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "设为精选" }).click();
    await expect(
      page.getByRole("button", { name: "取消精选" }),
    ).toBeVisible();
    expect(await findPhase4AuthoringPostById(post.id)).toMatchObject({
      featured: true,
    });

    await page.goto("/admin/posts");
    const row = page.getByTestId(`post-row-${post.id}`);
    await expect(row.getByText("精选", { exact: true })).toBeVisible();
    await row.getByRole("button", { name: "取消精选" }).click();
    await expect(row.getByRole("button", { name: "设为精选" })).toBeVisible();
    expect(await findPhase4AuthoringPostById(post.id)).toMatchObject({
      featured: false,
    });
  });

  test("requires destructive confirmation before unpublishing from protected controls", async ({
    page,
  }) => {
    const post = await seedPhase4AuthoringPost({
      title: "第四阶段取消发布确认",
      slug: "phase-4-authoring-unpublish-confirm",
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    await signInAdmin(page);

    await page.goto(`/admin/posts/${post.id}`);
    await expect(
      page.getByRole("button", { name: "取消发布" }),
    ).toBeVisible();

    const dialogPromise = page
      .waitForEvent("dialog", { timeout: 1000 })
      .then(async (dialog) => {
        const message = dialog.message();
        await dialog.dismiss();

        return message;
      });
    await page.getByRole("button", { name: "取消发布" }).click();

    expect(await dialogPromise).toBe(
      `取消发布文章：这会将「${post.title}」从公开笔记、搜索、标签、分类、归档、系列和相关文章中移除。`,
    );

    await expect(
      page.getByRole("button", { name: "取消发布" }),
    ).toBeVisible();
    expect(await findPhase4AuthoringPostById(post.id)).toMatchObject({
      status: "PUBLISHED",
    });
  });

  test("creates, edits, lists, and hard-deletes a draft", async ({ page }) => {
    await seedPhase3Post({
      title: "第三阶段较早草稿",
      slug: "phase-3-older-draft",
      excerpt: "用于排序验证的较早草稿。",
      updatedAt: new Date(Date.now() - 86_400_000),
    });
    await signInAdmin(page);

    await page.getByRole("link", { name: "新建文章" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/new$/);
    await fillDraftEditor(page, {
      title: "第三阶段草稿冒烟",
      slug: "phase-3-draft-smoke",
      excerpt: "由第三阶段写作测试创建的小草稿。",
      coverImage: "https://example.com/phase-3-cover.png",
      bodyMarkdown: "# 草稿冒烟\n\n写作正文。",
    });
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "phase-3-draft-smoke",
    );
    await expect(page.getByRole("button", { name: /publish/i })).toHaveCount(0);

    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostBySlug("phase-3-draft-smoke");
    expect(createdPost).toMatchObject({
      title: "第三阶段草稿冒烟",
      excerpt: "由第三阶段写作测试创建的小草稿。",
      status: "DRAFT",
    });
    expect(createdPost?.coverImage).toBe(
      "https://example.com/phase-3-cover.png",
    );

    await page.goto("/admin/posts");
    const listedTitles = await page
      .getByTestId("admin-post-title")
      .allTextContents();
    expect(listedTitles.indexOf("第三阶段草稿冒烟")).toBeGreaterThanOrEqual(
      0,
    );
    expect(listedTitles.indexOf("第三阶段较早草稿")).toBeGreaterThanOrEqual(
      0,
    );
    expect(listedTitles.indexOf("第三阶段草稿冒烟")).toBeLessThan(
      listedTitles.indexOf("第三阶段较早草稿"),
    );

    await page
      .getByTestId(`post-row-${createdPost?.id}`)
      .getByRole("link", { name: "编辑" })
      .click();
    await fillDraftEditor(page, {
      title: "第三阶段草稿冒烟已编辑",
      slug: "phase-3-draft-smoke-edited",
      excerpt: "已编辑的草稿摘要。",
      bodyMarkdown: "# 草稿冒烟已编辑\n\n已编辑的写作正文。",
    });
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const editedPost = await findPhase3PostBySlug(
      "phase-3-draft-smoke-edited",
    );
    expect(editedPost).toMatchObject({
      title: "第三阶段草稿冒烟已编辑",
      excerpt: "已编辑的草稿摘要。",
      status: "DRAFT",
    });
    expect(normalizeMarkdownForAssertion(editedPost?.bodyMarkdown ?? "")).toBe(
      "# 草稿冒烟已编辑\n\n已编辑的写作正文。",
    );

    await page.goto("/admin/posts");
    await page
      .getByTestId(`post-row-${editedPost?.id}`)
      .getByRole("button", { name: "删除" })
      .click();
    const dialog = page.getByRole("dialog", { name: "删除文章？" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      '这会永久删除「第三阶段草稿冒烟已编辑」，且无法撤销。',
    );
    await dialog.getByRole("button", { name: "确认删除" }).click();
    await expect(page.getByText("第三阶段草稿冒烟已编辑")).toHaveCount(0);
    const missingPublishResponse = await page.request.post(
      "/api/admin/posts/publish",
      {
        headers: sameOriginHeaders,
        data: { id: "phase-3-noop" },
      },
    );
    expect(missingPublishResponse.status()).toBe(400);
    await expect(missingPublishResponse.json()).resolves.toMatchObject({
      fieldErrors: {
        id: "文章不存在。",
      },
    });

    expect(await findPhase3PostById(editedPost?.id ?? "")).toBeNull();
  });

  test("shows validation and duplicate slug errors", async ({ page }) => {
    await seedPhase3Post({
      title: "第三阶段重复草稿",
      slug: "phase-3-duplicate",
    });
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("标题不能为空。")).toBeVisible();
    await expect(page.getByText("正文不能为空。")).toBeVisible();

    await fillDraftEditor(page, {
      title: "第三阶段无效路径",
      slug: "Invalid Slug!",
      bodyMarkdown: "# 无效路径正文",
    });
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(
      page.getByText("URL 路径只能使用小写字母、数字和连字符。"),
    ).toBeVisible();

    await page.getByLabel("URL 路径").fill("phase-3-duplicate");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(
      page.getByText("这个 URL 路径已被其他笔记使用。"),
    ).toBeVisible();
  });

  test("derives the slug from the title until it is manually edited", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await page
      .getByLabel("标题", { exact: true })
      .fill("Phase 3 Automatic Slug");
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "phase-3-automatic-slug",
    );

    await page.getByLabel("URL 路径").fill("phase-3-manual-path");
    await page
      .getByLabel("标题", { exact: true })
      .fill("Phase 3 Changed Title");
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "phase-3-manual-path",
    );
  });

  test("imports a local Markdown file into a reviewable draft", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");
    const importedHardBreakMarkdown = "硬换行第一行   \n硬换行第二行";
    const canonicalHardBreakMarkdown = "硬换行第一行  \n硬换行第二行";

    await page.getByTestId("markdown-import-input").setInputFiles({
      name: "ignored-file-name.md",
      mimeType: "text/markdown",
      buffer: Buffer.from(`---
title: 第三阶段 Markdown 导入
slug: phase-3-imported-markdown
description: 从本地文件安全导入。
tags: 第三阶段 Import, 第三阶段 Markdown
category: 第三阶段导入分类
series: 第三阶段导入系列
seriesOrder: 1
status: published
featured: true
---
# 第三阶段 Markdown 导入

导入正文
--------

导入后仍需手动保存和发布。

导入 ++下划线++ 与 ++**粗体下划线**++。

${importedHardBreakMarkdown}

* _星号列表_

- [ ] 待办
- [x] 已完成

~~删除内容~~

:tone-purple[未知颜色转普通文字] 与 :tone-blue[蓝色文字]。

阅读 [参考资料][guide] 或访问 https://example.com/path。

[guide]: https://example.com/guide

发布于 12:30，访问 localhost:3000，版本:beta。
`),
    });

    await expect(page.getByLabel("标题", { exact: true })).toHaveValue(
      "第三阶段 Markdown 导入",
    );
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "phase-3-imported-markdown",
    );
    await expect(page.getByLabel("摘要")).toHaveValue(
      "从本地文件安全导入。",
    );
    await expect(page.getByLabel("新建分类")).toHaveValue(
      "第三阶段导入分类",
    );
    await expect(page.getByLabel("新建标签")).toHaveValue(
      "第三阶段 Import, 第三阶段 Markdown",
    );
    await expect(page.getByLabel("新建系列")).toHaveValue(
      "第三阶段导入系列",
    );
    await expect(page.getByLabel("系列排序")).toHaveValue("1");
    await expectDraftEditorToContain(page, "导入后仍需手动保存和发布。");
    await expect(page.locator(".lab-wysiwyg-canvas u")).toHaveText([
      "下划线",
      "粗体下划线",
    ]);
    await expect(
      page.locator(".lab-wysiwyg-canvas strong u"),
    ).toHaveText("粗体下划线");
    await expectDraftEditorToContain(page, "硬换行第一行");
    await expectDraftEditorToContain(page, "硬换行第二行");
    await expectDraftEditorToContain(page, "星号列表");
    await expectDraftEditorToContain(page, "未知颜色转普通文字");
    await expect(page.locator(".lab-wysiwyg-canvas s")).toHaveText(
      "删除内容",
    );
    await expect(
      page.locator('.lab-wysiwyg-canvas input[type="checkbox"]'),
    ).toHaveCount(2);
    await expect(
      page.locator('.lab-wysiwyg-canvas input[type="checkbox"]:checked'),
    ).toHaveCount(1);
    await expect(
      page.locator(".lab-wysiwyg-canvas .lab-text-tone-blue"),
    ).toHaveText("蓝色文字");
    await expect(
      page.locator(".lab-wysiwyg-canvas .lab-text-tone-purple"),
    ).toHaveCount(0);
    await expectDraftEditorToContain(page, "localhost:3000");
    await expect(page.getByText(/已导入 ignored-file-name\.md/)).toBeVisible();
    await expect(
      page.getByText(/不支持的文字颜色已转为普通文字/),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /发布/ })).toHaveCount(0);

    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const imported = await findPhase3PostWithTaxonomyBySlug(
      "phase-3-imported-markdown",
    );
    expect(imported).toMatchObject({
      excerpt: "从本地文件安全导入。",
      status: "DRAFT",
      featured: false,
    });
    expect(imported?.bodyMarkdown).toContain("## 导入正文");
    expect(imported?.bodyMarkdown).toContain("++下划线++");
    expect(imported?.bodyMarkdown).toContain("++**粗体下划线**++");
    expect(imported?.bodyMarkdown).toContain(canonicalHardBreakMarkdown);
    expect(imported?.bodyMarkdown).toContain("- *星号列表*");
    expect(imported?.bodyMarkdown).toContain("- [ ] 待办");
    expect(imported?.bodyMarkdown).toContain("- [x] 已完成");
    expect(imported?.bodyMarkdown).toContain("~~删除内容~~");
    expect(imported?.bodyMarkdown).toContain("未知颜色转普通文字");
    expect(imported?.bodyMarkdown).not.toContain(":tone-purple[");
    expect(imported?.bodyMarkdown).toContain(":tone-blue[蓝色文字]");
    expect(imported?.bodyMarkdown).toContain("发布于 12:30");
    expect(imported?.bodyMarkdown).toContain("localhost:3000");
    expect(imported?.bodyMarkdown).not.toContain(
      "# 第三阶段 Markdown 导入\n",
    );
    expect(imported?.category?.name).toBe("第三阶段导入分类");
    expect(imported?.series?.title).toBe("第三阶段导入系列");
  });

  test("rejects oversized Markdown before reading it and preserves the draft", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      const originalArrayBuffer = Blob.prototype.arrayBuffer;
      const testWindow = window as Window & {
        __markdownImportArrayBufferReads?: number;
      };

      testWindow.__markdownImportArrayBufferReads = 0;
      Blob.prototype.arrayBuffer = function arrayBuffer(this: Blob) {
        if (this instanceof File && this.name === "too-large.md") {
          testWindow.__markdownImportArrayBufferReads =
            (testWindow.__markdownImportArrayBufferReads ?? 0) + 1;
        }

        return originalArrayBuffer.call(this);
      };
    });
    await signInAdmin(page);
    await page.goto("/admin/posts/new");
    await page.getByLabel("标题", { exact: true }).fill("保留中的草稿");
    await page.getByLabel("URL 路径").fill("preserve-before-large-import");

    await page.getByTestId("markdown-import-input").setInputFiles({
      name: "too-large.md",
      mimeType: "text/markdown",
      buffer: Buffer.alloc(1024 * 1024 + 1, 0x61),
    });

    await expect(
      page.getByRole("alert").filter({ hasText: "Markdown 文件不能超过 1 MiB。" }),
    ).toContainText("Markdown 文件不能超过 1 MiB。");
    await expect(page.getByLabel("标题", { exact: true })).toHaveValue(
      "保留中的草稿",
    );
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "preserve-before-large-import",
    );
    expect(
      await page.evaluate(
        () =>
          (
            window as Window & {
              __markdownImportArrayBufferReads?: number;
            }
          ).__markdownImportArrayBufferReads,
      ),
    ).toBe(0);
  });

  test("asks before replacing a slug-only draft and cancellation changes nothing", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");
    await page.getByLabel("URL 路径").fill("keep-this-manual-slug");

    let confirmMessage = "";
    const confirmation = new Promise<void>((resolve) => {
      page.once("dialog", async (dialog) => {
        confirmMessage = dialog.message();
        await dialog.dismiss();
        resolve();
      });
    });

    await page.getByTestId("markdown-import-input").setInputFiles({
      name: "replacement.md",
      mimeType: "text/markdown",
      buffer: Buffer.from("# Replacement\n\nReplacement body."),
    });
    await confirmation;

    expect(confirmMessage).toBe("导入会覆盖当前未保存的草稿内容，是否继续？");
    await expect(page.getByLabel("URL 路径")).toHaveValue(
      "keep-this-manual-slug",
    );
    await expect(page.getByLabel("标题", { exact: true })).toHaveValue("");
    await expect(page.getByText(/已导入 replacement\.md/)).toHaveCount(0);
  });

  test("blocks editing incompatible legacy markdown", async ({
    page,
  }) => {
    const blockedPost = await seedPhase3Post({
      title: "第三阶段不兼容正文",
      slug: "phase-3-incompatible-body",
      bodyMarkdown: [
        "# 不兼容正文",
        "",
        "<div>legacy html</div>",
      ].join("\n"),
    });
    await signInAdmin(page);
    await page.goto(`/admin/posts/${blockedPost.id}`);

    await expect(
      page.getByRole("region", { name: "正文无法进入可视化编辑" }),
    ).toBeVisible();
    await expect(page.getByText("包含 raw HTML。")).toBeVisible();
    await expect(page.getByRole("button", { name: "保存草稿" })).toBeDisabled();
    await expect(
      page.getByRole("region", { name: "正文画布" }),
    ).toHaveCount(0);
    await expect(page.getByTestId("markdown-editor-client")).toHaveCount(0);
  });

  test("keeps editor packages out of public source", () => {
    const sourceFiles = collectSourceFiles("src").filter(
      (file) => !file.replaceAll("\\", "/").startsWith("src/tests/"),
    );
    const editorImportFiles = sourceFiles
      .filter((file) =>
        readFileSync(file, "utf8").includes("@uiw/react-md-editor"),
      )
      .map((file) => file.replaceAll("\\", "/"));

    expect(editorImportFiles).toEqual([]);

    const publicReachableFiles = [
      ...collectSourceFiles("src/app/(public)"),
      ...collectSourceFiles("src/components/public"),
      ...collectSourceFiles("src/components/markdown"),
      ...collectSourceFiles("src/lib/markdown"),
      ...collectSourceFiles("src/lib/public"),
    ];

    for (const file of publicReachableFiles) {
      const source = readFileSync(file, "utf8");
      expect(source, `${file} must not import admin editor code`).not.toMatch(
        /@uiw\/react-md-editor|@uiw\/react-md-editor\/.*\.css|@tiptap\//,
      );
    }
  });

  test("reopens compatible posts in the WYSIWYG editor and saves Markdown", async ({
    page,
  }) => {
    const post = await seedPhase3Post({
      title: "第三阶段可视化编辑器",
      slug: "phase-3-visual-editor",
    });
    await signInAdmin(page);
    await page.goto(`/admin/posts/${post.id}`);

    await expect(
      page.getByRole("region", { name: "正文画布" }),
    ).toBeVisible();
    await expect(page.getByTestId("markdown-editor-client")).toHaveCount(0);
    await fillDraftEditor(page, {
      title: "第三阶段可视化编辑器",
      slug: "phase-3-visual-editor",
      bodyMarkdown: "# 可视化编辑检查\n\n保存后仍是 Markdown。",
    });
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const editedPost = await findPhase3PostById(post.id);

    expect(editedPost?.bodyMarkdown).toContain("保存后仍是 Markdown。");
  });

  test("persists markdown after visual code-block editing", async ({ page }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await page.getByLabel("标题", { exact: true }).fill("第三阶段可视化公开回归");
    await page.getByLabel("URL 路径").fill("phase-3-visual-public-regression");
    await page.getByRole("button", { name: "插入代码块" }).click();
    await page.getByRole("button", { name: "编辑代码块" }).click();
    await page.locator(".lab-code-node-content").click();
    await page.keyboard.type("const publicCheck = true;");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostBySlug(
      "phase-3-visual-public-regression",
    );

    expect(createdPost?.bodyMarkdown).toContain("```");
    await expect(
      page.getByRole("region", { name: "正文画布" }),
    ).toBeVisible();
    expect(createdPost?.bodyMarkdown).toContain("const publicCheck = true;");
  });

  test("inserts image URLs from the WYSIWYG toolbar and persists Markdown", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await page.getByLabel("标题", { exact: true }).fill("第三阶段图片插入回归");
    await page.getByLabel("URL 路径").fill("phase-3-image-insert-regression");
    await page.getByRole("button", { name: "插入图片" }).click();
    await page
      .getByRole("textbox", { name: "或使用图片 URL" })
      .fill("https://example.com/phase-3-inline-image.png");
    await page.getByRole("button", { name: "插入 URL" }).click();

    await expect(
      page
        .getByRole("region", { name: "正文画布" })
        .locator('img[src="https://example.com/phase-3-inline-image.png"]'),
    ).toBeVisible();

    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostBySlug(
      "phase-3-image-insert-regression",
    );

    expect(createdPost?.bodyMarkdown).toContain(
      "![](https://example.com/phase-3-inline-image.png)",
    );
  });

  test("uploads images by picker, drop, and paste with draft-private publishing", async ({
    browser,
    page,
  }) => {
    const { randomBytes } = await import("node:crypto");
    const { default: sharp } = await import("sharp");
    const image = await sharp(randomBytes(32 * 24 * 3), {
      raw: {
        width: 32,
        height: 24,
        channels: 3,
      },
    })
      .png()
      .toBuffer();
    const imageBase64 = image.toString("base64");

    await signInAdmin(page);
    await page.goto("/admin/posts/new");
    await page.getByLabel("标题", { exact: true }).fill("第三阶段本地图片回归");
    await page.getByLabel("URL 路径").fill("phase-3-local-image-regression");

    await page.getByRole("button", { name: "插入图片" }).click();
    let dialog = page.getByRole("dialog", { name: "插入图片" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("图片说明（建议填写）").fill("本地选择图片");
    await dialog.locator('input[type="file"]').setInputFiles({
      name: "picker.png",
      mimeType: "image/png",
      buffer: image,
    });
    await expect(dialog).toHaveCount(0);
    await expect(
      page.locator('.lab-wysiwyg-canvas img[alt="本地选择图片"]'),
    ).toHaveCount(1);

    await page.getByRole("button", { name: "插入图片" }).click();
    dialog = page.getByRole("dialog", { name: "插入图片" });
    await dialog.getByLabel("图片说明（建议填写）").fill("拖入图片");
    await dialog.locator(".lab-image-dropzone").evaluate(
      (dropzone, encoded) => {
        const bytes = Uint8Array.from(atob(encoded), (value) =>
          value.charCodeAt(0),
        );
        const transfer = new DataTransfer();
        transfer.items.add(
          new File([bytes], "drop.png", { type: "image/png" }),
        );
        dropzone.dispatchEvent(
          new DragEvent("drop", {
            bubbles: true,
            cancelable: true,
            dataTransfer: transfer,
          }),
        );
      },
      imageBase64,
    );
    await expect(dialog).toHaveCount(0);

    await page.getByRole("button", { name: "插入图片" }).click();
    dialog = page.getByRole("dialog", { name: "插入图片" });
    await dialog.getByLabel("图片说明（建议填写）").fill("粘贴图片");
    await dialog.evaluate(
      (dialogElement, encoded) => {
        const bytes = Uint8Array.from(atob(encoded), (value) =>
          value.charCodeAt(0),
        );
        const transfer = new DataTransfer();
        transfer.items.add(
          new File([bytes], "paste.png", { type: "image/png" }),
        );
        dialogElement.dispatchEvent(
          new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
            clipboardData: transfer,
          }),
        );
      },
      imageBase64,
    );
    await expect(dialog).toHaveCount(0);

    const managedImages = page.locator(
      '.lab-wysiwyg-canvas img[src^="/media/"][src$=".webp"]',
    );
    await expect(managedImages).toHaveCount(3);
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostBySlug(
      "phase-3-local-image-regression",
    );
    const managedUrls =
      createdPost?.bodyMarkdown.match(
        /\/media\/c[a-z0-9]{24}\.webp/g,
      ) ?? [];

    expect(managedUrls).toHaveLength(3);
    expect(new Set(managedUrls).size).toBe(1);

    const managedUrl = managedUrls[0];
    const adminMedia = await page.request.get(managedUrl);
    expect(adminMedia.status()).toBe(200);
    expect(adminMedia.headers()["cache-control"]).toBe("private, no-store");

    const anonymousContext = await browser.newContext();

    try {
      const privateMedia = await anonymousContext.request.get(
        `http://127.0.0.1:3000${managedUrl}`,
      );
      expect(privateMedia.status()).toBe(404);

      await page.getByRole("button", { name: "发布文章" }).click();
      await expect(page.getByRole("button", { name: "取消发布" })).toBeVisible();

      const publicMedia = await anonymousContext.request.get(
        `http://127.0.0.1:3000${managedUrl}`,
      );
      expect(publicMedia.status()).toBe(200);
      expect(publicMedia.headers()["content-type"]).toBe("image/webp");
      expect(publicMedia.headers()["cache-control"]).toBe(
        "public, max-age=31536000, immutable",
      );
      expect(publicMedia.headers()["x-content-type-options"]).toBe("nosniff");
      const etag = publicMedia.headers().etag;
      expect(etag).toBeTruthy();

      const notModified = await anonymousContext.request.get(
        `http://127.0.0.1:3000${managedUrl}`,
        { headers: { "If-None-Match": etag } },
      );
      expect(notModified.status()).toBe(304);
    } finally {
      await anonymousContext.close();
    }
  });

  test("renders the WYSIWYG canvas without the legacy Markdown preview", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await expect(
      page.getByRole("region", { name: "正文画布" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "文本层级" }),
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: "文字颜色" })).toBeVisible();
    await expect(page.getByRole("button", { name: "加粗" })).toBeVisible();
    await expect(page.getByRole("button", { name: "下划线" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "插入引用" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "无序列表" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "有序列表" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "插入代码块" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "插入表格" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "插入图片" }),
    ).toBeVisible();

    const toolbarButtons = page.locator(".lab-wysiwyg-toolbar-button");
    for (let index = 0; index < (await toolbarButtons.count()); index += 1) {
      const box = await toolbarButtons.nth(index).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await expect(page.getByRole("button", { name: "预览" })).toHaveCount(0);
    await expect(page.getByLabel("正文预览")).toHaveCount(0);
    await expect(page.getByTestId("markdown-editor-client")).toHaveCount(0);
  });

  test("formats selections with levels, bold, underline, lists, and fixed text tones", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    const canvas = page.locator(".lab-wysiwyg-canvas .ProseMirror");
    const levelSelect = page.getByRole("combobox", { name: "文本层级" });
    const toneSelect = page.getByRole("combobox", { name: "文字颜色" });

    await canvas.fill("格式化内容");

    for (const [value, tag] of [
      ["heading-1", "h1"],
      ["heading-2", "h2"],
      ["heading-3", "h3"],
      ["heading-4", "h4"],
    ] as const) {
      await levelSelect.selectOption(value);
      await expect(canvas.locator(tag)).toContainText("格式化内容");
      await expect(levelSelect).toHaveValue(value);
    }

    await levelSelect.selectOption("paragraph");
    await canvas.click();
    await page.keyboard.press("Control+A");
    await page.getByRole("button", { name: "加粗" }).click();
    await expect(canvas.locator("strong")).toContainText("格式化内容");
    await expect(page.getByRole("button", { name: "加粗" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await page.getByRole("button", { name: "下划线" }).click();
    await expect(canvas.locator("u")).toContainText("格式化内容");
    await expect(page.getByRole("button", { name: "下划线" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await toneSelect.selectOption("blue");
    await expect(canvas.locator(".lab-text-tone-blue")).toContainText(
      "格式化内容",
    );
    await expect(toneSelect).toHaveValue("blue");
    await toneSelect.selectOption("");
    await expect(canvas.locator(".lab-text-tone-blue")).toHaveCount(0);

    await canvas.click();
    await page.keyboard.press("Control+A");
    await page.getByRole("button", { name: "无序列表" }).click();
    await expect(canvas.locator("ul")).toBeVisible();
    await page.getByRole("button", { name: "无序列表" }).click();
    await page.getByRole("button", { name: "有序列表" }).click();
    await expect(canvas.locator("ol")).toBeVisible();
  });

  test("gives the WYSIWYG canvas comfortable desktop width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    const canvas = page.locator(".lab-wysiwyg-canvas .ProseMirror");

    await expect(canvas).toBeVisible();
    await expect(page.getByLabel("正文预览")).toHaveCount(0);

    const canvasBox = await canvas.boundingBox();

    expect(canvasBox?.width ?? 0).toBeGreaterThanOrEqual(760);
  });

  test("edits code blocks and tables through dedicated edit states", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await page
      .getByLabel("标题", { exact: true })
      .fill("第三阶段表格持久化回归");
    await page
      .getByLabel("URL 路径")
      .fill("phase-3-table-persistence-regression");

    await page.getByRole("button", { name: "插入代码块" }).click();
    await page.getByRole("button", { name: "编辑代码块" }).click();
    await page.locator(".lab-code-node-content").click();
    await page.keyboard.type("const answer = 42;");
    await expect(page.locator(".lab-code-node")).toContainText(
      "const answer = 42;",
    );
    await page.getByRole("button", { name: "完成代码编辑" }).click();
    await expect(
      page.getByRole("button", { name: "编辑代码块" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "插入表格" }).click();
    await page.getByRole("button", { name: "编辑表格" }).click();
    await page.locator(".lab-table-node td").first().click();
    await page.keyboard.type("alpha");
    await expect(page.locator(".lab-table-node")).toContainText("alpha");
    await page.getByRole("button", { name: "完成表格编辑" }).click();

    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostBySlug(
      "phase-3-table-persistence-regression",
    );
    const savedMarkdown = createdPost?.bodyMarkdown ?? "";

    expect(savedMarkdown).toContain("alpha");
    expect(savedMarkdown).toMatch(/^\|.*\|$/m);
    expect(savedMarkdown).toMatch(
      /^\|\s*:?-{3,}:?\s*\|\s*:?-{3,}:?\s*\|$/m,
    );

    await page.goto(`/admin/posts/${createdPost?.id}`);
    await expect(page.locator(".lab-table-node")).toContainText("alpha");
  });

  test("creates and persists inline taxonomy and series metadata", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await fillDraftEditor(page, {
      title: "第三阶段分类草稿",
      slug: "phase-3-taxonomy-draft",
      excerpt: "带有内联组织信息的草稿。",
      bodyMarkdown: "# 分类草稿\n\n发布前完成组织。",
    });
    await expect(page.getByLabel("系列排序")).toHaveCount(0);
    await page.getByLabel("新建分类").fill("第三阶段架构");
    await page.getByLabel("新建标签").fill("第三阶段 Next.js, 第三阶段 Prisma");
    await page.getByLabel("新建系列").fill("第三阶段构建日志");
    await expect(page.getByLabel("系列排序")).toBeVisible();
    await page.getByLabel("系列排序").fill("1");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(page.getByText("草稿已保存")).toBeVisible();

    const createdPost = await findPhase3PostWithTaxonomyBySlug(
      "phase-3-taxonomy-draft",
    );
    expect(createdPost?.category?.name).toBe("第三阶段架构");
    expect(createdPost?.series?.title).toBe("第三阶段构建日志");
    expect(createdPost?.seriesOrder).toBe(1);
    expect(createdPost?.tags.map(({ tag }) => tag.name).sort()).toEqual([
      "第三阶段 Next.js",
      "第三阶段 Prisma",
    ]);

    await page.goto(`/admin/posts/${createdPost?.id}`);
    await expect(page.getByLabel("分类", { exact: true })).toHaveValue(
      createdPost?.categoryId ?? "",
    );
    await expect(page.getByText("第三阶段 Next.js")).toBeVisible();
    await expect(page.getByText("第三阶段 Prisma")).toBeVisible();
    await expect(page.getByLabel("系列", { exact: true })).toHaveValue(
      createdPost?.seriesId ?? "",
    );
    await expect(page.getByLabel("系列排序")).toHaveValue("1");

    await page.goto("/admin");
    await expect(
      page.getByRole("link", { name: "第三阶段分类草稿" }).first(),
    ).toBeVisible();
    await expect(page.getByText("第三阶段架构").first()).toBeVisible();
    await expect(page.getByText("2 个标签").first()).toBeVisible();
    await expect(page.getByText("第三阶段构建日志 #1").first()).toBeVisible();

    await page.goto("/admin/posts");
    const row = page.getByTestId(`post-row-${createdPost?.id}`);
    await expect(row.getByText("第三阶段架构").first()).toBeVisible();
    await expect(row.getByText("2 个标签").first()).toBeVisible();
    await expect(row.getByText("第三阶段构建日志 #1").first()).toBeVisible();
  });

  test("shows duplicate taxonomy and series order errors without erasing the body", async ({
    page,
  }) => {
    await seedPhase3Category("第三阶段重复分类");
    const orderedSeries = await seedPhase3Series("第三阶段有序系列");
    await seedPhase3Post({
      title: "第三阶段排序占位",
      slug: "phase-3-ordered-slot",
      bodyMarkdown: "# 已有排序草稿",
      seriesId: orderedSeries.id,
      seriesOrder: 1,
    });
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    await fillDraftEditor(page, {
      title: "第三阶段冲突草稿",
      slug: "phase-3-conflict-draft",
      bodyMarkdown: "# 冲突正文\n\n这段正文必须保留在编辑器中。",
    });
    await page.getByLabel("新建分类").fill("第三阶段重复分类");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(
      page.getByText("这个分类已存在，请直接选择。"),
    ).toBeVisible();
    await expectDraftEditorToContain(page, "这段正文必须保留在编辑器中。");

    await page.getByLabel("新建分类").fill("");
    await page
      .getByLabel("系列", { exact: true })
      .selectOption(orderedSeries.id);
    await expect(page.getByLabel("系列排序")).toBeVisible();
    await page.getByLabel("系列排序").fill("1");
    await page.getByRole("button", { name: "保存草稿" }).click();
    await expect(
      page.getByText("这个系列排序已被使用。"),
    ).toBeVisible();
    await expectDraftEditorToContain(page, "这段正文必须保留在编辑器中。");
  });

  test("does not add standalone taxonomy management routes", async ({
    page,
  }) => {
    await signInAdmin(page);

    for (const route of ["/admin/categories", "/admin/tags", "/admin/series"]) {
      const response = await page.goto(route);
      expect(response?.status(), `${route} should stay out of Phase 3`).toBe(
        404,
      );
    }

    const sourceFiles = [
      ...collectSourceFiles("src/app"),
      ...collectSourceFiles("src/components"),
    ];
    const standaloneTaxonomyFiles = sourceFiles
      .filter((file) =>
        /\/admin\/(categories|tags|series)|admin\/categories|admin\/tags|admin\/series/.test(
          readFileSync(file, "utf8"),
        ),
      )
      .map((file) => file.replaceAll("\\", "/"));

    expect(standaloneTaxonomyFiles).toEqual([]);
  });
});

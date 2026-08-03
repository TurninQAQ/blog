import { expect, test, type Page } from "@playwright/test";
import nextEnv from "@next/env";
import { readFileSync } from "node:fs";

const unauthorizedMutationError =
  "未登录管理员，请先登录后重试。";
const sameOriginHeaders = {
  Origin: "http://127.0.0.1:3000",
};

const adminPostOperations = [
  "create",
  "edit",
  "delete",
  "publish",
  "unpublish",
  "feature",
  "unfeature",
] as const;

const requiredMutationEnv = [
  "ADMIN_EMAIL",
  "PLAYWRIGHT_ADMIN_PASSWORD",
  "DATABASE_URL",
] as const;

type RequiredMutationEnv = (typeof requiredMutationEnv)[number];

function loadLocalEnvFile() {
  nextEnv.loadEnvConfig(process.cwd());
}

function getRequiredMutationEnv() {
  loadLocalEnvFile();

  return Object.fromEntries(
    requiredMutationEnv.map((key) => {
      const value = process.env[key];
      expect(
        value,
        `${key} must be set in ignored .env.local before authenticated mutation boundary tests run`,
      ).toBeTruthy();

      return [key, value as string];
    }),
  ) as Record<RequiredMutationEnv, string>;
}

async function signInAdmin(page: Page) {
  const env = getRequiredMutationEnv();

  await page.goto("/admin/login");
  await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
  await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登录管理后台" }).click();
  await page.waitForURL("**/admin");

  return env;
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

type Phase4MutationPostInput = {
  title: string;
  slug: string;
  excerpt?: string;
  bodyMarkdown?: string;
  coverImage?: string | null;
  status?: "DRAFT" | "PUBLISHED";
  publishedAt?: Date | null;
  featured?: boolean;
};

async function cleanupPhase4MutationFixtures() {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.post.deleteMany({
      where: {
        slug: {
          startsWith: "phase-4-mutation-",
        },
      },
    });
    await prisma.category.deleteMany({
      where: {
        slug: {
          startsWith: "phase-4-mutation-",
        },
      },
    });
    await prisma.tag.deleteMany({
      where: {
        slug: {
          startsWith: "phase-4-mutation-",
        },
      },
    });
    await prisma.series.deleteMany({
      where: {
        slug: {
          startsWith: "phase-4-mutation-",
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function seedPhase4MutationPost({
  title,
  slug,
  excerpt = "第四阶段发布流测试摘要。",
  bodyMarkdown = "# 第四阶段发布流\n\n公开正文。",
  coverImage = null,
  status = "DRAFT",
  publishedAt = null,
  featured = false,
}: Phase4MutationPostInput) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.create({
      data: {
        title,
        slug,
        excerpt,
        bodyMarkdown,
        coverImage,
        status,
        publishedAt,
        featured,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

const phase6MediaSha256 = "e".repeat(64);

async function cleanupPhase6MediaFixtures() {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.mediaAsset.deleteMany({
      where: { sha256: phase6MediaSha256 },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function findPhase4MutationPostById(id: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { id },
    });
  } finally {
    await prisma.$disconnect();
  }
}

test.describe("admin post mutation boundary", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    getRequiredMutationEnv();
    await cleanupPhase4MutationFixtures();
    await cleanupPhase6MediaFixtures();
  });

  test.afterAll(async () => {
    await cleanupPhase4MutationFixtures();
    await cleanupPhase6MediaFixtures();
  });

  for (const operation of adminPostOperations) {
    test(`rejects unauthenticated ${operation} requests before trusting submitted data`, async ({
      request,
    }) => {
      const response = await request.post(`/api/admin/posts/${operation}`, {
        headers: sameOriginHeaders,
        data: {
          id: "post-direct-call",
          title: "Submitted before auth",
          body: "# This body must not be trusted before requireAdmin()",
          published: operation === "publish",
        },
      });

      expect(
        response.status(),
        `POST /api/admin/posts/${operation} should reject direct unauthenticated mutation calls`,
      ).toBe(401);
      await expect(response.text()).resolves.toBe(unauthorizedMutationError);
    });
  }

  test("returns 404 for unknown admin post operations", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/posts/reindex", {
      headers: sameOriginHeaders,
      data: {
        id: "unknown-operation",
        body: "This body must not make an invalid operation valid.",
      },
    });

    expect(response.status()).toBe(404);
    await expect(response.text()).resolves.toBe("");
  });

  test("publishes drafts, preserves first publishedAt on repeat publish, and unpublishes from public visibility", async ({
    page,
  }) => {
    const post = await seedPhase4MutationPost({
      title: "第四阶段发布流草稿",
      slug: "phase-4-mutation-publish-flow",
    });
    await signInAdmin(page);

    const publishResponse = await page.request.post("/api/admin/posts/publish", {
      headers: sameOriginHeaders,
      data: {
        id: post.id,
      },
    });

    expect(publishResponse.status()).toBe(200);
    const publishedPost = await findPhase4MutationPostById(post.id);
    expect(publishedPost).toMatchObject({
      status: "PUBLISHED",
    });
    expect(publishedPost?.publishedAt).toBeTruthy();
    const firstPublishedAt = publishedPost?.publishedAt?.toISOString();

    await page.goto(`/notes/${post.slug}`);
    await expect(
      page.getByRole("heading", { level: 1, name: "第四阶段发布流草稿" }),
    ).toBeVisible();

    const repeatPublishResponse = await page.request.post(
      "/api/admin/posts/publish",
      {
        headers: sameOriginHeaders,
        data: {
          id: post.id,
        },
      },
    );

    expect(repeatPublishResponse.status()).toBe(200);
    const repeatPublishedPost = await findPhase4MutationPostById(post.id);
    expect(repeatPublishedPost?.publishedAt?.toISOString()).toBe(
      firstPublishedAt,
    );

    const unpublishResponse = await page.request.post(
      "/api/admin/posts/unpublish",
      {
        headers: sameOriginHeaders,
        data: {
          id: post.id,
        },
      },
    );

    expect(unpublishResponse.status()).toBe(200);
    const unpublishedPost = await findPhase4MutationPostById(post.id);
    expect(unpublishedPost).toMatchObject({
      status: "DRAFT",
    });
    expect((await page.goto(`/notes/${post.slug}`))?.status()).toBe(404);
  });

  test("edits a published post through the protected route while keeping it public and featured", async ({
    page,
  }) => {
    const publishedAt = new Date("2026-07-06T08:00:00.000Z");
    const post = await seedPhase4MutationPost({
      title: "第四阶段已发布编辑前",
      slug: "phase-4-mutation-edit-published",
      excerpt: "编辑前公开摘要。",
      bodyMarkdown: "# 编辑前\n\n公开正文。",
      status: "PUBLISHED",
      publishedAt,
    });
    await signInAdmin(page);

    const editResponse = await page.request.post("/api/admin/posts/edit", {
      headers: sameOriginHeaders,
      data: {
        id: post.id,
        title: "第四阶段已发布编辑后",
        slug: "phase-4-mutation-edit-published",
        excerpt: "编辑后公开摘要。",
        bodyMarkdown: "# 编辑后\n\n更新后的公开正文。",
        coverImage: null,
        categoryId: null,
        newCategoryName: "",
        tagIds: [],
        newTagNames: [],
        seriesId: null,
        newSeriesName: "",
        seriesOrder: null,
        featured: true,
      },
    });

    expect(editResponse.status()).toBe(200);
    const editedPost = await findPhase4MutationPostById(post.id);
    expect(editedPost).toMatchObject({
      title: "第四阶段已发布编辑后",
      status: "PUBLISHED",
      featured: true,
    });
    expect(editedPost?.publishedAt?.toISOString()).toBe(
      publishedAt.toISOString(),
    );

    await page.goto(`/notes/${post.slug}`);
    await expect(
      page.getByRole("heading", { level: 1, name: "第四阶段已发布编辑后" }),
    ).toBeVisible();
    await expect(page.getByText("更新后的公开正文。")).toBeVisible();
  });

  test("rolls back publication when managed body or cover media is missing", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    const missingMediaUrl =
      "/media/cmissing00000000000000000.webp";
    const post = await seedPhase4MutationPost({
      title: "第六阶段缺失媒体发布回滚",
      slug: "phase-4-mutation-missing-media-rollback",
      bodyMarkdown: `![missing](${missingMediaUrl})`,
      coverImage: missingMediaUrl,
    });
    await signInAdmin(page);

    const response = await page.request.post("/api/admin/posts/publish", {
      headers: sameOriginHeaders,
      data: { id: post.id },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      fieldErrors: {
        bodyMarkdown:
          "正文引用的站内图片不存在，请重新上传或移除后再发布。",
        coverImage:
          "封面引用的站内图片不存在，请重新上传或移除后再发布。",
      },
    });
    await expect(findPhase4MutationPostById(post.id)).resolves.toMatchObject({
      status: "DRAFT",
      publishedAt: null,
    });
  });

  test("timestamps newly exposed media at the published edit transaction time", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    const historicalPublishedAt = new Date("2026-01-01T00:00:00.000Z");
    const post = await seedPhase4MutationPost({
      title: "第六阶段媒体曝光时间",
      slug: "phase-4-mutation-media-exposure-time",
      status: "PUBLISHED",
      publishedAt: historicalPublishedAt,
    });
    const { prisma } = await import("../../lib/db/prisma");
    const media = await prisma.mediaAsset.create({
      data: {
        data: Uint8Array.from([1, 2, 3, 4]),
        mimeType: "image/webp",
        byteLength: 4,
        width: 2,
        height: 2,
        sha256: phase6MediaSha256,
      },
    });
    await prisma.$disconnect();
    await signInAdmin(page);
    const requestStartedAt = new Date();

    const response = await page.request.post("/api/admin/posts/edit", {
      headers: sameOriginHeaders,
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        bodyMarkdown: `![new](/media/${media.id}.webp)`,
        coverImage: null,
        categoryId: null,
        newCategoryName: "",
        tagIds: [],
        newTagNames: [],
        seriesId: null,
        newSeriesName: "",
        seriesOrder: null,
        featured: false,
      },
    });
    const requestFinishedAt = new Date();

    expect(response.status()).toBe(200);
    const verifyClient = await import("../../lib/db/prisma");
    const exposedMedia = await verifyClient.prisma.mediaAsset.findUniqueOrThrow({
      where: { id: media.id },
    });
    await verifyClient.prisma.$disconnect();

    expect(exposedMedia.publicAt).not.toBeNull();
    expect(exposedMedia.publicAt!.getTime()).toBeGreaterThanOrEqual(
      requestStartedAt.getTime(),
    );
    expect(exposedMedia.publicAt!.getTime()).toBeLessThanOrEqual(
      requestFinishedAt.getTime(),
    );
    expect(exposedMedia.publicAt!.toISOString()).not.toBe(
      historicalPublishedAt.toISOString(),
    );
  });

  test("rejects cross-origin admin post mutation requests before cookie authorization", async ({
    page,
  }) => {
    await signInAdmin(page);

    const response = await page.request.post("/api/admin/posts/publish", {
      headers: {
        Origin: "https://attacker.example",
      },
      data: {
        id: "cross-origin-post",
      },
    });

    expect(response.status()).toBe(403);
  });

  test("rejects cross-origin admin mutations even when forwarded host headers are spoofed", async ({
    page,
  }) => {
    await signInAdmin(page);

    const response = await page.request.post("/api/admin/posts/publish", {
      headers: {
        Origin: "https://attacker.example",
        "x-forwarded-host": "attacker.example",
        "x-forwarded-proto": "https",
      },
      data: {
        id: "spoofed-forwarded-host-post",
      },
    });

    expect(response.status()).toBe(403);
  });

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

    const route = readFileSync(
      "src/app/api/admin/posts/[operation]/route.ts",
      "utf8",
    );
    const postStart = route.indexOf("POST");
    expect(postStart, "POST route handler should be defined").toBeGreaterThan(
      -1,
    );
    const postBody = route.slice(postStart);
    const normalizedPostBody = postBody.replace(/\s+/g, " ");
    const lazyReadCall = "readBoundedAdminPostJson(request)";

    expect(normalizedPostBody).toContain(lazyReadCall);
    expect(normalizedPostBody.replace(lazyReadCall, "")).not.toMatch(
      /request\.json|formData|prisma\.post/,
    );
  });

  test("keeps mutation-driven public revalidation wired to all affected public paths", () => {
    const mutationSource = readFileSync(
      "src/lib/admin/post-mutations.ts",
      "utf8",
    );
    const revalidationSource = readFileSync(
      "src/lib/public/revalidate.ts",
      "utf8",
    );

    expect(mutationSource).toContain("revalidatePublicPostPaths");
    expect(mutationSource).toMatch(
      /editDraftPost[\s\S]+revalidatePublicPostPaths/,
    );
    expect(mutationSource).toMatch(
      /mutatePostPublicationState[\s\S]+revalidatePublicPostPaths/,
    );
    expect(mutationSource).toMatch(/publishPost[\s\S]+mutatePostPublicationState/);
    expect(mutationSource).toMatch(/unpublishPost[\s\S]+mutatePostPublicationState/);
    expect(mutationSource).toMatch(/featurePost[\s\S]+mutatePostPublicationState/);

    for (const requiredPathToken of [
      '"/"',
      '"/notes"',
      '"/archive"',
      '"/series"',
      '"/search"',
      "`/notes/${",
      "`/tags/${",
      "`/categories/${",
      "`/series/${",
    ]) {
      expect(revalidationSource).toContain(requiredPathToken);
    }
    expect(revalidationSource).toContain("revalidatePath");
  });
});

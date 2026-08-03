import { expect, test, type Locator, type Page } from "@playwright/test";
import nextEnv from "@next/env";

import { PublicationStatus } from "../../generated/prisma/enums";

const fixtureSlugPrefix = "quick-260711-fwf-admin-ui";
const sameOriginHeaders = {
  Origin: "http://127.0.0.1:3000",
};
const requiredAdminEnv = [
  "ADMIN_EMAIL",
  "PLAYWRIGHT_ADMIN_PASSWORD",
  "DATABASE_URL",
] as const;

type RequiredAdminEnv = (typeof requiredAdminEnv)[number];

const colors = {
  paper: "rgb(247, 249, 252)",
  white: "rgb(255, 255, 255)",
  ink: "rgb(16, 18, 23)",
  cobalt: "rgb(7, 95, 206)",
  oldBase: "rgb(7, 10, 15)",
  oldAccent: "rgb(46, 242, 181)",
};

function getRequiredAdminEnv() {
  nextEnv.loadEnvConfig(process.cwd());

  return Object.fromEntries(
    requiredAdminEnv.map((key) => {
      const value = process.env[key];
      expect(
        value,
        `${key} must be set in ignored .env.local before admin UI tests run`,
      ).toBeTruthy();

      return [key, value as string];
    }),
  ) as Record<RequiredAdminEnv, string>;
}

async function signInAdmin(page: Page) {
  const env = getRequiredAdminEnv();

  await page.goto("/admin/login");
  await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
  await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
  await page.getByLabel("密码").press("Enter");
  await page.waitForURL("**/admin");
}

async function cleanupAdminUiFixtures() {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.post.deleteMany({
      where: {
        slug: {
          startsWith: fixtureSlugPrefix,
        },
      },
    });
    await prisma.category.deleteMany({
      where: {
        slug: {
          startsWith: fixtureSlugPrefix,
        },
      },
    });
    await prisma.tag.deleteMany({
      where: {
        slug: {
          startsWith: fixtureSlugPrefix,
        },
      },
    });
    await prisma.series.deleteMany({
      where: {
        slug: {
          startsWith: fixtureSlugPrefix,
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function seedAdminEditorTaxonomies(projectName: string) {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");
  const suffix = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  try {
    const category = await prisma.category.create({
      data: {
        name: `后台无障碍分类 ${suffix}`,
        slug: `${fixtureSlugPrefix}-${suffix}-category`,
      },
    });
    const tag = await prisma.tag.create({
      data: {
        name: `后台无障碍标签 ${suffix}`,
        slug: `${fixtureSlugPrefix}-${suffix}-tag`,
      },
    });
    const series = await prisma.series.create({
      data: {
        title: `后台无障碍系列 ${suffix}`,
        slug: `${fixtureSlugPrefix}-${suffix}-series`,
      },
    });

    return { category, tag, series };
  } finally {
    await prisma.$disconnect();
  }
}

async function findAdminUiPost(slug: string) {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.findUnique({
      where: { slug },
      select: {
        bodyMarkdown: true,
        coverImage: true,
        id: true,
        status: true,
        title: true,
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function countAdminUiPosts(slug: string) {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.post.count({ where: { slug } });
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteAdminUiPost(id: string) {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.post.delete({ where: { id } });
  } finally {
    await prisma.$disconnect();
  }
}

function directPostPayload(slug: string, bodyMarkdown: string) {
  return {
    title: "后台图片地址策略",
    slug,
    excerpt: "验证直接 API 无法绕过图片地址策略。",
    bodyMarkdown,
    coverImage: null,
    categoryId: null,
    newCategoryName: "",
    tagIds: [],
    newTagNames: [],
    seriesId: null,
    newSeriesName: "",
    seriesOrder: null,
    featured: false,
  };
}

async function seedAdminUiFixtures(projectName: string) {
  getRequiredAdminEnv();
  const { prisma } = await import("../../lib/db/prisma");
  const suffix = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  try {
    const draft = await prisma.post.create({
      data: {
        title: "后台视觉契约草稿",
        slug: `${fixtureSlugPrefix}-${suffix}-draft`,
        excerpt: "用于验证文章库草稿状态。",
        bodyMarkdown: "# 后台视觉契约草稿",
        status: PublicationStatus.DRAFT,
      },
    });
    const published = await prisma.post.create({
      data: {
        title: "后台视觉契约发布稿",
        slug: `${fixtureSlugPrefix}-${suffix}-published`,
        excerpt: "用于验证文章库发布与精选状态。",
        bodyMarkdown: "# 后台视觉契约发布稿",
        status: PublicationStatus.PUBLISHED,
        publishedAt: new Date(),
        featured: true,
      },
    });

    return { draft, published };
  } finally {
    await prisma.$disconnect();
  }
}

async function computedStyle(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      color: style.color,
      colorScheme: style.colorScheme,
    };
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth);
}

async function expectNoLegacyAdminColors(page: Page) {
  const matches = await page
    .locator(
      ".manga-admin-shell input, .manga-admin-shell textarea, .manga-admin-shell select, .manga-admin-shell button, .manga-admin-shell a, .manga-admin-shell header, .manga-admin-shell section",
    )
    .evaluateAll((elements, forbiddenColors) =>
      elements.flatMap((element) => {
        const style = getComputedStyle(element);
        const properties = {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          color: style.color,
        };

        return Object.entries(properties)
          .filter(([, value]) => forbiddenColors.includes(value))
          .map(([property, value]) => ({
            element: element.tagName.toLowerCase(),
            property,
            value,
          }));
      }),
    [colors.oldBase, colors.oldAccent]);

  expect(matches).toEqual([]);
}

async function expectFieldErrorAssociation(
  page: Page,
  control: Locator,
  message: string,
) {
  await expect(control).toHaveAttribute("aria-invalid", "true");
  const errorId = await control.getAttribute("aria-describedby");

  expect(errorId).toBeTruthy();
  await expect(page.locator(`[id="${errorId}"]`)).toHaveText(message);
}

test.describe("admin visual contract", () => {
  test.beforeEach(async () => {
    await cleanupAdminUiFixtures();
  });

  test.afterEach(async () => {
    await cleanupAdminUiFixtures();
  });

  test("admin shell exposes navigation, truthful status cues, and responsive boundaries", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    await signInAdmin(page);

    const shell = page.locator(".manga-admin-shell");
    await expect(shell).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "管理员导航" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "控制台" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: "查看站点" })).toHaveAttribute(
      "href",
      "/",
    );
    await expectNoHorizontalOverflow(page);

    await page.getByRole("link", { name: "文章库" }).press("Enter");
    await expect(page).toHaveURL(/\/admin\/posts$/);
    await expect(page.getByRole("heading", { name: "文章库" })).toBeVisible();
    await expect(page.getByRole("link", { name: "文章库" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const draftRow = page.getByTestId(`post-row-${fixtures.draft.id}`);
    const publishedRow = page.getByTestId(`post-row-${fixtures.published.id}`);
    await expect(draftRow.getByText("草稿", { exact: true })).toBeVisible();
    await expect(
      publishedRow.getByText("已发布", { exact: true }),
    ).toBeVisible();
    await expect(
      publishedRow.getByText("精选", { exact: true }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await page.goto("/admin/posts/new");
    await expect(page.getByRole("link", { name: "文章库" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expectNoHorizontalOverflow(page);

    const runningAnimations = await shell.evaluate((element) =>
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running").length,
    );
    expect(runningAnimations).toBe(0);
  });

  test("computed admin colors stay light across login, dashboard, library, and editor", async ({
    page,
  }, testInfo) => {
    await seedAdminUiFixtures(testInfo.project.name);
    await page.goto("/admin/login");

    const loginShell = page.locator(".manga-admin-shell");
    const loginCard = page.getByTestId("admin-login-card");
    const loginButton = page.getByRole("button", {
      name: "登录管理后台",
    });

    await expect(loginShell).toBeVisible();
    expect(await computedStyle(loginShell)).toMatchObject({
      backgroundColor: colors.paper,
      color: colors.ink,
      colorScheme: "light",
    });
    expect(await computedStyle(loginCard)).toMatchObject({
      backgroundColor: colors.white,
      color: colors.ink,
    });
    expect(await computedStyle(page.getByLabel("邮箱"))).toMatchObject({
      color: colors.ink,
    });
    expect(await computedStyle(loginButton)).toMatchObject({
      backgroundColor: colors.cobalt,
    });
    await expectNoLegacyAdminColors(page);
    await expectNoHorizontalOverflow(page);

    await signInAdmin(page);
    const dashboardPanel = page
      .getByRole("region", { name: "管理内容指标" })
      .locator("div")
      .first();
    expect(await computedStyle(page.locator(".manga-admin-shell"))).toMatchObject(
      {
        backgroundColor: colors.paper,
        color: colors.ink,
        colorScheme: "light",
      },
    );
    expect(await computedStyle(dashboardPanel)).toMatchObject({
      backgroundColor: colors.white,
    });
    expect(
      await computedStyle(page.getByRole("link", { name: "控制台" })),
    ).toMatchObject({
      backgroundColor: colors.cobalt,
    });
    await expectNoLegacyAdminColors(page);

    await page.goto("/admin/posts");
    expect(
      await computedStyle(page.getByTestId("admin-post-library-panel")),
    ).toMatchObject({
      backgroundColor: colors.white,
      color: colors.ink,
    });
    await expectNoLegacyAdminColors(page);

    await page.goto("/admin/posts/new");
    const editorShell = page.locator(".lab-wysiwyg-shell");
    const editorCanvas = page.locator(".lab-wysiwyg-canvas .ProseMirror");
    expect(await computedStyle(editorShell)).toMatchObject({
      backgroundColor: colors.white,
    });
    expect(await computedStyle(editorCanvas)).toMatchObject({
      backgroundColor: colors.white,
      color: colors.ink,
    });

    await editorCanvas.evaluate((element) => {
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = "const status = 'ready';";
      pre.append(code);
      element.replaceChildren(pre);
    });
    expect(await computedStyle(editorCanvas.locator("pre"))).toMatchObject({
      backgroundColor: colors.ink,
    });
    expect(await computedStyle(editorCanvas.locator("pre code"))).toMatchObject({
      color: colors.white,
    });
    await expectNoLegacyAdminColors(page);
    await expectNoHorizontalOverflow(page);
  });

  test("editor accessibility keeps long-form actions, errors, toolbar, tags, and delete dialog keyboard-safe", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    const taxonomies = await seedAdminEditorTaxonomies(testInfo.project.name);
    const desktopProject = ["desktop", "reduced-motion"].includes(
      testInfo.project.name,
    );

    await signInAdmin(page);
    await page.goto(`/admin/posts/${fixtures.draft.id}`);

    const actionCluster = page.getByTestId("editor-actions");
    await expect(actionCluster).toContainText("保存草稿");
    await expect(actionCluster).toContainText("发布文章");
    expect(await actionCluster.evaluate((element) => getComputedStyle(element).position)).toBe(
      desktopProject ? "sticky" : "static",
    );

    if (desktopProject) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const actionBox = await actionCluster.boundingBox();
      const viewportHeight = await page.evaluate(() => window.innerHeight);

      expect(actionBox).not.toBeNull();
      expect(actionBox?.y ?? -1).toBeGreaterThanOrEqual(0);
      expect((actionBox?.y ?? 0) + (actionBox?.height ?? 0)).toBeLessThanOrEqual(
        viewportHeight,
      );
    }

    await page.goto("/admin/posts/new");

    const toolbar = page.getByRole("toolbar", { name: "正文工具栏" });
    await expect(toolbar).toBeVisible();
    const toolbarButtons = toolbar.getByRole("button");

    for (let index = 0; index < (await toolbarButtons.count()); index += 1) {
      const box = await toolbarButtons.nth(index).boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    const boldButton = page.getByRole("button", { name: "加粗" });
    await boldButton.focus();
    const focusOutline = await boldButton.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(focusOutline.style).not.toBe("none");
    expect(focusOutline.width).toBeGreaterThanOrEqual(2);

    const tagChoice = page.getByLabel(taxonomies.tag.name, { exact: true });
    const tagTarget = await tagChoice.evaluate((element) => {
      const box = element.closest("label")?.getBoundingClientRect();
      return { height: box?.height ?? 0, width: box?.width ?? 0 };
    });
    expect(tagTarget.height).toBeGreaterThanOrEqual(44);
    expect(tagTarget.width).toBeGreaterThanOrEqual(44);

    await page.route("**/api/admin/posts/create", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          fieldErrors: {
            title: "标题错误。",
            slug: "路径错误。",
            excerpt: "摘要错误。",
            coverImage: "封面错误。",
            bodyMarkdown: "正文错误。",
            categoryId: "分类错误。",
            newCategoryName: "新分类错误。",
            tagIds: "标签错误。",
            newTagNames: "新标签错误。",
            seriesId: "系列错误。",
            newSeriesName: "新系列错误。",
            seriesOrder: "排序错误。",
          },
        }),
      });
    });

    await page.getByLabel("标题", { exact: true }).fill("后台错误关联检查");
    await page.getByLabel("URL 路径").fill(`${fixtureSlugPrefix}-aria-errors`);
    await page.getByRole("textbox", { name: "正文" }).fill("正文错误关联检查。");
    await page.getByLabel("新建系列").fill("错误关联系列");
    await page.getByRole("button", { name: "保存草稿" }).click();

    await expectFieldErrorAssociation(
      page,
      page.getByLabel("标题", { exact: true }),
      "标题错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("URL 路径"),
      "路径错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("摘要"),
      "摘要错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("封面图 URL"),
      "封面错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByRole("textbox", { name: "正文" }),
      "正文错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("分类", { exact: true }),
      "分类错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("新建分类"),
      "新分类错误。",
    );
    await expectFieldErrorAssociation(page, tagChoice, "标签错误。");
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("新建标签"),
      "新标签错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("系列", { exact: true }),
      "系列错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("新建系列"),
      "新系列错误。",
    );
    await expectFieldErrorAssociation(
      page,
      page.getByLabel("系列排序"),
      "排序错误。",
    );

    await page.getByRole("button", { name: "插入图片" }).click();
    const imageDialog = page.getByRole("dialog", { name: "插入图片" });
    await expect(imageDialog).toBeFocused();
    await imageDialog
      .getByRole("textbox", { name: "或使用图片 URL" })
      .fill("javascript:alert(1)");
    await imageDialog.getByRole("button", { name: "插入 URL" }).click();
    await expect(
      imageDialog.getByText("仅支持站内、相对路径或 HTTPS 图片 URL。"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(imageDialog).toHaveCount(0);
    await expect(page.getByRole("button", { name: "插入图片" })).toBeFocused();

    await page.goto("/admin/posts");
    const draftRow = page.getByTestId(`post-row-${fixtures.draft.id}`);
    const deleteTrigger = draftRow.getByRole("button", { name: "删除" });
    await deleteTrigger.click();

    const dialog = page.getByRole("dialog", { name: "删除文章？" });
    await expect(dialog).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe(
      "hidden",
    );

    await page.keyboard.press("Shift+Tab");
    await expect(
      dialog.getByRole("button", { name: "确认删除" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.locator("button").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(deleteTrigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("ProseMirror focus indicator is visibly cobalt", async ({ page }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    const bodyEditor = page.getByRole("textbox", { name: "正文" });
    await bodyEditor.focus();
    const editorFocusOutline = await bodyEditor.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        color: style.outlineColor,
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });

    expect(editorFocusOutline).toMatchObject({
      color: colors.cobalt,
      style: "solid",
    });
    expect(editorFocusOutline.width).toBeGreaterThanOrEqual(2);
  });

  test("toolbar uses dynamic roving focus and horizontal keyboard navigation", async ({
    page,
  }) => {
    await signInAdmin(page);
    await page.goto("/admin/posts/new");

    const toolbar = page.getByRole("toolbar", { name: "正文工具栏" });
    const buttons = toolbar.locator(":scope > button");
    const buttonCount = await buttons.count();
    const lastButtonIndex = buttonCount - 1;

    expect(buttonCount).toBeGreaterThan(6);
    await expect(buttons.nth(0)).toHaveAttribute("tabindex", "0");

    for (let index = 1; index < buttonCount; index += 1) {
      await expect(buttons.nth(index)).toHaveAttribute("tabindex", "-1");
    }

    await buttons.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await expect(buttons.nth(1)).toBeFocused();
    await expect(buttons.nth(1)).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("ArrowLeft");
    await expect(buttons.nth(0)).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(buttons.nth(lastButtonIndex)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(buttons.nth(0)).toBeFocused();
    await page.keyboard.press("End");
    await expect(buttons.nth(lastButtonIndex)).toBeFocused();
  });

  test("save request stays pending, blocks duplicates, and reports an aborted network request", async ({
    page,
  }) => {
    let releaseRoute: () => void = () => {};
    const routeGate = new Promise<void>((resolve) => {
      releaseRoute = resolve;
    });
    let requestCount = 0;

    await signInAdmin(page);
    await page.goto("/admin/posts/new");
    await page.getByLabel("标题", { exact: true }).fill("延迟保存检查");
    await page.getByLabel("URL 路径").fill(`${fixtureSlugPrefix}-delayed-save`);
    await page.getByRole("textbox", { name: "正文" }).fill("等待网络响应。");
    await page.route("**/api/admin/posts/create", async (route) => {
      requestCount += 1;
      await routeGate;
      await route.abort("failed");
    });

    const saveButton = page.getByRole("button", { name: "保存草稿" });
    await saveButton.click();
    await expect(saveButton).toBeDisabled();
    await expect.poll(() => requestCount).toBe(1);
    await saveButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    expect(requestCount).toBe(1);

    releaseRoute();
    await expect(
      page.getByRole("alert").filter({ hasText: "网络" }),
    ).toContainText("网络");
    await expect(saveButton).toBeEnabled();
    expect(requestCount).toBe(1);
  });

  test("slow save preserves newer edits and serializes publication requests", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    const taxonomies = await seedAdminEditorTaxonomies(testInfo.project.name);
    let releaseSave: () => void = () => {};
    const saveGate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });
    let saveRequests = 0;
    let publishRequests = 0;

    await signInAdmin(page);
    await page.goto(`/admin/posts/${fixtures.draft.id}`);
    await page.route("**/api/admin/posts/edit", async (route) => {
      saveRequests += 1;

      if (saveRequests > 1) {
        await route.continue();
        return;
      }

      await saveGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "草稿已保存",
          post: {
            id: fixtures.draft.id,
            title: "已提交的标题",
            slug: fixtures.draft.slug,
            status: "DRAFT",
            publishedAt: null,
            featured: false,
            categoryId: null,
            seriesId: null,
            seriesOrder: null,
            tagIds: [],
          },
        }),
      });
    });
    await page.route("**/api/admin/posts/publish", async (route) => {
      publishRequests += 1;
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          fieldErrors: {
            bodyMarkdown:
              "正文引用的站内图片不存在，请重新上传或移除后再发布。",
          },
        }),
      });
    });

    const titleInput = page.getByLabel("标题", { exact: true });
    const tagChoice = page.getByLabel(taxonomies.tag.name, { exact: true });
    const saveButton = page.getByRole("button", { name: "保存草稿" });
    const publishButton = page.getByRole("button", { name: "发布文章" });
    const featureButton = page.getByRole("button", { name: "设为精选" });

    await titleInput.fill("已提交的标题");
    await saveButton.click();
    await expect(saveButton).toBeDisabled();
    await titleInput.fill("保存期间的新标题");
    await tagChoice.check();
    await expect(publishButton).toBeDisabled();
    await expect(featureButton).toBeDisabled();
    await publishButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    expect(publishRequests).toBe(0);

    releaseSave();
    await expect(saveButton).toBeEnabled();
    await expect(titleInput).toHaveValue("保存期间的新标题");
    await expect(tagChoice).toBeChecked();
    await expect(page.getByRole("status")).toHaveText(
      "已保存上一版本；仍有未保存更改",
    );
    await expect(publishButton).toBeDisabled();
    await expect(featureButton).toBeDisabled();
    await publishButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    expect(publishRequests).toBe(0);

    await saveButton.click();
    await expect(page.getByRole("status")).toHaveText("草稿已保存");
    await expect.poll(() => saveRequests).toBe(2);
    await expect(publishButton).toBeEnabled();
    await expect(featureButton).toBeEnabled();
    await expect(findAdminUiPost(fixtures.draft.slug)).resolves.toMatchObject({
      status: "DRAFT",
      title: "保存期间的新标题",
      tags: [{ tagId: taxonomies.tag.id }],
    });

    await publishButton.click();
    await expect(
      page.getByRole("alert").filter({ hasText: "站内图片不存在" }),
    ).toHaveText(
      "正文引用的站内图片不存在，请重新上传或移除后再发布。",
    );
    await expect(publishButton).toBeEnabled();
    await expect(featureButton).toBeEnabled();
    await expect(saveButton).toBeEnabled();
    await expect(publishButton).toHaveText("发布文章");
    expect(publishRequests).toBe(1);
  });

  test("publication request and refresh block saving until both complete", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    let releasePublication: () => void = () => {};
    const publicationGate = new Promise<void>((resolve) => {
      releasePublication = resolve;
    });
    let releaseRefresh: () => void = () => {};
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });
    let saveRequests = 0;
    let refreshRequests = 0;

    await signInAdmin(page);
    await page.goto(`/admin/posts/${fixtures.draft.id}`);
    await page.route("**/api/admin/posts/publish", async (route) => {
      await publicationGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          post: {
            id: fixtures.draft.id,
            title: fixtures.draft.title,
            slug: fixtures.draft.slug,
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            featured: false,
          },
        }),
      });
    });
    await page.route("**/api/admin/posts/edit", async (route) => {
      saveRequests += 1;
      await route.abort("failed");
    });
    await page.route(`**/admin/posts/${fixtures.draft.id}*`, async (route) => {
      refreshRequests += 1;
      await refreshGate;
      await route.continue();
    });

    const publishButton = page.getByRole("button", { name: "发布文章" });
    const saveButton = page.getByRole("button", { name: "保存草稿" });

    await publishButton.click();
    await expect(saveButton).toBeDisabled();
    await saveButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    expect(saveRequests).toBe(0);

    releasePublication();
    await expect.poll(() => refreshRequests).toBe(1);
    await expect(saveButton).toBeDisabled();
    await saveButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    expect(saveRequests).toBe(0);

    releaseRefresh();
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect.poll(() => saveRequests).toBe(1);
    await expect(
      page.getByRole("alert").filter({ hasText: "网络" }),
    ).toContainText("网络");
    await expect(saveButton).toBeEnabled();
  });

  test("slow save merges canonical taxonomy groups without replacing a newer title", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    const taxonomies = await seedAdminEditorTaxonomies(testInfo.project.name);
    let releaseSave: () => void = () => {};
    const saveGate = new Promise<void>((resolve) => {
      releaseSave = resolve;
    });

    await signInAdmin(page);
    await page.goto(`/admin/posts/${fixtures.draft.id}`);
    await page.route("**/api/admin/posts/edit", async (route) => {
      await saveGate;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          message: "草稿已保存",
          post: {
            id: fixtures.draft.id,
            title: "已提交 taxonomy",
            slug: fixtures.draft.slug,
            status: "DRAFT",
            publishedAt: null,
            featured: false,
            categoryId: taxonomies.category.id,
            seriesId: taxonomies.series.id,
            seriesOrder: 7,
            tagIds: [taxonomies.tag.id],
          },
        }),
      });
    });

    const titleInput = page.getByLabel("标题", { exact: true });
    const categoryInput = page.getByLabel("新建分类");
    const tagInput = page.getByLabel("新建标签");
    const seriesInput = page.getByLabel("新建系列");
    const saveButton = page.getByRole("button", { name: "保存草稿" });

    await titleInput.fill("已提交 taxonomy");
    await categoryInput.fill("保存中的新分类");
    await tagInput.fill("保存中的新标签");
    await seriesInput.fill("保存中的新系列");
    await page.getByLabel("系列排序").fill("2");
    await saveButton.click();
    await titleInput.fill("保存期间的新标题");

    releaseSave();
    await expect(saveButton).toBeEnabled();
    await expect(titleInput).toHaveValue("保存期间的新标题");
    await expect(page.getByLabel("分类", { exact: true })).toHaveValue(
      taxonomies.category.id,
    );
    await expect(categoryInput).toHaveValue("");
    await expect(
      page.getByLabel(taxonomies.tag.name, { exact: true }),
    ).toBeChecked();
    await expect(tagInput).toHaveValue("");
    await expect(page.getByLabel("系列", { exact: true })).toHaveValue(
      taxonomies.series.id,
    );
    await expect(seriesInput).toHaveValue("");
    await expect(page.getByLabel("系列排序")).toHaveValue("7");
  });

  test("delete request blocks duplicate dismissal and surfaces an unknown server error", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    let releaseRoute: () => void = () => {};
    const routeGate = new Promise<void>((resolve) => {
      releaseRoute = resolve;
    });
    let requestCount = 0;

    await signInAdmin(page);
    await page.goto("/admin/posts");
    await page.route("**/api/admin/posts/delete", async (route) => {
      requestCount += 1;
      await routeGate;
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          fieldErrors: { conflict: "文章状态已变化，请重试。" },
        }),
      });
    });

    const draftRow = page.getByTestId(`post-row-${fixtures.draft.id}`);
    await draftRow.getByRole("button", { name: "删除" }).click();
    const dialog = page.getByRole("dialog", { name: "删除文章？" });
    const confirmButton = dialog.getByRole("button", { name: "确认删除" });
    await confirmButton.click();

    await expect(confirmButton).toBeDisabled();
    const cancelButtons = dialog.getByRole("button", { name: "取消" });
    await expect(cancelButtons).toHaveCount(2);
    await expect(cancelButtons.nth(0)).toBeDisabled();
    await expect(cancelButtons.nth(1)).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeVisible();
    await confirmButton.evaluate((element) => {
      (element as HTMLButtonElement).click();
    });
    await expect.poll(() => requestCount).toBe(1);

    releaseRoute();
    await expect(dialog.getByRole("alert")).toHaveText(
      "文章状态已变化，请重试。",
    );
    await expect(confirmButton).toBeEnabled();
    expect(requestCount).toBe(1);
  });

  test("concurrently deleted edit target surfaces its id error in the form", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);

    await signInAdmin(page);
    await page.goto(`/admin/posts/${fixtures.draft.id}`);
    await deleteAdminUiPost(fixtures.draft.id);
    await page.route("**/api/admin/posts/edit", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ fieldErrors: { id: "文章不存在。" } }),
      });
    });
    await page.getByLabel("标题", { exact: true }).fill("并发删除后的保存");
    await page.getByRole("button", { name: "保存草稿" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: "文章不存在。" }),
    ).toHaveText("文章不存在。");
    await expect(page.getByRole("button", { name: "保存草稿" })).toBeEnabled();
  });

  test("image destination policy blocks direct create and edit bypasses without writes", async ({
    page,
  }, testInfo) => {
    const fixtures = await seedAdminUiFixtures(testInfo.project.name);
    const suffix = testInfo.project.name
      .replace(/[^a-z0-9]+/gi, "-")
      .toLowerCase();
    const unsafeMarkdown = [
      "![script](javascript:alert(1))",
      "![data](data:image/svg+xml;base64,PHN2Zz4=)",
      "![http](http://example.com/image.png)",
      "![protocol relative](//attacker.example/image.png)",
      "![escaped](javascript\\:alert\\(1\\))",
      "![reference][asset]\n\n[asset]: file:///etc/passwd",
      "![duplicate][asset]\n\n[asset]: /images/safe.png\n[asset]: ftp://example.com/image.png",
      "> ![quoted][asset]\n>\n> [asset]: //attacker.example/pixel.png",
      String.raw`![escaped label][foo\]]

[foo\]]: javascript:alert(1)`,
      "> - ![nested][asset]\n>\n>   [asset]: data:image/png;base64,unsafe",
      "> ![quoted duplicate][asset]\n>\n> [asset]: /images/safe.png\n> [asset]: //attacker.example/duplicate.png",
    ];

    await signInAdmin(page);

    for (const [index, bodyMarkdown] of unsafeMarkdown.entries()) {
      const slug = `${fixtureSlugPrefix}-${suffix}-unsafe-${index}`;
      const response = await page.request.post("/api/admin/posts/create", {
        headers: sameOriginHeaders,
        data: directPostPayload(slug, bodyMarkdown),
      });
      const payload = (await response.json()) as {
        fieldErrors?: { bodyMarkdown?: string };
      };

      expect(response.status()).toBe(400);
      expect(payload.fieldErrors?.bodyMarkdown).toBeTruthy();
      expect(await countAdminUiPosts(slug)).toBe(0);
    }

    const unsafeCoverSlug = `${fixtureSlugPrefix}-${suffix}-unsafe-cover`;
    const unsafeCoverResponse = await page.request.post(
      "/api/admin/posts/create",
      {
        headers: sameOriginHeaders,
        data: {
          ...directPostPayload(unsafeCoverSlug, "![safe](/images/safe.png)"),
          coverImage: "http://example.com/cover.png",
        },
      },
    );
    const unsafeCoverPayload = (await unsafeCoverResponse.json()) as {
      fieldErrors?: { coverImage?: string };
    };

    expect(unsafeCoverResponse.status()).toBe(400);
    expect(unsafeCoverPayload.fieldErrors?.coverImage).toBeTruthy();
    expect(await countAdminUiPosts(unsafeCoverSlug)).toBe(0);

    const allowedSlug = `${fixtureSlugPrefix}-${suffix}-allowed-images`;
    const allowedMarkdown = [
      "![root](/images/root.png)",
      "![relative](../images/relative.png)",
      "![external](https://example.com/external.png)",
      "![reference][diagram]",
      "",
      "[diagram]: ./images/diagram.svg \"Diagram\"",
    ].join("\n");
    const allowedCreateResponse = await page.request.post(
      "/api/admin/posts/create",
      {
        headers: sameOriginHeaders,
        data: {
          ...directPostPayload(allowedSlug, allowedMarkdown),
          coverImage: "https://example.com/cover.png",
        },
      },
    );

    expect(allowedCreateResponse.status()).toBe(200);
    expect(await findAdminUiPost(allowedSlug)).toMatchObject({
      bodyMarkdown: allowedMarkdown,
      coverImage: "https://example.com/cover.png",
    });

    const originalBody = fixtures.draft.bodyMarkdown;
    for (const bodyMarkdown of unsafeMarkdown.slice(-4)) {
      const unsafeEditResponse = await page.request.post(
        "/api/admin/posts/edit",
        {
          headers: sameOriginHeaders,
          data: {
            ...directPostPayload(fixtures.draft.slug, bodyMarkdown),
            id: fixtures.draft.id,
          },
        },
      );
      const unsafeEditPayload = (await unsafeEditResponse.json()) as {
        fieldErrors?: { bodyMarkdown?: string };
      };

      expect(unsafeEditResponse.status()).toBe(400);
      expect(unsafeEditPayload.fieldErrors?.bodyMarkdown).toBeTruthy();
      expect(await findAdminUiPost(fixtures.draft.slug)).toMatchObject({
        bodyMarkdown: originalBody,
      });
    }

    const allowedEditBody = [
      "![root](/images/edit-root.png)",
      "![relative](./images/edit-relative.png)",
      "![external](https://example.com/edit-external.png)",
    ].join("\n");
    const allowedEditResponse = await page.request.post(
      "/api/admin/posts/edit",
      {
        headers: sameOriginHeaders,
        data: {
          ...directPostPayload(fixtures.draft.slug, allowedEditBody),
          id: fixtures.draft.id,
        },
      },
    );

    expect(allowedEditResponse.status()).toBe(200);
    expect(await findAdminUiPost(fixtures.draft.slug)).toMatchObject({
      bodyMarkdown: allowedEditBody,
    });
  });
});

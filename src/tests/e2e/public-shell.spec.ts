import { expect, test } from "@playwright/test";

const routeLabels = ["笔记", "系列", "归档", "搜索"] as const;
const siteBrand = "Turnin‘s Blog";
const contentRoutes = [
  {
    path: "/notes",
    label: "笔记",
    heading: /^笔记$/,
    emptyCopy: /暂时没有公开笔记/,
    contentTestId: "public-note-list",
  },
  {
    path: "/series",
    label: "系列",
    heading: /^系列$/,
    emptyCopy: /暂时没有公开系列/,
    contentTestId: "series-index",
  },
  {
    path: "/archive",
    label: "归档",
    heading: /^归档$/,
    emptyCopy: /暂时没有可归档的公开笔记/,
    contentTestId: "archive-timeline",
  },
  {
    path: "/search",
    label: "搜索",
    heading: /^搜索$/,
    emptyCopy: /输入关键词后，公开笔记中的相关结果会显示在这里/,
    contentTestId: null,
  },
] as const;

test.describe("public shell and navigation @shell-nav", () => {
  test("renders PublicShell semantic landmarks and configured brand copy @shell-nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await expect(page.locator("header")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "主导航" }),
    ).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    await expect(page).toHaveTitle(siteBrand);
    await expect(
      page.getByRole("heading", { level: 1, name: siteBrand }),
    ).toBeVisible();
    await expect(page.getByText(siteBrand).first()).toBeVisible();
  });

  test("keeps desktop route order 笔记 / 系列 / 归档 / 搜索 @shell-nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const primaryLinks = page
      .getByRole("navigation", { name: "主导航" })
      .getByRole("link");
    await expect(primaryLinks).toHaveText(routeLabels);

    const footerLinks = page
      .getByRole("navigation", { name: "页脚导航" })
      .getByRole("link");
    await expect(footerLinks).toHaveText(routeLabels);
  });

  test("uses the email-only public contact boundary @shell-nav", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /邮箱/i })).toHaveAttribute(
      "href",
      "mailto:zhdydkdh@163.com",
    );
    await expect(page.getByText(/GitHub|RSS|Projects/i)).toHaveCount(0);
  });

  test("opens Mobile navigation in locked order, traps focus, and returns focus after Escape @shell-nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "打开导航" });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await trigger.press("Enter");

    const dialog = page.getByRole("dialog", { name: "移动导航" });
    await expect(dialog).toBeVisible();

    const close = page.getByRole("button", { name: "关闭导航" });
    await expect(close).toBeFocused();

    const mobileLinks = dialog
      .getByRole("navigation", { name: "移动导航" })
      .getByRole("link");
    await expect(mobileLinks).toHaveText(routeLabels);

    for (let index = 0; index < routeLabels.length; index += 1) {
      const box = await mobileLinks.nth(index).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    await page.keyboard.press("Shift+Tab");
    await expect(mobileLinks.nth(routeLabels.length - 1)).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("restores background access and scroll when mobile navigation closes or crosses desktop breakpoint @shell-nav", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const trigger = page.getByRole("button", { name: "打开导航" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "移动导航" });
    const header = page.locator("header");
    await expect(dialog).toBeVisible();
    await expect(header).toHaveAttribute("inert", "");
    await expect(header).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#main-content")).toHaveAttribute("inert", "");
    await expect(page.locator("#main-content")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator("footer")).toHaveAttribute("inert", "");
    await expect(page.locator("footer")).toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    await page.setViewportSize({ width: 900, height: 844 });
    await expect(dialog).toBeHidden();
    await expect(header).not.toHaveAttribute("inert", "");
    await expect(header).not.toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#main-content")).not.toHaveAttribute("inert", "");
    await expect(page.locator("#main-content")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator("footer")).not.toHaveAttribute("inert", "");
    await expect(page.locator("footer")).not.toHaveAttribute(
      "aria-hidden",
      "true",
    );
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});

test.describe("homepage identity and public routes @homepage-routes", () => {
  test("renders configured mixed-language hero identity and approved first-viewport actions @homepage-routes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const homepageH1 = page.getByRole("heading", {
      level: 1,
      name: siteBrand,
    });
    await expect(homepageH1).toHaveCount(1);
    await expect(page.getByText(siteBrand).first()).toBeVisible();
    await expect(page.getByText(siteBrand).first()).toHaveAttribute("lang", "en");
    await expect(
      page.getByText(/记录技术笔记、系统草图和软件构建实验/),
    ).toBeVisible();
    await expect(
      page.getByText("这里记录技术笔记、系统草图和软件构建实验。"),
    ).toHaveAttribute("lang", "zh-Hans");
    await expect(
      page.getByText(/首页展示已经公开且被明确设为精选/),
    ).toHaveAttribute("lang", "zh-Hans");

    const mainContent = page.locator("main");
    await expect(
      mainContent.getByRole("link", { name: /^查看笔记$/ }),
    ).toHaveAttribute("href", "/notes");
    await expect(
      mainContent.getByRole("link", { name: /^打开博客索引$/ }),
    ).toHaveAttribute("href", "#lab-index");

    const emailContact = page.locator('a[href="mailto:zhdydkdh@163.com"]');
    await expect(emailContact).toHaveCount(1);
    await expect(emailContact.first()).toBeVisible();
    await expect(page.getByText(/GitHub|RSS|Projects/i)).toHaveCount(0);
  });

  test("renders lab-index route strip and public content modules @homepage-routes", async ({
    page,
  }) => {
    await page.goto("/");

    const labIndex = page.locator("#lab-index");
    await expect(labIndex).toBeVisible();
    await expect(
      labIndex.getByRole("heading", { name: "博客索引" }),
    ).toBeVisible();
    await expect(labIndex.getByRole("link")).toHaveText(routeLabels);
    await expect(labIndex).toContainText(
      "笔记、系列、归档和搜索已经连接到公开内容",
    );

    const contentModules = page.getByRole("region", { name: "内容模块" });
    await expect(contentModules.getByTestId("featured-notes-module")).toBeVisible();
    await expect(
      contentModules.getByRole("heading", { name: "精选笔记", exact: true }),
    ).toBeVisible();
    await expect(contentModules.getByTestId("homepage-public-stats")).toBeVisible();
    await expect(
      page.getByText(/内容系统待接入|系列模型待接入|归档数据待接入/),
    ).toHaveCount(0);
    await expect(page.getByText(/fake article|published on|by hans/i)).toHaveCount(
      0,
    );
  });

  test("renders Chinese-first content or empty states for public routes @homepage-routes", async ({
    page,
  }) => {
    for (const route of contentRoutes) {
      await page.goto(route.path);

      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading }),
      ).toHaveAttribute("lang", "zh-Hans");
      await expect(page.locator("main")).toContainText(route.label);
      await expect(page.getByText(/Loading|加载中/)).toHaveCount(0);

      if (route.contentTestId) {
        const contentState = page.getByTestId(route.contentTestId);
        const emptyState = page.locator("main").getByText(route.emptyCopy);

        expect((await contentState.count()) + (await emptyState.count())).toBeGreaterThan(
          0,
        );

        if ((await contentState.count()) > 0) {
          await expect(contentState).toBeVisible();
        } else {
          await expect(emptyState.first()).toBeVisible();
        }

        await expect(page.locator("main").getByRole("button")).toHaveCount(0);
      } else {
        await expect(page.locator("main")).toContainText(route.emptyCopy);
        await expect(
          page.locator("main").getByRole("button", { name: "搜索" }),
        ).toHaveCount(1);
      }
    }
  });

  test("omits the retired generic reading preview @homepage-routes", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("region", { name: "阅读预览" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "阅读版式预览" })).toHaveCount(
      0,
    );
    await expect(page.getByText("行内代码")).toHaveCount(0);
    await expect(page.getByText("draft.status")).toHaveCount(0);
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 720 },
  ]) {
    test(`keeps homepage inside the ${viewport.width}px mobile viewport @homepage-routes`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");

      const heading = page.getByRole("heading", {
        level: 1,
        name: siteBrand,
      });
      await expect(heading).toBeVisible();
      await expect(heading).toHaveCSS("text-wrap", "balance");

      const hasHorizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(hasHorizontalOverflow).toBe(false);
    });
  }
});

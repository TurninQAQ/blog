import { createHmac } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import nextEnv from "@next/env";

const genericLoginError = "登录失败。请确认管理员邮箱和密码后重试。";
const protectedShellCopy = "写作控制台";
const forbiddenAccountEntryCopy =
  /sign up|signup|register|registration|invite|invitation|reset|forgot|oauth|provider|github|google|magic link|rss|projects/i;

const requiredSuccessfulLoginEnv = [
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "PLAYWRIGHT_ADMIN_PASSWORD",
  "DATABASE_URL",
] as const;

type RequiredSuccessfulLoginEnv = (typeof requiredSuccessfulLoginEnv)[number];

function loadLocalEnvFile() {
  nextEnv.loadEnvConfig(process.cwd());
}

function getRequiredSuccessfulLoginEnv() {
  loadLocalEnvFile();

  return Object.fromEntries(
    requiredSuccessfulLoginEnv.map((key) => {
      const value = process.env[key];
      expect(
        value,
        `${key} must be set in ignored .env.local before the successful admin login test runs`,
      ).toBeTruthy();

      return [key, value as string];
    }),
  ) as Record<RequiredSuccessfulLoginEnv, string>;
}

async function assertNoHorizontalOverflow(page: Page) {
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
}

async function clearAdminLoginAttempts() {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.$executeRawUnsafe('DELETE FROM "AdminLoginAttempt"');
  } finally {
    await prisma.$disconnect();
  }
}

async function createExpiredAdminSessionCookie(page: Page) {
  const env = getRequiredSuccessfulLoginEnv();
  const token = `expired-session-${Date.now()}`;
  const tokenHash = createHmac("sha256", env.ADMIN_SESSION_SECRET)
    .update(token)
    .digest("hex");
  const { prisma } = await import("../../lib/db/prisma");

  const adminUser = await prisma.adminUser.findUniqueOrThrow({
    where: { email: env.ADMIN_EMAIL },
  });

  await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId: adminUser.id,
      expiresAt: new Date(Date.now() - 60_000),
    },
  });
  await prisma.$disconnect();

  await page.context().addCookies([
    {
      name: "admin_session",
      value: token,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 3600,
    },
  ]);
}

async function signInAdmin(page: Page) {
  const env = getRequiredSuccessfulLoginEnv();

  await page.goto("/admin/login");
  await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
  await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
  await page.getByRole("button", { name: "登录管理后台" }).click();
  await page.waitForURL("**/admin");

  return env;
}

test.describe("custom single-admin auth boundary", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    const env = getRequiredSuccessfulLoginEnv();
    const { prisma } = await import("../../lib/db/prisma");

    const [byEmail, total] = await Promise.all([
      prisma.adminUser.count({ where: { email: env.ADMIN_EMAIL } }),
      prisma.adminUser.count(),
    ]);
    await prisma.$disconnect();

    expect(
      byEmail,
      "successful login must not run until admin bootstrap proves one ADMIN_EMAIL row exists",
    ).toBe(1);
    expect(
      total,
      "successful login must not run until bootstrap proves no extra AdminUser rows exist",
    ).toBe(1);
  });

  test("redirects unauthenticated /admin requests before protected shell renders", async ({
    page,
  }) => {
    await page.goto("/admin");
    await page.waitForURL("**/admin/login");

    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByText(protectedShellCopy)).toHaveCount(0);
    await expect(page.getByText("数据模型")).toHaveCount(0);
    await expect(page.getByText("管理员会话")).toHaveCount(0);
    await expect(page.getByText("写入保护")).toHaveCount(0);
  });

  test("redirects expired admin sessions without a server render failure", async ({
    page,
  }) => {
    await createExpiredAdminSessionCookie(page);

    const response = await page.goto("/admin");

    expect(response?.status()).not.toBe(500);
    await page.waitForURL("**/admin/login");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByText(protectedShellCopy)).toHaveCount(0);
  });

  test("renders the admin login form without alternate account entry links", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 1, name: "管理员登录" }),
    ).toBeVisible();
    await expect(page.getByLabel("邮箱")).toBeVisible();
    await expect(page.getByLabel("密码")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "登录管理后台" }),
    ).toBeVisible();
    await expect(page.getByText("Turnin‘s Blog")).toBeVisible();
    await expect(page.getByText(forbiddenAccountEntryCopy)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "返回博客首页" })).toHaveCount(
      1,
    );
  });

  test("shows one generic Chinese-first error for invalid credentials", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await page.getByLabel("邮箱").fill("not-the-admin@example.com");
    await page.getByLabel("密码").fill("definitely-wrong");
    await page.getByRole("button", { name: "登录管理后台" }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: genericLoginError }),
    ).toBeVisible();
    await expect(
      page.getByText(/email.*not found|password.*incorrect|wrong password|unknown email|not allowlisted/i),
    ).toHaveCount(0);
  });

  test("rate limits repeated invalid admin login attempts before accepting the correct password", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    await clearAdminLoginAttempts();
    try {
      const env = getRequiredSuccessfulLoginEnv();

      await page.goto("/admin/login");

      for (let attempt = 0; attempt < 6; attempt += 1) {
        await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
        await page.getByLabel("密码").fill(`wrong-password-${attempt}`);
        await page.getByRole("button", { name: "登录管理后台" }).click();
        await expect(
          page.getByRole("alert").filter({ hasText: genericLoginError }),
        ).toBeVisible();
      }

      await page.goto("/admin/login");
      await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
      await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
      await page.getByRole("button", { name: "登录管理后台" }).click();

      await expect(
        page.getByRole("alert").filter({ hasText: genericLoginError }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/login$/);
    } finally {
      await clearAdminLoginAttempts();
    }
  });

  test("uses one admin login rate bucket when forwarding headers rotate", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    await clearAdminLoginAttempts();
    try {
      const env = getRequiredSuccessfulLoginEnv();

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await page.context().setExtraHTTPHeaders({
          "x-forwarded-for": `198.51.100.${attempt + 10}`,
        });
        await page.goto("/admin/login");
        await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
        await page.getByLabel("密码").fill(`rotated-header-${attempt}`);
        await page.getByRole("button", { name: "登录管理后台" }).click();
        await expect(
          page.getByRole("alert").filter({ hasText: genericLoginError }),
        ).toBeVisible();
      }

      await page.context().setExtraHTTPHeaders({
        "x-forwarded-for": "203.0.113.25",
      });
      await page.goto("/admin/login");
      await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
      await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
      await page.getByRole("button", { name: "登录管理后台" }).click();

      await expect(
        page.getByRole("alert").filter({ hasText: genericLoginError }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/login$/);
    } finally {
      await clearAdminLoginAttempts();
    }
  });

  test("counts concurrent admin login failures atomically", async ({
    browser,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    await clearAdminLoginAttempts();
    let context: BrowserContext | null = null;

    try {
      const env = getRequiredSuccessfulLoginEnv();
      context = await browser.newContext({
        extraHTTPHeaders: {
          "x-forwarded-for": "198.51.100.40",
        },
      });
      const pages = await Promise.all(
        Array.from({ length: 5 }, () => context!.newPage()),
      );

      await Promise.all(
        pages.map(async (attemptPage, attempt) => {
          await attemptPage.goto("/admin/login");
          await attemptPage.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
          await attemptPage
            .getByLabel("密码")
            .fill(`concurrent-wrong-${attempt}`);
          await attemptPage
            .getByRole("button", { name: "登录管理后台" })
            .click();
          await expect(
            attemptPage
              .getByRole("alert")
              .filter({ hasText: genericLoginError }),
          ).toBeVisible();
        }),
      );

      const verificationPage = await context.newPage();
      await verificationPage.goto("/admin/login");
      await verificationPage.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
      await verificationPage
        .getByLabel("密码")
        .fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
      await verificationPage
        .getByRole("button", { name: "登录管理后台" })
        .click();

      await expect(
        verificationPage
          .getByRole("alert")
          .filter({ hasText: genericLoginError }),
      ).toBeVisible();
      await expect(verificationPage).toHaveURL(/\/admin\/login$/);
    } finally {
      await context?.close();
      await clearAdminLoginAttempts();
    }
  });

  test("uses one admin login rate bucket when submitted emails rotate", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");

    await clearAdminLoginAttempts();
    try {
      const env = getRequiredSuccessfulLoginEnv();

      for (let attempt = 0; attempt < 5; attempt += 1) {
        await page.goto("/admin/login");
        await page
          .getByLabel("邮箱")
          .fill(`not-admin-${attempt}@example.com`);
        await page.getByLabel("密码").fill(`rotated-email-${attempt}`);
        await page.getByRole("button", { name: "登录管理后台" }).click();
        await expect(
          page.getByRole("alert").filter({ hasText: genericLoginError }),
        ).toBeVisible();
      }

      await page.goto("/admin/login");
      await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
      await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
      await page.getByRole("button", { name: "登录管理后台" }).click();

      await expect(
        page.getByRole("alert").filter({ hasText: genericLoginError }),
      ).toBeVisible();
      await expect(page).toHaveURL(/\/admin\/login$/);
    } finally {
      await clearAdminLoginAttempts();
    }
  });

  test("reserves login attempts before password verification", () => {
    const source = readFileSync("src/app/admin/login/actions.ts", "utf8");
    const reserveOffset = source.indexOf("reserveAdminLoginAttempt(");
    const verifyOffset = source.indexOf("verifyAdminPassword(");

    expect(reserveOffset).toBeGreaterThanOrEqual(0);
    expect(verifyOffset).toBeGreaterThanOrEqual(0);
    expect(reserveOffset).toBeLessThan(verifyOffset);
    expect(source).not.toContain("isAdminLoginAttemptAllowed");
    expect(source).not.toContain("recordAdminLoginFailure(");
  });

  test("verifies the password hash on the generic failure path for non-admin emails", () => {
    const source = readFileSync("src/app/admin/login/actions.ts", "utf8");
    const passwordMatchesStart = source.indexOf("const passwordMatches");
    const failureStart = source.indexOf("if (!emailMatches");
    const passwordMatchesBlock = source.slice(
      passwordMatchesStart,
      failureStart,
    );

    expect(passwordMatchesStart).toBeGreaterThanOrEqual(0);
    expect(failureStart).toBeGreaterThan(passwordMatchesStart);
    expect(passwordMatchesBlock).toMatch(
      /verifyAdminPassword\(\s*ADMIN_PASSWORD_HASH,/,
    );
    expect(passwordMatchesBlock).not.toMatch(/emailMatches\s*\?/);
    expect(passwordMatchesBlock).not.toMatch(/:\s*false/);
  });

  test("keeps login outside the protected admin route group while layout owns the page guard", () => {
    const protectedLayoutPath = "src/app/admin/(protected)/layout.tsx";
    const protectedPagePath = "src/app/admin/(protected)/page.tsx";
    const loginPagePath = "src/app/admin/login/page.tsx";

    expect(existsSync(protectedLayoutPath)).toBe(true);
    expect(existsSync(protectedPagePath)).toBe(true);
    expect(existsSync(loginPagePath)).toBe(true);

    const protectedLayout = readFileSync(protectedLayoutPath, "utf8");
    const protectedPage = readFileSync(protectedPagePath, "utf8");
    const loginPage = readFileSync(loginPagePath, "utf8");

    expect(protectedLayout).toContain("requireAdminPage");
    expect(protectedLayout).toContain("<AdminShell");
    expect(protectedPage).not.toContain("requireAdminPage");
    expect(loginPage).not.toContain("requireAdminPage");
  });

  test("logs in the seeded admin, renders protected status, and signs out", async ({
    page,
  }) => {
    const env = getRequiredSuccessfulLoginEnv();

    await page.goto("/admin/login");
    await page.getByLabel("邮箱").fill(env.ADMIN_EMAIL);
    await page.getByLabel("密码").fill(env.PLAYWRIGHT_ADMIN_PASSWORD);
    await page.getByRole("button", { name: "登录管理后台" }).click();

    await page.waitForURL("**/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText("Turnin‘s Blog")).toBeVisible();
    await expect(page.getByText(env.ADMIN_EMAIL)).toBeVisible();
    await expect(page.getByText(protectedShellCopy)).toBeVisible();
    await expect(page.getByRole("link", { name: "新建文章" })).toBeVisible();
    const metrics = page.getByRole("region", { name: "管理内容指标" });
    await expect(
      metrics.getByRole("heading", { name: "草稿", exact: true }),
    ).toBeVisible();
    await expect(
      metrics.getByRole("heading", { name: "最近编辑", exact: true }),
    ).toBeVisible();

    const adminCookie = (await page.context().cookies()).find(
      (cookie) => cookie.name === "admin_session",
    );
    expect(adminCookie?.httpOnly).toBe(true);
    expect(adminCookie?.sameSite).toBe("Lax");

    await page.getByRole("button", { name: "退出登录" }).click();
    await page.waitForURL("**/admin/login");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByText(protectedShellCopy)).toHaveCount(0);
  });

  test("does not destroy the admin session on GET logout navigation", async ({
    page,
  }) => {
    const env = await signInAdmin(page);

    await page.goto("/admin/logout");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(env.ADMIN_EMAIL)).toBeVisible();
  });

  test("rejects cross-origin logout POST without clearing the admin session", async ({
    page,
  }) => {
    const env = await signInAdmin(page);

    const response = await page.request.post("/admin/logout", {
      headers: {
        Origin: "https://attacker.example",
      },
    });

    expect(response.status()).toBe(403);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(env.ADMIN_EMAIL)).toBeVisible();
  });

  test("keeps the login page inside the viewport for responsive projects", async ({
    page,
  }) => {
    await page.goto("/admin/login");

    await assertNoHorizontalOverflow(page);
  });

  test("keeps reduced-motion login rendering static and inside the viewport", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion");

    await page.goto("/admin/login");

    await expect
      .poll(() =>
        page.evaluate(() =>
          window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        ),
      )
      .toBe(true);
    await assertNoHorizontalOverflow(page);
  });
});

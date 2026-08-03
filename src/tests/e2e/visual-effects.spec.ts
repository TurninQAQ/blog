import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const isolatedRoutes = ["/notes", "/series", "/archive", "/search"] as const;
const bannedWebGlPackages = [
  "three",
  "@react-three/fiber",
  "@react-three/drei",
] as const;
const bannedWebGlImportPattern = new RegExp(
  `(?:from\\s+["']|import\\s+["']|import\\s*\\(\\s*["']|require\\s*\\(\\s*["'])(${bannedWebGlPackages
    .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})(?:/[^"']*)?["']`,
);

function projectRoot() {
  return process.cwd();
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

function collectSourceFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (
      entry.name === "node_modules" ||
      entry.name === ".next" ||
      entry.name === ".git" ||
      entry.name === ".planning" ||
      entry.name === "playwright-report" ||
      entry.name === "test-results"
    ) {
      continue;
    }

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(entryPath));
      continue;
    }

    if (/\.(?:cjs|mjs|js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

function assertNoBannedWebGlImports() {
  const root = projectRoot();
  const pkg = readJson(path.join(root, "package.json"));

  for (const bannedPackage of bannedWebGlPackages) {
    expect(pkg.dependencies?.[bannedPackage]).toBeUndefined();
    expect(pkg.devDependencies?.[bannedPackage]).toBeUndefined();
  }

  const offenders = collectSourceFiles(root).filter((filePath) =>
    bannedWebGlImportPattern.test(fs.readFileSync(filePath, "utf8")),
  );

  expect(offenders).toEqual([]);
}

async function expectWebpAsset(page: Page, assetPath: string) {
  const response = await page.request.get(new URL(assetPath, page.url()).href);

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toMatch(/^image\/webp(?:;|$)/);
  expect((await response.body()).byteLength).toBeGreaterThan(0);
}

test.describe("homepage visual foundation @visual-effects", () => {
  test("renders a homepage-only signal canvas over a static lab fallback @visual-effects", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "desktop pointer attraction is asserted only in the desktop project",
    );

    await page.goto("/");

    const signalCanvas = page.locator("[data-signal-canvas]");
    await expect(
      signalCanvas,
      "SignalNetworkCanvas should mount on the homepage with data-signal-canvas",
    ).toHaveCount(1);
    await expect(signalCanvas).toHaveAttribute("aria-hidden", "true");
    await expect(signalCanvas).toHaveCSS("pointer-events", "none");
    await expect(signalCanvas).toHaveAttribute("data-animation-state", "active");
    await expect(signalCanvas).toHaveAttribute("data-pointer-follow", "desktop");

    const initialFrameCount = Number(
      (await signalCanvas.getAttribute("data-frame-count")) ?? "0",
    );
    await page.waitForTimeout(160);
    const nextFrameCount = Number(
      (await signalCanvas.getAttribute("data-frame-count")) ?? "0",
    );
    expect(nextFrameCount).toBeGreaterThan(initialFrameCount);

    const nonTransparentSamples = await signalCanvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      const context = canvas.getContext("2d");

      if (!context) {
        return 0;
      }

      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let painted = 0;

      for (let index = 3; index < pixels.length; index += 160) {
        if (pixels[index] > 0) {
          painted += 1;
        }
      }

      return painted;
    });
    expect(nonTransparentSamples).toBeGreaterThan(20);

    const staticFallback = page.locator("[data-lab-static='true']");
    await expect(staticFallback).toBeVisible();

    const fallbackImage = await staticFallback.evaluate((element) =>
      window.getComputedStyle(element).backgroundImage,
    );
    expect(fallbackImage).toContain(
      "/images/mecha/hero-desktop-orbital.webp",
    );
  });

  test("serves and decodes all three original WebP assets @visual-effects", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "the shared asset contract needs one browser project",
    );

    const assetPaths = [
      "/images/mecha/hero-desktop-orbital.webp",
      "/images/mecha/hero-mobile-orbital.webp",
      "/images/mecha/note-fallback-orbital.webp",
    ];

    await page.goto("/");

    for (const assetPath of assetPaths) {
      await expectWebpAsset(page, assetPath);
    }

    const decoded = await page.evaluate(
      (paths) =>
        Promise.all(
          paths.map(
            (src) =>
              new Promise<boolean>((resolve) => {
                const image = new Image();

                image.addEventListener("load", () => {
                  resolve(image.complete && image.naturalWidth > 0);
                });
                image.addEventListener("error", () => resolve(false));
                image.src = src;
              }),
          ),
        ),
      assetPaths,
    );

    expect(decoded).toEqual([true, true, true]);
  });

  test("keeps the static lab background readable before canvas hydration @visual-effects", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: "http://127.0.0.1:3000",
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: "Turnin‘s Blog" }),
    ).toBeVisible();
    await expect(page.locator("[data-lab-background='homepage']")).toBeVisible();
    await expect(page.locator("[data-lab-static='true']")).toBeVisible();

    await context.close();
  });

  test("does not mount homepage effect code on public placeholder routes @visual-effects", async ({
    page,
  }) => {
    for (const route of isolatedRoutes) {
      await page.goto(route);

      await expect(page.locator("[data-signal-canvas]")).toHaveCount(0);
      await expect(page.locator("[data-lab-background='homepage']")).toHaveCount(0);

      const html = await page.content();
      expect(html).not.toContain("data-signal-canvas");
    }
  });

  test("does not depend on Three.js, React Three Fiber, or Drei @visual-effects", async () => {
    assertNoBannedWebGlImports();
  });

  test("matches banned WebGL package subpath imports @visual-effects", async () => {
    const threeSubpathImport = [
      'import { OrbitControls } from "',
      "three",
      '/examples/jsm/controls/OrbitControls.js"',
    ].join("");
    const dreiDynamicImport = [
      'const drei = await import("',
      "@react-three/drei",
      '/core")',
    ].join("");
    const threeSideEffectImport = [
      'import "',
      "three",
      '/examples/jsm/controls/OrbitControls.js"',
    ].join("");

    expect(bannedWebGlImportPattern.test(threeSubpathImport)).toBe(true);
    expect(bannedWebGlImportPattern.test(dreiDynamicImport)).toBe(true);
    expect(bannedWebGlImportPattern.test(threeSideEffectImport)).toBe(true);
    expect(
      bannedWebGlImportPattern.test('import localTool from "./local-tool"'),
    ).toBe(false);
  });
});

test.describe("mobile visual safeguards @visual-effects", () => {
  test("disables pointer-follow and prevents horizontal overflow on mobile widths @visual-effects", async ({
    page,
  }, testInfo) => {
    test.skip(
      !["mobile", "min-mobile"].includes(testInfo.project.name),
      "mobile guard runs only in mobile viewport projects",
    );

    await page.goto("/");

    await expectWebpAsset(page, "/images/mecha/hero-mobile-orbital.webp");

    const mobileHeroImage = page.locator(".manga-hero__mobile-art img");
    await expect(mobileHeroImage).toBeVisible();
    await expect
      .poll(() =>
        mobileHeroImage.evaluate(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);

    const signalCanvas = page.locator("[data-signal-canvas]");
    await expect(signalCanvas).toHaveAttribute("data-pointer-follow", "disabled");

    const signalCount = await signalCanvas.getAttribute("data-signal-count");
    expect(Number(signalCount)).toBeLessThanOrEqual(36);

    const devicePixelRatio = await signalCanvas.getAttribute("data-dpr");
    expect(Number(devicePixelRatio)).toBeLessThanOrEqual(1);

    const hasHorizontalOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("reduced-motion visual safeguards @visual-effects", () => {
  test("keeps static identity while canvas animation and pointer attraction are inactive @visual-effects", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "reduced-motion",
      "reduced-motion guard runs only in the reduced-motion project",
    );

    await page.goto("/");

    await expect(page.locator("[data-lab-static='true']")).toBeVisible();

    const signalCanvas = page.locator("[data-signal-canvas]");
    await expect(signalCanvas).toHaveAttribute(
      "data-animation-state",
      "reduced-motion",
    );
    await expect(signalCanvas).toHaveAttribute("data-pointer-follow", "disabled");

    const initialFrameCount = await signalCanvas.getAttribute("data-frame-count");
    await page.waitForTimeout(220);
    await expect(signalCanvas).toHaveAttribute(
      "data-frame-count",
      initialFrameCount ?? "0",
    );
  });
});

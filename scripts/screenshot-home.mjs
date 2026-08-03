import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.screenshot({ path: "output/turnin-home-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.screenshot({ path: "output/turnin-home-mobile.png" });
await browser.close();
console.log("screenshots done");

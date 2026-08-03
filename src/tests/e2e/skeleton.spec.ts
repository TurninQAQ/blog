import { expect, test } from "@playwright/test";
import { rm } from "node:fs/promises";

import { GET, POST } from "../../app/api/skeleton-probe/route";
import { createProbeStore } from "../../lib/skeleton/probe-store";

async function withProbeEnv(
  values: { nodeEnv: string; enabled?: string },
  callback: () => Promise<void>,
) {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalEnabled = process.env.ENABLE_SKELETON_PROBE;

  process.env.NODE_ENV = values.nodeEnv;
  if (values.enabled === undefined) {
    delete process.env.ENABLE_SKELETON_PROBE;
  } else {
    process.env.ENABLE_SKELETON_PROBE = values.enabled;
  }

  try {
    await callback();
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    if (originalEnabled === undefined) {
      delete process.env.ENABLE_SKELETON_PROBE;
    } else {
      process.env.ENABLE_SKELETON_PROBE = originalEnabled;
    }
  }
}

test.describe("walking skeleton probe", () => {
  test("keeps the diagnostic API unavailable in production even with the legacy flag", async () => {
    await withProbeEnv({ nodeEnv: "production" }, async () => {
      await expect((await GET()).status).toBe(404);
      await expect((await POST()).status).toBe(404);
    });

    await withProbeEnv(
      { nodeEnv: "production", enabled: "true" },
      async () => {
        await expect((await GET()).status).toBe(404);
        await expect((await POST()).status).toBe(404);
      },
    );
  });

  test("serializes local probe writes without losing concurrent increments", async ({
  }, testInfo) => {
    const probePath = testInfo.outputPath("skeleton-probe.json");
    const store = createProbeStore(probePath);
    await rm(probePath, { force: true });

    const writes = await Promise.all(
      Array.from({ length: 6 }, () => store.writeProbe()),
    );
    const counts = writes.map((state) => state.count);

    expect(new Set(counts).size).toBe(6);
    expect(Math.max(...counts)).toBe(6);
  });

  test("exposes a local skeleton API read and write contract", async ({
    request,
  }) => {
    const initialRead = await request.get("/api/skeleton-probe");
    expect(
      initialRead.status(),
      "GET /api/skeleton-probe should return the current probe state",
    ).toBe(200);
    const initialState = await initialRead.json();

    const write = await request.post("/api/skeleton-probe", {
      data: { source: "playwright" },
    });
    expect(
      write.status(),
      "POST /api/skeleton-probe should persist a new probe value",
    ).toBe(200);

    const nextRead = await request.get("/api/skeleton-probe");
    expect(
      nextRead.status(),
      "GET /api/skeleton-probe should reflect the persisted write",
    ).toBe(200);
    const nextState = await nextRead.json();

    expect(nextState).not.toEqual(initialState);
  });

  test("round-trips a browser write through the skeleton page", async ({
    page,
  }) => {
    await page.goto("/__skeleton");

    await expect(
      page.getByRole("heading", { name: "骨架探针" }),
    ).toBeVisible();

    const writeButton = page.getByRole("button", { name: "写入探针" });
    await expect(writeButton).toBeVisible();

    const result = page.getByTestId("skeleton-probe-result");
    await expect(result).toBeVisible();
    const before = (await result.textContent()) ?? "";

    await writeButton.click();

    await expect(result).not.toHaveText(before);
  });
});

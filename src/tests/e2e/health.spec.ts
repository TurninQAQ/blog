import { expect, test } from "@playwright/test";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const sensitiveDetailPattern =
  /credential|database|environment|error|exception|host|message|postgres|sql|stack|url|version/i;

test.describe.serial("health contracts", () => {
  test("exposes exact non-cacheable liveness and readiness responses", async ({
    request,
  }) => {
    const liveness = await request.get("/api/health");
    const livenessText = await liveness.text();
    expect(liveness.status()).toBe(200);
    expect(JSON.parse(livenessText)).toEqual({ status: "ok" });
    expect(liveness.headers()["cache-control"]).toContain("no-store");

    const readiness = await request.get("/api/health/ready");
    const readinessText = await readiness.text();
    expect(readiness.status()).toBe(200);
    expect(JSON.parse(readinessText)).toEqual({ status: "ready" });
    expect(readiness.headers()["cache-control"]).toContain("no-store");

    for (const body of [livenessText, readinessText]) {
      expect(body).not.toMatch(sensitiveDetailPattern);
    }

    expect((await request.post("/api/health")).status()).toBe(405);
    expect((await request.post("/api/health/ready")).status()).toBe(405);
  });

  test("keeps liveness database-independent and maps readiness failure to 503", async () => {
    const [{ GET: getLiveness }, { GET: getReadiness }, { prisma }] =
      await Promise.all([
        import("../../app/api/health/route"),
        import("../../app/api/health/ready/route"),
        import("../../lib/db/prisma"),
      ]);
    const originalQueryRaw = prisma.$queryRaw;

    prisma.$queryRaw = (async () => {
      throw new Error("database credential on private host");
    }) as typeof prisma.$queryRaw;

    try {
      const liveness = await getLiveness();
      expect(liveness.status).toBe(200);
      expect(await liveness.json()).toEqual({ status: "ok" });

      const readiness = await getReadiness();
      const readinessText = await readiness.text();
      expect(readiness.status).toBe(503);
      expect(JSON.parse(readinessText)).toEqual({ status: "unavailable" });
      expect(readiness.headers.get("cache-control")).toContain("no-store");
      expect(readinessText).not.toMatch(sensitiveDetailPattern);
    } finally {
      prisma.$queryRaw = originalQueryRaw;
    }
  });
});

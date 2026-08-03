import { spawn, type ChildProcess } from "node:child_process";
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";

import { expect, test } from "@playwright/test";
import nextEnv from "@next/env";

const expectedSecurityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "strict-origin-when-cross-origin",
} as const;

const loopbackHost = "127.0.0.1";
const nextBin = join(
  process.cwd(),
  "node_modules/next/dist/bin/next",
);

type ProductionServer = {
  origin: string;
  port: number;
  child: ChildProcess;
  output: () => string;
};

async function unusedPort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, loopbackHost, () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not allocate an unused loopback port."));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

async function waitForProductionServer(server: ProductionServer) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (server.child.exitCode !== null) {
      throw new Error(
        `next start exited before readiness (code ${server.child.exitCode}).\n${server.output()}`,
      );
    }

    try {
      const response = await fetch(`${server.origin}/admin/login`);
      await response.arrayBuffer();

      if (response.status === 200) {
        return;
      }
    } catch {
      // The loopback server is expected to refuse connections while starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for next start.\n${server.output()}`);
}

async function startProductionServer(adminSiteOrigin: string) {
  nextEnv.loadEnvConfig(process.cwd());

  const port = await unusedPort();
  const chunks: string[] = [];
  const child = spawn(
    process.execPath,
    [nextBin, "start", "-H", loopbackHost, "-p", String(port)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "production",
        ADMIN_SITE_ORIGIN: adminSiteOrigin,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const append = (chunk: Buffer) => {
    chunks.push(chunk.toString("utf8"));
  };

  child.stdout?.on("data", append);
  child.stderr?.on("data", append);

  const server = {
    origin: `http://${loopbackHost}:${port}`,
    port,
    child,
    output: () => chunks.join("").slice(-16 * 1024),
  } satisfies ProductionServer;

  await waitForProductionServer(server);
  return server;
}

async function stopProductionServer(server: ProductionServer) {
  if (server.child.exitCode !== null) {
    return;
  }

  const exited = new Promise<void>((resolve) => {
    server.child.once("exit", () => resolve());
  });
  server.child.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (server.child.exitCode === null) {
    server.child.kill("SIGKILL");
    await exited;
  }
}

async function withProductionServer(
  adminSiteOrigin: string,
  run: (server: ProductionServer) => Promise<void>,
) {
  const server = await startProductionServer(adminSiteOrigin);

  try {
    await run(server);
  } finally {
    await stopProductionServer(server);
  }
}

async function createAdminSessionFixture() {
  nextEnv.loadEnvConfig(process.cwd());

  const secret = process.env.ADMIN_SESSION_SECRET;
  const email = process.env.ADMIN_EMAIL;

  expect(secret, "ADMIN_SESSION_SECRET must be configured").toBeTruthy();
  expect(email, "ADMIN_EMAIL must be configured").toBeTruthy();

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHmac("sha256", secret as string)
    .update(token)
    .digest("hex");
  const { prisma } = await import("../../lib/db/prisma");

  const adminUser = await prisma.adminUser.findUniqueOrThrow({
    where: { email: email as string },
  });
  await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId: adminUser.id,
      expiresAt: new Date(Date.now() + 60_000),
    },
  });
  await prisma.$disconnect();

  return { token, tokenHash };
}

async function adminSessionCount(tokenHash: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    return await prisma.adminSession.count({ where: { tokenHash } });
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteAdminSessionFixture(tokenHash: string) {
  const { prisma } = await import("../../lib/db/prisma");

  try {
    await prisma.adminSession.deleteMany({ where: { tokenHash } });
  } finally {
    await prisma.$disconnect();
  }
}

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

function exportedFunctionSource(
  source: string,
  name: string,
  nextName?: string,
) {
  const start = source.indexOf(`export async function ${name}`);
  const end = nextName
    ? source.indexOf(`export async function ${nextName}`, start + 1)
    : source.length;

  expect(start, `${name} must remain exported`).toBeGreaterThanOrEqual(0);
  expect(end, `${name} source boundary must be found`).toBeGreaterThan(start);

  return source.slice(start, end);
}

test.describe("public exposure security hardening", () => {
  test("keeps authorization inside every admin content query", () => {
    const querySource = readSource("src/lib/admin/post-queries.ts");
    const guardedQuerySource = readSource("src/lib/admin/guarded-query.ts");
    const protectedLayoutSource = readSource(
      "src/app/admin/(protected)/layout.tsx",
    );
    const entryPoints = [
      "getAdminDashboardData",
      "getAdminPostList",
      "getAdminPostEditorData",
    ];

    expect(querySource).toContain(
      'import { runGuardedQuery } from "@/lib/admin/guarded-query";',
    );
    expect(querySource).toContain(
      'import { requireAdmin } from "@/lib/auth/admin";',
    );
    expect(querySource).not.toContain("requireAdminPage");
    expect(querySource).not.toContain('from "next/navigation"');
    expect(guardedQuerySource).not.toContain("next/navigation");

    for (const [index, name] of entryPoints.entries()) {
      const functionSource = exportedFunctionSource(
        querySource,
        name,
        entryPoints[index + 1],
      );
      const guardOffset = functionSource.indexOf(
        "return runGuardedQuery(requireAdmin, async () => {",
      );
      const prismaOffset = functionSource.indexOf("prisma.");

      expect(guardOffset, `${name} must immediately enter its guard`).toBeGreaterThan(
        0,
      );
      expect(prismaOffset, `${name} must keep Prisma inside the lazy read`).toBeGreaterThan(
        guardOffset,
      );
    }

    expect(protectedLayoutSource).toContain("requireAdminPage");
  });

  test("redirects unauthenticated admin pages without exposing protected content", async ({
    request,
  }) => {
    const response = await request.get("/admin", { maxRedirects: 0 });

    expect([303, 307, 308]).toContain(response.status());
    expect(response.headers().location).toMatch(/\/admin\/login$/);
    await expect(response.text()).resolves.not.toContain("草稿队列");
  });

  test("serves the defense headers and admin robots policy in development", async ({
    request,
  }) => {
    const responses = await Promise.all([
      request.get("/"),
      request.get("/admin/login"),
      request.get("/api/skeleton-probe"),
    ]);

    for (const response of responses) {
      const headers = response.headers();
      const csp = headers["content-security-policy"];

      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("'unsafe-eval'");
      expect(headers["x-powered-by"]).toBeUndefined();
      expect(headers["strict-transport-security"]).toBeUndefined();

      for (const [name, value] of Object.entries(expectedSecurityHeaders)) {
        expect(headers[name]).toBe(value);
      }

      expect(headers["permissions-policy"]).toContain("camera=()");
    }

    expect(responses[1].headers()["x-robots-tag"]).toContain("noindex");
    expect(responses[1].headers()["x-robots-tag"]).toContain("noarchive");
  });
});

test.describe("canonical admin logout redirect", () => {
  test.describe.configure({ mode: "serial" });

  test("uses the configured canonical origin and ignores hostile host headers", async () => {
    await withProductionServer("https://blog.example", async (server) => {
      const response = await fetch(`${server.origin}/admin/logout`, {
        redirect: "manual",
        headers: {
          Host: "attacker.example",
          "X-Forwarded-Host": "forwarded-attacker.example",
          "X-Forwarded-Proto": "http",
        },
      });

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe(
        "https://blog.example/admin/login",
      );
    });
  });

  test("keeps the unconfigured fallback on the internal request origin", async () => {
    await withProductionServer("", async (server) => {
      const response = await fetch(`${server.origin}/admin/logout`, {
        redirect: "manual",
        headers: {
          Host: "attacker.example",
          "X-Forwarded-Host": "forwarded-attacker.example",
          "X-Forwarded-Proto": "https",
        },
      });
      const location = response.headers.get("location");

      expect(response.status).toBe(303);
      expect(location).not.toContain("attacker.example");
      expect(location).not.toContain("forwarded-attacker.example");
      expect(location).toMatch(
        new RegExp(
          `^https?://(?:localhost|127\\.0\\.0\\.1):${server.port}/admin/login$`,
        ),
      );
    });
  });

  test("rejects every invalid configured origin without redirecting or destroying a session", async () => {
    test.setTimeout(120_000);

    const invalidOrigins = [
      { label: "relative", value: "/admin" },
      { label: "malformed", value: "not an absolute URL" },
      {
        label: "credentials",
        value: "https://author:" + "placeholder@blog.example",
      },
      { label: "non-http", value: "ftp://blog.example" },
      { label: "path", value: "https://blog.example/admin" },
      { label: "query", value: "https://blog.example/?mode=admin" },
      { label: "hash", value: "https://blog.example/#admin" },
    ];

    for (const configuredOrigin of invalidOrigins) {
      await withProductionServer(configuredOrigin.value, async (server) => {
        const session = await createAdminSessionFixture();

        try {
          const response = await fetch(`${server.origin}/admin/logout`, {
            method: "POST",
            redirect: "manual",
            headers: {
              Cookie: `admin_session=${session.token}`,
              Origin: server.origin,
            },
          });

          expect(response.status, configuredOrigin.label).toBe(500);
          expect(response.headers.get("location"), configuredOrigin.label).toBeNull();
          expect(await response.text(), configuredOrigin.label).toBe(
            "Internal Server Error",
          );
          expect(
            await adminSessionCount(session.tokenHash),
            `${configuredOrigin.label} must not destroy the session`,
          ).toBe(1);
        } finally {
          await deleteAdminSessionFixture(session.tokenHash);
        }
      });
    }
  });

  test("rejects CSRF before effects and destroys a valid session before the canonical redirect", async () => {
    await withProductionServer("https://blog.example", async (server) => {
      const session = await createAdminSessionFixture();
      const cookie = `admin_session=${session.token}`;

      try {
        const rejected = await fetch(`${server.origin}/admin/logout`, {
          method: "POST",
          redirect: "manual",
          headers: {
            Cookie: cookie,
            Host: "attacker.example",
            Origin: "http://attacker.example",
          },
        });

        expect(rejected.status).toBe(403);
        expect(rejected.headers.get("location")).toBeNull();
        expect(await adminSessionCount(session.tokenHash)).toBe(1);

        const accepted = await fetch(`${server.origin}/admin/logout`, {
          method: "POST",
          redirect: "manual",
          headers: {
            Cookie: cookie,
            Host: "attacker.example",
            Origin: "https://blog.example",
            "X-Forwarded-Host": "forwarded-attacker.example",
            "X-Forwarded-Proto": "http",
          },
        });

        expect(accepted.status).toBe(303);
        expect(accepted.headers.get("location")).toBe(
          "https://blog.example/admin/login",
        );
        expect(accepted.headers.get("set-cookie")).toContain("Max-Age=0");
        expect(await adminSessionCount(session.tokenHash)).toBe(0);
      } finally {
        await deleteAdminSessionFixture(session.tokenHash);
      }
    });
  });

  test("rejects a valid-session mutation when hostile Host and Origin headers match", async () => {
    await withProductionServer("https://blog.example", async (server) => {
      const session = await createAdminSessionFixture();

      try {
        const response = await fetch(
          `${server.origin}/api/admin/posts/delete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `admin_session=${session.token}`,
              Host: "attacker.example",
              Origin: "http://attacker.example",
            },
            body: JSON.stringify({ id: "host-origin-probe" }),
          },
        );

        expect(response.status).toBe(403);
        expect(await adminSessionCount(session.tokenHash)).toBe(1);
      } finally {
        await deleteAdminSessionFixture(session.tokenHash);
      }
    });
  });
});

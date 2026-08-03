import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { chromium } from "playwright";

const host = "127.0.0.1";
const root = fileURLToPath(new URL("../", import.meta.url));
const nextBin = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);

nextEnv.loadEnvConfig(root);

function unusedPort() {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.once("error", reject);
    server.listen(0, host, () => {
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

function captureOutput(child) {
  let output = "";
  const append = (chunk) => {
    output = `${output}${chunk.toString("utf8")}`.slice(-64 * 1024);
  };

  child.stdout?.on("data", append);
  child.stderr?.on("data", append);
  return () => output.trim();
}

async function waitForReady(child, url, output) {
  const deadline = Date.now() + 30_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `next start exited before readiness (code ${child.exitCode}).\n${output()}`,
      );
    }

    try {
      const response = await fetch(url);
      await response.arrayBuffer();

      if (response.status === 200) {
        return;
      }
    } catch {
      // The loopback server is expected to refuse connections while starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Timed out waiting for next start.\n${output()}`);
}

async function stopServer(child) {
  if (child.exitCode !== null) {
    return;
  }

  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);

  if (child.exitCode === null) {
    child.kill("SIGKILL");
    await exited;
  }
}

function assertSecurityHeaders(response, label) {
  const csp = response.headers.get("content-security-policy") ?? "";
  const hsts = response.headers.get("strict-transport-security") ?? "";

  assert.match(csp, /(?:^|;)\s*default-src 'self'(?:;|$)/, `${label} CSP`);
  assert.match(csp, /(?:^|;)\s*script-src 'self' 'unsafe-inline'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*connect-src 'self'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*form-action 'self'(?:\s|;|$)/);
  assert.match(csp, /(?:^|;)\s*object-src 'none'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*base-uri 'self'(?:;|$)/);
  assert.match(csp, /(?:^|;)\s*frame-ancestors 'none'(?:;|$)/);
  assert.ok(!csp.includes("'unsafe-eval'"), `${label} CSP contains unsafe-eval`);
  assert.doesNotMatch(
    csp,
    /(?:localhost|127\.0\.0\.1|\[::1\])/i,
    `${label} CSP contains a loopback host allowance`,
  );
  assert.equal(hsts, "max-age=31536000", `${label} HSTS`);
  assert.ok(!/includeSubDomains|preload/i.test(hsts), `${label} HSTS scope`);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
  assert.equal(response.headers.get("x-powered-by"), null, `${label} power header`);
}

const port = await unusedPort();
const origin = `http://${host}:${port}`;
const child = spawn(
  process.execPath,
  [nextBin, "start", "-H", host, "-p", String(port)],
  {
    cwd: root,
    env: {
      ...process.env,
      NODE_ENV: "production",
      ADMIN_SITE_ORIGIN: origin,
      ENABLE_SKELETON_PROBE: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
const output = captureOutput(child);
let browser;

try {
  await waitForReady(child, `${origin}/admin/login`, output);

  const [
    publicResponse,
    adminResponse,
    protectedAdminResponse,
    protectedPostsResponse,
    probeGet,
    probePost,
  ] =
    await Promise.all([
      fetch(`${origin}/`),
      fetch(`${origin}/admin/login`),
      fetch(`${origin}/admin`, { redirect: "manual" }),
      fetch(`${origin}/admin/posts`, { redirect: "manual" }),
      fetch(`${origin}/api/skeleton-probe`),
      fetch(`${origin}/api/skeleton-probe`, { method: "POST" }),
    ]);

  assert.equal(publicResponse.status, 200, "public homepage status");
  assert.equal(adminResponse.status, 200, "admin login status");
  for (const [label, response] of [
    ["protected admin", protectedAdminResponse],
    ["protected posts", protectedPostsResponse],
  ]) {
    assert.ok(
      [303, 307, 308].includes(response.status),
      `${label} redirect status was ${response.status}`,
    );
    assert.match(response.headers.get("location") ?? "", /\/admin\/login$/);
    assertSecurityHeaders(response, label);

    const body = await response.text();
    assert.doesNotMatch(body, /UnauthorizedAdminError|未登录管理员|草稿队列/);
  }

  assert.equal(probeGet.status, 404, "production skeleton GET status");
  assert.equal(probePost.status, 404, "production skeleton POST status");

  assertSecurityHeaders(publicResponse, "public homepage");
  assertSecurityHeaders(adminResponse, "admin login");
  assertSecurityHeaders(probeGet, "skeleton GET");
  assertSecurityHeaders(probePost, "skeleton POST");

  const robots = adminResponse.headers.get("x-robots-tag") ?? "";
  assert.match(robots, /(?:^|,)\s*noindex(?:,|$)/);
  assert.match(robots, /(?:^|,)\s*noarchive(?:,|$)/);

  await Promise.all([
    publicResponse.arrayBuffer(),
    adminResponse.arrayBuffer(),
    probeGet.arrayBuffer(),
    probePost.arrayBuffer(),
  ]);

  const unauthorizedGuardLogs =
    output().match(/UnauthorizedAdminError/g)?.length ?? 0;

  for (const key of ["ADMIN_EMAIL", "PLAYWRIGHT_ADMIN_PASSWORD"]) {
    assert.ok(process.env[key], `${key} must be set for production browser smoke`);
  }

  browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const policyViolations = [];
  const cspConsoleErrors = [];
  let observedLoginPost = false;
  let observedLogoutPost = false;

  await page.exposeFunction("__recordSecurityPolicyViolation", (detail) => {
    policyViolations.push(detail);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__recordSecurityPolicyViolation({
        blockedURI: event.blockedURI,
        directive: event.effectiveDirective,
      });
    });
  });
  page.on("console", (message) => {
    const value = message.text();

    if (
      /content security policy/i.test(value) ||
      /violates the following security policy/i.test(value)
    ) {
      cspConsoleErrors.push(value);
    }
  });
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;

    if (request.method() === "POST" && path === "/admin/login") {
      observedLoginPost = true;
    }

    if (request.method() === "POST" && path === "/admin/logout") {
      observedLogoutPost = true;
    }
  });

  await page.goto(`${origin}/admin/login`);
  await page.getByLabel("邮箱").fill(process.env.ADMIN_EMAIL);
  await page.getByLabel("密码").fill(process.env.PLAYWRIGHT_ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(`${origin}/admin`),
    page.getByRole("button", { name: "登录管理后台" }).click(),
  ]);
  await Promise.all([
    page.waitForURL(`${origin}/admin/login`),
    page.getByRole("button", { name: "退出登录" }).click(),
  ]);

  assert.equal(page.url(), `${origin}/admin/login`, "logout destination");
  assert.equal(observedLoginPost, true, "production browser login POST");
  assert.equal(observedLogoutPost, true, "production browser logout POST");
  assert.deepEqual(policyViolations, [], "securitypolicyviolation events");
  assert.deepEqual(cspConsoleErrors, [], "CSP console errors");

  await browser.close();
  browser = undefined;

  console.log(
    `Production security smoke passed on ${origin}: public/admin 200, protected redirects non-disclosing, skeleton GET/POST 404, headed login/logout POSTs with zero CSP violations; guarded-query server log entries=${unauthorizedGuardLogs}.`,
  );
} catch (error) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`${message}\n${output()}`.trim());
  process.exitCode = 1;
} finally {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to close production browser: ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    await stopServer(child);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to stop next start: ${message}`);
    process.exitCode = 1;
  }
}

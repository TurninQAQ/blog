import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { rejectCrossOriginAdminRequest } from "./csrf";

const originalAdminSiteOrigin = process.env.ADMIN_SITE_ORIGIN;
const originalNodeEnvironment = process.env.NODE_ENV;

afterEach(() => {
  vi.unstubAllEnvs();

  if (originalNodeEnvironment === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalNodeEnvironment;
  }

  if (originalAdminSiteOrigin === undefined) {
    delete process.env.ADMIN_SITE_ORIGIN;
  } else {
    process.env.ADMIN_SITE_ORIGIN = originalAdminSiteOrigin;
  }
});

function request(
  origin: string,
  host = "attacker.example",
  requestOrigin = "http://127.0.0.1:3000",
  extraHeaders: HeadersInit = {},
) {
  const headers = new Headers(extraHeaders);
  headers.set("Host", host);
  headers.set("Origin", origin);

  return new Request(`${requestOrigin}/api/admin/posts/delete`, {
    method: "POST",
    headers,
  });
}

function requestWithReferer(
  referer: string | null,
  host = "attacker.example",
  requestOrigin = "http://127.0.0.1:3000",
  origin: string | null = null,
) {
  const headers = new Headers({ Host: host });

  if (referer) {
    headers.set("Referer", referer);
  }

  if (origin) {
    headers.set("Origin", origin);
  }

  return new Request(`${requestOrigin}/api/admin/posts/delete`, {
    method: "POST",
    headers,
  });
}

describe("rejectCrossOriginAdminRequest", () => {
  it("accepts only the configured canonical origin", () => {
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(
      rejectCrossOriginAdminRequest(request("https://blog.example")),
    ).toBeNull();
    expect(
      rejectCrossOriginAdminRequest(request("http://attacker.example"))
        ?.status,
    ).toBe(403);
  });

  it("uses only request.url origin when no canonical origin is configured", () => {
    delete process.env.ADMIN_SITE_ORIGIN;

    expect(
      rejectCrossOriginAdminRequest(request("http://127.0.0.1:3000")),
    ).toBeNull();
    expect(
      rejectCrossOriginAdminRequest(request("http://attacker.example"))
        ?.status,
    ).toBe(403);
  });

  it("accepts an exact same-origin Referer when the browser omits Origin", () => {
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "https://blog.example/admin/posts/new?from=editor",
        ),
      ),
    ).toBeNull();
    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer("https://attacker.example/admin/posts/new"),
      )?.status,
    ).toBe(403);
  });

  it("rejects missing or malformed browser source headers", () => {
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(rejectCrossOriginAdminRequest(requestWithReferer(null))?.status).toBe(
      403,
    );
    expect(
      rejectCrossOriginAdminRequest(requestWithReferer("not a URL"))?.status,
    ).toBe(403);
    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "https://author:" + "password@blog.example/admin",
        ),
      )?.status,
    ).toBe(403);
  });

  it("never lets a valid Referer override a conflicting Origin", () => {
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "https://blog.example/admin/posts/new",
          "blog.example",
          "https://blog.example",
          "https://attacker.example",
        ),
      )?.status,
    ).toBe(403);
  });

  it("accepts a loopback Referer during local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "http://127.0.0.1:13000/admin/posts/new",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      ),
    ).toBeNull();
  });

  it("accepts a loopback Host when Next.js exposes its wildcard dev binding", () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.ADMIN_SITE_ORIGIN;

    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "http://127.0.0.1:3000/admin/posts/new",
          "127.0.0.1:3000",
          "http://0.0.0.0:3000",
        ),
      ),
    ).toBeNull();

    vi.stubEnv("NODE_ENV", "production");
    expect(
      rejectCrossOriginAdminRequest(
        requestWithReferer(
          "http://127.0.0.1:3000/admin/posts/new",
          "127.0.0.1:3000",
          "http://0.0.0.0:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it("accepts the exact loopback request origin during local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://127.0.0.1:13000",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      ),
    ).toBeNull();
    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://localhost:4000",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it.each(["production", "test", "staging"])(
    "keeps the configured canonical origin strict in %s",
    (nodeEnvironment) => {
      vi.stubEnv("NODE_ENV", nodeEnvironment);
      process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

      expect(
        rejectCrossOriginAdminRequest(
          request(
            "http://127.0.0.1:13000",
            "127.0.0.1:13000",
            "http://localhost:3000",
          ),
        )?.status,
      ).toBe(403);
    },
  );

  it("fails closed when NODE_ENV is absent", () => {
    delete process.env.NODE_ENV;
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://127.0.0.1:13000",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it("does not relax a public configured origin during development", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://127.0.0.1:13000",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it("uses the actual request protocol for a loopback Host match", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "https://127.0.0.1:13000",
          "127.0.0.1:13000",
          "http://localhost:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it.each([
    ["http://127.0.0.1:13000", "127.0.0.1.evil.example:13000"],
    ["http://localhost.evil.example:13000", "localhost.evil.example:13000"],
    ["http://127.0.0.1:13000", "attacker.example@127.0.0.1:13000"],
  ])("rejects malicious loopback-looking Origin and Host values", (origin, host) => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(origin, host, "http://localhost:3000"),
      )?.status,
    ).toBe(403);
  });

  it("does not trust forwarded headers for the local development exception", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://127.0.0.1:13000",
          "attacker.example",
          "http://localhost:3000",
          {
            Forwarded: "for=127.0.0.1;host=127.0.0.1:13000;proto=http",
            "X-Forwarded-Host": "127.0.0.1:13000",
            "X-Forwarded-Proto": "http",
          },
        ),
      )?.status,
    ).toBe(403);
  });

  it("accepts IPv6 loopback but rejects an IPv4-mapped disguise", () => {
    vi.stubEnv("NODE_ENV", "development");
    process.env.ADMIN_SITE_ORIGIN = "http://localhost:3000";

    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://[::1]:13000",
          "[::1]:13000",
          "http://localhost:3000",
        ),
      ),
    ).toBeNull();
    expect(
      rejectCrossOriginAdminRequest(
        request(
          "http://[::ffff:7f00:1]:13000",
          "[::ffff:7f00:1]:13000",
          "http://localhost:3000",
        ),
      )?.status,
    ).toBe(403);
  });

  it.each([
    "not an absolute URL",
    "/admin",
    "ftp://blog.example",
    "https://author:" + "placeholder@blog.example",
    "https://blog.example/admin",
    "https://blog.example/?mode=admin",
    "https://blog.example/#admin",
  ])("fails closed for invalid configured origin %s", (configuredOrigin) => {
    process.env.ADMIN_SITE_ORIGIN = configuredOrigin;

    expect(
      rejectCrossOriginAdminRequest(request("https://blog.example"))?.status,
    ).toBe(403);
  });

  it("rejects an Origin header containing non-origin components", () => {
    process.env.ADMIN_SITE_ORIGIN = "https://blog.example";

    expect(
      rejectCrossOriginAdminRequest(request("https://blog.example/path"))
        ?.status,
    ).toBe(403);
  });
});

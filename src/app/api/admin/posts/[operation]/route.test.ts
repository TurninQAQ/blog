import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  csrf: vi.fn(),
  runGuarded: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/csrf", () => ({
  rejectCrossOriginAdminRequest: mocks.csrf,
}));
vi.mock("@/lib/auth/admin", () => ({
  UnauthorizedAdminError: class UnauthorizedAdminError extends Error {},
}));
vi.mock("@/lib/admin/post-mutations", () => ({
  adminPostOperations: [
    "create",
    "edit",
    "delete",
    "publish",
    "unpublish",
    "feature",
    "unfeature",
  ],
  runGuardedPostMutation: mocks.runGuarded,
}));

import { UnauthorizedAdminError } from "@/lib/auth/admin";
import { MAX_ADMIN_POST_REQUEST_BYTES, POST } from "./route";

function context(operation = "create") {
  return { params: Promise.resolve({ operation }) };
}

function jsonRequest(body: BodyInit, headers: HeadersInit = {}) {
  return new Request("http://localhost/api/admin/posts/create", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "http://localhost",
      ...headers,
    },
    body,
  });
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.csrf.mockReturnValue(null);
  mocks.runGuarded.mockImplementation(
    async (
      operation: string,
      readInput: () => Promise<unknown>,
    ) => ({ operation, input: await readInput() }),
  );
});

describe("POST /api/admin/posts/[operation]", () => {
  it("parses a bounded JSON body through the lazy authenticated reader", async () => {
    const body = JSON.stringify({ title: "A", bodyMarkdown: "# Body" });
    const response = await POST(
      jsonRequest(body, { "content-length": String(Buffer.byteLength(body)) }),
      context(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      operation: "create",
      input: { title: "A", bodyMarkdown: "# Body" },
    });
  });

  it("does not read the body when the guarded dispatcher rejects auth", async () => {
    mocks.runGuarded.mockRejectedValue(new UnauthorizedAdminError());
    const request = jsonRequest(JSON.stringify({ secret: "untrusted" }));

    const response = await POST(request, context());

    expect(response.status).toBe(401);
    expect(request.bodyUsed).toBe(false);
  });

  it("rejects an oversized declared body before streaming it", async () => {
    const request = jsonRequest("{}", {
      "content-length": String(MAX_ADMIN_POST_REQUEST_BYTES + 1),
    });

    const response = await POST(request, context());

    expect(response.status).toBe(413);
    expect(request.bodyUsed).toBe(false);
  });

  it("rejects an oversized streamed body without trusting Content-Length", async () => {
    const request = jsonRequest(
      new Uint8Array(MAX_ADMIN_POST_REQUEST_BYTES + 1).fill(0x20),
    );

    const response = await POST(request, context());

    expect(response.status).toBe(413);
  });

  it("rejects non-JSON and encoded request bodies", async () => {
    const wrongType = await POST(
      new Request("http://localhost/api/admin/posts/create", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: "{}",
      }),
      context(),
    );
    const encoded = await POST(
      jsonRequest("{}", { "content-encoding": "gzip" }),
      context(),
    );

    expect(wrongType.status).toBe(415);
    expect(encoded.status).toBe(415);
  });

  it("returns 404 for unknown operations without reading a body", async () => {
    const request = jsonRequest("{}");
    const response = await POST(request, context("reindex"));

    expect(response.status).toBe(404);
    expect(request.bodyUsed).toBe(false);
    expect(mocks.runGuarded).not.toHaveBeenCalled();
  });
});

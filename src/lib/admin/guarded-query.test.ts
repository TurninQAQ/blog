import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getAdminSession: vi.fn() }));

import { UnauthorizedAdminError } from "@/lib/auth/admin";
import { runGuardedQuery } from "./guarded-query";

describe("runGuardedQuery", () => {
  it("propagates the same authorization error without invoking the lazy read", async () => {
    const unauthorized = new UnauthorizedAdminError();
    const authorize = vi.fn().mockRejectedValue(unauthorized);
    const read = vi.fn().mockResolvedValue({ privateDraft: true });

    await expect(runGuardedQuery(authorize, read)).rejects.toBe(unauthorized);
    expect(authorize).toHaveBeenCalledOnce();
    expect(read).not.toHaveBeenCalled();
  });

  it("runs the lazy read only after authorization succeeds", async () => {
    const events: string[] = [];
    const authorize = vi.fn(async () => {
      events.push("authorize");
    });
    const read = vi.fn(async () => {
      events.push("read");
      return "private content";
    });

    await expect(runGuardedQuery(authorize, read)).resolves.toBe(
      "private content",
    );
    expect(events).toEqual(["authorize", "read"]);
  });
});

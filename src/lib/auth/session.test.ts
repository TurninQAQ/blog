import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  cookieSet: vi.fn(),
  create: vi.fn(),
  deleteMany: vi.fn(),
  findUnique: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: mocks.cookieGet,
    set: mocks.cookieSet,
  })),
}));
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    adminSession: {
      create: mocks.create,
      deleteMany: mocks.deleteMany,
      findUnique: mocks.findUnique,
      updateMany: mocks.updateMany,
    },
  },
}));
vi.mock("@/lib/auth/env", () => ({
  getAuthEnv: () => ({
    ADMIN_EMAIL: "admin@example.com",
    ADMIN_SESSION_SECRET: "s".repeat(32),
  }),
}));

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_IDLE_TIMEOUT_SECONDS,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
  getAdminSession,
} from "./session";

const now = new Date("2026-07-12T08:00:00.000Z");

function sessionRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    tokenHash: "hash",
    adminUserId: "admin-1",
    expiresAt: new Date(
      now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
    ),
    createdAt: new Date(now.getTime() - 60_000),
    lastSeenAt: new Date(now.getTime() - 60_000),
    adminUser: {
      id: "admin-1",
      email: "admin@example.com",
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.resetAllMocks();
  mocks.cookieGet.mockReturnValue({ value: "raw-session-token" });
  mocks.deleteMany.mockResolvedValue({ count: 1 });
  mocks.updateMany.mockResolvedValue({ count: 1 });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getAdminSession", () => {
  it("refreshes lastSeenAt only while absolute and idle boundaries are valid", async () => {
    mocks.findUnique.mockResolvedValue(sessionRecord());

    await expect(getAdminSession()).resolves.toMatchObject({
      id: "session-1",
      adminUserId: "admin-1",
      email: "admin@example.com",
    });

    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.any(String),
        expiresAt: { gt: now },
        createdAt: {
          gt: new Date(
            now.getTime() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
          ),
        },
        lastSeenAt: {
          gt: new Date(
            now.getTime() - ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000,
          ),
        },
      },
      data: { lastSeenAt: now },
    });
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes and rejects a session beyond the idle timeout", async () => {
    mocks.findUnique.mockResolvedValue(
      sessionRecord({
        lastSeenAt: new Date(
          now.getTime() - ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000,
        ),
      }),
    );

    await expect(getAdminSession()).resolves.toBeNull();
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.any(String),
        OR: [
          { expiresAt: { lte: now } },
          {
            createdAt: {
              lte: new Date(
                now.getTime() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
              ),
            },
          },
          {
            lastSeenAt: {
              lte: new Date(
                now.getTime() -
                  ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000,
              ),
            },
          },
        ],
      },
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("deletes and rejects legacy sessions older than the absolute lifetime", async () => {
    mocks.findUnique.mockResolvedValue(
      sessionRecord({
        createdAt: new Date(
          now.getTime() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
        ),
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      }),
    );

    await expect(getAdminSession()).resolves.toBeNull();
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tokenHash: expect.any(String),
        OR: expect.arrayContaining([
          {
            createdAt: {
              lte: new Date(
                now.getTime() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
              ),
            },
          },
        ]),
      }),
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it("does not delete a session refreshed after an expired snapshot was read", async () => {
    const expiredLastSeenAt = new Date(
      now.getTime() - ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000,
    );
    let storedLastSeenAt = expiredLastSeenAt;
    let deleted = false;

    mocks.findUnique.mockResolvedValue(
      sessionRecord({ lastSeenAt: expiredLastSeenAt }),
    );
    mocks.deleteMany.mockImplementation(async ({ where }) => {
      storedLastSeenAt = now;
      const idleCondition = where.OR.find(
        (condition: Record<string, unknown>) => "lastSeenAt" in condition,
      ) as { lastSeenAt: { lte: Date } };

      if (storedLastSeenAt <= idleCondition.lastSeenAt.lte) {
        deleted = true;
      }

      return { count: deleted ? 1 : 0 };
    });

    await expect(getAdminSession()).resolves.toBeNull();
    expect(storedLastSeenAt).toEqual(now);
    expect(deleted).toBe(false);
  });

  it("conditions allowlist cleanup on the user still being unauthorized", async () => {
    mocks.findUnique.mockResolvedValue(
      sessionRecord({
        adminUser: {
          id: "admin-1",
          email: "former-admin@example.com",
        },
      }),
    );

    await expect(getAdminSession()).resolves.toBeNull();
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: {
        tokenHash: expect.any(String),
        adminUser: {
          email: { not: "admin@example.com" },
        },
      },
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });
});

describe("createAdminSession", () => {
  it("sets a seven-day HttpOnly same-site cookie", async () => {
    mocks.create.mockImplementation(async ({ data }) =>
      sessionRecord({
        tokenHash: data.tokenHash,
        adminUserId: data.adminUserId,
        expiresAt: data.expiresAt,
        createdAt: now,
        lastSeenAt: now,
      }),
    );

    await createAdminSession("admin-1");

    expect(mocks.cookieSet).toHaveBeenCalledWith(
      ADMIN_SESSION_COOKIE,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        expires: new Date(
          now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
        ),
      }),
    );
  });
});

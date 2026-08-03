import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db/prisma";
import { getAuthEnv } from "@/lib/auth/env";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const ADMIN_SESSION_IDLE_TIMEOUT_SECONDS = 60 * 60 * 2;

export type AdminSession = {
  id: string;
  adminUserId: string;
  email: string;
  expiresAt: Date;
};

function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

function hashSessionToken(token: string) {
  const { ADMIN_SESSION_SECRET } = getAuthEnv();

  return createHmac("sha256", ADMIN_SESSION_SECRET)
    .update(token)
    .digest("hex");
}

function getSessionExpiresAt(now = new Date()) {
  return new Date(now.getTime() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000);
}

function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  };
}

function getExpiredCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  };
}

async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, "", getExpiredCookieOptions());
}

function toAdminSession(session: {
  id: string;
  adminUserId: string;
  expiresAt: Date;
  adminUser: { email: string };
}): AdminSession {
  return {
    id: session.id,
    adminUserId: session.adminUserId,
    email: session.adminUser.email,
    expiresAt: session.expiresAt,
  };
}

export async function createAdminSession(adminUserId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiresAt();

  const session = await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId,
      expiresAt,
    },
    include: {
      adminUser: true,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    token,
    getSessionCookieOptions(expiresAt),
  );

  return toAdminSession(session);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      adminUser: true,
    },
  });

  if (!session) {
    return null;
  }

  const now = new Date();
  const absoluteCutoff = new Date(
    now.getTime() - ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  );
  const idleCutoff = new Date(
    now.getTime() - ADMIN_SESSION_IDLE_TIMEOUT_SECONDS * 1000,
  );
  const invalidSessionTimeConditions = [
    { expiresAt: { lte: now } },
    { createdAt: { lte: absoluteCutoff } },
    { lastSeenAt: { lte: idleCutoff } },
  ];

  if (
    session.expiresAt <= now ||
    session.createdAt <= absoluteCutoff ||
    session.lastSeenAt <= idleCutoff
  ) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash,
        OR: invalidSessionTimeConditions,
      },
    });
    return null;
  }

  const { ADMIN_EMAIL } = getAuthEnv();
  if (session.adminUser.email !== ADMIN_EMAIL) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash,
        adminUser: {
          email: { not: ADMIN_EMAIL },
        },
      },
    });
    return null;
  }

  const updatedSession = await prisma.adminSession.updateMany({
    where: {
      tokenHash,
      expiresAt: {
        gt: now,
      },
      createdAt: {
        gt: absoluteCutoff,
      },
      lastSeenAt: {
        gt: idleCutoff,
      },
    },
    data: {
      lastSeenAt: now,
    },
  });

  if (updatedSession.count === 0) {
    return null;
  }

  return toAdminSession(session);
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }

  await clearAdminSessionCookie();
}

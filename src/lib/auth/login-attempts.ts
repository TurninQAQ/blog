import "server-only";

import { prisma } from "@/lib/db/prisma";

const MAX_FAILED_ADMIN_LOGIN_ATTEMPTS = 5;
const ADMIN_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_ATTEMPT_IDENTIFIER = "admin-login";

type AdminLoginAttemptReservation = {
  allowed: boolean;
};

function normalizeAttemptEmail(email: string) {
  return email.trim().toLowerCase();
}

function loginWindowStart(now: Date) {
  return new Date(now.getTime() - ADMIN_LOGIN_WINDOW_MS);
}

export function getAdminLoginAttemptIdentifier() {
  return ADMIN_LOGIN_ATTEMPT_IDENTIFIER;
}

export async function reserveAdminLoginAttempt(
  identifier: string,
  email: string,
  now = new Date(),
): Promise<AdminLoginAttemptReservation> {
  const normalizedEmail = normalizeAttemptEmail(email);
  const windowStart = loginWindowStart(now);
  const lockUntil = new Date(now.getTime() + ADMIN_LOGIN_WINDOW_MS);

  return prisma.$transaction(async (tx) => {
    const lockedAttempt = await tx.adminLoginAttempt.findFirst({
      where: {
        email: normalizedEmail,
        lockedUntil: {
          gt: now,
        },
      },
    });

    if (lockedAttempt) {
      return { allowed: false };
    }

    await tx.adminLoginAttempt.updateMany({
      where: {
        identifier,
        email: normalizedEmail,
        lastAttemptAt: {
          lte: windowStart,
        },
      },
      data: {
        attempts: 0,
        lockedUntil: null,
        firstAttemptAt: now,
      },
    });

    const attempt = await tx.adminLoginAttempt.upsert({
      where: {
        identifier_email: {
          identifier,
          email: normalizedEmail,
        },
      },
      create: {
        identifier,
        email: normalizedEmail,
        attempts: 1,
        firstAttemptAt: now,
      },
      update: {
        attempts: {
          increment: 1,
        },
      },
      select: {
        attempts: true,
      },
    });

    if (attempt && attempt.attempts >= MAX_FAILED_ADMIN_LOGIN_ATTEMPTS) {
      await tx.adminLoginAttempt.update({
        where: {
          identifier_email: {
            identifier,
            email: normalizedEmail,
          },
        },
        data: {
          lockedUntil: lockUntil,
        },
      });
    }

    return { allowed: attempt.attempts <= MAX_FAILED_ADMIN_LOGIN_ATTEMPTS };
  });
}

export async function clearAdminLoginFailures(email: string) {
  await prisma.adminLoginAttempt.deleteMany({
    where: {
      email: normalizeAttemptEmail(email),
    },
  });
}

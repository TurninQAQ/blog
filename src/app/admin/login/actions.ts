"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { getAuthEnv } from "@/lib/auth/env";
import {
  clearAdminLoginFailures,
  getAdminLoginAttemptIdentifier,
  reserveAdminLoginAttempt,
} from "@/lib/auth/login-attempts";
import { verifyAdminPassword } from "@/lib/auth/password";
import { createAdminSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

const ADMIN_LOGIN_ERROR = "登录失败。请确认管理员邮箱和密码后重试。";

type AdminLoginState = {
  error: string | null;
};

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(512),
});

function loginFailure(): AdminLoginState {
  return { error: ADMIN_LOGIN_ERROR };
}

export async function loginAdmin(
  _previousState: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return loginFailure();
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH } = getAuthEnv();
  const attemptIdentifier = getAdminLoginAttemptIdentifier();
  const attemptReservation = await reserveAdminLoginAttempt(
    attemptIdentifier,
    ADMIN_EMAIL,
  );

  if (!attemptReservation.allowed) {
    return loginFailure();
  }

  const emailMatches = parsed.data.email === ADMIN_EMAIL;
  const passwordMatches = await verifyAdminPassword(
    ADMIN_PASSWORD_HASH,
    parsed.data.password,
  );

  if (!emailMatches || !passwordMatches) {
    return loginFailure();
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (!adminUser) {
    return loginFailure();
  }

  await clearAdminLoginFailures(ADMIN_EMAIL);
  await createAdminSession(adminUser.id);
  redirect("/admin");
}

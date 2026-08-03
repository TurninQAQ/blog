import "server-only";

import { redirect } from "next/navigation";

import {
  getAdminSession as readAdminSession,
  type AdminSession,
} from "@/lib/auth/session";

export class UnauthorizedAdminError extends Error {
  constructor() {
    super("未登录管理员，请先登录后重试。");
    this.name = "UnauthorizedAdminError";
  }
}

export async function getAdminSession() {
  return readAdminSession();
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new UnauthorizedAdminError();
  }

  return session;
}

export async function requireAdminPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

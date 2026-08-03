import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdminPage } from "@/lib/auth/admin";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await requireAdminPage();

  return <AdminShell sessionEmail={session.email}>{children}</AdminShell>;
}

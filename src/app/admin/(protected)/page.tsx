import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdminDashboardData } from "@/lib/admin/post-queries";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}

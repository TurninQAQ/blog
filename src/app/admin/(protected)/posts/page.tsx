import { AdminPostList } from "@/components/admin/AdminPostList";
import { getAdminPostList } from "@/lib/admin/post-queries";

export default async function AdminPostsPage() {
  const posts = await getAdminPostList();

  return <AdminPostList posts={posts} />;
}

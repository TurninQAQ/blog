import { PostEditorShell } from "@/components/admin/PostEditorShell";
import { getAdminPostEditorData } from "@/lib/admin/post-queries";

export default async function NewAdminPostPage() {
  const { categories, tags, series } = await getAdminPostEditorData();

  return (
    <PostEditorShell
      mode="create"
      categories={categories}
      tags={tags}
      series={series}
    />
  );
}

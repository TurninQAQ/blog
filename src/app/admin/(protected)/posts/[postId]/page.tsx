import { notFound } from "next/navigation";

import { PostEditorShell } from "@/components/admin/PostEditorShell";
import { getAdminPostEditorData } from "@/lib/admin/post-queries";

type EditAdminPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function EditAdminPostPage({
  params,
}: EditAdminPostPageProps) {
  const { postId } = await params;
  const { post, categories, tags, series } =
    await getAdminPostEditorData(postId);

  if (!post) {
    notFound();
  }

  return (
    <PostEditorShell
      mode="edit"
      post={post}
      categories={categories}
      tags={tags}
      series={series}
    />
  );
}

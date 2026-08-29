import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePost } from "@/lib/actions/posts";
import PostForm from "@/components/PostForm";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/posts/${id}`);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <h1 className="text-xl font-bold mb-6">글 수정</h1>
      <PostForm
        action={updatePost.bind(null, id)}
        defaultTitle={post.title}
        defaultContent={post.content}
        defaultThumbnail={post.thumbnail_url ?? ""}
        submitLabel="수정 완료"
      />
    </div>
  );
}

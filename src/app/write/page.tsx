import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPost } from "@/lib/actions/posts";
import PostForm from "@/components/PostForm";

export default async function WritePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <h1 className="text-xl font-bold mb-6">새 글 작성</h1>
      <PostForm action={createPost} submitLabel="출간하기" />
    </div>
  );
}

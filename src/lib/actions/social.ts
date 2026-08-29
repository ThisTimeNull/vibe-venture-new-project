"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 좋아요 토글
export async function toggleLike(postId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath(path);
}

// 댓글 작성
export async function addComment(postId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return;

  await supabase.from("comments").insert({
    post_id: postId,
    author_id: user.id,
    content,
  });

  revalidatePath(`/posts/${postId}`);
}

// 댓글 삭제
export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", user.id);

  revalidatePath(`/posts/${postId}`);
}

// 팔로우 토글
export async function toggleFollow(targetUserId: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.id === targetUserId) return;

  const { data: existing } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase.from("follows").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetUserId });
  }

  revalidatePath(path);
}

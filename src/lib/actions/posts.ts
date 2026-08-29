"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string } | void;

// 새 글 작성
export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();

  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해주세요." };
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      content,
      thumbnail_url: thumbnailUrl || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "글 작성에 실패했습니다." };
  }

  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

// 글 수정
export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();

  if (!title || !content) {
    return { error: "제목과 내용을 모두 입력해주세요." };
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      content,
      thumbnail_url: thumbnailUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}

// 글 삭제
export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);

  revalidatePath("/");
  revalidatePath("/mypage");
  redirect("/mypage");
}

// 조회수 이벤트 기록 (trend 계산의 기반 데이터)
export async function recordView(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("post_views").insert({
    post_id: postId,
    viewer_id: user?.id ?? null,
  });

  // view_count 원자적 증가 (supabase/schema.sql 의 increment_view_count 함수 사용)
  await supabase.rpc("increment_view_count", { p_post_id: postId });
}

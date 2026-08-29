"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult = { error?: string; message?: string } | void;

// 이메일/비밀번호 로그인
export async function signInWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 모두 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  redirect("/");
}

// 이메일/비밀번호 회원가입
export async function signUpWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !email || !password) {
    return { error: "닉네임, 이메일, 비밀번호를 모두 입력해주세요." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      error: "닉네임은 영문 소문자/숫자/밑줄(_)로 3~20자여야 합니다.",
    };
  }
  if (password.length < 6) {
    return { error: "비밀번호는 6자 이상이어야 합니다." };
  }

  const supabase = await createClient();

  // username 중복 확인
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (existingProfile) {
    return { error: "이미 사용 중인 닉네임입니다." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL ??
        (await headers()).get("origin") ??
        "http://localhost:3000"
      }/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 이메일 확인이 꺼져 있으면 가입과 동시에 세션이 생성됨
  if (data.session) {
    redirect("/");
  }

  return {
    message:
      "가입 확인 메일을 보냈습니다. 메일함에서 인증 링크를 눌러 로그인해주세요.",
  };
}

// 로그아웃
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

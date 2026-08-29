"use client";

import { useState, useTransition } from "react";
import type { AuthActionResult } from "@/lib/actions/auth";

export default function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<AuthActionResult>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) setError(result.error);
      if (result?.message) setMessage(result.message);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {mode === "signup" && (
        <input
          name="username"
          placeholder="닉네임 (영문 소문자/숫자/_, 3~20자)"
          required
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
        />
      )}
      <input
        name="email"
        type="email"
        placeholder="이메일"
        required
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
      />
      <input
        name="password"
        type="password"
        placeholder="비밀번호 (6자 이상)"
        required
        minLength={6}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-black text-white px-4 py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending
          ? "처리 중..."
          : mode === "login"
            ? "로그인"
            : "회원가입"}
      </button>
    </form>
  );
}

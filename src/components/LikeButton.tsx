"use client";

import { useTransition } from "react";
import { toggleLike } from "@/lib/actions/social";

export default function LikeButton({
  postId,
  path,
  likeCount,
  likedByMe,
  isLoggedIn,
}: {
  postId: string;
  path: string;
  likeCount: number;
  likedByMe: boolean;
  isLoggedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => startTransition(() => toggleLike(postId, path))}
    >
      <button
        type="submit"
        disabled={isPending}
        title={isLoggedIn ? undefined : "로그인이 필요합니다"}
        className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          likedByMe
            ? "border-red-400 bg-red-50 text-red-500"
            : "border-gray-300 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <span>{likedByMe ? "❤️" : "🤍"}</span>
        <span>{likeCount}</span>
      </button>
    </form>
  );
}

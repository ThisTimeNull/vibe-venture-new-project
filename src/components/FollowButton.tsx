"use client";

import { useTransition } from "react";
import { toggleFollow } from "@/lib/actions/social";

export default function FollowButton({
  targetUserId,
  path,
  isFollowing,
}: {
  targetUserId: string;
  path: string;
  isFollowing: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form action={() => startTransition(() => toggleFollow(targetUserId, path))}>
      <button
        type="submit"
        disabled={isPending}
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          isFollowing
            ? "border border-gray-300 text-gray-600 hover:bg-gray-50"
            : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isFollowing ? "팔로잉" : "팔로우"}
      </button>
    </form>
  );
}

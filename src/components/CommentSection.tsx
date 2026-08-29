"use client";

import { useRef, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { addComment, deleteComment } from "@/lib/actions/social";

type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: { username: string; display_name: string | null } | null;
};

export default function CommentSection({
  postId,
  comments,
  currentUserId,
  isLoggedIn,
}: {
  postId: string;
  comments: CommentItem[];
  currentUserId?: string;
  isLoggedIn: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold mb-4">댓글 {comments.length}개</h2>

      {isLoggedIn ? (
        <form
          ref={formRef}
          action={(formData) =>
            startTransition(async () => {
              await addComment(postId, formData);
              formRef.current?.reset();
            })
          }
          className="mb-6 flex flex-col gap-2"
        >
          <textarea
            name="content"
            required
            placeholder="댓글을 남겨보세요"
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-black"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-black text-white px-4 py-1.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              등록
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-gray-400">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {comments.map((comment) => (
          <li key={comment.id} className="border-b border-gray-100 pb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {comment.profiles?.display_name ?? comment.profiles?.username}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ko,
                  })}
                </span>
                {currentUserId === comment.author_id && (
                  <form
                    action={() =>
                      startTransition(() => deleteComment(comment.id, postId))
                    }
                  >
                    <button type="submit" className="hover:text-red-500">
                      삭제
                    </button>
                  </form>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import type { PostWithAuthor } from "@/lib/supabase/types";

function excerpt(markdown: string, length = 120) {
  const plain = markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[#>*`_~-]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  return plain.length > length ? `${plain.slice(0, length)}…` : plain;
}

export default function PostCard({ post }: { post: PostWithAuthor }) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
    >
      <h2 className="text-lg font-bold mb-1.5 line-clamp-1">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {excerpt(post.content)}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600">
            {post.profiles?.display_name ?? post.profiles?.username}
          </span>
          <span>·</span>
          <span>
            {formatDistanceToNow(new Date(post.created_at), {
              addSuffix: true,
              locale: ko,
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>👁 {post.view_count}</span>
          <span>❤️ {post.like_count}</span>
          <span>💬 {post.comment_count}</span>
        </div>
      </div>
    </Link>
  );
}

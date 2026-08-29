import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { createClient } from "@/lib/supabase/server";
import { recordView, deletePost } from "@/lib/actions/posts";
import MarkdownContent from "@/components/MarkdownContent";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles:author_id(id, username, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  // 조회수 기록 (본인 글 조회는 카운트하지 않음)
  if (!user || user.id !== post.author_id) {
    await recordView(id);
  }

  const [{ data: comments }, { data: myLike }, { data: myFollow }] =
    await Promise.all([
      supabase
        .from("comments")
        .select("id, content, created_at, author_id, profiles:author_id(username, display_name)")
        .eq("post_id", id)
        .order("created_at", { ascending: true }),
      user
        ? supabase
            .from("likes")
            .select("id")
            .eq("post_id", id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", post.author_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const isAuthor = user?.id === post.author_id;
  const path = `/posts/${id}`;

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href={`/users/${post.profiles.username}`}
            className="flex items-center gap-2"
          >
            {post.profiles.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.profiles.avatar_url}
                alt={post.profiles.username}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                {post.profiles.username[0]?.toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm font-medium">
                {post.profiles.display_name ?? post.profiles.username}
              </p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: ko,
                })}
              </p>
            </div>
          </Link>
          {!isAuthor && (
            <FollowButton
              targetUserId={post.author_id}
              path={path}
              isFollowing={!!myFollow}
            />
          )}
        </div>

        {isAuthor && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <Link href={`/posts/${id}/edit`} className="hover:text-black">
              수정
            </Link>
            <form action={deletePost.bind(null, id)}>
              <button type="submit" className="hover:text-red-500">
                삭제
              </button>
            </form>
          </div>
        )}
      </div>

      <MarkdownContent content={post.content} />

      <div className="mt-10 flex items-center justify-between text-sm text-gray-400">
        <div className="flex gap-4">
          <span>👁 조회 {post.view_count}</span>
        </div>
        <LikeButton
          postId={id}
          path={path}
          likeCount={post.like_count}
          likedByMe={!!myLike}
          isLoggedIn={!!user}
        />
      </div>

      <CommentSection
        postId={id}
        comments={(comments ?? []) as never}
        currentUserId={user?.id}
        isLoggedIn={!!user}
      />
    </div>
  );
}

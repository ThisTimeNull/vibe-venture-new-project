import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { recordView, deletePost } from "@/lib/actions/posts";
import MarkdownContent from "@/components/MarkdownContent";
import LikeButton from "@/components/LikeButton";
import FollowButton from "@/components/FollowButton";
import CommentSection from "@/components/CommentSection";
import { getBlogProvider } from "@/lib/mock/provider";
import { withMockScenario } from "@/lib/mock/url";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mockScenario?: string }>;
}) {
  const { id } = await params;
  const { mockScenario: rawScenario } = await searchParams;
  const { provider, isMock, mockScenario } = await getBlogProvider(rawScenario);
  const viewer = await provider.getViewer();
  const post = await provider.getPostById(id);

  if (!post) notFound();

  // 조회수 기록 (본인 글 조회는 카운트하지 않음)
  if (!isMock && (!viewer || viewer.id !== post.author_id)) {
    await recordView(id);
  }

  const [comments, myLike, myFollow] =
    await Promise.all([
      provider.getComments(id),
      viewer ? provider.hasLiked(id, viewer.id) : Promise.resolve(false),
      viewer
        ? provider.isFollowing(viewer.id, post.author_id)
        : Promise.resolve(false),
    ]);

  const isAuthor = viewer?.id === post.author_id;
  const path = withMockScenario(`/posts/${id}`, mockScenario);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href={withMockScenario(`/users/${post.profiles.username}`, mockScenario)}
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
              isFollowing={myFollow}
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
          likedByMe={myLike}
          isLoggedIn={!!viewer}
        />
      </div>

      <CommentSection
        postId={id}
        comments={comments}
        currentUserId={viewer?.id}
        isLoggedIn={!!viewer}
      />
    </div>
  );
}

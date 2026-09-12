import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MOCK_VIEWER_ID } from "@/lib/mock/config";
import { getBlogProvider } from "@/lib/mock/provider";
import { withMockScenario } from "@/lib/mock/url";
import PostCard from "@/components/PostCard";

export const dynamic = "force-dynamic";

export default async function MyPage({
  searchParams,
}: {
  searchParams: Promise<{ mockScenario?: string }>;
}) {
  const { mockScenario: rawScenario } = await searchParams;
  const { provider, isMock, mockScenario } = await getBlogProvider(rawScenario);
  const viewer = await provider.getViewer();
  const ownerId = viewer?.id ?? (isMock ? MOCK_VIEWER_ID : null);
  if (!ownerId) redirect("/login");

  const [profile, myPosts, followCounts] = await Promise.all([
    provider.getProfileById(ownerId),
    provider.getPostsByAuthor(ownerId),
    provider.getFollowCounts(ownerId),
  ]);

  if (!profile) notFound();
  const totalViews = myPosts.reduce((sum, p) => sum + p.view_count, 0);
  const totalLikes = myPosts.reduce((sum, p) => sum + p.like_count, 0);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        {profile?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl">
            {profile?.username?.[0]?.toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-xl font-bold">
            {profile?.display_name ?? profile?.username}
          </h1>
          <p className="text-sm text-gray-400">@{profile?.username}</p>
        </div>
      </div>

      <div className="flex gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
        <span>
          글 <b className="text-black">{myPosts.length}</b>
        </span>
        <span>
          조회 <b className="text-black">{totalViews}</b>
        </span>
        <span>
          좋아요 <b className="text-black">{totalLikes}</b>
        </span>
        <span>
          팔로워 <b className="text-black">{followCounts.followerCount}</b>
        </span>
        <span>
          팔로잉 <b className="text-black">{followCounts.followingCount}</b>
        </span>
      </div>

      <h2 className="text-lg font-bold mb-4">내가 작성한 글</h2>
      {myPosts.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          아직 작성한 글이 없습니다.{" "}
          <Link
            href={withMockScenario("/write", mockScenario)}
            className="underline"
          >
            첫 글을 작성해보세요!
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {myPosts.map((post) => (
            <PostCard key={post.id} post={post} mockScenario={mockScenario} />
          ))}
        </div>
      )}
    </div>
  );
}

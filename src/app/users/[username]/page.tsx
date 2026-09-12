import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import { getBlogProvider } from "@/lib/mock/provider";
import { withMockScenario } from "@/lib/mock/url";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ mockScenario?: string }>;
}) {
  const { username } = await params;
  const { mockScenario: rawScenario } = await searchParams;
  const { provider, mockScenario } = await getBlogProvider(rawScenario);
  const viewer = await provider.getViewer();
  const profile = await provider.getProfileByUsername(username);

  if (!profile) notFound();

  const [posts, followCounts, myFollow] =
    await Promise.all([
      provider.getPostsByAuthor(profile.id, { publishedOnly: true }),
      provider.getFollowCounts(profile.id),
      viewer ? provider.isFollowing(viewer.id, profile.id) : Promise.resolve(false),
    ]);

  const userPosts = posts;
  const isMe = viewer?.id === profile.id;

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <div className="flex items-center gap-4 mb-4">
        {profile.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <span className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl">
            {profile.username[0]?.toUpperCase()}
          </span>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {profile.display_name ?? profile.username}
          </h1>
          <p className="text-sm text-gray-400">@{profile.username}</p>
        </div>
        {!isMe && (
          <FollowButton
            targetUserId={profile.id}
            path={withMockScenario(`/users/${username}`, mockScenario)}
            isFollowing={myFollow}
          />
        )}
      </div>

      {profile.bio && <p className="text-sm text-gray-600 mb-4">{profile.bio}</p>}

      <div className="flex gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
        <span>
          글 <b className="text-black">{userPosts.length}</b>
        </span>
        <span>
          팔로워 <b className="text-black">{followCounts.followerCount}</b>
        </span>
        <span>
          팔로잉 <b className="text-black">{followCounts.followingCount}</b>
        </span>
      </div>

      {userPosts.length === 0 ? (
        <p className="text-center text-gray-400 py-16">작성한 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} mockScenario={mockScenario} />
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";
import type { PostWithAuthor } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  const [{ data: posts }, { count: followerCount }, { count: followingCount }, { data: myFollow }] =
    await Promise.all([
      supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, display_name, avatar_url)")
        .eq("author_id", profile.id)
        .eq("published", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", profile.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", profile.id),
      user
        ? supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const userPosts = (posts ?? []) as unknown as PostWithAuthor[];
  const isMe = user?.id === profile.id;

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
            path={`/users/${username}`}
            isFollowing={!!myFollow}
          />
        )}
      </div>

      {profile.bio && <p className="text-sm text-gray-600 mb-4">{profile.bio}</p>}

      <div className="flex gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
        <span>
          글 <b className="text-black">{userPosts.length}</b>
        </span>
        <span>
          팔로워 <b className="text-black">{followerCount ?? 0}</b>
        </span>
        <span>
          팔로잉 <b className="text-black">{followingCount ?? 0}</b>
        </span>
      </div>

      {userPosts.length === 0 ? (
        <p className="text-center text-gray-400 py-16">작성한 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

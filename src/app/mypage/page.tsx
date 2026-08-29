import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PostCard from "@/components/PostCard";
import type { PostWithAuthor } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: posts }, { count: followerCount }, { count: followingCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, display_name, avatar_url)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", user.id),
    ]);

  const myPosts = (posts ?? []) as unknown as PostWithAuthor[];
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
          팔로워 <b className="text-black">{followerCount ?? 0}</b>
        </span>
        <span>
          팔로잉 <b className="text-black">{followingCount ?? 0}</b>
        </span>
      </div>

      <h2 className="text-lg font-bold mb-4">내가 작성한 글</h2>
      {myPosts.length === 0 ? (
        <p className="text-center text-gray-400 py-16">
          아직 작성한 글이 없습니다.{" "}
          <Link href="/write" className="underline">
            첫 글을 작성해보세요!
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {myPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

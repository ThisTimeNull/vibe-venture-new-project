import { createClient } from "@/lib/supabase/server";
import FeedTabs from "@/components/FeedTabs";
import PostCard from "@/components/PostCard";
import type { PostWithAuthor } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

type Tab = "latest" | "hot" | "trend";

async function getPosts(tab: Tab): Promise<PostWithAuthor[]> {
  const supabase = await createClient();

  if (tab === "trend") {
    // 최근 5일간 조회수가 빠르게 증가한 글 (supabase/schema.sql 의 trending_posts 뷰)
    const { data, error } = await supabase
      .from("trending_posts")
      .select(
        "*, profiles:author_id(id, username, display_name, avatar_url)"
      )
      .order("recent_view_count", { ascending: false })
      .limit(30);

    if (error) {
      console.error(error);
      return [];
    }
    return (data ?? []) as unknown as PostWithAuthor[];
  }

  let query = supabase
    .from("posts")
    .select("*, profiles:author_id(id, username, display_name, avatar_url)")
    .eq("published", true)
    .limit(30);

  if (tab === "hot") {
    // hot: 좋아요 + 조회수 기준 (좋아요에 더 큰 가중치)
    query = query
      .order("like_count", { ascending: false })
      .order("view_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }
  return (data ?? []) as unknown as PostWithAuthor[];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: Tab =
    rawTab === "hot" || rawTab === "trend" ? rawTab : "latest";

  const posts = await getPosts(tab);

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      <FeedTabs active={tab} />
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          아직 작성된 글이 없습니다. 첫 글을 작성해보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

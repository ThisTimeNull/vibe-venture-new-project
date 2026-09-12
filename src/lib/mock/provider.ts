import { createClient } from "@/lib/supabase/server";
import type { PostWithAuthor, Profile } from "@/lib/supabase/types";
import {
  isMockModeEnabled,
  normalizeMockScenario,
  type MockScenario,
} from "@/lib/mock/config";

export type FeedTab = "latest" | "hot" | "trend";

export type CommentWithAuthor = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: { username: string; display_name: string | null } | null;
};

type Viewer = { id: string } | null;

type BlogDataProvider = {
  getViewer: () => Promise<Viewer>;
  getFeedPosts: (tab: FeedTab) => Promise<PostWithAuthor[]>;
  getPostById: (postId: string) => Promise<PostWithAuthor | null>;
  getComments: (postId: string) => Promise<CommentWithAuthor[]>;
  hasLiked: (postId: string, userId: string) => Promise<boolean>;
  isFollowing: (followerId: string, followingId: string) => Promise<boolean>;
  getProfileByUsername: (username: string) => Promise<Profile | null>;
  getProfileById: (id: string) => Promise<Profile | null>;
  getPostsByAuthor: (
    authorId: string,
    options?: { publishedOnly?: boolean }
  ) => Promise<PostWithAuthor[]>;
  getFollowCounts: (
    userId: string
  ) => Promise<{ followerCount: number; followingCount: number }>;
};

type ProviderContext = {
  provider: BlogDataProvider;
  isMock: boolean;
  mockScenario: MockScenario | null;
};

function nowMinusHours(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const MOCK_PROFILES: Profile[] = [
  {
    id: "10000000-0000-0000-0000-000000000001",
    username: "me",
    display_name: "개발자 민수",
    avatar_url: null,
    bio: "개발 중인 블로그 시나리오 계정입니다.",
    created_at: nowMinusHours(240),
  },
  {
    id: "10000000-0000-0000-0000-000000000002",
    username: "alice",
    display_name: "Alice",
    avatar_url: null,
    bio: "프론트엔드와 글쓰기를 좋아합니다.",
    created_at: nowMinusHours(220),
  },
  {
    id: "10000000-0000-0000-0000-000000000003",
    username: "bob",
    display_name: "Bob",
    avatar_url: null,
    bio: "성능 최적화 기록용 계정",
    created_at: nowMinusHours(180),
  },
  {
    id: "10000000-0000-0000-0000-000000000004",
    username: "cindy",
    display_name: "Cindy",
    avatar_url: null,
    bio: "백엔드와 데이터 이야기",
    created_at: nowMinusHours(120),
  },
];

const MOCK_POSTS: PostWithAuthor[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    author_id: MOCK_PROFILES[1].id,
    title: "Next.js App Router 실전 팁 12가지",
    content:
      "대규모 페이지에서도 유지보수 가능한 App Router 패턴을 정리했습니다.\n\n- 서버 컴포넌트 우선\n- 데이터 경계 분리\n- 캐시 무효화 전략",
    thumbnail_url: null,
    view_count: 2140,
    like_count: 182,
    comment_count: 24,
    published: true,
    created_at: nowMinusHours(5),
    updated_at: nowMinusHours(4),
    profiles: MOCK_PROFILES[1],
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    author_id: MOCK_PROFILES[0].id,
    title: "Supabase RLS 처음 설계할 때 체크리스트",
    content:
      "RLS는 정책 이름과 대상 액션을 먼저 그리면 실수를 줄일 수 있습니다.\n\n이 글에서는 posts/comments/follows 기준으로 설명합니다.",
    thumbnail_url: null,
    view_count: 980,
    like_count: 88,
    comment_count: 11,
    published: true,
    created_at: nowMinusHours(28),
    updated_at: nowMinusHours(20),
    profiles: MOCK_PROFILES[0],
  },
  {
    id: "20000000-0000-0000-0000-000000000003",
    author_id: MOCK_PROFILES[2].id,
    title: "웹 성능 개선 사례: TTFB 40% 단축",
    content:
      "이미지 최적화, 서버 캐싱, DB 인덱스를 순서대로 적용해서 TTFB를 줄였습니다.",
    thumbnail_url: null,
    view_count: 3250,
    like_count: 240,
    comment_count: 19,
    published: true,
    created_at: nowMinusHours(70),
    updated_at: nowMinusHours(60),
    profiles: MOCK_PROFILES[2],
  },
  {
    id: "20000000-0000-0000-0000-000000000004",
    author_id: MOCK_PROFILES[3].id,
    title: "트래픽 급증 시 DB 병목 찾는 방법",
    content:
      "Slow query 로그와 connection pool 수치를 같이 보면 병목 지점을 빨리 찾을 수 있습니다.",
    thumbnail_url: null,
    view_count: 4100,
    like_count: 160,
    comment_count: 36,
    published: true,
    created_at: nowMinusHours(10),
    updated_at: nowMinusHours(9),
    profiles: MOCK_PROFILES[3],
  },
  {
    id: "20000000-0000-0000-0000-000000000005",
    author_id: MOCK_PROFILES[0].id,
    title: "개인 블로그 UI 개선 기록",
    content:
      "카드 간격, 줄 간격, 폰트 대비를 수정해 읽기 경험을 개선한 과정을 정리했습니다.",
    thumbnail_url: null,
    view_count: 320,
    like_count: 21,
    comment_count: 2,
    published: true,
    created_at: nowMinusHours(3),
    updated_at: nowMinusHours(2),
    profiles: MOCK_PROFILES[0],
  },
  {
    id: "20000000-0000-0000-0000-000000000006",
    author_id: MOCK_PROFILES[1].id,
    title: "CI 파이프라인에서 캐시 전략 세우기",
    content:
      "캐시 적중률을 올리기 위해 lockfile 기반 키 전략을 적용한 내용입니다.",
    thumbnail_url: null,
    view_count: 740,
    like_count: 55,
    comment_count: 6,
    published: true,
    created_at: nowMinusHours(45),
    updated_at: nowMinusHours(40),
    profiles: MOCK_PROFILES[1],
  },
];

const MOCK_COMMENTS: CommentWithAuthor[] = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    post_id: MOCK_POSTS[0].id,
    author_id: MOCK_PROFILES[0].id,
    content: "실무에서 바로 적용하기 좋네요. 감사합니다!",
    created_at: nowMinusHours(4),
    profiles: {
      username: MOCK_PROFILES[0].username,
      display_name: MOCK_PROFILES[0].display_name,
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    post_id: MOCK_POSTS[0].id,
    author_id: MOCK_PROFILES[2].id,
    content: "데이터 경계 분리 부분이 특히 공감됩니다.",
    created_at: nowMinusHours(3),
    profiles: {
      username: MOCK_PROFILES[2].username,
      display_name: MOCK_PROFILES[2].display_name,
    },
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    post_id: MOCK_POSTS[3].id,
    author_id: MOCK_PROFILES[1].id,
    content: "connection pool 설정값도 궁금해요.",
    created_at: nowMinusHours(8),
    profiles: {
      username: MOCK_PROFILES[1].username,
      display_name: MOCK_PROFILES[1].display_name,
    },
  },
];

const MOCK_FOLLOWS = [
  { follower_id: MOCK_PROFILES[0].id, following_id: MOCK_PROFILES[1].id },
  { follower_id: MOCK_PROFILES[0].id, following_id: MOCK_PROFILES[3].id },
  { follower_id: MOCK_PROFILES[1].id, following_id: MOCK_PROFILES[0].id },
  { follower_id: MOCK_PROFILES[2].id, following_id: MOCK_PROFILES[0].id },
  { follower_id: MOCK_PROFILES[3].id, following_id: MOCK_PROFILES[0].id },
];

const MOCK_LIKES = [
  { user_id: MOCK_PROFILES[0].id, post_id: MOCK_POSTS[0].id },
  { user_id: MOCK_PROFILES[0].id, post_id: MOCK_POSTS[3].id },
  { user_id: MOCK_PROFILES[1].id, post_id: MOCK_POSTS[2].id },
  { user_id: MOCK_PROFILES[2].id, post_id: MOCK_POSTS[0].id },
  { user_id: MOCK_PROFILES[3].id, post_id: MOCK_POSTS[0].id },
];

const MOCK_RECENT_VIEW_COUNT: Record<string, number> = {
  [MOCK_POSTS[0].id]: 94,
  [MOCK_POSTS[1].id]: 20,
  [MOCK_POSTS[2].id]: 35,
  [MOCK_POSTS[3].id]: 180,
  [MOCK_POSTS[4].id]: 64,
  [MOCK_POSTS[5].id]: 27,
};

function sortByLatest(posts: PostWithAuthor[]) {
  return [...posts].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function sortByHot(posts: PostWithAuthor[]) {
  return [...posts].sort((a, b) => {
    if (b.like_count !== a.like_count) return b.like_count - a.like_count;
    return b.view_count - a.view_count;
  });
}

function sortByTrend(posts: PostWithAuthor[]) {
  return [...posts].sort((a, b) => {
    const aRecent = MOCK_RECENT_VIEW_COUNT[a.id] ?? 0;
    const bRecent = MOCK_RECENT_VIEW_COUNT[b.id] ?? 0;
    return bRecent - aRecent;
  });
}

function buildScenarioPosts(scenario: MockScenario) {
  if (scenario === "empty-feed") return [];
  if (scenario === "hot-burst") {
    return sortByHot(
      MOCK_POSTS.map((post) =>
        post.id === MOCK_POSTS[4].id
          ? { ...post, like_count: 520, view_count: 6900, comment_count: 114 }
          : post
      )
    );
  }
  if (scenario === "trend-spike") {
    return sortByTrend(
      MOCK_POSTS.map((post) =>
        post.id === MOCK_POSTS[5].id
          ? { ...post, view_count: post.view_count + 1400 }
          : post
      )
    );
  }
  return [...MOCK_POSTS];
}

function createMockProvider(scenario: MockScenario): BlogDataProvider {
  const scenarioPosts = buildScenarioPosts(scenario);

  return {
    async getViewer() {
      return null;
    },
    async getFeedPosts(tab) {
      if (tab === "hot") return sortByHot(scenarioPosts);
      if (tab === "trend") return sortByTrend(scenarioPosts);
      return sortByLatest(scenarioPosts);
    },
    async getPostById(postId) {
      return scenarioPosts.find((post) => post.id === postId) ?? null;
    },
    async getComments(postId) {
      return MOCK_COMMENTS.filter((comment) => comment.post_id === postId).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    },
    async hasLiked(postId, userId) {
      return MOCK_LIKES.some(
        (like) => like.post_id === postId && like.user_id === userId
      );
    },
    async isFollowing(followerId, followingId) {
      return MOCK_FOLLOWS.some(
        (follow) =>
          follow.follower_id === followerId && follow.following_id === followingId
      );
    },
    async getProfileByUsername(username) {
      return MOCK_PROFILES.find((profile) => profile.username === username) ?? null;
    },
    async getProfileById(id) {
      return MOCK_PROFILES.find((profile) => profile.id === id) ?? null;
    },
    async getPostsByAuthor(authorId, options) {
      const onlyPublished = options?.publishedOnly ?? false;
      return sortByLatest(
        scenarioPosts.filter(
          (post) => post.author_id === authorId && (!onlyPublished || post.published)
        )
      );
    },
    async getFollowCounts(userId) {
      const followerCount = MOCK_FOLLOWS.filter(
        (follow) => follow.following_id === userId
      ).length;
      const followingCount = MOCK_FOLLOWS.filter(
        (follow) => follow.follower_id === userId
      ).length;
      return { followerCount, followingCount };
    },
  };
}

async function createSupabaseProvider(): Promise<BlogDataProvider> {
  const supabase = await createClient();

  return {
    async getViewer() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user ? { id: user.id } : null;
    },
    async getFeedPosts(tab) {
      if (tab === "trend") {
        const { data, error } = await supabase
          .from("trending_posts")
          .select("*, profiles:author_id(id, username, display_name, avatar_url)")
          .order("recent_view_count", { ascending: false })
          .limit(30);

        if (error) return [];
        return (data ?? []) as unknown as PostWithAuthor[];
      }

      let query = supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, display_name, avatar_url)")
        .eq("published", true)
        .limit(30);

      if (tab === "hot") {
        query = query
          .order("like_count", { ascending: false })
          .order("view_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) return [];
      return (data ?? []) as unknown as PostWithAuthor[];
    },
    async getPostById(postId) {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, display_name, avatar_url)")
        .eq("id", postId)
        .single();
      return (data as unknown as PostWithAuthor | null) ?? null;
    },
    async getComments(postId) {
      const { data } = await supabase
        .from("comments")
        .select(
          "id, post_id, author_id, content, created_at, profiles:author_id(username, display_name)"
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      return (data ?? []) as unknown as CommentWithAuthor[];
    },
    async hasLiked(postId, userId) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();
      return !!data;
    },
    async isFollowing(followerId, followingId) {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();
      return !!data;
    },
    async getProfileByUsername(username) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      return (data as Profile | null) ?? null;
    },
    async getProfileById(id) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      return (data as Profile | null) ?? null;
    },
    async getPostsByAuthor(authorId, options) {
      const onlyPublished = options?.publishedOnly ?? false;
      let query = supabase
        .from("posts")
        .select("*, profiles:author_id(id, username, display_name, avatar_url)")
        .eq("author_id", authorId)
        .order("created_at", { ascending: false });

      if (onlyPublished) query = query.eq("published", true);

      const { data } = await query;
      return (data ?? []) as unknown as PostWithAuthor[];
    },
    async getFollowCounts(userId) {
      const [{ count: followerCount }, { count: followingCount }] =
        await Promise.all([
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("following_id", userId),
          supabase
            .from("follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", userId),
        ]);

      return {
        followerCount: followerCount ?? 0,
        followingCount: followingCount ?? 0,
      };
    },
  };
}

export async function getBlogProvider(rawScenario?: string): Promise<ProviderContext> {
  if (!isMockModeEnabled()) {
    return {
      provider: await createSupabaseProvider(),
      isMock: false,
      mockScenario: null,
    };
  }

  const scenario = normalizeMockScenario(rawScenario);
  return {
    provider: createMockProvider(scenario),
    isMock: true,
    mockScenario: scenario,
  };
}

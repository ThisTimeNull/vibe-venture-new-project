import Link from "next/link";
import FeedTabs from "@/components/FeedTabs";
import PostCard from "@/components/PostCard";
import { MOCK_SCENARIO_QUERY_KEY } from "@/lib/mock/config";
import { getBlogProvider, type FeedTab } from "@/lib/mock/provider";
import { withMockScenario } from "@/lib/mock/url";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mockScenario?: string }>;
}) {
  const { tab: rawTab, mockScenario: rawScenario } = await searchParams;
  const tab: FeedTab =
    rawTab === "hot" || rawTab === "trend" ? rawTab : "latest";
  const { provider, isMock, mockScenario } = await getBlogProvider(rawScenario);
  const posts = await provider.getFeedPosts(tab);

  const scenarioLinks = [
    { key: "baseline", label: "기본" },
    { key: "empty-feed", label: "빈 피드" },
    { key: "hot-burst", label: "Hot 폭증" },
    { key: "trend-spike", label: "Trend 급상승" },
  ];

  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-8">
      {isMock && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <p className="mb-2 font-medium">
            개발용 Mock 데이터 모드 (운영 배포에서는 자동 비활성화)
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {scenarioLinks.map((scenario) => (
              <Link
                key={scenario.key}
                href={withMockScenario("/", scenario.key)}
                className={`rounded-full border px-2 py-1 ${
                  mockScenario === scenario.key
                    ? "border-amber-600 bg-amber-100 font-semibold"
                    : "border-amber-300"
                }`}
              >
                {scenario.label}
              </Link>
            ))}
          </div>
          <p className="mt-2">
            현재 시나리오: <b>{mockScenario}</b> (
            <code>{MOCK_SCENARIO_QUERY_KEY}</code> 쿼리로 변경)
          </p>
        </div>
      )}
      <FeedTabs active={tab} mockScenario={mockScenario} />
      {posts.length === 0 ? (
        <p className="text-center text-gray-400 py-20">
          아직 작성된 글이 없습니다. 첫 글을 작성해보세요!
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} mockScenario={mockScenario} />
          ))}
        </div>
      )}
    </div>
  );
}

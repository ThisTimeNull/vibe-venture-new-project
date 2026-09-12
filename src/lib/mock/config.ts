export const MOCK_SCENARIO_QUERY_KEY = "mockScenario";

export const MOCK_VIEWER_ID = "10000000-0000-0000-0000-000000000001";

export type MockScenario =
  | "baseline"
  | "empty-feed"
  | "hot-burst"
  | "trend-spike";

export function isMockModeEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.BLOG_MOCK_MODE !== "off"
  );
}

export function normalizeMockScenario(raw?: string): MockScenario {
  if (raw === "empty-feed") return "empty-feed";
  if (raw === "hot-burst") return "hot-burst";
  if (raw === "trend-spike") return "trend-spike";
  return "baseline";
}

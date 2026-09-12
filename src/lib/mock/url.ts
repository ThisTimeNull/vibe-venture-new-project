import { MOCK_SCENARIO_QUERY_KEY } from "@/lib/mock/config";

export function withMockScenario(path: string, mockScenario?: string | null) {
  if (!mockScenario) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}${MOCK_SCENARIO_QUERY_KEY}=${encodeURIComponent(
    mockScenario
  )}`;
}

import Link from "next/link";
import clsx from "clsx";

const TABS = [
  { key: "latest", label: "최신" },
  { key: "hot", label: "🔥 Hot" },
  { key: "trend", label: "📈 Trend" },
] as const;

export default function FeedTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-1 border-b border-gray-200 mb-6">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={tab.key === "latest" ? "/" : `/?tab=${tab.key}`}
          className={clsx(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            active === tab.key
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-gray-700"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

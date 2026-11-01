import { Link } from "@tanstack/react-router";

const TABS = [
  { key: "overview", label: "Overview", to: "/project/$projectId/", exact: true },
  { key: "gaps", label: "Gaps", to: "/project/$projectId/gaps", count: "gaps" },
  { key: "conflicts", label: "Conflicts", to: "/project/$projectId/conflicts", count: "conflicts" },
  { key: "freshness", label: "Freshness", to: "/project/$projectId/freshness", count: "warnings" },
  { key: "sources", label: "Sources", to: "/project/$projectId/sources", count: "sources" },
  { key: "checklist", label: "Checklist", to: "/project/$projectId/checklist", count: "checklist" },
];

export default function ProjectTabs({ projectId, data }) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {TABS.map((tab) => {
        const count = tab.count ? data[tab.count]?.length : null;
        return (
          <Link
            key={tab.key}
            to={tab.to}
            params={{ projectId }}
            activeOptions={{ exact: Boolean(tab.exact) }}
            className="shrink-0 rounded-full border-2 border-brand-ink/15 bg-white px-3.5 py-1.5 text-[13px] font-bold text-brand-ink/60 transition hover:border-brand-ink/50 hover:text-brand-ink data-[status=active]:border-brand-ink data-[status=active]:!bg-brand-ink data-[status=active]:!text-white"
          >
            {tab.label}
            {typeof count === "number" && count > 0 && (
              <span className="ml-1.5 rounded-full bg-brand-yellow px-1.5 text-[10px] font-extrabold text-brand-ink">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

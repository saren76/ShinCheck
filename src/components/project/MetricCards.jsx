import { Layers, ScanSearch, GitCompare, Clock3, ListChecks, Quote } from "lucide-react";

export default function MetricCards({ project }) {
  const cards = [
    {
      icon: Layers,
      label: "Sources read",
      value: project.source_count ?? 0,
      hint: "links, documents and notes",
      tone: "bg-brand-blue-soft text-brand-blue",
    },
    {
      icon: Quote,
      label: "Claims extracted",
      value: project.claim_count ?? 0,
      hint: "each traced to a source",
      tone: "bg-brand-green-soft text-brand-green",
    },
    {
      icon: ScanSearch,
      label: "Information gaps",
      value: project.gap_count ?? 0,
      hint: "questions still unanswered",
      tone: "bg-brand-yellow/30 text-brand-ink",
    },
    {
      icon: GitCompare,
      label: "Potential conflicts",
      value: project.conflict_count ?? 0,
      hint: "sources that disagree",
      tone: "bg-brand-red/10 text-brand-red",
    },
    {
      icon: Clock3,
      label: "Freshness warnings",
      value: project.freshness_count ?? 0,
      hint: "earlier cycles, missing dates",
      tone: "bg-brand-amber-soft text-brand-amber",
    },
    {
      icon: ListChecks,
      label: "Checklist",
      value: `${project.checklist_done ?? 0}/${project.checklist_total ?? 0}`,
      hint: "tasks verified",
      tone: "bg-brand-cream-deep text-brand-ink",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="pop-card p-4">
          <span className={`grid h-8 w-8 place-items-center rounded-lg border-2 border-brand-ink/15 ${card.tone}`}>
            <card.icon className="h-4 w-4" />
          </span>
          <p className="mt-3 font-display text-2xl font-extrabold leading-none">{card.value}</p>
          <p className="mt-1.5 text-[13px] font-bold leading-tight">{card.label}</p>
          <p className="mt-0.5 text-[11px] leading-tight text-brand-ink/45">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
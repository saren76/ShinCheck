import { useMemo, useState } from "react";
import { ExternalLink, Puzzle, AlertCircle, ArrowRight, HelpCircle } from "lucide-react";
import { PRIORITY_META } from "@/components/project/status";

const FILTERS = [
  { value: "all", label: "All gaps" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function GapsPanel({ data }) {
  const [filter, setFilter] = useState("all");
  const { gaps, sources, project } = data;

  const visible = useMemo(
    () => (filter === "all" ? gaps : gaps.filter((gap) => gap.priority === filter)),
    [filter, gaps]
  );
  const primaryUrl = sources.find((source) => source.url)?.url || "";

  return (
    <div className="space-y-5">
      <div className="pop-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-extrabold">Information gap analysis</h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-ink/65">
              A gap is a question your sources never answer. Priority reflects how much a wrong
              assumption could cost you — not how easy the question is.
            </p>
          </div>
          <span className="pop-chip bg-brand-yellow/60">{gaps.length} open</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition ${
                filter === item.value
                  ? "border-brand-ink bg-brand-ink text-white"
                  : "border-brand-ink/20 bg-white text-brand-ink/60 hover:border-brand-ink/50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <Puzzle className="mx-auto h-8 w-8 text-brand-ink/30" />
          <p className="mt-2 font-display text-lg font-bold">Nothing here at this priority</p>
          <p className="mt-1 text-sm text-brand-ink/55">Switch the filter to see the other gaps.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((gap, index) => (
            <article key={gap.id} className="pop-card pop-card-hover flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl border-2 border-brand-ink bg-brand-cream">
                  <Puzzle className="h-5 w-5 text-brand-red" />
                </span>
                <span className={`rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_META[gap.priority]?.chip}`}>
                  {PRIORITY_META[gap.priority]?.label}
                </span>
              </div>

              <h3 className="mt-3 font-display text-lg font-extrabold leading-snug">
                {gap.title}
              </h3>

              <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed">
                <p className="flex items-start gap-2 text-brand-ink/65">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-amber" />
                  <span>
                    <span className="font-bold text-brand-ink/80">Why it matters · </span>
                    {gap.why_it_matters}
                  </span>
                </p>
                <p className="flex items-start gap-2 rounded-xl bg-brand-cream px-3 py-2 text-brand-ink/75">
                  <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-blue" />
                  <span>
                    <span className="font-bold">Unanswered · </span>
                    {gap.question}
                  </span>
                </p>
                <p className="flex items-start gap-2 text-brand-ink/65">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-green" />
                  <span>
                    <span className="font-bold text-brand-ink/80">Next · </span>
                    {gap.next_step}
                  </span>
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t-2 border-brand-ink/10 pt-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink/35">
                  Gap {String(index + 1).padStart(2, "0")}
                </span>
                {primaryUrl ? (
                  <a
                    href={primaryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-3 py-1.5 text-xs font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
                  >
                    Investigate <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-[11px] font-semibold text-brand-ink/40">
                    Add a source to investigate
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-brand-ink/40">
        Project · {project.title}
      </p>
    </div>
  );
}
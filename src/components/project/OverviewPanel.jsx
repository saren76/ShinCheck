import { Link } from "@tanstack/react-router";
import { ArrowRight, AlertTriangle, GitCompare, Puzzle } from "lucide-react";
import MetricCards from "@/components/project/MetricCards";
import CoverageChart from "@/components/project/CoverageChart";
import { PRIORITY_META, STATUS_META, formatDate, hostLabel } from "@/components/project/status";

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function OverviewPanel({ data }) {
  const { project, claims, gaps, conflicts, warnings, sources, checklist } = data;
  const topGaps = [...gaps].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
  ).slice(0, 3);
  const done = checklist.filter((item) => item.status === "done").length;
  const progress = checklist.length ? Math.round((done / checklist.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <MetricCards project={project} />

      <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
        <div className="space-y-5">
          <section className="pop-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="pop-chip bg-brand-cream">Research summary</span>
              <span className="rounded-full border-2 border-brand-ink/15 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                {project.analysis_engine}
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-ink/75">{project.summary}</p>
            <p className="mt-3 text-xs text-brand-ink/40">
              Goal · {project.query}
            </p>
          </section>

          <section className="pop-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold">What to verify next</h2>
              <Link
                to="/project/$projectId/gaps"
                params={{ projectId: project.id }}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
              >
                All gaps <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {topGaps.length === 0 ? (
              <p className="mt-3 rounded-xl bg-brand-cream px-3 py-3 text-sm text-brand-ink/60">
                No gaps detected. Add more sources to stress-test this conclusion.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {topGaps.map((gap) => (
                  <li key={gap.id} className="rounded-xl border-2 border-brand-ink/10 bg-brand-cream/50 p-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_META[gap.priority]?.chip}`}>
                        {PRIORITY_META[gap.priority]?.label}
                      </span>
                      <span className="font-display text-[15px] font-extrabold leading-tight">{gap.title}</span>
                    </div>
                    <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-snug text-brand-ink/65">
                      <Puzzle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-red" />
                      {gap.question}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pop-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-extrabold">Source disagreement</h2>
              <Link
                to="/project/$projectId/conflicts"
                params={{ projectId: project.id }}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
              >
                Compare all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {conflicts.length === 0 ? (
              <p className="mt-3 rounded-xl bg-brand-cream px-3 py-3 text-sm text-brand-ink/60">
                No two sources contradicted each other in this run.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {conflicts.slice(0, 2).map((conflict) => (
                  <li key={conflict.id} className="rounded-xl border-2 border-brand-red/25 bg-brand-red/5 p-3.5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-red">
                      <GitCompare className="h-3.5 w-3.5" /> {conflict.topic}
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-brand-ink/75">
                      <span className="font-semibold">{conflict.source_a}</span>: “{conflict.claim_a}”
                    </p>
                    <p className="mt-1 text-[13px] leading-snug text-brand-ink/75">
                      <span className="font-semibold">{conflict.source_b}</span>: “{conflict.claim_b}”
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <CoverageChart claims={claims} coverage={project.coverage ?? 0} />

          <section className="pop-card p-5">
            <h3 className="font-display text-lg font-extrabold leading-none">Verification checklist</h3>
            <p className="mt-1 text-xs text-brand-ink/50">
              {done} of {checklist.length} tasks verified
            </p>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full border-2 border-brand-ink bg-white">
              <div
                className="h-full rounded-full bg-brand-green transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Link
              to="/project/$projectId/checklist"
              params={{ projectId: project.id }}
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
            >
              Open checklist <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </section>

          {warnings.length > 0 && (
            <section className="pop-card p-5">
              <h3 className="flex items-center gap-1.5 font-display text-lg font-extrabold leading-none">
                <AlertTriangle className="h-4 w-4 text-brand-amber" /> Freshness
              </h3>
              <ul className="mt-2.5 space-y-2">
                {warnings.slice(0, 3).map((warning) => (
                  <li key={warning.id} className="text-[13px] leading-snug text-brand-ink/70">
                    <span className="font-bold">{warning.source_title || "Source"}</span> · {warning.reason}
                  </li>
                ))}
              </ul>
              <Link
                to="/project/$projectId/freshness"
                params={{ projectId: project.id }}
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
              >
                See warnings <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}

          <section className="pop-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold leading-none">Sources</h3>
              <Link
                to="/project/$projectId/sources"
                params={{ projectId: project.id }}
                className="text-xs font-bold text-brand-red hover:underline"
              >
                All {sources.length}
              </Link>
            </div>
            {sources.length === 0 ? (
              <p className="mt-2 text-sm text-brand-ink/55">No sources were supplied for this run.</p>
            ) : (
              <ul className="mt-2.5 space-y-2">
                {sources.slice(0, 4).map((source) => (
                  <li key={source.id} className="flex items-start gap-2 text-[13px]">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_META[source.status]?.dot || "bg-brand-grey"}`} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{source.title}</span>
                      <span className="block text-[11px] text-brand-ink/40">
                        {hostLabel(source.url) || source.kind}
                        {source.published_date ? ` · ${formatDate(source.published_date)}` : " · undated"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
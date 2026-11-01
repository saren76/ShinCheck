import { AlertTriangle, CalendarClock, ExternalLink, Clock3 } from "lucide-react";
import { formatDate, hostLabel } from "@/components/project/status";

const TONES = {
  high: { card: "border-brand-red/30 bg-brand-red/5", chip: "bg-brand-red text-white" },
  medium: { card: "border-brand-amber/35 bg-brand-amber-soft", chip: "bg-brand-amber text-white" },
  low: { card: "border-brand-ink/15 bg-white", chip: "bg-brand-grey-soft text-brand-ink/70" },
};

export default function FreshnessPanel({ data }) {
  const { warnings } = data;

  return (
    <div className="space-y-5">
      <div className="pop-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-extrabold">Freshness monitoring</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-ink/65">
          An old page is not automatically wrong — but it cannot be trusted for a current cycle. Each
          warning below points at the evidence that raised it. We never guess a publication date.
        </p>
      </div>

      {warnings.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <Clock3 className="mx-auto h-8 w-8 text-brand-ink/30" />
          <p className="mt-2 font-display text-lg font-bold">No freshness warnings</p>
          <p className="mt-1 text-sm text-brand-ink/55">
            Every supplied source carried a usable publication date within the current period.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {warnings.map((warning) => {
            const tone = TONES[warning.severity] || TONES.low;
            return (
              <article key={warning.id} className={`rounded-[1.4rem] border-2 p-5 ${tone.card}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink px-2.5 py-0.5 text-[10px] font-bold uppercase ${tone.chip}`}>
                    <AlertTriangle className="h-3 w-3" />
                    {warning.reason}
                  </span>
                  {warning.severity === "high" && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-red">
                      Check before use
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-display text-lg font-extrabold leading-snug">
                  {warning.source_title || "Unnamed source"}
                </h3>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-brand-ink/45">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {warning.published_date ? formatDate(warning.published_date) : "No publication date found"}
                  {warning.source_url ? ` · ${hostLabel(warning.source_url)}` : ""}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-brand-ink/75">{warning.detail}</p>

                {warning.source_url && (
                  <a
                    href={warning.source_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-3 py-1.5 text-xs font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
                  >
                    Re-check source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
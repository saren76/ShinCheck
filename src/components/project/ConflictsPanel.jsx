import { ExternalLink, GitCompare, Info } from "lucide-react";
import { CONFLICT_TYPE_LABEL, formatDate, hostLabel } from "@/components/project/status";

function ClaimBlock({ claim, source, url, date, excerpt, tone }) {
  return (
    <div className={`rounded-2xl border-2 p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-extrabold">{source || "Unknown source"}</p>
          <p className="text-[11px] text-brand-ink/45">
            {hostLabel(url) || "no link"}
            {date ? ` · ${formatDate(date)}` : " · undated"}
          </p>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-brand-ink bg-white hover:bg-brand-yellow"
            aria-label={`Open ${source}`}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-brand-ink/80">“{claim}”</p>
      {excerpt && excerpt !== claim && (
        <p className="mt-2 border-l-2 border-brand-ink/20 pl-2 text-[11px] italic leading-snug text-brand-ink/45">
          {excerpt}
        </p>
      )}
    </div>
  );
}

export default function ConflictsPanel({ data }) {
  const { conflicts } = data;

  return (
    <div className="space-y-5">
      <div className="pop-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-extrabold">Contradiction analysis</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-ink/65">
          Two sources saying different things is not automatically a contradiction. ShinCheck labels
          what kind of difference it looks like, so you do not waste a day chasing a difference caused
          by dates or regions.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-blue-soft px-3 py-2.5 text-[12px] text-brand-blue">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Only a “genuine contradiction” label means both claims describe the same period and place.
            Everything else still needs a primary source, but the cause is probably timing or scope.
          </span>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <GitCompare className="mx-auto h-8 w-8 text-brand-ink/30" />
          <p className="mt-2 font-display text-lg font-bold">No conflicts found in this run</p>
          <p className="mt-1 text-sm text-brand-ink/55">
            That is not proof of agreement — add a second independent source to test it.
          </p>
        </div>
      ) : (
        conflicts.map((conflict) => (
          <article key={conflict.id} className="pop-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border-2 px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                conflict.conflict_type === "genuine"
                  ? "border-brand-ink bg-brand-red text-white"
                  : "border-brand-ink/25 bg-brand-yellow/50 text-brand-ink"
              }`}>
                {CONFLICT_TYPE_LABEL[conflict.conflict_type] || "Difference"}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink/40">
                {conflict.severity} severity
              </span>
              <h3 className="ml-auto font-display text-base font-extrabold">{conflict.topic}</h3>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <ClaimBlock
                claim={conflict.claim_a}
                source={conflict.source_a}
                url={conflict.url_a}
                date={conflict.date_a}
                excerpt={conflict.excerpt_a}
                tone="border-brand-ink/15 bg-white"
              />
              <ClaimBlock
                claim={conflict.claim_b}
                source={conflict.source_b}
                url={conflict.url_b}
                date={conflict.date_b}
                excerpt={conflict.excerpt_b}
                tone="border-brand-ink/15 bg-white"
              />
            </div>

            <div className="mt-3 rounded-xl border-2 border-brand-red/25 bg-brand-red/5 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-red">
                Why these might conflict
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-brand-ink/75">{conflict.explanation}</p>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
import { ExternalLink, FileText, Globe, Quote } from "lucide-react";
import { STATUS_META, formatDate, hostLabel } from "@/components/project/status";

const KIND_LABEL = {
  link: "Website",
  document: "PDF document",
  text: "Pasted text",
  web: "Web search result",
};

export default function SourcesPanel({ data }) {
  const { sources } = data;

  return (
    <div className="space-y-5">
      <div className="pop-card p-5 sm:p-6">
        <h2 className="font-display text-2xl font-extrabold">Source provenance</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-ink/65">
          Every claim in this workspace points back to one of these sources. Status shows how much the
          source could be relied on in this run.
        </p>
      </div>

      {sources.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <Globe className="mx-auto h-8 w-8 text-brand-ink/30" />
          <p className="mt-2 font-display text-lg font-bold">No sources in this run</p>
          <p className="mt-1 text-sm text-brand-ink/55">
            Start a new research run with links or a PDF to build a source trail.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source) => (
            <article key={source.id} className="pop-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-brand-ink bg-brand-cream">
                  {source.kind === "document" ? (
                    <FileText className="h-5 w-5 text-brand-red" />
                  ) : (
                    <Globe className="h-5 w-5 text-brand-blue" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-[16px] font-extrabold leading-tight">
                    {source.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-brand-ink/45">
                    {KIND_LABEL[source.kind] || "Source"}
                    {source.host ? ` · ${source.host}` : ""}
                    {source.published_date ? ` · ${formatDate(source.published_date)}` : " · undated"}
                    {source.word_count ? ` · ${source.word_count} words read` : ""}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_META[source.status]?.chip || STATUS_META.info.chip}`}>
                  {STATUS_META[source.status]?.label || "Information"}
                </span>
              </div>

              {source.excerpt && (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-brand-cream px-3 py-2 text-[12px] leading-relaxed text-brand-ink/65">
                  <Quote className="mt-0.5 h-3 w-3 shrink-0 text-brand-ink/30" />
                  {source.excerpt}
                </p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-brand-ink/35">
                  {hostLabel(source.url) || "Uploaded locally"}
                </span>
                {source.url && (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-3 py-1.5 text-xs font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
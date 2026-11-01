import { useEffect, useState } from "react";
import { ExternalLink, Loader2, NotebookPen, Save } from "lucide-react";
import { toast } from "sonner";
import { CHECK_STATUS, PRIORITY_META } from "@/components/project/status";

const STATES = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export default function ChecklistItemRow({ item, onUpdate }) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [draft, setDraft] = useState(item.notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(item.notes || "");
  }, [item.notes]);

  const change = async (patch) => {
    setSaving(true);
    try {
      await onUpdate(item.id, patch);
    } catch {
      toast.error("Could not save that change. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const done = item.status === "done";

  return (
    <div className={`pop-card p-4 ${done ? "bg-brand-green-soft/40" : ""}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full border-2 px-2 py-0.5 text-[10px] font-bold uppercase ${PRIORITY_META[item.priority]?.chip}`}>
          {PRIORITY_META[item.priority]?.label}
        </span>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${CHECK_STATUS[item.status]?.chip}`}>
          {CHECK_STATUS[item.status]?.label}
        </span>
        {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-ink/40" />}
      </div>

      <h3 className={`mt-2 font-display text-[16px] font-extrabold leading-snug ${done ? "text-brand-ink/50 line-through" : ""}`}>
        {item.title}
      </h3>
      {item.description && (
        <p className="mt-1 text-[13px] leading-relaxed text-brand-ink/65">{item.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border-2 border-brand-ink/15 bg-brand-cream p-0.5">
          {STATES.map((state) => (
            <button
              key={state.value}
              type="button"
              disabled={saving}
              onClick={() => change({ status: state.value })}
              aria-pressed={item.status === state.value}
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                item.status === state.value ? "bg-brand-ink text-white" : "text-brand-ink/55 hover:text-brand-ink"
              }`}
            >
              {state.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setNotesOpen((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink/20 bg-white px-3 py-1 text-[11px] font-bold text-brand-ink/70 hover:border-brand-ink/50"
        >
          <NotebookPen className="h-3 w-3" />
          {item.notes ? "Edit note" : "Add note"}
        </button>

        {item.recommended_url ? (
          <a
            href={item.recommended_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-white px-3 py-1 text-[11px] font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            {item.recommended_label || "Open source"}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      {notesOpen && (
        <div className="mt-3 rounded-xl border-2 border-brand-ink/10 bg-brand-cream/60 p-2.5">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="What did you find, and where did you find it?"
            className="w-full resize-none rounded-lg border-2 border-brand-ink/15 bg-white px-3 py-2 text-[13px] focus:border-brand-ink/50 focus:outline-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                await change({ notes: draft });
                toast.success("Note saved");
                setNotesOpen(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-brand-yellow px-3 py-1.5 text-[11px] font-bold shadow-pop-sm"
            >
              <Save className="h-3 w-3" /> Save note
            </button>
          </div>
        </div>
      )}

      {item.notes && !notesOpen && (
        <p className="mt-3 border-l-2 border-brand-green/50 pl-2 text-[12px] italic leading-snug text-brand-ink/55">
          {item.notes}
        </p>
      )}
    </div>
  );
}
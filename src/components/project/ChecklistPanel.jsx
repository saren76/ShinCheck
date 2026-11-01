import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListChecks } from "lucide-react";
import { updateChecklistItem } from "@/lib/research-fns";
import ChecklistItemRow from "@/components/project/ChecklistItemRow";

const STATUS_FILTERS = [
  { value: "all", label: "Everything" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const PRIORITY_FILTERS = [
  { value: "all", label: "Any priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function ChecklistPanel({ data }) {
  const save = useServerFn(updateChecklistItem);
  const [items, setItems] = useState(data.checklist);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (statusFilter === "all" || item.status === statusFilter) &&
          (priorityFilter === "all" || item.priority === priorityFilter)
      ),
    [items, statusFilter, priorityFilter]
  );

  const done = items.filter((item) => item.status === "done").length;
  const progress = items.length ? Math.round((done / items.length) * 100) : 0;

  const update = async (id, patch) => {
    const updated = await save({ data: { id, ...patch } });
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: updated.status ?? item.status, notes: updated.notes ?? item.notes }
          : item
      )
    );
  };

  return (
    <div className="space-y-5">
      <div className="pop-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-extrabold">Verification checklist</h2>
            <p className="mt-1 text-sm leading-relaxed text-brand-ink/65">
              Each task comes from a gap, a conflict or a freshness warning. Mark progress, keep notes
              and reopen anything you need to re-check — changes are saved to this project.
            </p>
          </div>
          <div className="w-full max-w-[220px]">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-brand-ink/50">Verified</span>
              <span>
                {done}/{items.length}
              </span>
            </div>
            <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full border-2 border-brand-ink bg-white">
              <div
                className="h-full rounded-full bg-brand-green transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                aria-pressed={statusFilter === filter.value}
                className={`rounded-full border-2 px-3 py-1.5 text-[11px] font-bold transition ${
                  statusFilter === filter.value
                    ? "border-brand-ink bg-brand-ink text-white"
                    : "border-brand-ink/20 bg-white text-brand-ink/60 hover:border-brand-ink/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setPriorityFilter(filter.value)}
                aria-pressed={priorityFilter === filter.value}
                className={`rounded-full border-2 px-3 py-1.5 text-[11px] font-bold transition ${
                  priorityFilter === filter.value
                    ? "border-brand-ink bg-brand-yellow text-brand-ink"
                    : "border-brand-ink/20 bg-white text-brand-ink/60 hover:border-brand-ink/50"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <ListChecks className="mx-auto h-8 w-8 text-brand-ink/30" />
          <p className="mt-2 font-display text-lg font-bold">No tasks in this project</p>
          <p className="mt-1 text-sm text-brand-ink/55">
            Tasks appear automatically when gaps, conflicts or freshness warnings are found.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="pop-card p-8 text-center">
          <p className="font-display text-lg font-bold">Nothing matches these filters</p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="mt-2 rounded-full border-2 border-brand-ink bg-brand-yellow px-3.5 py-1.5 text-xs font-bold shadow-pop-sm"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((item) => (
            <ChecklistItemRow key={item.id} item={item} onUpdate={update} />
          ))}
        </div>
      )}
    </div>
  );
}
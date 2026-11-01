export const STATUS_META = {
  supported: {
    label: "Supported",
    chip: "bg-brand-green-soft text-brand-green border-brand-green/30",
    dot: "bg-brand-green",
  },
  uncertain: {
    label: "Uncertain",
    chip: "bg-brand-amber-soft text-brand-amber border-brand-amber/30",
    dot: "bg-brand-amber",
  },
  conflict: {
    label: "Conflict",
    chip: "bg-brand-red/10 text-brand-red border-brand-red/30",
    dot: "bg-brand-red",
  },
  info: {
    label: "Information",
    chip: "bg-brand-blue-soft text-brand-blue border-brand-blue/30",
    dot: "bg-brand-blue",
  },
  unavailable: {
    label: "Unavailable",
    chip: "bg-brand-grey-soft text-brand-grey border-brand-grey/30",
    dot: "bg-brand-grey",
  },
};

export const PRIORITY_META = {
  high: { label: "High priority", chip: "bg-brand-red text-white border-brand-ink" },
  medium: { label: "Medium", chip: "bg-brand-yellow text-brand-ink border-brand-ink" },
  low: { label: "Low", chip: "bg-white text-brand-ink/60 border-brand-ink/25" },
};

export const CONFLICT_TYPE_LABEL = {
  genuine: "Genuine contradiction",
  date: "Likely a date difference",
  cycle: "Different round or cycle",
  region: "Different region",
  category: "Different category",
};

export const CHECK_STATUS = {
  todo: { label: "To do", chip: "bg-white text-brand-ink/60 border-brand-ink/25" },
  in_progress: { label: "In progress", chip: "bg-brand-blue-soft text-brand-blue border-brand-blue/40" },
  done: { label: "Done", chip: "bg-brand-green-soft text-brand-green border-brand-green/40" },
};

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 40);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function hostLabel(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return String(url).slice(0, 40);
  }
}
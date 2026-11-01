import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Globe2, ScanSearch, GitCompare, Puzzle, ListChecks, FileText } from "lucide-react";

const STEPS = [
  {
    icon: Target,
    title: "Research Goal",
    detail: "You describe what you need to decide. ShinCheck turns it into a question set instead of a single search.",
    tag: "You",
  },
  {
    icon: Globe2,
    title: "Source Collection",
    detail: "Links are fetched, PDFs are read, pasted notes stay attached to their origin. Every source keeps its own record.",
    tag: "Ingest",
  },
  {
    icon: ScanSearch,
    title: "Claim Extraction",
    detail: "Each source is split into checkable statements — the ones with dates, numbers, rules and limits first.",
    tag: "Extract",
  },
  {
    icon: GitCompare,
    title: "Evidence Comparison",
    detail: "Claims about the same thing are compared. Different values become a conflict, not a blended average.",
    tag: "Compare",
  },
  {
    icon: Puzzle,
    title: "Gap Detection",
    detail: "The playbook for your research category is checked against what was actually found. Silence becomes a gap.",
    tag: "Gaps",
  },
  {
    icon: ListChecks,
    title: "Verification Checklist",
    detail: "Gaps, conflicts and freshness warnings become ordered tasks with a suggested place to look.",
    tag: "Plan",
  },
  {
    icon: FileText,
    title: "Final Report",
    detail: "A coverage score, the supported claims and the open questions — one page you can send to someone else.",
    tag: "Report",
  },
];

export default function JourneyShowcase() {
  const [active, setActive] = useState(2);
  const step = STEPS[active];

  return (
    <section id="how-it-works" className="relative overflow-hidden bg-brand-cream-deep/70 py-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <span className="pop-chip bg-white">360° research journey</span>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
              From a question to a report, in seven steps
            </h2>
          </div>
          <p className="max-w-sm text-sm text-brand-ink/60">
            Tap any step to see what happens inside it. Nothing is hidden behind a spinner you cannot
            inspect.
          </p>
        </div>

        <div className="mt-10 hidden items-start justify-between gap-1 lg:flex">
          {STEPS.map((item, index) => {
            const isActive = index === active;
            return (
              <div key={item.title} className="relative flex flex-1 flex-col items-center">
                {index < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute left-1/2 top-7 h-[3px] w-full border-t-[3px] border-dashed border-brand-ink/20"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                  className={`relative z-10 grid h-14 w-14 place-items-center rounded-2xl border-2 border-brand-ink transition-all duration-200 ${
                    isActive
                      ? "-translate-y-1 bg-brand-red text-white shadow-pop"
                      : "bg-white text-brand-ink hover:-translate-y-0.5 hover:bg-brand-yellow/50 hover:shadow-pop-sm"
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                </button>
                <span className="mt-3 text-center text-xs font-bold uppercase tracking-wide text-brand-ink/60">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-3 lg:hidden">
          {STEPS.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActive(index)}
              className={`flex items-center gap-3 rounded-2xl border-2 border-brand-ink px-4 py-3 text-left transition ${
                index === active ? "bg-brand-red text-white shadow-pop-sm" : "bg-white"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 ${
                  index === active ? "border-white/60 bg-white/15" : "border-brand-ink/15 bg-brand-cream"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </span>
              <span className="font-display text-base font-bold">{item.title}</span>
              <span className="ml-auto text-[10px] font-bold uppercase opacity-60">0{index + 1}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="pop-card mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-6"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-brand-ink bg-brand-yellow">
            <step.icon className="h-8 w-8" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border-2 border-brand-ink bg-white px-2 py-0.5 text-[10px] font-bold uppercase">
                Step {active + 1} · {step.tag}
              </span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-extrabold">{step.title}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-ink/70">{step.detail}</p>
          </div>

          <div className="sm:ml-auto sm:w-40">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-ink/45">Progress</div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full border-2 border-brand-ink bg-white">
              <motion.div
                className="h-full rounded-full bg-brand-red"
                initial={false}
                animate={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
            <div className="mt-1 text-xs font-semibold text-brand-ink/50">
              {active + 1} of {STEPS.length} stages
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
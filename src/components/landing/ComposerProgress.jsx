import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

const STEPS = ["Reading your sources", "Extracting claims and comparing evidence", "Saving your workspace"];

export default function ComposerProgress({ stage }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-brand-ink/45 p-5 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-[1.75rem] border-2 border-brand-ink bg-white p-6 shadow-pop-lg"
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-brand-ink bg-brand-yellow">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <div>
            <h2 className="font-display text-xl font-extrabold leading-none">Working on it</h2>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-ink/45">
              Reading, never guessing
            </p>
          </div>
        </div>

        <ul className="mt-6 space-y-3">
          {STEPS.map((label, index) => {
            const done = index < stage;
            const active = index === stage;
            return (
              <li key={label} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-brand-ink text-xs font-bold ${
                    done ? "bg-brand-green text-white" : active ? "bg-brand-yellow" : "bg-white text-brand-ink/30"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : index + 1}
                </span>
                <span className={`text-sm font-semibold ${done || active ? "text-brand-ink" : "text-brand-ink/40"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 rounded-xl bg-brand-cream px-3 py-2 text-xs text-brand-ink/55">
          Long PDFs and slow websites can take a few seconds. Keep this tab open.
        </p>
      </motion.div>
    </div>
  );
}
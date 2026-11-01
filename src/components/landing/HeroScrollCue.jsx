import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroScrollCue() {
  const reduce = useReducedMotion();

  const scrollToComposer = () => {
    document.getElementById("composer")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 hidden justify-center sm:flex">
      <button
        type="button"
        onClick={scrollToComposer}
        className="pointer-events-auto inline-flex flex-col items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-ink/45 transition hover:text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow/60"
      >
        Discover the Investigation
        <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-brand-ink bg-white shadow-pop-sm">
          <motion.span
            animate={reduce ? undefined : { y: [0, 4, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="grid place-items-center"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </motion.span>
        </span>
      </button>
    </div>
  );
}
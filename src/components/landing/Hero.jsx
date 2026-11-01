import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowDown, Sparkles, ShieldCheck, GitCompare, Clock3 } from "lucide-react";
import HeroMascotStage from "@/components/landing/HeroMascotStage";
import HeroScrollCue from "@/components/landing/HeroScrollCue";

const TRUST = [
  { icon: ShieldCheck, label: "Every claim traced to a source" },
  { icon: GitCompare, label: "Conflicts placed side by side" },
  { icon: Clock3, label: "Outdated pages flagged, never guessed" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-72px)] flex-col justify-center overflow-hidden px-5 pb-20 pt-10 sm:px-8 lg:pb-24 lg:pt-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-brand-yellow/40 blur-3xl" />
        <div className="absolute -right-20 top-24 h-96 w-96 rounded-full bg-brand-red/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="dot-grid absolute inset-x-0 bottom-0 h-48 opacity-40 [mask-image:linear-gradient(to_top,#000,transparent)]" />
        <span className="absolute left-[6%] top-[26%] hidden rotate-[-12deg] rounded-xl border-2 border-brand-ink/10 bg-white/70 px-3 py-2 font-display text-xs font-bold text-brand-ink/35 lg:block">
          notice.pdf
        </span>
        <span className="absolute bottom-[22%] left-[42%] hidden rotate-[8deg] rounded-xl border-2 border-brand-ink/10 bg-white/60 px-3 py-2 font-display text-xs font-bold text-brand-ink/30 lg:block">
          source #3
        </span>
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-12">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <span className="pop-chip bg-brand-yellow/70">
            <Sparkles className="h-3.5 w-3.5" />
            AI information gap analysis
          </span>

          <h1 className="mt-5 font-display text-[clamp(2.7rem,7vw,5.2rem)] font-extrabold leading-[0.94] tracking-tight text-brand-ink">
            <span className="block">
              Find the <span className="ink-underline">Facts</span>.
            </span>
            <span className="block">
              Uncover the{" "}
              <span className="relative inline-block text-brand-red">
                Gaps
                <svg
                  className="absolute -bottom-1.5 left-0 z-0 w-full"
                  height="12"
                  viewBox="0 0 220 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M3 8c48-6 108-7 214-3" stroke="#FFCB1F" strokeWidth="8" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              .
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-brand-ink/70">
            Meet your AI research detective. Analyze multiple sources, uncover missing information,
            detect conflicting claims, and discover exactly what you need to verify next.
          </p>
        </div>

        <div className="order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:py-4">
          <HeroMascotStage />
        </div>

        <div className="order-3 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/dashboard"
              className="group inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-brand-ink bg-brand-red px-6 py-4 font-display text-base font-extrabold text-white shadow-pop transition duration-200 hover:-translate-y-0.5 hover:shadow-pop-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow/60 active:translate-y-0"
            >
              <Sparkles className="h-5 w-5 text-brand-yellow" />
              Start Investigating
              <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-brand-ink bg-brand-yellow text-brand-ink transition duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <a
              href="#features"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-ink bg-white px-6 py-4 font-display text-base font-extrabold text-brand-ink shadow-pop-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-yellow/30 hover:shadow-pop focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-blue/40"
            >
              Explore How It Works
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          <ul className="mt-6 flex flex-col gap-2">
            {TRUST.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm font-semibold text-brand-ink/60">
                <span className="grid h-7 w-7 place-items-center rounded-lg border-2 border-brand-ink/15 bg-white">
                  <item.icon className="h-3.5 w-3.5 text-brand-red" />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <HeroScrollCue />
    </section>
  );
}
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, GitCompare, Puzzle, Clock3 } from "lucide-react";

const TILES = [
  {
    icon: ShieldCheck,
    title: "Supported eligibility",
    body: "The official portal states 60% qualifying marks and an annual family income under ₹2,50,000.",
    tone: "border-brand-green/30 bg-brand-green-soft",
    iconTone: "bg-brand-green text-white",
    tag: "Supported",
  },
  {
    icon: GitCompare,
    title: "Conflicting deadline",
    body: "A department notice says 31 October 2026; the college FAQ says 15 November 2026 — same cycle.",
    tone: "border-brand-red/30 bg-brand-red/5",
    iconTone: "bg-brand-red text-white",
    tag: "Conflict",
  },
  {
    icon: Puzzle,
    title: "Missing renewal rules",
    body: "Nothing in the four sources explains what a student must maintain to keep the award in year two.",
    tone: "border-brand-amber/30 bg-brand-amber-soft",
    iconTone: "bg-brand-amber text-white",
    tag: "Gap",
  },
  {
    icon: Clock3,
    title: "Earlier-cycle source",
    body: "The portal page still describes the previous academic cycle, so its amounts need re-checking.",
    tone: "border-brand-amber/30 bg-brand-amber-soft",
    iconTone: "bg-brand-ink text-white",
    tag: "Freshness",
  },
];

export default function SampleShowcase() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
      <div className="pop-card relative overflow-hidden p-0">
        <div className="border-b-2 border-brand-ink/10 bg-brand-yellow/35 px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pop-chip bg-white">Sample demonstration</span>
            <span className="text-xs font-bold uppercase tracking-wide text-brand-ink/50">
              Simulated results — not real analysis
            </span>
          </div>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.7rem,3.4vw,2.6rem)] font-extrabold leading-tight tracking-tight">
            One scholarship, four sources, three things to fix
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-ink/65">
            This is the exact workspace you get after uploading your own sources. Everything here was
            written to demonstrate the product.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          {TILES.map((tile) => (
            <div key={tile.title} className={`rounded-2xl border-2 p-4 ${tile.tone}`}>
              <div className="flex items-center gap-2">
                <span className={`grid h-8 w-8 place-items-center rounded-lg border-2 border-brand-ink ${tile.iconTone}`}>
                  <tile.icon className="h-4 w-4" />
                </span>
                <span className="rounded-full border-2 border-brand-ink/20 bg-white/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                  {tile.tag}
                </span>
              </div>
              <h3 className="mt-2.5 font-display text-lg font-extrabold leading-snug">{tile.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-brand-ink/70">{tile.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t-2 border-brand-ink/10 bg-brand-cream px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-brand-ink/50">
            Sample content only. Your own runs are labelled by the engine that produced them.
          </p>
          <Link
            to="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-brand-ink bg-white px-5 py-2.5 text-sm font-bold shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            Open the full sample workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
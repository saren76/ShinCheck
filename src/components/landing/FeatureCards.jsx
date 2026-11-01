import { Layers, ScanSearch, GitCompare, Clock3, FileCheck2, ListChecks } from "lucide-react";

const FEATURES = [
  {
    icon: Layers,
    title: "Multi-Source Research",
    body: "Drop in links, PDFs or pasted notes. ShinCheck reads each one separately so findings never blur together.",
    tone: "bg-brand-red/10 text-brand-red",
  },
  {
    icon: ScanSearch,
    title: "Information Gap Detection",
    body: "The questions your sources never answer, ranked by how much they could cost you.",
    tone: "bg-brand-blue/10 text-brand-blue",
  },
  {
    icon: GitCompare,
    title: "Contradiction Detection",
    body: "Two pages saying different things is a finding, not noise. We place both claims side by side.",
    tone: "bg-brand-red/10 text-brand-red",
  },
  {
    icon: Clock3,
    title: "Freshness Monitoring",
    body: "Earlier cycles, expired deadlines and undated pages get flagged with the evidence behind the flag.",
    tone: "bg-brand-amber/15 text-brand-amber",
  },
  {
    icon: FileCheck2,
    title: "Evidence-Based Reports",
    body: "Every claim carries its source, date and excerpt. Nothing is asserted without a trail.",
    tone: "bg-brand-green/10 text-brand-green",
  },
  {
    icon: ListChecks,
    title: "Smart Verification Checklists",
    body: "Turn gaps into tasks you can tick off, annotate and come back to tomorrow.",
    tone: "bg-brand-yellow/25 text-brand-ink",
  },
];

export default function FeatureCards() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8">
      <div className="max-w-2xl">
        <span className="pop-chip">What it does</span>
        <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-tight">
          Six checks between you and a wrong answer
        </h2>
        <p className="mt-3 text-brand-ink/65">
          ShinCheck is not a summary machine. It is a sceptical reading partner that tells you what
          the sources do not say.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="pop-card pop-card-hover group flex flex-col p-6"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-2xl border-2 border-brand-ink ${feature.tone}`}>
              <feature.icon className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-display text-xl font-extrabold leading-snug">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-ink/65">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical, MousePointerClick } from "lucide-react";
import { getDemoProject, getProjectWorkspace } from "@/lib/research-fns";
import ProjectTabs from "@/components/project/ProjectTabs";
import OverviewPanel from "@/components/project/OverviewPanel";

export const Route = createFileRoute("/demo")({
  loader: async () => {
    const { projectId } = await getDemoProject();
    const data = await getProjectWorkspace({ data: { projectId } });
    return data;
  },
  head: () => ({
    meta: [
      { title: "Sample analysis — ShinCheck" },
      {
        name: "description",
        content:
          "A simulated ShinCheck workspace: a scholarship research run with a conflicting deadline, a missing renewal rule and an earlier-cycle source.",
      },
    ],
  }),
  component: DemoPage,
});

const HIGHLIGHTS = [
  { title: "Supported eligibility", body: "Two sources agree on the marks and income thresholds." },
  { title: "Conflicting deadline", body: "Two official-looking pages give different closing dates." },
  { title: "Missing renewal rules", body: "No source explains year two — so it becomes a task." },
  { title: "Earlier-cycle source", body: "One page belongs to the previous academic cycle." },
];

function DemoPage() {
  const data = Route.useLoaderData();
  const { project } = data;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="pop-card overflow-hidden">
        <div className="border-b-2 border-brand-ink/10 bg-brand-yellow/45 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="pop-chip bg-white">
              <FlaskConical className="h-3.5 w-3.5" /> Demonstration mode
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide text-brand-ink/50">
              Simulated data · no AI credits used
            </span>
          </div>
          <h1 className="mt-2 font-display text-[clamp(1.6rem,3.4vw,2.4rem)] font-extrabold leading-tight tracking-tight">
            {project.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-brand-ink/70">{project.summary}</p>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} className="rounded-xl border-2 border-brand-ink/10 bg-brand-cream/60 px-3 py-2.5">
              <p className="text-[13px] font-bold leading-tight">{item.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-brand-ink/55">{item.body}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-brand-ink/10 bg-brand-cream px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="flex items-center gap-1.5 text-xs text-brand-ink/55">
            <MousePointerClick className="h-3.5 w-3.5" />
            Every tab works exactly as it does in your own projects — try editing the checklist.
          </p>
          <Link
            to="/"
            hash="composer"
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink bg-brand-red px-4 py-2 text-xs font-bold text-white shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            Run my own research <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <ProjectTabs projectId={project.id} data={data} />
      </div>

      <div className="mt-5">
        <OverviewPanel data={data} />
      </div>
    </div>
  );
}
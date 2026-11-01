import { createFileRoute, Link, notFound, Outlet } from "@tanstack/react-router";
import { ArrowLeft, FlaskConical, Sparkles, Wand2 } from "lucide-react";
import { getProjectWorkspace } from "@/lib/research-fns";
import ProjectTabs from "@/components/project/ProjectTabs";
import { formatDate } from "@/components/project/status";

const CATEGORY_LABELS = {
  scholarship: "Scholarships",
  admissions: "Admissions",
  career: "Careers",
  government: "Government schemes",
  business: "Business",
  general: "General research",
};

export const Route = createFileRoute("/_authed/project/$projectId")({
  loader: async ({ params }) => {
    const data = await getProjectWorkspace({ data: { projectId: params.projectId } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.project?.title || "Research workspace"} — ShinCheck` },
      { name: "description", content: loaderData?.project?.summary?.slice(0, 155) || "ShinCheck research workspace" },
    ],
  }),
  component: ProjectLayout,
});

function ProjectLayout() {
  const data = Route.useLoaderData();
  const { project } = data;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-ink/15 bg-white px-3 py-1.5 text-xs font-bold text-brand-ink/60 transition hover:border-brand-ink/50 hover:text-brand-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> My research
        </Link>
        <span className="rounded-full border-2 border-brand-ink/15 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
          {CATEGORY_LABELS[project.category] || "Research"}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border-2 border-brand-ink/15 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
          {project.analysis_engine === "AI deep analysis" ? (
            <Wand2 className="h-3 w-3 text-brand-red" />
          ) : (
            <Sparkles className="h-3 w-3 text-brand-blue" />
          )}
          {project.analysis_engine}
        </span>
        {project.created_date && (
          <span className="text-[11px] font-semibold text-brand-ink/35">{formatDate(project.created_date)}</span>
        )}
      </div>

      <h1 className="mt-3 max-w-4xl font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-tight tracking-tight">
        {project.title}
      </h1>

      {project.is_demo && (
        <div className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-brand-ink bg-brand-yellow/50 px-4 py-3">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="text-[13px] leading-snug text-brand-ink/75">
            <span className="font-bold">Simulated demonstration.</span> This workspace is sample content
            created to show how ShinCheck works — it is not a real analysis of a real scholarship.
          </p>
        </div>
      )}

      {project.is_guest && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-brand-ink bg-brand-yellow/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-brand-red" />
            <p className="text-[13px] font-semibold text-brand-ink">
              <span className="font-bold">Instant analysis preview.</span> Sign up or log in to save this research permanently to your personal dashboard.
            </p>
          </div>
          <Link
            to="/login"
            search={{ returnTo: `/project/${project.id}` }}
            className="rounded-full border-2 border-brand-ink bg-brand-red px-3.5 py-1 text-xs font-bold text-white shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
          >
            Log in to save
          </Link>
        </div>
      )}

      <div className="mt-5">
        <ProjectTabs projectId={project.id} data={data} />
      </div>

      <div className="mt-5">
        <Outlet />
      </div>
    </div>
  );
}
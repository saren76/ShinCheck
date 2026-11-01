import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowRight,
  Plus,
  Trash2,
  Layers,
  ScanSearch,
  GitCompare,
  Clock3,
  Loader2,
  FlaskConical,
} from "lucide-react";
import { listProjects, deleteProject } from "@/lib/research-fns";
import { getOwnerKey } from "@/lib/owner-key";
import { formatDate } from "@/components/project/status";

const CATEGORY_LABELS = {
  scholarship: "Scholarships",
  admissions: "Admissions",
  career: "Careers",
  government: "Government schemes",
  business: "Business",
  general: "General",
};

export const Route = createFileRoute("/_authed/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My research — ShinCheck" },
      { name: "description", content: "Every research project you have analysed with ShinCheck." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const fetchProjects = useServerFn(listProjects);
  const removeProject = useServerFn(deleteProject);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const result = await fetchProjects({ data: { owner_key: getOwnerKey() } });
        if (alive) setProjects(Array.isArray(result) ? result : []);
      } catch {
        if (alive) toast.error("Could not load your saved research.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fetchProjects]);

  const onDelete = async (project) => {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setBusyId(project.id);
    try {
      await removeProject({ data: { projectId: project.id } });
      setProjects((current) => current.filter((item) => item.id !== project.id));
      toast.success("Project deleted");
    } catch {
      toast.error("Could not delete that project.");
    } finally {
      setBusyId("");
    }
  };

  const totals = projects.reduce(
    (acc, project) => ({
      sources: acc.sources + (project.source_count || 0),
      claims: acc.claims + (project.claim_count || 0),
      gaps: acc.gaps + (project.gap_count || 0),
      conflicts: acc.conflicts + (project.conflict_count || 0),
      warnings: acc.warnings + (project.freshness_count || 0),
    }),
    { sources: 0, claims: 0, gaps: 0, conflicts: 0, warnings: 0 }
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="pop-chip bg-white">Saved projects</span>
          <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-extrabold leading-tight tracking-tight">
            My research
          </h1>
          <p className="mt-1 text-sm text-brand-ink/60">
            Every run keeps its sources, claims and checklist — so you can pick it up tomorrow.
          </p>
        </div>
        <Link
          to="/"
          hash="composer"
          className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-red px-5 py-3 text-sm font-bold text-white shadow-pop-sm transition hover:-translate-y-0.5 hover:shadow-pop"
        >
          <Plus className="h-4 w-4" /> New research
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          { icon: Layers, label: "Projects", value: projects.length, tone: "text-brand-blue" },
          { icon: ScanSearch, label: "Gaps found", value: totals.gaps, tone: "text-brand-ink" },
          { icon: GitCompare, label: "Conflicts", value: totals.conflicts, tone: "text-brand-red" },
          { icon: Clock3, label: "Freshness flags", value: totals.warnings, tone: "text-brand-amber" },
          { icon: Layers, label: "Claims extracted", value: totals.claims, tone: "text-brand-green" },
        ].map((stat) => (
          <div key={stat.label} className="pop-card p-4">
            <stat.icon className={`h-4 w-4 ${stat.tone}`} />
            <p className="mt-2 font-display text-2xl font-extrabold leading-none">{stat.value}</p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-brand-ink/45">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm font-semibold text-brand-ink/50">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your research…
        </div>
      ) : projects.length === 0 ? (
        <div className="pop-card mt-8 p-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border-2 border-brand-ink bg-brand-yellow">
            <ScanSearch className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-2xl font-extrabold">No research saved yet</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-brand-ink/60">
            Start with a question, a link or a PDF. Your workspace will appear here with its gaps,
            conflicts and checklist.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              hash="composer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-red px-5 py-2.5 text-sm font-bold text-white shadow-pop-sm"
            >
              Start research <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/demo"
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink bg-white px-5 py-2.5 text-sm font-bold shadow-pop-sm"
            >
              <FlaskConical className="h-4 w-4" /> Explore the sample
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="pop-card pop-card-hover flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full border-2 border-brand-ink/15 bg-brand-cream px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-ink/50">
                  {CATEGORY_LABELS[project.category] || "Research"}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(project)}
                  disabled={busyId === project.id}
                  aria-label={`Delete ${project.title}`}
                  className="grid h-7 w-7 place-items-center rounded-lg border-2 border-brand-ink/15 text-brand-ink/40 transition hover:border-brand-red hover:text-brand-red"
                >
                  {busyId === project.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <h2 className="mt-2 line-clamp-2 font-display text-lg font-extrabold leading-snug">
                {project.title}
              </h2>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-brand-ink/55">
                {project.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                <span className="rounded-full bg-brand-blue-soft px-2 py-0.5 text-brand-blue">
                  {project.source_count || 0} sources
                </span>
                <span className="rounded-full bg-brand-green-soft px-2 py-0.5 text-brand-green">
                  {project.claim_count || 0} claims
                </span>
                <span className="rounded-full bg-brand-yellow/40 px-2 py-0.5 text-brand-ink/70">
                  {project.gap_count || 0} gaps
                </span>
                <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-brand-red">
                  {project.conflict_count || 0} conflicts
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-brand-ink/45">
                  <span>Evidence coverage</span>
                  <span>{project.coverage ?? 0}%</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full border-2 border-brand-ink/15 bg-white">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${project.coverage ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-brand-ink/10 pt-3">
                <span className="text-[11px] font-semibold text-brand-ink/40">
                  {formatDate(project.created_date)}
                </span>
                <Link
                  to="/project/$projectId/"
                  params={{ projectId: project.id }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-red hover:underline"
                >
                  Open workspace <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
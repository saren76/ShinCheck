import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import ChecklistPanel from "@/components/project/ChecklistPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/checklist")({
  component: ProjectChecklist,
});

function ProjectChecklist() {
  const data = parent.useLoaderData();
  return <ChecklistPanel data={data} />;
}
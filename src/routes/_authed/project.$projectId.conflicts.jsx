import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import ConflictsPanel from "@/components/project/ConflictsPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/conflicts")({
  component: ProjectConflicts,
});

function ProjectConflicts() {
  const data = parent.useLoaderData();
  return <ConflictsPanel data={data} />;
}
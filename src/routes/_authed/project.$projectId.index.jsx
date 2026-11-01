import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import OverviewPanel from "@/components/project/OverviewPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/")({
  component: ProjectOverview,
});

function ProjectOverview() {
  const data = parent.useLoaderData();
  return <OverviewPanel data={data} />;
}
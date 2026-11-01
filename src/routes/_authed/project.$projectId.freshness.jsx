import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import FreshnessPanel from "@/components/project/FreshnessPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/freshness")({
  component: ProjectFreshness,
});

function ProjectFreshness() {
  const data = parent.useLoaderData();
  return <FreshnessPanel data={data} />;
}
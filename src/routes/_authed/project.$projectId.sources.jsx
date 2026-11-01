import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import SourcesPanel from "@/components/project/SourcesPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/sources")({
  component: ProjectSources,
});

function ProjectSources() {
  const data = parent.useLoaderData();
  return <SourcesPanel data={data} />;
}
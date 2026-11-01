import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import GapsPanel from "@/components/project/GapsPanel";

const parent = getRouteApi("/_authed/project/$projectId");

export const Route = createFileRoute("/_authed/project/$projectId/gaps")({
  component: ProjectGaps,
});

function ProjectGaps() {
  const data = parent.useLoaderData();
  return <GapsPanel data={data} />;
}
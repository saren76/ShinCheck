import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireSignedIn, AuthGateError } from "@/components/auth/AuthGate";

export const Route = createFileRoute("/_authed")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: () => <Outlet />,
});

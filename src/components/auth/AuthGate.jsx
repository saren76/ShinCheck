import { redirect } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { supabase } from "@/lib/supabase";

export async function requireSignedIn({ location }) {
  // Allow demonstration and guest research previews without requiring login
  if (
    location.pathname.includes("/project/demo") ||
    location.pathname.includes("/project/guest-")
  ) {
    return { user: null };
  }

  const { data, error } = await supabase.auth.getUser();

  if (error && error.name !== "AuthSessionMissingError") {
    throw error;
  }

  if (data?.user) {
    return { user: data.user };
  }

  throw redirect({
    to: "/login",
    search: {
      returnTo: location.href,
    },
  });
}

export function AuthGateError({ error }) {
  return <DefaultCatchBoundary error={error} />;
}

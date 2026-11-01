// Supabase session helpers
// The Supabase client manages its own token storage; this file is kept for
// legacy imports that relied on getAppParams().
const isBrowser = typeof window !== "undefined";

// Clear a stale token if the URL requests it (kept for backward compat).
if (isBrowser && new URLSearchParams(window.location.search).get("clear_access_token") === "true") {
  try {
    // Remove any Supabase session keys from localStorage.
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

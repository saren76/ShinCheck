import { createClient } from "@supabase/supabase-js";
import { setResponseStatus } from "@tanstack/react-start/server";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export function makeServerSupabase(userToken) {
  // If a valid service role key is configured, use it
  if (SUPABASE_SERVICE_KEY && SUPABASE_SERVICE_KEY !== "your_supabase_service_role_key_here") {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  // Otherwise, use the publishable/anon key with the user's bearer token for RLS
  const options = {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  };

  if (userToken) {
    options.global = {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    };
  }

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
}

export async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export function handleUnauthorized() {
  try {
    setResponseStatus(401);
  } catch {
    // ignore
  }
}


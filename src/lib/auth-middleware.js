// Supabase-based auth middleware for TanStack Start server functions and routes.
// Verifies the visitor's JWT from the Authorization header using Supabase.
import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import {
  getUserFromRequest,
  makeServerSupabase,
  handleUnauthorized,
} from "./auth-middleware.server";

// Applied to every server function: forwards the visitor's Supabase JWT so
// `context.getSupabase()` acts as the authenticated visitor.
export const authMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    let token = null;
    if (typeof window !== "undefined") {
      try {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      } catch {
        // ignore
      }
    }
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  })
  .server(({ next, request }) => {
    let user;
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    return next({
      context: {
        getUser: async () => {
          if (user === undefined) user = await getUserFromRequest(request);
          return user;
        },
        getSupabase: () => makeServerSupabase(token),
      },
    });
  });

// Applied to every request (server routes): same lazy `context.getUser()` helper.
export const supabaseRequestMiddleware = createMiddleware({ type: "request" }).server(
  ({ next, request }) => {
    let user;
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    return next({
      context: {
        getUser: async () => {
          if (user === undefined) user = await getUserFromRequest(request);
          return user;
        },
        getSupabase: () => makeServerSupabase(token),
      },
    });
  }
);

// Add to a server function that needs a signed-in caller.
// Rejects anonymous callers with 401 and sets `context.user`.
export const requireUser = createMiddleware({ type: "function" }).server(
  async ({ next, context }) => {
    const user = await context.getUser();
    if (!user) {
      handleUnauthorized();
      throw Object.assign(new Error("Unauthorized"), { status: 401, code: "UNAUTHORIZED" });
    }
    return next({ context: { user } });
  }
);

// For server routes: answers anonymous callers with 401 and sets `context.user`.
export const requireUserRoute = createMiddleware({ type: "request" }).server(
  async ({ next, context }) => {
    const user = await context.getUser();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    return next({ context: { user } });
  }
);

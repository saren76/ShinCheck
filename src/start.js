import { createStart } from "@tanstack/react-start";
import { authMiddleware, supabaseRequestMiddleware } from "@/lib/auth-middleware";
import { errorCaptureFunctionMiddleware, errorCaptureRequestMiddleware } from "@/lib/error-capture";

// Every server function and server route gets `context.getUser()` and `context.getSupabase()`.
// Error capture goes first, so it sees what the other middlewares and the handlers throw.
export const startInstance = createStart(() => ({
  requestMiddleware: [errorCaptureRequestMiddleware, supabaseRequestMiddleware],
  functionMiddleware: [errorCaptureFunctionMiddleware, authMiddleware],
}));

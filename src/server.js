import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

// Standard TanStack Start request handler
const handler = createStartHandler((ctx) => {
  for (const match of ctx.router.state.matches) {
    if (match.status === "error") {
      console.error(`Route error in ${match.routeId}:`, match.error);
    }
  }
  return defaultStreamHandler(ctx);
});

export default { fetch: handler };

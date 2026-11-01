import { isNotFound, isRedirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";

const isControlFlow = (error) => error instanceof Response || isRedirect(error) || isNotFound(error);

// Catches unhandled errors in server functions and logs them cleanly
export const errorCaptureFunctionMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next, serverFnMeta }) => {
    try {
      return await next();
    } catch (error) {
      if (!isControlFlow(error)) {
        console.error(`[ServerFn Error] ${serverFnMeta?.name || serverFnMeta?.id || "anonymous"}:`, error);
      }
      throw error;
    }
  }
);

// Catches unhandled errors in server routes and logs them cleanly
export const errorCaptureRequestMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, handlerType }) => {
    try {
      return await next();
    } catch (error) {
      if (handlerType !== "serverFn" && !isControlFlow(error)) {
        console.error("[Server Request Error]:", error);
      }
      throw error;
    }
  }
);

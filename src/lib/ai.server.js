// AI adapter for TanStack AI's chat() — optional, only used if OPENAI_API_KEY is set.
// Connects to an OpenAI-compatible endpoint using server-side credentials only.
// Never expose OPENAI_API_KEY in the browser (don't prefix it with VITE_).
import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";

export const gatewayModel = (model = "gpt-4o-mini") => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  const baseURL = import.meta.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set — AI chat is unavailable.");
  }
  return openaiCompatibleText(model, { name: "openai", baseURL, apiKey });
};

/**
 * Optional LLM layer. Runs only when the user turns on "deep AI analysis".
 * If no AI provider is configured, or if the model call fails, the caller
 * falls back to the deterministic engine — no crash, no fake results.
 *
 * AI credentials are read from private server environment variables ONLY.
 * NEVER put AI keys in VITE_* variables.
 *
 * Supported providers (configure ONE):
 *   - OpenAI:   OPENAI_API_KEY
 *   - Gemini:   GOOGLE_GENERATIVE_AI_API_KEY  (via OpenAI-compatible endpoint)
 *   - Any OpenAI-compatible endpoint via OPENAI_BASE_URL + OPENAI_API_KEY
 */

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    claims: {
      type: "array",
      items: {
        type: "object",
        properties: {
          statement: { type: "string" },
          category: { type: "string" },
          status: {
            type: "string",
            enum: ["supported", "uncertain", "conflict", "info", "unavailable"],
          },
          confidence: { type: "number" },
          source_title: { type: "string" },
          source_url: { type: "string" },
          source_date: { type: "string" },
          excerpt: { type: "string" },
        },
        required: ["statement", "status"],
      },
    },
    gaps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          why_it_matters: { type: "string" },
          question: { type: "string" },
          next_step: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["title", "question"],
      },
    },
    conflicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          claim_a: { type: "string" },
          source_a: { type: "string" },
          url_a: { type: "string" },
          date_a: { type: "string" },
          excerpt_a: { type: "string" },
          claim_b: { type: "string" },
          source_b: { type: "string" },
          url_b: { type: "string" },
          date_b: { type: "string" },
          excerpt_b: { type: "string" },
          explanation: { type: "string" },
          conflict_type: {
            type: "string",
            enum: ["genuine", "date", "region", "category", "cycle"],
          },
          severity: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["topic", "claim_a", "claim_b", "explanation"],
      },
    },
    freshness: {
      type: "array",
      items: {
        type: "object",
        properties: {
          source_title: { type: "string" },
          source_url: { type: "string" },
          published_date: { type: "string" },
          reason: { type: "string" },
          detail: { type: "string" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["reason", "detail"],
      },
    },
    checklist: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          recommended_url: { type: "string" },
          recommended_label: { type: "string" },
        },
        required: ["title", "priority"],
      },
    },
  },
  required: ["summary", "claims", "gaps", "conflicts", "freshness", "checklist"],
};

function buildPrompt({ query, category, sources, webSearch }) {
  const corpus = sources
    .map(
      (s, i) =>
        `SOURCE ${i + 1}\nTitle: ${s.title || "Untitled"}\nURL: ${s.url || "none"}\nPublished: ${
          s.published_date || "unknown"
        }\nText: ${String(s.text || "").slice(0, 3500)}`
    )
    .join("\n\n")
    .slice(0, 14000);

  return `You are ShinCheck, an evidence-first research analyst. Research goal: "${query}". Research category: ${category}.

You must be strictly grounded: only state facts that appear in the supplied sources${
    webSearch ? " or that you can verify with a live web search (cite the real URL you used)" : ""
  }. Never invent dates, amounts, deadlines or URLs. If something is unstated, report it as a gap instead of guessing.

Return JSON with:
- summary: 2-4 sentences a student or founder would understand, naming what is solid and what is unverified.
- claims: up to 12 extracted claims, each with the exact supporting source_title, source_url, source_date and a short verbatim excerpt. status = "supported" when the source states it with a date or number, "uncertain" when hedged, "conflict" when another source disagrees, "info" otherwise. confidence 0-100.
- gaps: up to 6 genuinely missing items, each with why_it_matters, the unanswered question, and a concrete next_step. priority high/medium/low.
- conflicts: up to 5 pairs of claims from different sources that disagree. Set conflict_type to "genuine" only when they truly contradict for the same period and place; use "date", "cycle", "region" or "category" when the difference is explained by timing, rounds, region or category. Explain the likely cause in explanation.
- freshness: up to 5 warnings where a source refers to an earlier year/cycle, a stated deadline appears to have passed, or the publication date is unavailable. Only create these from evidence in the text.
- checklist: up to 8 verification tasks with title, description, priority and a recommended_url that already appears in the sources (or empty string).

Sources:
${corpus || "No sources supplied. Build a research plan instead: claims may be empty, and gaps/checklist should describe exactly what must be collected and verified, using the research goal above."}`;
}

/**
 * Call an OpenAI-compatible chat completion endpoint.
 * Returns parsed JSON or throws on failure.
 */
async function callOpenAI({ prompt }) {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  const baseUrl = import.meta.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = import.meta.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured — AI analysis unavailable.");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are ShinCheck, an evidence-first research analyst. Always respond with valid JSON matching the requested schema.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(55000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`AI provider returned ${response.status}: ${body.slice(0, 200)}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned no content");

  return typeof content === "string" ? JSON.parse(content) : content;
}

export async function aiAnalyze(payload) {
  const result = await callOpenAI({ prompt: buildPrompt(payload) });
  if (!result || typeof result !== "object") throw new Error("Model returned no usable analysis");
  return result;
}

const str = (value, max = 600) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const list = (value, max) => (Array.isArray(value) ? value.slice(0, max) : []);
const priority = (value) => (["high", "medium", "low"].includes(value) ? value : "medium");
const status = (value) =>
  ["supported", "uncertain", "conflict", "info", "unavailable"].includes(value) ? value : "info";

/** Merge a model response with the deterministic engine so nothing is ever empty. */
export function mergeAnalysis(ai, engine) {
  const claims = list(ai.claims, 20)
    .filter((c) => str(c.statement).length > 12)
    .map((c) => ({
      statement: str(c.statement, 260),
      category: str(c.category, 40) || "general",
      status: status(c.status),
      confidence: Math.max(10, Math.min(98, Math.round(Number(c.confidence) || 60))),
      source_title: str(c.source_title, 160),
      source_url: str(c.source_url, 900),
      source_date: str(c.source_date, 40),
      excerpt: str(c.excerpt || c.statement, 300),
    }));

  const gaps = list(ai.gaps, 7)
    .filter((g) => str(g.title).length > 2)
    .map((g, i) => ({
      title: str(g.title, 120),
      why_it_matters: str(g.why_it_matters, 400),
      question: str(g.question, 300),
      next_step: str(g.next_step, 300),
      priority: priority(g.priority),
      status: "open",
      order: i,
    }));

  const conflicts = list(ai.conflicts, 5).map((c) => ({
    topic: str(c.topic, 90),
    claim_a: str(c.claim_a, 260),
    source_a: str(c.source_a, 160),
    url_a: str(c.url_a, 900),
    date_a: str(c.date_a, 40),
    excerpt_a: str(c.excerpt_a || c.claim_a, 300),
    claim_b: str(c.claim_b, 260),
    source_b: str(c.source_b, 160),
    url_b: str(c.url_b, 900),
    date_b: str(c.date_b, 40),
    excerpt_b: str(c.excerpt_b || c.claim_b, 300),
    explanation: str(c.explanation, 600),
    conflict_type: ["genuine", "date", "region", "category", "cycle"].includes(c.conflict_type)
      ? c.conflict_type
      : "genuine",
    severity: priority(c.severity),
  }));

  const freshness = list(ai.freshness, 5).map((f) => ({
    source_title: str(f.source_title, 160),
    source_url: str(f.source_url, 900),
    published_date: str(f.published_date, 40),
    reason: str(f.reason, 90),
    detail: str(f.detail, 500),
    severity: priority(f.severity),
  }));

  const checklist = list(ai.checklist, 8)
    .filter((c) => str(c.title).length > 2)
    .map((c, i) => ({
      title: str(c.title, 140),
      description: str(c.description, 400),
      priority: priority(c.priority),
      status: "todo",
      notes: "",
      recommended_url: str(c.recommended_url, 900),
      recommended_label: str(c.recommended_label, 60) || "Open source",
      order: i,
    }));

  const finalClaims = claims.length ? claims : engine.claims;
  const supported = finalClaims.filter((c) => c.status === "supported").length;

  return {
    summary: str(ai.summary, 900) || engine.summary,
    coverage: finalClaims.length ? Math.round((supported / finalClaims.length) * 100) : engine.coverage,
    claims: finalClaims,
    gaps: gaps.length >= 2 ? gaps : engine.gaps,
    conflicts: conflicts.length ? conflicts : engine.conflicts,
    freshness: freshness.length ? freshness : engine.freshness,
    checklist: checklist.length >= 3 ? checklist : engine.checklist,
    sources: engine.sources,
    engine: "AI deep analysis",
  };
}
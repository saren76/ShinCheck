import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { runEngineAnalysis, hostOf } from "@/lib/analysis-engine.server";
import { aiAnalyze, mergeAnalysis } from "@/lib/ai-analysis.server";
import { makeServerSupabase } from "@/lib/auth-middleware.server";
import {
  DEMO_PROJECT,
  DEMO_SOURCES,
  DEMO_CLAIMS,
  DEMO_GAPS,
  DEMO_CONFLICTS,
  DEMO_FRESHNESS,
  DEMO_CHECKLIST,
} from "@/lib/demo-data.server";

// ---------------------------------------------------------------------------
// Database client helper
// ---------------------------------------------------------------------------
function getDb(context) {
  if (context?.getSupabase) {
    return context.getSupabase();
  }
  return makeServerSupabase();
}

// In-memory store for guest/instant research sessions
const guestStore = new Map();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_SOURCES = 8;
const MAX_TEXT = 24000;

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
const SourceInput = z.object({
  title: z.string().max(300).optional().default(""),
  url: z.string().max(2000).optional().default(""),
  text: z.string().max(MAX_TEXT).optional().default(""),
  kind: z.enum(["link", "document", "text", "web"]).optional().default("link"),
  published_date: z.string().max(60).optional().default(""),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function tidy(value, max) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (
      /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/
        .test(url.hostname)
    )
      return null;
    return url;
  } catch {
    return null;
  }
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

async function readLink(url) {
  const parsed = safeUrl(url);
  if (!parsed) return null;
  try {
    const response = await fetch(parsed.toString(), {
      headers: { "user-agent": "ShinCheckResearchBot/1.0" },
      signal: AbortSignal.timeout(9000),
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") || "";
    if (!/text\/|html|xml|json/.test(contentType)) return null;
    const body = (await response.text()).slice(0, 400000);
    const titleTag = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const description =
      body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
      body.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const published =
      body.match(/article:published_time["'][^>]+content=["']([^"']+)["']/i) ||
      body.match(/"datePublished"\s*:\s*"([^"]+)"/i);
    const text = stripHtml(body);
    return {
      title: tidy(titleTag?.[1] || parsed.hostname, 220),
      text: tidy(`${description?.[1] ? `${description[1]}. ` : ""}${text}`, MAX_TEXT),
      published_date: published ? tidy(published[1], 30).slice(0, 10) : "",
      kind: "link",
      url: parsed.toString(),
    };
  } catch {
    return null;
  }
}

async function resolveSources(input) {
  const resolved = [];
  for (const source of input.slice(0, MAX_SOURCES)) {
    const supplied = tidy(source.text, MAX_TEXT);
    if (supplied.length > 40 || source.kind === "document" || source.kind === "text") {
      resolved.push({
        title: tidy(source.title, 220) || (source.url ? hostOf(source.url) : "Pasted notes"),
        url: safeUrl(source.url)?.toString() || "",
        text: supplied,
        published_date: tidy(source.published_date, 30),
        kind: source.kind,
      });
      continue;
    }
    if (source.url) {
      const fetched = await readLink(source.url);
      if (fetched) {
        resolved.push({
          ...fetched,
          title: tidy(source.title, 220) || fetched.title,
          published_date: tidy(source.published_date, 30) || "",
        });
        continue;
      }
      resolved.push({
        title: tidy(source.title, 220) || hostOf(source.url) || "Unreadable link",
        url: safeUrl(source.url)?.toString() || "",
        text: "",
        published_date: tidy(source.published_date, 30),
        kind: "link",
      });
    }
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Supabase insert helper
// ---------------------------------------------------------------------------
async function supabaseInsertMany(db, table, rows) {
  if (!rows || rows.length === 0) return;
  const { error } = await db.from(table).insert(rows);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Persist analysis sub-documents to Supabase Postgres
// ---------------------------------------------------------------------------
async function persistAnalysis(db, projectId, analysis) {
  const tasks = [];

  if (analysis.sources.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "research_sources",
        analysis.sources.map((s) => ({
          project_id: projectId,
          title: s.title || "",
          url: s.url || "",
          host: s.url ? (safeUrl(s.url)?.hostname || "") : "",
          kind: s.kind || "link",
          published_date: s.published_date || "",
          excerpt: (s.text || "").slice(0, 800),
          word_count: s.text ? s.text.split(/\s+/).filter(Boolean).length : 0,
          status: s.status || "info",
        }))
      )
    );
  }

  if (analysis.claims.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "claims",
        analysis.claims.map((c) => ({
          project_id: projectId,
          statement: c.statement || "",
          category: c.category || "general",
          status: c.status || "info",
          confidence: c.confidence || 0,
          source_title: c.source_title || "",
          source_url: c.source_url || "",
          source_date: c.source_date || "",
          excerpt: c.excerpt || "",
        }))
      )
    );
  }

  if (analysis.gaps.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "gaps",
        analysis.gaps.map((g, i) => ({
          project_id: projectId,
          title: g.title || "",
          why_it_matters: g.why_it_matters || "",
          question: g.question || "",
          next_step: g.next_step || "",
          priority: g.priority || "medium",
          status: g.status || "open",
          order: g.order ?? i,
        }))
      )
    );
  }

  if (analysis.conflicts.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "conflicts",
        analysis.conflicts.map((c) => ({
          project_id: projectId,
          topic: c.topic || "",
          claim_a: c.claim_a || "",
          source_a: c.source_a || "",
          url_a: c.url_a || "",
          date_a: c.date_a || "",
          excerpt_a: c.excerpt_a || "",
          claim_b: c.claim_b || "",
          source_b: c.source_b || "",
          url_b: c.url_b || "",
          date_b: c.date_b || "",
          excerpt_b: c.excerpt_b || "",
          explanation: c.explanation || "",
          conflict_type: c.conflict_type || "genuine",
          severity: c.severity || "medium",
        }))
      )
    );
  }

  if (analysis.freshness.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "freshness_warnings",
        analysis.freshness.map((f) => ({
          project_id: projectId,
          source_title: f.source_title || "",
          source_url: f.source_url || "",
          published_date: f.published_date || "",
          reason: f.reason || "",
          detail: f.detail || "",
          severity: f.severity || "medium",
        }))
      )
    );
  }

  if (analysis.checklist.length) {
    tasks.push(
      supabaseInsertMany(
        db,
        "checklist_items",
        analysis.checklist.map((item, i) => ({
          project_id: projectId,
          title: item.title || "",
          description: item.description || "",
          priority: item.priority || "medium",
          status: item.status || "todo",
          notes: item.notes || "",
          recommended_url: item.recommended_url || "",
          recommended_label: item.recommended_label || "",
          order: item.order ?? i,
        }))
      )
    );
  }

  await Promise.all(tasks);
}

// ---------------------------------------------------------------------------
// Server functions
// ---------------------------------------------------------------------------

export const createResearchProject = createServerFn({ method: "POST" })
  .validator(
    z.object({
      title: z.string().max(200).optional().default(""),
      query: z.string().min(4).max(1200),
      category: z.string().max(40).optional().default("general"),
      input_mode: z.enum(["scratch", "links", "documents"]).optional().default("scratch"),
      web_search: z.boolean().optional().default(false),
      deep_ai: z.boolean().optional().default(false),
      owner_key: z.string().max(80).optional().default(""),
      sources: z.array(SourceInput).max(MAX_SOURCES).optional().default([]),
    })
  )
  .handler(async ({ data, context }) => {
    const user = await context.getUser();
    const db = getDb(context);
    const sources = await resolveSources(data.sources);

    let analysis = null;
    if (data.deep_ai) {
      try {
        const ai = await aiAnalyze({
          query: data.query,
          category: data.category,
          sources,
          webSearch: data.web_search,
        });
        analysis = mergeAnalysis(ai, runEngineAnalysis({ ...data, sources }));
      } catch {
        analysis = null;
      }
    }
    if (!analysis) {
      analysis = runEngineAnalysis({ query: data.query, category: data.category, sources });
    }
    if (data.web_search && !data.deep_ai) {
      analysis.summary = `${analysis.summary} Live web search was off for this run, so only the sources you supplied were used.`;
    }

    const readCount = analysis.sources.filter((s) => s.status !== "unavailable").length;
    const engine =
      analysis.claims.length === 0 && readCount === 0
        ? "Research plan"
        : data.deep_ai && analysis.engine === "AI deep analysis"
          ? "AI deep analysis"
          : "ShinCheck engine";

    if (!user) {
      const guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const guestData = {
        project: {
          id: guestId,
          title: tidy(data.title, 180) || tidy(data.query, 120),
          query: tidy(data.query, 1200),
          category: data.category,
          input_mode: data.input_mode,
          status: "ready",
          summary: analysis.summary,
          analysis_engine: engine,
          coverage: analysis.coverage,
          source_count: analysis.sources.length,
          claim_count: analysis.claims.length,
          gap_count: analysis.gaps.length,
          conflict_count: analysis.conflicts.length,
          freshness_count: analysis.freshness.length,
          checklist_total: analysis.checklist.length,
          checklist_done: 0,
          is_demo: false,
          is_guest: true,
          web_search: data.web_search,
          created_at: new Date().toISOString(),
          created_date: new Date().toISOString(),
        },
        sources: analysis.sources,
        claims: analysis.claims,
        gaps: analysis.gaps,
        conflicts: analysis.conflicts,
        warnings: analysis.freshness,
        checklist: analysis.checklist.map((item, idx) => ({
          ...item,
          id: `guest-checklist-${idx}`,
        })),
      };

      if (guestStore.size > 200) {
        const first = guestStore.keys().next().value;
        guestStore.delete(first);
      }
      guestStore.set(guestId, guestData);

      return {
        projectId: guestId,
        ready: analysis.claims.length > 0 || analysis.sources.length > 0,
      };
    }

    const { data: project, error: insertError } = await db
      .from("research_projects")
      .insert({
        owner_id: user.id,
        title: tidy(data.title, 180) || tidy(data.query, 120),
        query: tidy(data.query, 1200),
        category: data.category,
        input_mode: data.input_mode,
        status: "ready",
        summary: analysis.summary,
        analysis_engine: engine,
        coverage: analysis.coverage,
        source_count: analysis.sources.length,
        claim_count: analysis.claims.length,
        gap_count: analysis.gaps.length,
        conflict_count: analysis.conflicts.length,
        freshness_count: analysis.freshness.length,
        checklist_total: analysis.checklist.length,
        checklist_done: 0,
        is_demo: false,
        web_search: data.web_search,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await persistAnalysis(db, project.id, analysis);

    return {
      projectId: project.id,
      ready: analysis.claims.length > 0 || analysis.sources.length > 0,
    };
  });

export const getProjectWorkspace = createServerFn({ method: "GET" })
  .validator(z.object({ projectId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    // If requesting the demonstration project or ID "demo"
    if (data.projectId === "demo") {
      return {
        project: {
          ...DEMO_PROJECT,
          id: "demo",
          created_date: new Date().toISOString(),
        },
        sources: DEMO_SOURCES,
        claims: DEMO_CLAIMS,
        gaps: DEMO_GAPS,
        conflicts: DEMO_CONFLICTS,
        warnings: DEMO_FRESHNESS,
        checklist: DEMO_CHECKLIST.map((item, idx) => ({
          ...item,
          id: `demo-checklist-${idx}`,
        })),
      };
    }

    // If requesting a guest analysis session
    if (data.projectId.startsWith("guest-")) {
      const guest = guestStore.get(data.projectId);
      if (guest) return guest;
    }

    const db = getDb(context);

    const { data: project, error: projectError } = await db
      .from("research_projects")
      .select("*")
      .eq("id", data.projectId)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") return null; // row not found or blocked by RLS
      throw projectError;
    }
    if (!project) return null;

    const [
      { data: sources },
      { data: claims },
      { data: gaps },
      { data: conflicts },
      { data: warnings },
      { data: checklist },
    ] = await Promise.all([
      db.from("research_sources").select("*").eq("project_id", project.id).order("created_at").limit(100),
      db.from("claims").select("*").eq("project_id", project.id).order("confidence", { ascending: false }).limit(100),
      db.from("gaps").select("*").eq("project_id", project.id).order("order").limit(60),
      db.from("conflicts").select("*").eq("project_id", project.id).order("created_at").limit(60),
      db.from("freshness_warnings").select("*").eq("project_id", project.id).order("created_at").limit(60),
      db.from("checklist_items").select("*").eq("project_id", project.id).order("order").limit(100),
    ]);

    return {
      project: {
        ...project,
        created_date: project.created_at,
      },
      sources: sources || [],
      claims: claims || [],
      gaps: gaps || [],
      conflicts: conflicts || [],
      warnings: warnings || [],
      checklist: checklist || [],
    };
  });

export const listProjects = createServerFn({ method: "GET" })
  .validator(z.object({ owner_key: z.string().max(80).optional().default("") }))
  .handler(async ({ context }) => {
    const user = await context.getUser();
    if (!user) return [];

    const db = getDb(context);
    const { data, error } = await db
      .from("research_projects")
      .select("*")
      .eq("owner_id", user.id)
      .eq("is_demo", false)
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) throw error;

    return (data || []).map((p) => ({ ...p, created_date: p.created_at }));
  });

export const updateChecklistItem = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1).max(80),
      status: z.enum(["todo", "in_progress", "done"]).optional(),
      notes: z.string().max(2000).optional(),
    })
  )
  .handler(async ({ data, context }) => {
    // Demonstration or guest mode checklist items
    if (data.id.startsWith("demo-") || data.id.startsWith("guest-")) {
      return {
        id: data.id,
        status: data.status || "todo",
        notes: data.notes || "",
      };
    }

    const user = await context.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const db = getDb(context);

    const patch = {};
    if (data.status) patch.status = data.status;
    if (typeof data.notes === "string") patch.notes = data.notes;

    const { data: item, error: updateError } = await db
      .from("checklist_items")
      .update(patch)
      .eq("id", data.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Recalculate project checklist counts
    const { data: all } = await db
      .from("checklist_items")
      .select("status")
      .eq("project_id", item.project_id);

    const total = (all || []).length;
    const done = (all || []).filter((r) => r.status === "done").length;

    await db
      .from("research_projects")
      .update({ checklist_total: total, checklist_done: done })
      .eq("id", item.project_id);

    return item;
  });

export const analyzeDocument = createServerFn({ method: "POST" })
  .validator(z.object({ fileUri: z.string().min(4).max(600), fileName: z.string().max(200).optional() }))
  .handler(async ({ data }) => {
    // PDF documents are stored privately in Supabase Storage under the user's bucket.
    // Text can be pasted into the research composer notes, or extracted via client/server PDF parser.
    return {
      ok: false,
      reason:
        "Document uploaded to private storage. Please paste the document text directly into the text field for analysis.",
    };
  });

export const getDemoProject = createServerFn({ method: "POST" }).handler(async ({ context }) => {
  const db = getDb(context);

  try {
    const { data: existing } = await db
      .from("research_projects")
      .select("id")
      .eq("is_demo", true)
      .limit(1)
      .maybeSingle();

    if (existing?.id) return { projectId: existing.id };
  } catch {
    // fallback
  }

  return { projectId: "demo" };
});

export const deleteProject = createServerFn({ method: "POST" })
  .validator(z.object({ projectId: z.string().min(1).max(80) }))
  .handler(async ({ data, context }) => {
    const user = await context.getUser();
    if (!user) return { deleted: false };

    const db = getDb(context);

    const { data: project, error: fetchError } = await db
      .from("research_projects")
      .select("id, is_demo, owner_id")
      .eq("id", data.projectId)
      .single();

    if (fetchError || !project || project.is_demo) return { deleted: false };
    // Only the owner may delete
    if (user.id !== project.owner_id) return { deleted: false };

    // Child rows are cascade-deleted by foreign keys
    const { error } = await db.from("research_projects").delete().eq("id", project.id);
    if (error) throw error;

    return { deleted: true };
  });

export const serverSignUp = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(6) }))
  .handler(async ({ data }) => {
    const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (serviceKey && serviceKey !== "your_supabase_service_role_key_here") {
      const { createClient } = await import("@supabase/supabase-js");
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const { error } = await adminClient.auth.admin.createUser({
        email: data.email.trim(),
        password: data.password,
        email_confirm: true,
      });
      if (error && !error.message.includes("already registered") && !error.message.includes("already been registered")) {
        throw error;
      }
      return { autoConfirmed: true };
    }
    return { autoConfirmed: false };
  });

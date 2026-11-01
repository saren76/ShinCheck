# AGENTS.md

## Project Context

**ShinCheck** is an independent AI research assistant and information verification web application built with **TanStack Start** (React 19, plain JavaScript) and **Supabase**.

## Architecture & Conventions

- `src/routes/__root.jsx`: The root document, layout, `AuthProvider`, and global chrome (`SiteHeader`, `SiteFooter`).
- `src/routes/_authed.jsx`: Protected layout gate requiring authenticated Supabase session (`beforeLoad: requireSignedIn`).
- `src/routes/_authed/dashboard.jsx`: Authenticated user dashboard displaying user's saved research projects.
- `src/routes/_authed/project.$projectId.jsx`: Project workspace layout and tabs.
- `src/routes/demo.jsx`: Public demonstration analysis page.
- `src/routes/login.jsx`: Supabase authentication page (login & signup).
- `src/lib/supabase.js`: Public Supabase browser client (`createClient`).
- `src/lib/AuthContext.jsx`: Client authentication context providing `user`, `isAuthenticated`, `logout`, `refresh`.
- `src/lib/auth-middleware.js`: TanStack Start server function middleware forwarding user JWTs to Supabase.
- `src/lib/auth-middleware.server.js`: Server-side Supabase client initialization respecting Row Level Security (RLS).
- `src/lib/research-fns.js`: Supabase server functions (`createResearchProject`, `getProjectWorkspace`, `listProjects`, `updateChecklistItem`, `deleteProject`, `getDemoProject`).
- `src/lib/analysis-engine.server.js`: Deterministic research analysis engine (evidence, gaps, conflicts, freshness, checklist).
- `src/lib/ai-analysis.server.js`: Optional deep LLM analysis using server-side OpenAI-compatible provider credentials.

## Server Security & RLS

- Row Level Security (RLS) is enabled on all 7 Postgres tables: `research_projects`, `research_sources`, `claims`, `gaps`, `conflicts`, `freshness_warnings`, `checklist_items`.
- Server functions authenticate visitors via the Bearer token in the `Authorization` header.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` in `VITE_` variables or client bundles.

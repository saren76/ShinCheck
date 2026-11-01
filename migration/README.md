# ShinCheck: Supabase Backend Migration

## Independent Stack
- **Supabase Auth**: Email/password authentication with session persistence and automatic token refresh.
- **Supabase PostgreSQL**: All 7 tables (`research_projects`, `research_sources`, `claims`, `gaps`, `conflicts`, `freshness_warnings`, `checklist_items`) with Row Level Security (RLS) enabled.
- **Supabase Storage**: Private `documents` bucket for uploaded PDF files.
- **Deterministic Analysis Engine**: Preserved evidence analysis (`src/lib/analysis-engine.server.js`).
- **AI Integration**: Optional OpenAI-compatible server-side provider (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`).

## Verification
- Legacy dependencies, plugins, scripts, and runtime references have been completely removed.
- Production build succeeds cleanly with `npm run build`.

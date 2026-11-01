# ShinCheck — AI Information Gap Analysis & Verification

ShinCheck is an evidence-first research analysis web application built with **React 19**, **TanStack Start**, **Tailwind CSS**, and backed by **Supabase** (Auth, PostgreSQL, and Storage).

## Architecture

- **Frontend**: React 19, TanStack Router, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend / SSR**: TanStack Start with Cloudflare Vite plugin
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email/password session management)
- **Storage**: Supabase Storage for private research documents
- **Analysis Engine**: Deterministic evidence-based engine (`src/lib/analysis-engine.server.js`) with optional deep AI analysis (`src/lib/ai-analysis.server.js`)

## Getting Started

### 1. Environment Configuration

Copy or edit `.env` with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-only (optional)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npx vite --host 127.0.0.1
```

### 4. Build for Production

```bash
npm run build
```

## Features

- **Evidence Analysis**: Derives supported claims, flags uncertain statements, and computes source coverage.
- **Information Gaps**: Uncovers missing critical information needed for informed decisions.
- **Conflict Detection**: Detects contradicting claims across multiple sources with severity scoring.
- **Freshness Warnings**: Alerts when sources reference past academic or fiscal cycles or lack dates.
- **Interactive Verification Checklist**: Track progress on verification tasks with live state persistence.
- **Demonstration Mode**: Interactive sample analysis for immediate exploration.

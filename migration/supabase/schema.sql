-- ShinCheck independent backend schema (Supabase/Postgres)
-- Run in Supabase SQL Editor. Uses Supabase Auth user IDs for ownership.
create extension if not exists pgcrypto;

create table if not exists public.research_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  query text not null,
  category text default 'general',
  input_mode text default 'scratch',
  status text default 'ready' check (status in ('analyzing','ready','failed')),
  summary text default '',
  analysis_engine text default 'ShinCheck engine',
  coverage numeric default 0,
  source_count integer default 0,
  claim_count integer default 0,
  gap_count integer default 0,
  conflict_count integer default 0,
  freshness_count integer default 0,
  checklist_total integer default 0,
  checklist_done integer default 0,
  is_demo boolean default false,
  web_search boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  title text not null default '',
  url text default '',
  host text default '',
  kind text default 'link' check (kind in ('link','document','text','web')),
  published_date text default '',
  excerpt text default '',
  word_count integer default 0,
  status text default 'info' check (status in ('supported','uncertain','conflict','info','unavailable')),
  created_at timestamptz not null default now()
);

create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  statement text not null,
  category text default 'general',
  status text default 'info' check (status in ('supported','uncertain','conflict','info','unavailable')),
  confidence numeric default 0,
  source_title text default '',
  source_url text default '',
  source_date text default '',
  excerpt text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.gaps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  title text not null,
  why_it_matters text default '',
  question text default '',
  next_step text default '',
  priority text default 'medium' check (priority in ('high','medium','low')),
  status text default 'open' check (status in ('open','resolved')),
  "order" integer default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.conflicts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  topic text default '',
  claim_a text default '',
  source_a text default '',
  url_a text default '',
  date_a text default '',
  excerpt_a text default '',
  claim_b text default '',
  source_b text default '',
  url_b text default '',
  date_b text default '',
  excerpt_b text default '',
  explanation text default '',
  conflict_type text default 'genuine' check (conflict_type in ('genuine','date','region','category','cycle')),
  severity text default 'medium' check (severity in ('high','medium','low')),
  created_at timestamptz not null default now()
);

create table if not exists public.freshness_warnings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  source_title text default '',
  source_url text default '',
  published_date text default '',
  reason text not null,
  detail text not null default '',
  severity text default 'medium' check (severity in ('high','medium','low')),
  created_at timestamptz not null default now()
);

create table if not exists public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.research_projects(id) on delete cascade,
  title text not null,
  description text default '',
  priority text default 'medium' check (priority in ('high','medium','low')),
  status text default 'todo' check (status in ('todo','in_progress','done')),
  notes text default '',
  recommended_url text default '',
  recommended_label text default '',
  "order" integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_owner_created on public.research_projects(owner_id, created_at desc);
create index if not exists idx_sources_project on public.research_sources(project_id);
create index if not exists idx_claims_project on public.claims(project_id);
create index if not exists idx_gaps_project on public.gaps(project_id);
create index if not exists idx_conflicts_project on public.conflicts(project_id);
create index if not exists idx_freshness_project on public.freshness_warnings(project_id);
create index if not exists idx_checklist_project on public.checklist_items(project_id);

-- RLS: authenticated users can only access their own projects and their child records.
alter table public.research_projects enable row level security;
alter table public.research_sources enable row level security;
alter table public.claims enable row level security;
alter table public.gaps enable row level security;
alter table public.conflicts enable row level security;
alter table public.freshness_warnings enable row level security;
alter table public.checklist_items enable row level security;

drop policy if exists "projects_select_own" on public.research_projects;
create policy "projects_select_own" on public.research_projects for select to authenticated using (owner_id = auth.uid() or is_demo = true);
drop policy if exists "projects_insert_own" on public.research_projects;
create policy "projects_insert_own" on public.research_projects for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "projects_update_own" on public.research_projects;
create policy "projects_update_own" on public.research_projects for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "projects_delete_own" on public.research_projects;
create policy "projects_delete_own" on public.research_projects for delete to authenticated using (owner_id = auth.uid() and is_demo = false);

do $$
declare t text;
begin
  foreach t in array array['research_sources','claims','gaps','conflicts','freshness_warnings','checklist_items'] loop
    execute format('drop policy if exists "child_select_own" on public.%I', t);
    execute format('create policy "child_select_own" on public.%I for select to authenticated using (exists (select 1 from public.research_projects p where p.id = project_id and (p.owner_id = auth.uid() or p.is_demo = true)))', t);
    execute format('drop policy if exists "child_insert_own" on public.%I', t);
    execute format('create policy "child_insert_own" on public.%I for insert to authenticated with check (exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = auth.uid()))', t);
    execute format('drop policy if exists "child_update_own" on public.%I', t);
    execute format('create policy "child_update_own" on public.%I for update to authenticated using (exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = auth.uid())) with check (exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = auth.uid()))', t);
    execute format('drop policy if exists "child_delete_own" on public.%I', t);
    execute format('create policy "child_delete_own" on public.%I for delete to authenticated using (exists (select 1 from public.research_projects p where p.id = project_id and p.owner_id = auth.uid()))', t);
  end loop;
end $$;

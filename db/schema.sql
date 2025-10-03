
-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Reports table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text,
  severity integer,
  description text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz default now(),
  reporter text default 'Guest',
  media_url text,
  verified boolean default false,
  confidence_score float default 0.0
);

-- Evacuation centers table
create table if not exists public.evacuation_centers (
  id uuid primary key default gen_random_uuid(),
  name text,
  latitude double precision,
  longitude double precision,
  capacity integer,
  current_occupancy integer,
  status text check (status in ('open', 'full', 'closed'))
);

-- RLS policies for development (adjust for production)
alter table public.reports enable row level security;
create policy if not exists "anon_select" on public.reports for select using (true);
create policy if not exists "anon_insert" on public.reports for insert with check (true);

alter table public.evacuation_centers enable row level security;
create policy if not exists "anon_select" on public.evacuation_centers for select using (true);

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists "pgcrypto";

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  type text,
  severity integer,
  description text,
  latitude double precision,
  longitude double precision,
  reporter text default 'Guest',
  created_at timestamptz default now()
);

-- Row Level Security (RLS) policies
-- The following policies allow anonymous users (the `anon` role) to
-- SELECT and INSERT rows for development/testing purposes. Use with
-- caution in production — restrict these policies as needed.

-- Enable RLS on the table
alter table public.reports enable row level security;

-- Allow anyone to select rows
create policy if not exists "anon_select" on public.reports
  for select
  using (true);

-- Allow anyone to insert rows (useful for anonymous reporting)
create policy if not exists "anon_insert" on public.reports
  for insert
  with check (true);

-- Optionally, add update/delete policies later (not enabled by default here)

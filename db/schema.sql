-- Supabase schema for Philippines Disaster Map
-- Run this in the Supabase SQL editor

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

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

-- Grant select/insert on public.reports to anon if using RLS/public access as needed
-- alter default privileges ... or configure RLS/policies in Supabase UI.

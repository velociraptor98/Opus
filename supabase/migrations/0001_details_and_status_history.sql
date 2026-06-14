-- High-impact feature support: richer application details, next-action dates,
-- and a status history table for funnel/time-in-stage analytics.
--
-- Run this in the Supabase SQL editor (or via `supabase db push` if you link
-- the project to the CLI). Everything is additive and safe to re-run.

-- 1. Extra detail columns on applications -----------------------------------

alter table public.applications add column if not exists location text;
alter table public.applications add column if not exists salary text;
alter table public.applications add column if not exists source text;
alter table public.applications add column if not exists contact text;
-- The next scheduled step (interview, deadline, call) and a short label for it.
alter table public.applications add column if not exists next_action_date date;
alter table public.applications add column if not exists next_action_note text;

-- 2. Status history -----------------------------------------------------------
-- One row per status transition. `from_status` is null for the initial status
-- recorded at creation/import time.

create table if not exists public.application_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  user_id uuid not null default auth.uid(),
  from_status text,
  to_status text not null,
  occurred_at timestamptz not null default now()
);

create index if not exists application_events_application_id_idx
  on public.application_events (application_id, occurred_at);

alter table public.application_events enable row level security;

-- Owner-only access, keyed on user_id like the applications table.
drop policy if exists "Users manage their own application events" on public.application_events;
create policy "Users manage their own application events"
  on public.application_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

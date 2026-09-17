-- Phase 3.0 additive migration for existing Consistency Tracker databases.
-- Run this in the Supabase SQL editor. Safe to re-run (IF NOT EXISTS / exception guards).
-- Do not run supabase/schema.sql against a live database that already has tables.

alter table public.tasks
  add column if not exists planned_start_time time,
  add column if not exists actual_start_time timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists status text not null default 'pending';

update public.tasks
  set status = 'done',
      completed_at = coalesce(completed_at, created_at)
  where done = true and status is distinct from 'done';

do $$
begin
  alter table public.tasks
    add constraint tasks_status_chk check (status in ('pending', 'started', 'done', 'missed'));
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.sync_task_done_status()
returns trigger
language plpgsql
as $$
begin
  if NEW.done and NEW.status is distinct from 'done' then
    NEW.status := 'done';
    NEW.completed_at := coalesce(NEW.completed_at, now());
  elsif NEW.status = 'done' and not NEW.done then
    NEW.done := true;
    NEW.completed_at := coalesce(NEW.completed_at, now());
  elsif (tg_op = 'UPDATE') then
    if (not NEW.done) and OLD.done and NEW.status is not distinct from OLD.status then
      NEW.status := 'pending';
      NEW.completed_at := null;
    elsif NEW.status is distinct from 'done' and OLD.status = 'done'
      and NEW.done is not distinct from OLD.done then
      NEW.done := false;
      if NEW.completed_at is not distinct from OLD.completed_at then
        NEW.completed_at := null;
      end if;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists tasks_sync_done_status on public.tasks;
create trigger tasks_sync_done_status
  before insert or update of done, status on public.tasks
  for each row execute procedure public.sync_task_done_status();

create table if not exists public.block_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked_apps text[] not null default '{}',
  blocked_domains text[] not null default array['facebook.com', 'youtube.com', 'm.facebook.com', 'm.youtube.com'],
  daily_window_start time,
  daily_window_end time,
  ringtone_uri text
);

create table if not exists public.block_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  reason_text text,
  created_at timestamptz not null default now(),
  constraint block_events_type_chk check (
    event_type in ('block_start', 'override_requested', 'override_granted', 'auto_relock')
  )
);
create index if not exists block_events_user_created_idx
  on public.block_events(user_id, created_at desc);

alter table public.block_config enable row level security;
alter table public.block_events enable row level security;

do $$
begin
  create policy "own block config" on public.block_config
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create policy "own block events" on public.block_events
    for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end;
$$;

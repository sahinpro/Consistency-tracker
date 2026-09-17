create extension if not exists "uuid-ossp";

-- `text` is the task title. `date` is the planned calendar day (Asia/Dhaka).
-- Phase 3 adds start/status columns; the web app still reads `done`.
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  text text not null,
  done boolean not null default false,
  position int not null default 0,
  planned_start_time time,
  actual_start_time timestamptz,
  completed_at timestamptz,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint tasks_status_chk check (status in ('pending', 'started', 'done', 'missed'))
);
create index tasks_user_date_idx on public.tasks(user_id, date);

create table public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  count int not null default 0,
  last_complete_date date
);

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_enabled boolean not null default false,
  reminder_dismissed_date date,
  notified_date date
);

create table public.push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.block_config (
  user_id uuid primary key references auth.users(id) on delete cascade,
  blocked_apps text[] not null default '{}',
  blocked_domains text[] not null default array['facebook.com', 'youtube.com', 'm.facebook.com', 'm.youtube.com'],
  daily_window_start time,
  daily_window_end time,
  ringtone_uri text
);

create table public.block_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  reason_text text,
  created_at timestamptz not null default now(),
  constraint block_events_type_chk check (
    event_type in ('block_start', 'override_requested', 'override_granted', 'auto_relock')
  )
);
create index block_events_user_created_idx on public.block_events(user_id, created_at desc);

-- Keep web `done` and Android `status` aligned.
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

create trigger tasks_sync_done_status
  before insert or update of done, status on public.tasks
  for each row execute procedure public.sync_task_done_status();

alter table public.tasks enable row level security;
alter table public.streaks enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.block_config enable row level security;
alter table public.block_events enable row level security;

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streak" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own push subs" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own block config" on public.block_config
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own block events" on public.block_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

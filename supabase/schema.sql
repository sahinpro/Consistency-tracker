create extension if not exists "uuid-ossp";

create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  text text not null,
  done boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
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

alter table public.tasks enable row level security;
alter table public.streaks enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_subscriptions enable row level security;

create policy "own tasks" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own streak" on public.streaks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own settings" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own push subs" on public.push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

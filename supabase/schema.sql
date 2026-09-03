-- Setunia database schema
-- Run this once in your Supabase project's SQL editor (Project > SQL Editor > New query).
-- Safe to re-run: uses "if not exists" / "on conflict" guards where practical.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'exercise_unit') then
    create type exercise_unit as enum ('weight', 'duration');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  name text not null,
  unit_type exercise_unit not null default 'weight',
  created_at timestamptz not null default now()
);

-- A global exercise name (owner_id is null) must be unique among global exercises;
-- a user's custom exercise name must be unique among that user's own exercises.
create unique index if not exists exercises_global_name_idx
  on public.exercises (name) where owner_id is null;
create unique index if not exists exercises_owner_name_idx
  on public.exercises (owner_id, name) where owner_id is not null;

create table if not exists public.personal_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id uuid not null references public.exercises (id) on delete cascade,
  weight_kg numeric(6, 2),
  reps int,
  duration_seconds int,
  is_max boolean not null default false,
  performed_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  constraint personal_records_has_a_value check (
    weight_kg is not null or duration_seconds is not null
  )
);

-- Guard for re-running this file against a project that already has the
-- table without this column.
alter table public.personal_records
  add column if not exists is_max boolean not null default false;

-- A single-rep entry is functionally a max attempt; backfill so existing
-- data keeps showing up as a Personal Best after the Max/Reps split.
update public.personal_records
  set is_max = true
  where is_max = false and (reps is null or reps = 1) and weight_kg is not null;

create index if not exists personal_records_user_exercise_idx
  on public.personal_records (user_id, exercise_id);

-- ---------------------------------------------------------------------------
-- Derived "personal best" per user + exercise
-- security_invoker makes the view respect the querying user's RLS instead of
-- the view owner's, which matters because Postgres views run as their owner
-- by default.
-- ---------------------------------------------------------------------------

create or replace view public.personal_bests
  with (security_invoker = true) as
select distinct on (user_id, exercise_id) *
from public.personal_records
where is_max = true or duration_seconds is not null
order by
  user_id,
  exercise_id,
  coalesce(weight_kg, 0) desc,
  coalesce(duration_seconds, 0) desc,
  coalesce(reps, 0) desc,
  performed_at desc;

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth user signs up
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.personal_records enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "exercises_select_global_or_own" on public.exercises;
create policy "exercises_select_global_or_own" on public.exercises
  for select using (owner_id is null or owner_id = auth.uid());

drop policy if exists "exercises_insert_own" on public.exercises;
create policy "exercises_insert_own" on public.exercises
  for insert with check (owner_id = auth.uid());

drop policy if exists "exercises_update_own" on public.exercises;
create policy "exercises_update_own" on public.exercises
  for update using (owner_id = auth.uid());

drop policy if exists "exercises_delete_own" on public.exercises;
create policy "exercises_delete_own" on public.exercises
  for delete using (owner_id = auth.uid());

drop policy if exists "personal_records_select_own" on public.personal_records;
create policy "personal_records_select_own" on public.personal_records
  for select using (auth.uid() = user_id);

drop policy if exists "personal_records_insert_own" on public.personal_records;
create policy "personal_records_insert_own" on public.personal_records
  for insert with check (auth.uid() = user_id);

drop policy if exists "personal_records_update_own" on public.personal_records;
create policy "personal_records_update_own" on public.personal_records
  for update using (auth.uid() = user_id);

drop policy if exists "personal_records_delete_own" on public.personal_records;
create policy "personal_records_delete_own" on public.personal_records
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Avatar storage bucket + policies
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar_owner_insert" on storage.objects;
create policy "avatar_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatar_owner_delete" on storage.objects;
create policy "avatar_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------------------------------------------------------------------------
-- Seed data: common gym exercises, available to every user
-- ---------------------------------------------------------------------------

insert into public.exercises (name, unit_type) values
  ('Bench Press', 'weight'),
  ('Incline Bench Press', 'weight'),
  ('Overhead Press', 'weight'),
  ('Squat', 'weight'),
  ('Front Squat', 'weight'),
  ('Deadlift', 'weight'),
  ('Romanian Deadlift', 'weight'),
  ('Barbell Row', 'weight'),
  ('Pull-up', 'weight'),
  ('Chin-up', 'weight'),
  ('Lat Pulldown', 'weight'),
  ('Seated Cable Row', 'weight'),
  ('Leg Press', 'weight'),
  ('Bulgarian Split Squat', 'weight'),
  ('Hip Thrust', 'weight'),
  ('Dumbbell Shoulder Press', 'weight'),
  ('Dumbbell Curl', 'weight'),
  ('Barbell Curl', 'weight'),
  ('Triceps Pushdown', 'weight'),
  ('Dip', 'weight'),
  ('Plank', 'duration'),
  ('Farmer''s Carry', 'duration')
on conflict (name) where owner_id is null do nothing;

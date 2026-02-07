-- ============================================================
-- Migration: Separate Account from Player/Team Ad
-- Run this in the Supabase SQL Editor AFTER the existing schema.
-- ============================================================

-- 1. New enum for experience level
create type public.experience_level as enum ('amateur', 'semi_pro', 'pro');

-- 2. Add bio column to profiles (account-level bio)
alter table public.profiles add column if not exists bio text;

-- 3. Create player_ads table
create table public.player_ads (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null unique references public.profiles(id) on delete cascade,
  positions        text[] default '{}',
  height_cm        integer,
  weight_kg        integer,
  date_of_birth    date,
  experience_level public.experience_level,
  experience_years integer default 0,
  previous_teams   text,
  highlights_url   text,
  ppg              numeric(4,1) default 0,
  apg              numeric(4,1) default 0,
  rpg              numeric(4,1) default 0,
  spg              numeric(4,1) default 0,
  bpg              numeric(4,1) default 0,
  three_pt_pct     numeric(4,1),
  looking_for      text,
  is_active        boolean default true,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index idx_player_ads_profile on public.player_ads(profile_id);
create index idx_player_ads_positions on public.player_ads using gin(positions);
create index idx_player_ads_active on public.player_ads(is_active) where is_active = true;

-- 4. Create team_ads table
create table public.team_ads (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null unique references public.profiles(id) on delete cascade,
  team_name        text,
  positions_needed text[] default '{}',
  league           text,
  league_tier      integer,
  division         text,
  description      text,
  what_we_offer    text,
  website          text,
  founded_year     integer,
  season_record    text,
  is_active        boolean default true,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index idx_team_ads_profile on public.team_ads(profile_id);
create index idx_team_ads_positions on public.team_ads using gin(positions_needed);
create index idx_team_ads_active on public.team_ads(is_active) where is_active = true;

-- 5. Apply updated_at triggers to new tables
create trigger set_updated_at before update on public.player_ads
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.team_ads
  for each row execute function public.handle_updated_at();

-- 6. Enable RLS on new tables
alter table public.player_ads enable row level security;
alter table public.team_ads enable row level security;

-- 7. RLS policies for player_ads
create policy "Active player ads are viewable by everyone"
  on public.player_ads for select
  using (is_active = true);

create policy "Owners can view their own player ad"
  on public.player_ads for select
  using (auth.uid() = profile_id);

create policy "Players can insert their own ad"
  on public.player_ads for insert
  with check (auth.uid() = profile_id);

create policy "Players can update their own ad"
  on public.player_ads for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Players can delete their own ad"
  on public.player_ads for delete
  using (auth.uid() = profile_id);

-- 8. RLS policies for team_ads
create policy "Active team ads are viewable by everyone"
  on public.team_ads for select
  using (is_active = true);

create policy "Owners can view their own team ad"
  on public.team_ads for select
  using (auth.uid() = profile_id);

create policy "Teams can insert their own ad"
  on public.team_ads for insert
  with check (auth.uid() = profile_id);

create policy "Teams can update their own ad"
  on public.team_ads for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

create policy "Teams can delete their own ad"
  on public.team_ads for delete
  using (auth.uid() = profile_id);

-- 9. Data migration: Copy player_profiles → player_ads
insert into public.player_ads (
  profile_id, positions, height_cm, weight_kg, date_of_birth,
  experience_years, highlights_url, ppg, apg, rpg, spg, bpg,
  looking_for, created_at, updated_at
)
select
  pp.id,
  case when pp.position is not null then array[pp.position::text] else '{}' end,
  pp.height_cm, pp.weight_kg, pp.date_of_birth,
  pp.experience_years, pp.highlights_url,
  pp.ppg, pp.apg, pp.rpg, pp.spg, pp.bpg,
  pp.looking_for, pp.created_at, pp.updated_at
from public.player_profiles pp
on conflict (profile_id) do nothing;

-- 10. Copy player_profiles.bio → profiles.bio
update public.profiles p
set bio = pp.bio
from public.player_profiles pp
where p.id = pp.id and pp.bio is not null and p.bio is null;

-- 11. Data migration: Copy team_profiles → team_ads (aggregate positions from team_positions)
insert into public.team_ads (
  profile_id, team_name, positions_needed, league, league_tier,
  description, website, founded_year, created_at, updated_at
)
select
  tp.id,
  tp.team_name,
  coalesce(
    (select array_agg(distinct tpos.position::text)
     from public.team_positions tpos
     where tpos.team_id = tp.id and tpos.is_open = true),
    '{}'
  ),
  tp.league, tp.league_tier,
  tp.description, tp.website, tp.founded_year,
  tp.created_at, tp.updated_at
from public.team_profiles tp
on conflict (profile_id) do nothing;

-- 12. Create avatars storage bucket (run manually if needed, or via Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- NOTE: Old tables (player_profiles, team_profiles, team_positions) are kept temporarily.
-- Drop them only after verifying the new code works correctly.

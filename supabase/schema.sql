-- ============================================================
-- Picked Database Schema
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

create type public.user_role as enum ('player', 'team');

create type public.player_position as enum (
  'point_guard',
  'shooting_guard',
  'small_forward',
  'power_forward',
  'center'
);

create type public.invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'cancelled'
);

create type public.boost_type as enum ('basic', 'premium');

-- ============================================================
-- 2. PROFILES (base table, 1:1 with auth.users)
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null,
  full_name   text,
  avatar_url  text,
  country     text,
  city        text,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index idx_profiles_role on public.profiles(role);
create index idx_profiles_country on public.profiles(country);

-- ============================================================
-- 3. PLAYER PROFILES
-- ============================================================

create table public.player_profiles (
  id               uuid primary key references public.profiles(id) on delete cascade,
  position         public.player_position,
  height_cm        integer,
  weight_kg        integer,
  date_of_birth    date,
  experience_years integer default 0,
  bio              text,
  highlights_url   text,
  ppg              numeric(4,1) default 0,
  apg              numeric(4,1) default 0,
  rpg              numeric(4,1) default 0,
  spg              numeric(4,1) default 0,
  bpg              numeric(4,1) default 0,
  looking_for      text,
  created_at       timestamptz default now() not null,
  updated_at       timestamptz default now() not null
);

create index idx_player_position on public.player_profiles(position);

-- ============================================================
-- 4. TEAM PROFILES
-- ============================================================

create table public.team_profiles (
  id           uuid primary key references public.profiles(id) on delete cascade,
  team_name    text not null,
  league       text,
  league_tier  integer,
  description  text,
  website      text,
  founded_year integer,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index idx_team_league on public.team_profiles(league);

-- ============================================================
-- 5. TEAM OPEN POSITIONS
-- ============================================================

create table public.team_positions (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.team_profiles(id) on delete cascade,
  position    public.player_position not null,
  title       text,
  description text,
  salary_min  integer,
  salary_max  integer,
  currency    text default 'EUR',
  is_open     boolean default true,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index idx_team_positions_team on public.team_positions(team_id);
create index idx_team_positions_open on public.team_positions(position, is_open)
  where is_open = true;

-- ============================================================
-- 6. CONVERSATIONS & MESSAGES
-- ============================================================

create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  joined_at       timestamptz default now() not null,
  primary key (conversation_id, profile_id)
);

create index idx_conv_participants_profile on public.conversation_participants(profile_id);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references public.profiles(id) on delete cascade,
  content         text not null,
  read_at         timestamptz,
  created_at      timestamptz default now() not null
);

create index idx_messages_conversation on public.messages(conversation_id, created_at);

-- ============================================================
-- 7. TRYOUT INVITATIONS
-- ============================================================

create table public.tryout_invitations (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.team_profiles(id) on delete cascade,
  player_id   uuid not null references public.player_profiles(id) on delete cascade,
  tryout_date date,
  location    text,
  message     text,
  status      public.invitation_status default 'pending' not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index idx_invitations_player on public.tryout_invitations(player_id);
create index idx_invitations_team on public.tryout_invitations(team_id);

-- ============================================================
-- 8. BOOSTS
-- ============================================================

create table public.boosts (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  boost_type public.boost_type default 'basic' not null,
  starts_at  timestamptz default now() not null,
  ends_at    timestamptz not null,
  is_active  boolean default true,
  created_at timestamptz default now() not null
);

create index idx_boosts_active on public.boosts(profile_id, is_active)
  where is_active = true;

-- ============================================================
-- 9. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.player_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.team_profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.team_positions
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.tryout_invitations
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 10. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'player'
    ),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 11. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.player_profiles enable row level security;
alter table public.team_profiles enable row level security;
alter table public.team_positions enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.tryout_invitations enable row level security;
alter table public.boosts enable row level security;

-- ----------------------------------------------------------
-- PROFILES
-- ----------------------------------------------------------
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ----------------------------------------------------------
-- PLAYER PROFILES
-- ----------------------------------------------------------
create policy "Player profiles are viewable by everyone"
  on public.player_profiles for select
  using (true);

create policy "Players can insert their own profile"
  on public.player_profiles for insert
  with check (auth.uid() = id);

create policy "Players can update their own profile"
  on public.player_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Players can delete their own profile"
  on public.player_profiles for delete
  using (auth.uid() = id);

-- ----------------------------------------------------------
-- TEAM PROFILES
-- ----------------------------------------------------------
create policy "Team profiles are viewable by everyone"
  on public.team_profiles for select
  using (true);

create policy "Teams can insert their own profile"
  on public.team_profiles for insert
  with check (auth.uid() = id);

create policy "Teams can update their own profile"
  on public.team_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Teams can delete their own profile"
  on public.team_profiles for delete
  using (auth.uid() = id);

-- ----------------------------------------------------------
-- TEAM POSITIONS
-- ----------------------------------------------------------
create policy "Team positions are viewable by everyone"
  on public.team_positions for select
  using (true);

create policy "Teams can manage their own positions"
  on public.team_positions for insert
  with check (auth.uid() = team_id);

create policy "Teams can update their own positions"
  on public.team_positions for update
  using (auth.uid() = team_id)
  with check (auth.uid() = team_id);

create policy "Teams can delete their own positions"
  on public.team_positions for delete
  using (auth.uid() = team_id);

-- ----------------------------------------------------------
-- CONVERSATIONS
-- ----------------------------------------------------------
create policy "Participants can view their conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = id
      and profile_id = auth.uid()
    )
  );

create policy "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------
-- CONVERSATION PARTICIPANTS
-- ----------------------------------------------------------
create policy "Participants can view conversation members"
  on public.conversation_participants for select
  using (
    exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = conversation_participants.conversation_id
      and cp.profile_id = auth.uid()
    )
  );

create policy "Authenticated users can add participants"
  on public.conversation_participants for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------
-- MESSAGES
-- ----------------------------------------------------------
create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id
      and profile_id = auth.uid()
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id
      and profile_id = auth.uid()
    )
  );

create policy "Senders can update their messages"
  on public.messages for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

-- ----------------------------------------------------------
-- TRYOUT INVITATIONS
-- ----------------------------------------------------------
create policy "Teams can view their sent invitations"
  on public.tryout_invitations for select
  using (auth.uid() = team_id);

create policy "Players can view their received invitations"
  on public.tryout_invitations for select
  using (auth.uid() = player_id);

create policy "Teams can create invitations"
  on public.tryout_invitations for insert
  with check (auth.uid() = team_id);

create policy "Teams can update their invitations"
  on public.tryout_invitations for update
  using (auth.uid() = team_id)
  with check (auth.uid() = team_id);

create policy "Players can respond to invitations"
  on public.tryout_invitations for update
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);

-- ----------------------------------------------------------
-- BOOSTS
-- ----------------------------------------------------------
create policy "Active boosts are viewable by everyone"
  on public.boosts for select
  using (is_active = true);

create policy "Users can view their own boosts"
  on public.boosts for select
  using (auth.uid() = profile_id);

create policy "Users can create their own boosts"
  on public.boosts for insert
  with check (auth.uid() = profile_id);

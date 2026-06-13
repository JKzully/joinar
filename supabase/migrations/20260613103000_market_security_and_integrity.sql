-- Lock authorization and market integrity at the database boundary.

-- Normalize legacy position abbreviations before enforcing canonical values.
update public.player_ads
set positions = (
  select coalesce(array_agg(
    case position
      when 'PG' then 'point_guard'
      when 'SG' then 'shooting_guard'
      when 'SF' then 'small_forward'
      when 'PF' then 'power_forward'
      when 'C' then 'center'
      else position
    end
  ), '{}')
  from unnest(positions) as position
);

update public.team_ads
set positions_needed = (
  select coalesce(array_agg(
    case position
      when 'PG' then 'point_guard'
      when 'SG' then 'shooting_guard'
      when 'SF' then 'small_forward'
      when 'PF' then 'power_forward'
      when 'C' then 'center'
      else position
    end
  ), '{}')
  from unnest(positions_needed) as position
);

create or replace function private.normalize_player_ad_positions()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.positions := array(
    select distinct case position
      when 'PG' then 'point_guard'
      when 'SG' then 'shooting_guard'
      when 'SF' then 'small_forward'
      when 'PF' then 'power_forward'
      when 'C' then 'center'
      else position
    end
    from unnest(coalesce(new.positions, '{}')) as position
  );
  return new;
end;
$$;

drop trigger if exists normalize_player_ad_positions on public.player_ads;
create trigger normalize_player_ad_positions
  before insert or update of positions on public.player_ads
  for each row execute function private.normalize_player_ad_positions();

create or replace function private.normalize_team_ad_positions()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.positions_needed := array(
    select distinct case position
      when 'PG' then 'point_guard'
      when 'SG' then 'shooting_guard'
      when 'SF' then 'small_forward'
      when 'PF' then 'power_forward'
      when 'C' then 'center'
      else position
    end
    from unnest(coalesce(new.positions_needed, '{}')) as position
  );
  return new;
end;
$$;

drop trigger if exists normalize_team_ad_positions on public.team_ads;
create trigger normalize_team_ad_positions
  before insert or update of positions_needed on public.team_ads
  for each row execute function private.normalize_team_ad_positions();

alter table public.player_ads
  add constraint player_ads_positions_valid
  check (
    positions <@ array[
      'point_guard',
      'shooting_guard',
      'small_forward',
      'power_forward',
      'center'
    ]::text[]
  ) not valid;

alter table public.team_ads
  add constraint team_ads_positions_valid
  check (
    positions_needed <@ array[
      'point_guard',
      'shooting_guard',
      'small_forward',
      'power_forward',
      'center'
    ]::text[]
  ) not valid;

-- Draft profiles stay private. Owners can always read their own profile.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Owners and active market profiles are viewable"
  on public.profiles for select
  using (
    (select auth.uid()) = id
    or exists (
      select 1
      from public.player_ads
      where player_ads.profile_id = profiles.id
        and player_ads.is_active = true
    )
    or exists (
      select 1
      from public.team_ads
      where team_ads.profile_id = profiles.id
        and team_ads.is_active = true
    )
  );

-- Users may edit public profile fields, but never their authorization role.
revoke update on public.profiles from authenticated, anon;
grant update (
  full_name,
  avatar_url,
  country,
  city,
  bio,
  onboarding_completed
) on public.profiles to authenticated;

drop policy if exists "Players can insert their own ad" on public.player_ads;
create policy "Players can insert their own ad"
  on public.player_ads for insert
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'player'
    )
  );

drop policy if exists "Players can update their own ad" on public.player_ads;
create policy "Players can update their own ad"
  on public.player_ads for update
  using ((select auth.uid()) = profile_id)
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'player'
    )
  );

drop policy if exists "Teams can insert their own ad" on public.team_ads;
create policy "Teams can insert their own ad"
  on public.team_ads for insert
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'team'
    )
  );

drop policy if exists "Teams can update their own ad" on public.team_ads;
create policy "Teams can update their own ad"
  on public.team_ads for update
  using ((select auth.uid()) = profile_id)
  with check (
    (select auth.uid()) = profile_id
    and exists (
      select 1 from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'team'
    )
  );

-- Invitation state changes only happen through narrow RPCs.
drop policy if exists "Teams can update their invitations" on public.tryout_invitations;
drop policy if exists "Players can respond to invitations" on public.tryout_invitations;
revoke update on public.tryout_invitations from authenticated, anon;

with ranked_pending as (
  select
    id,
    row_number() over (
      partition by team_id, player_id
      order by created_at desc, id desc
    ) as row_number
  from public.tryout_invitations
  where status = 'pending'
)
update public.tryout_invitations
set status = 'cancelled'
where id in (
  select id from ranked_pending where row_number > 1
);

create unique index if not exists idx_one_pending_invitation_per_pair
  on public.tryout_invitations(team_id, player_id)
  where status = 'pending';

create or replace function public.respond_to_tryout_invitation(
  invitation_id uuid,
  response public.invitation_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if response not in ('accepted', 'declined') then
    raise exception 'Invalid invitation response';
  end if;

  update public.tryout_invitations
  set status = response
  where id = invitation_id
    and player_id = (select auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'Invitation not found or already answered';
  end if;
end;
$$;

revoke execute on function public.respond_to_tryout_invitation(uuid, public.invitation_status)
  from public, anon;
grant execute on function public.respond_to_tryout_invitation(uuid, public.invitation_status)
  to authenticated;

create or replace function public.cancel_tryout_invitation(invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.tryout_invitations
  set status = 'cancelled'
  where id = invitation_id
    and team_id = (select auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'Invitation not found or already closed';
  end if;
end;
$$;

revoke execute on function public.cancel_tryout_invitation(uuid) from public, anon;
grant execute on function public.cancel_tryout_invitation(uuid) to authenticated;

-- Bound user-controlled text at the database edge.
alter table public.profiles
  add constraint profiles_full_name_length check (char_length(full_name) <= 120) not valid,
  add constraint profiles_bio_length check (char_length(bio) <= 1200) not valid;

alter table public.player_ads
  add constraint player_ads_previous_teams_length check (char_length(previous_teams) <= 1200) not valid,
  add constraint player_ads_looking_for_length check (char_length(looking_for) <= 1200) not valid;

alter table public.team_ads
  add constraint team_ads_description_length check (char_length(description) <= 2000) not valid,
  add constraint team_ads_offer_length check (char_length(what_we_offer) <= 2000) not valid;

alter table public.messages
  add constraint messages_content_length
  check (char_length(content) between 1 and 4000) not valid;

alter table public.tryout_invitations
  add constraint invitations_location_length check (char_length(location) <= 240) not valid,
  add constraint invitations_message_length check (char_length(message) <= 2000) not valid;

-- Serialize creation for a pair so concurrent requests cannot create duplicates.
create or replace function public.start_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  conv uuid;
  pair_key text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  if other_profile_id = auth.uid() then
    raise exception 'Cannot message yourself';
  end if;
  if not exists (select 1 from public.profiles where id = other_profile_id) then
    raise exception 'Profile not found';
  end if;

  pair_key := least(auth.uid()::text, other_profile_id::text)
    || ':' ||
    greatest(auth.uid()::text, other_profile_id::text);
  perform pg_advisory_xact_lock(hashtextextended(pair_key, 0));

  select cp1.conversation_id into conv
  from public.conversation_participants cp1
  join public.conversation_participants cp2
    on cp1.conversation_id = cp2.conversation_id
  where cp1.profile_id = auth.uid()
    and cp2.profile_id = other_profile_id
  limit 1;

  if conv is not null then
    return conv;
  end if;

  insert into public.conversations default values returning id into conv;
  insert into public.conversation_participants (conversation_id, profile_id)
  values (conv, auth.uid()), (conv, other_profile_id);
  return conv;
end;
$$;

revoke execute on function public.start_conversation(uuid) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;

-- Reproducible avatar storage. Public delivery is intentional; write access is owner-only.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'Avatars',
  'Avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload their own avatar" on storage.objects;
create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own avatar" on storage.objects;
create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own avatar" on storage.objects;
create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'Avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

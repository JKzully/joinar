-- ============================================================
-- Security hardening
-- 1. Non-recursive, security-definer participant check
-- 2. Conversation creation moves into an RPC; remove the policy
--    that let any user add anyone to any conversation
-- 3. Read receipts: participants may update read_at only
-- 4. Tryout invitations: only team accounts may invite players
-- ============================================================

create schema if not exists private;

-- ------------------------------------------------------------
-- 1. Participant check (security definer avoids RLS recursion
--    on conversation_participants referencing itself)
-- ------------------------------------------------------------
create or replace function private.is_conversation_participant(conv_id uuid, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = conv_id and profile_id = uid
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.is_conversation_participant(uuid, uuid) to authenticated;

-- ------------------------------------------------------------
-- 2. Conversations: creation only via RPC
-- ------------------------------------------------------------
create or replace function public.start_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  conv uuid;
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

drop policy if exists "Authenticated users can create conversations" on public.conversations;
drop policy if exists "Authenticated users can add participants" on public.conversation_participants;

drop policy if exists "Participants can view their conversations" on public.conversations;
create policy "Participants can view their conversations"
  on public.conversations for select
  using (private.is_conversation_participant(id, auth.uid()));

drop policy if exists "Participants can view conversation members" on public.conversation_participants;
create policy "Participants can view conversation members"
  on public.conversation_participants for select
  using (private.is_conversation_participant(conversation_id, auth.uid()));

-- ------------------------------------------------------------
-- 3. Messages: rewrite policies on top of the helper, and allow
--    participants to set read_at (column-restricted via grants)
-- ------------------------------------------------------------
drop policy if exists "Participants can view messages" on public.messages;
create policy "Participants can view messages"
  on public.messages for select
  using (private.is_conversation_participant(conversation_id, auth.uid()));

drop policy if exists "Participants can send messages" on public.messages;
create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and private.is_conversation_participant(conversation_id, auth.uid())
  );

drop policy if exists "Senders can update their messages" on public.messages;
create policy "Participants can mark messages read"
  on public.messages for update
  using (private.is_conversation_participant(conversation_id, auth.uid()))
  with check (private.is_conversation_participant(conversation_id, auth.uid()));

-- Message content is immutable after send; only read_at is writable
revoke update on public.messages from authenticated, anon;
grant update (read_at) on public.messages to authenticated;

-- ------------------------------------------------------------
-- 4. Tryout invitations: enforce roles at the database level
-- ------------------------------------------------------------
drop policy if exists "Teams can create invitations" on public.tryout_invitations;
create policy "Teams can create invitations"
  on public.tryout_invitations for insert
  with check (
    auth.uid() = team_id
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'team'
    )
    and exists (
      select 1 from public.profiles
      where id = player_id and role = 'player'
    )
  );

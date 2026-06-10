-- ============================================================
-- Picked — Update existing seed profiles with avatar_url
-- Run this in the Supabase SQL Editor if you already have
-- seed data and just need to add the stock photo references.
-- ============================================================

-- Players (12 of 30)
UPDATE public.profiles SET avatar_url = '/seed/players/p01.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE public.profiles SET avatar_url = '/seed/players/p02.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000002';
UPDATE public.profiles SET avatar_url = '/seed/players/p03.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000003';
UPDATE public.profiles SET avatar_url = '/seed/players/p04.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000004';
UPDATE public.profiles SET avatar_url = '/seed/players/p05.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000006';
UPDATE public.profiles SET avatar_url = '/seed/players/p06.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000008';
UPDATE public.profiles SET avatar_url = '/seed/players/p07.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000010';
UPDATE public.profiles SET avatar_url = '/seed/players/p08.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000015';
UPDATE public.profiles SET avatar_url = '/seed/players/p09.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000021';
UPDATE public.profiles SET avatar_url = '/seed/players/p10.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000022';
UPDATE public.profiles SET avatar_url = '/seed/players/p11.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000026';
UPDATE public.profiles SET avatar_url = '/seed/players/p12.jpg' WHERE id = 'a0000001-0000-0000-0000-000000000029';

-- Teams (4 of 10)
UPDATE public.profiles SET avatar_url = '/seed/teams/t01.jpg' WHERE id = 'b0000001-0000-0000-0000-000000000001';
UPDATE public.profiles SET avatar_url = '/seed/teams/t02.jpg' WHERE id = 'b0000001-0000-0000-0000-000000000002';
UPDATE public.profiles SET avatar_url = '/seed/teams/t03.jpg' WHERE id = 'b0000001-0000-0000-0000-000000000003';
UPDATE public.profiles SET avatar_url = '/seed/teams/t04.jpg' WHERE id = 'b0000001-0000-0000-0000-000000000004';

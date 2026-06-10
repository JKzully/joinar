-- ============================================================
-- Picked — Seed Data
-- Run this in the Supabase SQL Editor to populate the database
-- with 30 player profiles and 10 team profiles.
-- ============================================================

-- 1. Add is_seed column for easy cleanup
ALTER TABLE public.profiles    ADD COLUMN IF NOT EXISTS is_seed boolean DEFAULT false;
ALTER TABLE public.player_ads  ADD COLUMN IF NOT EXISTS is_seed boolean DEFAULT false;
ALTER TABLE public.team_ads    ADD COLUMN IF NOT EXISTS is_seed boolean DEFAULT false;

-- 2. Seed data
DO $$
DECLARE
  -- Shared password for all seed accounts
  hashed_pw text := crypt('SeedPass123!', gen_salt('bf'));
  now_ts    timestamptz := now();

  -- Player UUIDs (30)
  p01 uuid := 'a0000001-0000-0000-0000-000000000001';
  p02 uuid := 'a0000001-0000-0000-0000-000000000002';
  p03 uuid := 'a0000001-0000-0000-0000-000000000003';
  p04 uuid := 'a0000001-0000-0000-0000-000000000004';
  p05 uuid := 'a0000001-0000-0000-0000-000000000005';
  p06 uuid := 'a0000001-0000-0000-0000-000000000006';
  p07 uuid := 'a0000001-0000-0000-0000-000000000007';
  p08 uuid := 'a0000001-0000-0000-0000-000000000008';
  p09 uuid := 'a0000001-0000-0000-0000-000000000009';
  p10 uuid := 'a0000001-0000-0000-0000-000000000010';
  p11 uuid := 'a0000001-0000-0000-0000-000000000011';
  p12 uuid := 'a0000001-0000-0000-0000-000000000012';
  p13 uuid := 'a0000001-0000-0000-0000-000000000013';
  p14 uuid := 'a0000001-0000-0000-0000-000000000014';
  p15 uuid := 'a0000001-0000-0000-0000-000000000015';
  p16 uuid := 'a0000001-0000-0000-0000-000000000016';
  p17 uuid := 'a0000001-0000-0000-0000-000000000017';
  p18 uuid := 'a0000001-0000-0000-0000-000000000018';
  p19 uuid := 'a0000001-0000-0000-0000-000000000019';
  p20 uuid := 'a0000001-0000-0000-0000-000000000020';
  p21 uuid := 'a0000001-0000-0000-0000-000000000021';
  p22 uuid := 'a0000001-0000-0000-0000-000000000022';
  p23 uuid := 'a0000001-0000-0000-0000-000000000023';
  p24 uuid := 'a0000001-0000-0000-0000-000000000024';
  p25 uuid := 'a0000001-0000-0000-0000-000000000025';
  p26 uuid := 'a0000001-0000-0000-0000-000000000026';
  p27 uuid := 'a0000001-0000-0000-0000-000000000027';
  p28 uuid := 'a0000001-0000-0000-0000-000000000028';
  p29 uuid := 'a0000001-0000-0000-0000-000000000029';
  p30 uuid := 'a0000001-0000-0000-0000-000000000030';

  -- Team UUIDs (10)
  t01 uuid := 'b0000001-0000-0000-0000-000000000001';
  t02 uuid := 'b0000001-0000-0000-0000-000000000002';
  t03 uuid := 'b0000001-0000-0000-0000-000000000003';
  t04 uuid := 'b0000001-0000-0000-0000-000000000004';
  t05 uuid := 'b0000001-0000-0000-0000-000000000005';
  t06 uuid := 'b0000001-0000-0000-0000-000000000006';
  t07 uuid := 'b0000001-0000-0000-0000-000000000007';
  t08 uuid := 'b0000001-0000-0000-0000-000000000008';
  t09 uuid := 'b0000001-0000-0000-0000-000000000009';
  t10 uuid := 'b0000001-0000-0000-0000-000000000010';

BEGIN

  -- ============================================================
  -- INSERT auth.users (40 accounts)
  -- The on_auth_user_created trigger auto-creates profiles rows
  -- ============================================================

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
    -- === PLAYERS (30) ===
    ('00000000-0000-0000-0000-000000000000', p01, 'authenticated', 'authenticated', 'seed.player01@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Nikola Petrović"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p02, 'authenticated', 'authenticated', 'seed.player02@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Alejandro García"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p03, 'authenticated', 'authenticated', 'seed.player03@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Mikko Virtanen"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p04, 'authenticated', 'authenticated', 'seed.player04@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Kasper Andersen"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p05, 'authenticated', 'authenticated', 'seed.player05@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Bjarki Sigurdsson"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p06, 'authenticated', 'authenticated', 'seed.player06@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Lukas Müller"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p07, 'authenticated', 'authenticated', 'seed.player07@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Antoine Dubois"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p08, 'authenticated', 'authenticated', 'seed.player08@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Marco Rossetti"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p09, 'authenticated', 'authenticated', 'seed.player09@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Dimitris Papadopoulos"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p10, 'authenticated', 'authenticated', 'seed.player10@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Mantas Kazlauskas"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p11, 'authenticated', 'authenticated', 'seed.player11@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Erik Lindqvist"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p12, 'authenticated', 'authenticated', 'seed.player12@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Håkon Berg"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p13, 'authenticated', 'authenticated', 'seed.player13@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Ivan Horvat"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p14, 'authenticated', 'authenticated', 'seed.player14@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Luka Zupančič"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p15, 'authenticated', 'authenticated', 'seed.player15@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Stefan Jovanović"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p16, 'authenticated', 'authenticated', 'seed.player16@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Pablo Fernández"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p17, 'authenticated', 'authenticated', 'seed.player17@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Joonas Heikkinen"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p18, 'authenticated', 'authenticated', 'seed.player18@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Moritz Weber"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p19, 'authenticated', 'authenticated', 'seed.player19@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Giorgos Nikolaou"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p20, 'authenticated', 'authenticated', 'seed.player20@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Domantas Valančiūnas"}', now_ts, now_ts, '', '', '', ''),
    -- Female players (10)
    ('00000000-0000-0000-0000-000000000000', p21, 'authenticated', 'authenticated', 'seed.player21@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Milica Todorović"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p22, 'authenticated', 'authenticated', 'seed.player22@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"María López"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p23, 'authenticated', 'authenticated', 'seed.player23@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Silja Korhonen"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p24, 'authenticated', 'authenticated', 'seed.player24@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Freya Nielsen"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p25, 'authenticated', 'authenticated', 'seed.player25@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Katrin Schneider"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p26, 'authenticated', 'authenticated', 'seed.player26@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Chloé Martin"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p27, 'authenticated', 'authenticated', 'seed.player27@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Giulia Bianchi"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p28, 'authenticated', 'authenticated', 'seed.player28@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Elena Papadaki"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p29, 'authenticated', 'authenticated', 'seed.player29@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Asta Johansson"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', p30, 'authenticated', 'authenticated', 'seed.player30@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"player","full_name":"Ana Kovačević"}', now_ts, now_ts, '', '', '', ''),
    -- === TEAMS (10) ===
    ('00000000-0000-0000-0000-000000000000', t01, 'authenticated', 'authenticated', 'seed.team01@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Belgrade Wolves BC"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t02, 'authenticated', 'authenticated', 'seed.team02@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Barcelona Flames"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t03, 'authenticated', 'authenticated', 'seed.team03@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Helsinki Frost"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t04, 'authenticated', 'authenticated', 'seed.team04@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Copenhagen Kings"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t05, 'authenticated', 'authenticated', 'seed.team05@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"München Thunder"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t06, 'authenticated', 'authenticated', 'seed.team06@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Lyon Vipers"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t07, 'authenticated', 'authenticated', 'seed.team07@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Athens Eagles BC"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t08, 'authenticated', 'authenticated', 'seed.team08@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Kaunas Storm"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t09, 'authenticated', 'authenticated', 'seed.team09@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Zagreb Falcons"}', now_ts, now_ts, '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', t10, 'authenticated', 'authenticated', 'seed.team10@getpicked.co', hashed_pw, now_ts, '{"provider":"email","providers":["email"]}', '{"role":"team","full_name":"Ljubljana Dragons"}', now_ts, now_ts, '', '', '', '');

  -- ============================================================
  -- INSERT auth.identities (required for fully formed accounts)
  -- ============================================================

  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) VALUES
    (gen_random_uuid(), p01, p01::text, jsonb_build_object('sub', p01::text, 'email', 'seed.player01@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p02, p02::text, jsonb_build_object('sub', p02::text, 'email', 'seed.player02@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p03, p03::text, jsonb_build_object('sub', p03::text, 'email', 'seed.player03@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p04, p04::text, jsonb_build_object('sub', p04::text, 'email', 'seed.player04@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p05, p05::text, jsonb_build_object('sub', p05::text, 'email', 'seed.player05@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p06, p06::text, jsonb_build_object('sub', p06::text, 'email', 'seed.player06@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p07, p07::text, jsonb_build_object('sub', p07::text, 'email', 'seed.player07@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p08, p08::text, jsonb_build_object('sub', p08::text, 'email', 'seed.player08@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p09, p09::text, jsonb_build_object('sub', p09::text, 'email', 'seed.player09@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p10, p10::text, jsonb_build_object('sub', p10::text, 'email', 'seed.player10@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p11, p11::text, jsonb_build_object('sub', p11::text, 'email', 'seed.player11@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p12, p12::text, jsonb_build_object('sub', p12::text, 'email', 'seed.player12@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p13, p13::text, jsonb_build_object('sub', p13::text, 'email', 'seed.player13@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p14, p14::text, jsonb_build_object('sub', p14::text, 'email', 'seed.player14@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p15, p15::text, jsonb_build_object('sub', p15::text, 'email', 'seed.player15@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p16, p16::text, jsonb_build_object('sub', p16::text, 'email', 'seed.player16@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p17, p17::text, jsonb_build_object('sub', p17::text, 'email', 'seed.player17@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p18, p18::text, jsonb_build_object('sub', p18::text, 'email', 'seed.player18@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p19, p19::text, jsonb_build_object('sub', p19::text, 'email', 'seed.player19@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p20, p20::text, jsonb_build_object('sub', p20::text, 'email', 'seed.player20@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p21, p21::text, jsonb_build_object('sub', p21::text, 'email', 'seed.player21@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p22, p22::text, jsonb_build_object('sub', p22::text, 'email', 'seed.player22@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p23, p23::text, jsonb_build_object('sub', p23::text, 'email', 'seed.player23@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p24, p24::text, jsonb_build_object('sub', p24::text, 'email', 'seed.player24@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p25, p25::text, jsonb_build_object('sub', p25::text, 'email', 'seed.player25@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p26, p26::text, jsonb_build_object('sub', p26::text, 'email', 'seed.player26@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p27, p27::text, jsonb_build_object('sub', p27::text, 'email', 'seed.player27@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p28, p28::text, jsonb_build_object('sub', p28::text, 'email', 'seed.player28@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p29, p29::text, jsonb_build_object('sub', p29::text, 'email', 'seed.player29@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), p30, p30::text, jsonb_build_object('sub', p30::text, 'email', 'seed.player30@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t01, t01::text, jsonb_build_object('sub', t01::text, 'email', 'seed.team01@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t02, t02::text, jsonb_build_object('sub', t02::text, 'email', 'seed.team02@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t03, t03::text, jsonb_build_object('sub', t03::text, 'email', 'seed.team03@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t04, t04::text, jsonb_build_object('sub', t04::text, 'email', 'seed.team04@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t05, t05::text, jsonb_build_object('sub', t05::text, 'email', 'seed.team05@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t06, t06::text, jsonb_build_object('sub', t06::text, 'email', 'seed.team06@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t07, t07::text, jsonb_build_object('sub', t07::text, 'email', 'seed.team07@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t08, t08::text, jsonb_build_object('sub', t08::text, 'email', 'seed.team08@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t09, t09::text, jsonb_build_object('sub', t09::text, 'email', 'seed.team09@getpicked.co'), 'email', now_ts, now_ts, now_ts),
    (gen_random_uuid(), t10, t10::text, jsonb_build_object('sub', t10::text, 'email', 'seed.team10@getpicked.co'), 'email', now_ts, now_ts, now_ts);

  -- ============================================================
  -- UPDATE profiles (trigger created them, now add details)
  -- ============================================================

  -- Players
  UPDATE public.profiles SET country = 'Serbia',    city = 'Belgrade',    bio = 'Playmaker with court vision and competitive fire. Led my academy team to two national finals.', avatar_url = '/seed/players/p01.jpg', is_seed = true WHERE id = p01;
  UPDATE public.profiles SET country = 'Spain',      city = 'Madrid',      bio = 'Quick guard who loves the fast break. Three years in the Spanish regional league.', avatar_url = '/seed/players/p02.jpg', is_seed = true WHERE id = p02;
  UPDATE public.profiles SET country = 'Finland',    city = 'Helsinki',    bio = 'Physical wing player. Strong in transition and half-court defense.', avatar_url = '/seed/players/p03.jpg', is_seed = true WHERE id = p03;
  UPDATE public.profiles SET country = 'Denmark',    city = 'Copenhagen',  bio = 'Versatile forward comfortable playing the 3 or 4. Good rebounder and passer.', avatar_url = '/seed/players/p04.jpg', is_seed = true WHERE id = p04;
  UPDATE public.profiles SET country = 'Iceland',    city = 'Reykjavik',   bio = 'Hard-nosed defender who brings energy every night. Looking to play abroad.', is_seed = true WHERE id = p05;
  UPDATE public.profiles SET country = 'Germany',    city = 'Berlin',      bio = 'Stretch four with a reliable three-point shot. Two seasons in the Regionalliga.', avatar_url = '/seed/players/p05.jpg', is_seed = true WHERE id = p06;
  UPDATE public.profiles SET country = 'France',     city = 'Lyon',        bio = 'Crafty point guard with high basketball IQ. Experienced in NM1 level play.', is_seed = true WHERE id = p07;
  UPDATE public.profiles SET country = 'Italy',      city = 'Milan',       bio = 'Athletic wing who can score at all three levels. Former Serie B youth team.', avatar_url = '/seed/players/p06.jpg', is_seed = true WHERE id = p08;
  UPDATE public.profiles SET country = 'Greece',     city = 'Athens',      bio = 'Traditional big man with post moves and shot-blocking ability.', is_seed = true WHERE id = p09;
  UPDATE public.profiles SET country = 'Lithuania',  city = 'Kaunas',      bio = 'Skilled combo guard with deep range. Trained at a top Lithuanian academy.', avatar_url = '/seed/players/p07.jpg', is_seed = true WHERE id = p10;
  UPDATE public.profiles SET country = 'Sweden',     city = 'Gothenburg',  bio = 'Lengthy forward who defends multiple positions. Captain of my club team.', is_seed = true WHERE id = p11;
  UPDATE public.profiles SET country = 'Norway',     city = 'Oslo',        bio = 'Scoring guard with a quick release. Looking for a competitive team in Europe.', is_seed = true WHERE id = p12;
  UPDATE public.profiles SET country = 'Croatia',    city = 'Zagreb',      bio = 'Tough interior player. Excellent rebounder and screen-setter.', is_seed = true WHERE id = p13;
  UPDATE public.profiles SET country = 'Slovenia',   city = 'Ljubljana',   bio = 'Floor general with leadership qualities. Four years of organized play.', is_seed = true WHERE id = p14;
  UPDATE public.profiles SET country = 'Serbia',     city = 'Novi Sad',    bio = 'Explosive wing who thrives in open court. Good three-point shooter.', avatar_url = '/seed/players/p08.jpg', is_seed = true WHERE id = p15;
  UPDATE public.profiles SET country = 'Spain',      city = 'Valencia',    bio = 'Combo forward with a smooth mid-range game. Defensive specialist.', is_seed = true WHERE id = p16;
  UPDATE public.profiles SET country = 'Finland',    city = 'Tampere',     bio = 'High-motor center who dominates the boards. Physical and relentless.', is_seed = true WHERE id = p17;
  UPDATE public.profiles SET country = 'Germany',    city = 'München',     bio = 'Sharpshooting guard who spaces the floor. Reliable free throw shooter.', is_seed = true WHERE id = p18;
  UPDATE public.profiles SET country = 'Greece',     city = 'Thessaloniki',bio = 'Athletic swingman with a nose for the ball. Strong in transition defense.', is_seed = true WHERE id = p19;
  UPDATE public.profiles SET country = 'Lithuania',  city = 'Vilnius',     bio = 'Young center developing his all-around game. Already a strong rim protector.', is_seed = true WHERE id = p20;
  -- Female players
  UPDATE public.profiles SET country = 'Serbia',     city = 'Belgrade',    bio = 'Elite ball-handler and scorer. Two-time Serbian youth league MVP.', avatar_url = '/seed/players/p09.jpg', is_seed = true WHERE id = p21;
  UPDATE public.profiles SET country = 'Spain',      city = 'Barcelona',   bio = 'Quick and creative point guard. Excellent court vision and passing.', avatar_url = '/seed/players/p10.jpg', is_seed = true WHERE id = p22;
  UPDATE public.profiles SET country = 'Finland',    city = 'Espoo',       bio = 'Versatile wing player with a strong defensive presence.', is_seed = true WHERE id = p23;
  UPDATE public.profiles SET country = 'Denmark',    city = 'Aarhus',      bio = 'Sharp-shooting guard with great off-ball movement.', is_seed = true WHERE id = p24;
  UPDATE public.profiles SET country = 'Germany',    city = 'Hamburg',     bio = 'Physical power forward who controls the paint on both ends.', is_seed = true WHERE id = p25;
  UPDATE public.profiles SET country = 'France',     city = 'Paris',       bio = 'Fast and agile guard. Captain of my regional team for two seasons.', avatar_url = '/seed/players/p11.jpg', is_seed = true WHERE id = p26;
  UPDATE public.profiles SET country = 'Italy',      city = 'Rome',        bio = 'Tall forward with outside shooting range. Played in Serie A2 youth.', is_seed = true WHERE id = p27;
  UPDATE public.profiles SET country = 'Greece',     city = 'Athens',      bio = 'Tenacious defender and transition scorer. Always brings high energy.', is_seed = true WHERE id = p28;
  UPDATE public.profiles SET country = 'Sweden',     city = 'Stockholm',   bio = 'Smart playmaker who makes everyone around her better.', avatar_url = '/seed/players/p12.jpg', is_seed = true WHERE id = p29;
  UPDATE public.profiles SET country = 'Croatia',    city = 'Split',       bio = 'Strong center with great footwork in the post. Reliable free throw shooter.', is_seed = true WHERE id = p30;

  -- Teams
  UPDATE public.profiles SET country = 'Serbia',    city = 'Belgrade',     bio = 'Competitive semi-pro club with a strong youth pipeline.', avatar_url = '/seed/teams/t01.jpg', is_seed = true WHERE id = t01;
  UPDATE public.profiles SET country = 'Spain',     city = 'Barcelona',    bio = 'Ambitious club competing in the Spanish regional leagues.', avatar_url = '/seed/teams/t02.jpg', is_seed = true WHERE id = t02;
  UPDATE public.profiles SET country = 'Finland',   city = 'Helsinki',     bio = 'Top Finnish club focused on player development.', avatar_url = '/seed/teams/t03.jpg', is_seed = true WHERE id = t03;
  UPDATE public.profiles SET country = 'Denmark',   city = 'Copenhagen',   bio = 'Growing program in Danish basketball.', avatar_url = '/seed/teams/t04.jpg', is_seed = true WHERE id = t04;
  UPDATE public.profiles SET country = 'Germany',   city = 'München',      bio = 'Well-organized club with excellent facilities.', is_seed = true WHERE id = t05;
  UPDATE public.profiles SET country = 'France',    city = 'Lyon',         bio = 'Historic French club with passionate fans.', is_seed = true WHERE id = t06;
  UPDATE public.profiles SET country = 'Greece',    city = 'Athens',       bio = 'Storied Greek club competing at the highest level.', is_seed = true WHERE id = t07;
  UPDATE public.profiles SET country = 'Lithuania', city = 'Kaunas',       bio = 'Basketball is life in Kaunas. Join the tradition.', is_seed = true WHERE id = t08;
  UPDATE public.profiles SET country = 'Croatia',   city = 'Zagreb',       bio = 'Building a competitive roster for European cups.', is_seed = true WHERE id = t09;
  UPDATE public.profiles SET country = 'Slovenia',  city = 'Ljubljana',    bio = 'Fast-growing Slovenian club with international ambitions.', is_seed = true WHERE id = t10;

  -- ============================================================
  -- INSERT player_ads (30 rows)
  -- ============================================================

  INSERT INTO public.player_ads (
    profile_id, positions, height_cm, weight_kg, date_of_birth,
    experience_level, experience_years, previous_teams,
    ppg, apg, rpg, spg, bpg, three_pt_pct,
    looking_for, is_active, is_seed
  ) VALUES
    -- Male players (20)
    (p01, '{PG}',      188, 82, '1999-03-15', 'semi_pro', 5, 'KK Zemun, OKK Beograd',                    14.2, 6.8, 3.1, 1.8, 0.2, 34.5, 'A team with an up-tempo style where I can run the offense. Open to moving abroad.', true, true),
    (p02, '{SG}',      191, 85, '2001-07-22', 'semi_pro', 3, 'CB Fuenlabrada B, CB Estudiantes U20',      16.5, 3.2, 4.0, 1.4, 0.3, 37.8, 'A competitive team in Spain or elsewhere in Europe. Want to take the next step.', true, true),
    (p03, '{SF,SG}',   196, 91, '1998-11-05', 'semi_pro', 6, 'Torpan Pojat, Helsinki Seagulls B',         12.8, 2.5, 5.3, 1.6, 0.5, 31.2, 'A team that values two-way players. Happy to play the 2 or 3.', true, true),
    (p04, '{SF,PF}',   201, 95, '2000-01-18', 'amateur',  4, 'Falcon Basketball, BK Amager',              10.1, 3.8, 6.7, 1.1, 0.8, 28.9, 'Looking for a semi-pro opportunity. Willing to relocate anywhere in Europe.', true, true),
    (p05, '{SG}',      189, 84, '1997-06-30', 'semi_pro', 7, 'Grindavík, KR Reykjavik',                   11.4, 2.9, 3.5, 2.1, 0.1, 36.1, 'Want to play at a higher level outside Iceland. Defensive-minded guard.', true, true),
    (p06, '{PF}',      204, 98, '1999-09-12', 'semi_pro', 4, 'TuS Lichterfelde, Alba Berlin III',         13.7, 1.8, 7.2, 0.9, 1.2, 35.4, 'A team that needs a stretch four. Comfortable shooting from deep.', true, true),
    (p07, '{PG}',      183, 78, '1996-04-25', 'pro',      8, 'ASVEL Lyon B, Saint-Vallier, Fos Provence',  9.3, 7.1, 2.8, 1.5, 0.1, 32.0, 'An organized program where I can contribute as a veteran floor general.', true, true),
    (p08, '{SF,SG}',   198, 90, '2002-08-14', 'amateur',  2, 'Olimpia Milano Youth',                     15.9, 2.1, 4.8, 1.3, 0.6, 33.7, 'Looking for my first senior team. Athletic and ready to compete.', true, true),
    (p09, '{C}',       208, 108, '1997-12-01', 'semi_pro', 6, 'Ionikos Nikeas, Peristeri B',               8.6, 1.2, 8.9, 0.5, 2.4, NULL, 'A team that plays through the post. Strong rebounder and rim protector.', true, true),
    (p10, '{PG,SG}',   186, 80, '2000-05-19', 'semi_pro', 4, 'Žalgiris-2, BC Nevėžis',                   13.1, 5.4, 2.6, 1.7, 0.2, 38.5, 'A club with a winning culture. Can play the 1 or 2 effectively.', true, true),
    (p11, '{SF,PF}',   200, 93, '1998-02-28', 'semi_pro', 5, 'Gothia Basket, Borås Basket',              11.0, 2.3, 6.1, 1.2, 0.7, 30.8, 'A team in Scandinavia or Central Europe. Versatile defender.', true, true),
    (p12, '{SG}',      193, 86, '2001-10-07', 'amateur',  3, 'Tromsø Storm, Ammerud Basket',             17.3, 2.0, 3.7, 1.0, 0.2, 39.2, 'A club where I can develop as a scorer. Willing to move south in Europe.', true, true),
    (p13, '{PF,C}',    205, 102, '1996-08-20', 'semi_pro', 7, 'KK Zadar B, KK Šibenik',                    9.8, 1.5, 9.4, 0.7, 1.9, NULL, 'A team in the Adriatic region or Central Europe. Experienced interior player.', true, true),
    (p14, '{PG}',      185, 79, '1999-12-11', 'semi_pro', 5, 'KK Olimpija, KD Ilirija',                  11.6, 6.2, 2.4, 1.9, 0.1, 33.3, 'A program with good coaching. Want to lead a team and compete for titles.', true, true),
    (p15, '{SG,SF}',   195, 88, '2003-04-03', 'amateur',  2, 'KK Vojvodina',                             18.7, 2.7, 4.5, 1.5, 0.4, 36.7, 'Open to any competitive opportunity. Young and hungry to prove myself.', true, true),
    (p16, '{SF,PF}',   199, 94, '1998-07-16', 'semi_pro', 6, 'Valencia Basket B, CB Lucentum',           10.4, 2.0, 5.9, 1.3, 0.9, 29.5, 'A defensive-oriented team. I take pride in guarding the best player.', true, true),
    (p17, '{C}',       211, 112, '2000-03-22', 'amateur',  3, 'Tampereen Pyrintö',                         7.9, 0.8, 10.2, 0.4, 2.8, NULL, 'Looking for a team that needs a physical center. I live on the boards.', true, true),
    (p18, '{SG}',      190, 83, '2002-11-30', 'amateur',  2, 'TSV Bayern München U20',                   14.8, 1.9, 3.3, 0.8, 0.1, 41.2, 'A team that values spacing and shooting. Best asset is my three-point shot.', true, true),
    (p19, '{SF}',      197, 92, '2001-06-08', 'semi_pro', 4, 'PAOK B, Aris BC B',                        12.2, 2.4, 5.0, 1.8, 0.5, 32.6, 'A competitive club in Greece or Southern Europe. Two-way wing.', true, true),
    (p20, '{C,PF}',    209, 105, '2004-01-14', 'amateur',  1, 'BC Wolves Vilnius Youth',                   6.4, 0.9, 7.8, 0.3, 2.1, NULL, 'First senior opportunity. Young big with rim protection and upside.', true, true),
    -- Female players (10)
    (p21, '{PG,SG}',   175, 65, '2000-09-17', 'semi_pro', 5, 'ŽKK Crvena zvezda, ŽKK Partizan',         16.1, 5.5, 3.0, 2.3, 0.2, 35.8, 'A women''s team competing at the semi-pro or pro level. Can play the 1 or 2.', true, true),
    (p22, '{PG}',      172, 62, '2002-02-14', 'semi_pro', 3, 'CB Avenida B, Uni Girona Youth',           11.3, 6.9, 2.2, 2.0, 0.1, 33.1, 'A team with a fast-paced offense. I love to push the tempo.', true, true),
    (p23, '{SF,SG}',   181, 72, '1999-05-28', 'semi_pro', 5, 'Tapiolan Honka, Espoo Basket',             13.5, 2.8, 5.1, 1.5, 0.4, 30.9, 'Looking for a new challenge outside Finland. Strong two-way wing.', true, true),
    (p24, '{SG}',      178, 68, '2001-08-11', 'amateur',  3, 'Stevnsgade Basketball',                    15.7, 2.3, 3.4, 1.2, 0.2, 38.4, 'A competitive team in Scandinavia or Western Europe. Pure scorer.', true, true),
    (p25, '{PF,C}',    186, 80, '1998-10-05', 'semi_pro', 6, 'BG 89 Avides Hamburg, TK Hannover',         9.2, 1.4, 8.6, 0.8, 1.7, NULL, 'A team that needs a physical inside presence. Experienced in German leagues.', true, true),
    (p26, '{PG}',      173, 63, '2000-12-20', 'semi_pro', 4, 'Lyon ASVEL Féminin B, Tarbes',             10.8, 5.7, 2.5, 2.1, 0.1, 31.5, 'An ambitious club in France or Southern Europe. Floor general with experience.', true, true),
    (p27, '{SF,PF}',   184, 75, '2001-03-09', 'amateur',  3, 'Virtus Bologna Youth, Ragusa',             12.4, 1.7, 6.0, 1.0, 0.6, 29.8, 'A team where I can grow as a player. Comfortable at the 3 or 4 spot.', true, true),
    (p28, '{SG,SF}',   179, 70, '1999-07-25', 'semi_pro', 5, 'Olympiacos W, Athinaikos W',               14.6, 2.6, 4.3, 1.9, 0.3, 34.2, 'A top-level women''s program. I bring energy and scoring off the bench or as a starter.', true, true),
    (p29, '{PG,SG}',   176, 66, '2003-11-02', 'amateur',  2, 'Alvik Basket',                             13.0, 4.8, 2.9, 1.6, 0.1, 36.0, 'My first opportunity abroad. Smart guard who can play both backcourt spots.', true, true),
    (p30, '{C}',       190, 84, '1997-04-18', 'pro',      8, 'ŽKK Split, ŽKK Ragusa, ŽKK Šibenik',       8.1, 1.1, 9.7, 0.6, 2.6, NULL, 'A professional team looking for an experienced center. Ready to contribute immediately.', true, true);

  -- ============================================================
  -- INSERT team_ads (10 rows)
  -- ============================================================

  INSERT INTO public.team_ads (
    profile_id, team_name, positions_needed, league, league_tier,
    division, description, what_we_offer, website, founded_year,
    season_record, is_active, is_seed
  ) VALUES
    (t01, 'Belgrade Wolves BC', '{PG,SF}',  'Serbian Basketball League', 2, 'First Division', 'Ambitious semi-pro club from Belgrade with a proud tradition. We play fast, physical basketball and develop talent for higher leagues.', 'Professional coaching staff, gym access, travel covered for away games, and a pathway to top-tier Serbian basketball.', NULL, 2005, '18-10', true, true),
    (t02, 'Barcelona Flames',   '{C,PF}',   'Liga EBA',                  3, 'Group B',        'A rising club in the Barcelona basketball scene. We compete in Spain''s fourth tier with ambitions to move up.', 'Modern training facility, team housing assistance, competitive schedule with 30+ games per season.', NULL, 2012, '14-12', true, true),
    (t03, 'Helsinki Frost',     '{SG,PF}',  'Korisliiga',                1, NULL,              'One of Finland''s top clubs competing in the premier league. We emphasize team play and defensive intensity.', 'Full-time basketball environment, sports science support, housing provided, and a passionate fanbase.', NULL, 1994, '22-8', true, true),
    (t04, 'Copenhagen Kings',   '{PG,C}',   'Basketligaen',              1, NULL,              'Leading Danish club pushing for the championship. We play an up-tempo, spacing-heavy offense.', 'Fully professional setup with daily training, video analysis, nutritionist, and centrally located housing.', NULL, 2001, '20-6', true, true),
    (t05, 'München Thunder',    '{SF}',     'ProA',                      2, NULL,              'Competitive German second-division club based in Munich. Strong fan support and excellent facilities.', 'Professional contract, fully equipped gym, team apartment, and opportunities to move up to the BBL.', NULL, 1998, '16-14', true, true),
    (t06, 'Lyon Vipers',        '{PG,SG}',  'NM1',                       2, NULL,              'Historic French club with deep roots in Lyon basketball. We play a structured, half-court game.', 'Experienced coaching, team housing in central Lyon, competitive salary, and a tight-knit club culture.', NULL, 1987, '19-11', true, true),
    (t07, 'Athens Eagles BC',   '{PF,C}',   'A2 Ethniki',                2, 'South Division',  'Storied Greek club building a roster to compete for promotion. Strong home-court advantage.', 'Housing near the arena, sports physiotherapy, passionate Greek basketball atmosphere, and a supportive board.', NULL, 1972, '17-9', true, true),
    (t08, 'Kaunas Storm',       '{SG,SF}',  'NKL',                       2, NULL,              'Lithuanian club with a winning tradition. Based in the basketball capital of Europe.', 'Access to world-class basketball infrastructure, experienced Lithuanian coaching, and player development focus.', NULL, 2008, '21-7', true, true),
    (t09, 'Zagreb Falcons',     '{PG,PF,C}','A-1 Liga',                  1, NULL,              'Top-flight Croatian club competing in the ABA League qualifiers. We need hungry players ready for big games.', 'Professional contract, housing, full medical staff, and exposure to scouts from ABA League and Euroleague feeder clubs.', NULL, 1991, '23-5', true, true),
    (t10, 'Ljubljana Dragons',  '{SG,PF}',  'Liga Nova KBM',             1, NULL,              'Slovenian premier league club with a tradition of developing talent. Modern approach to the game.', 'Professional environment, team apartment in Ljubljana, strength and conditioning program, and a path to top European leagues.', NULL, 2003, '19-9', true, true);

END;
$$;

-- ============================================================
-- CLEANUP (uncomment and run to remove all seed data)
-- ============================================================
-- DELETE FROM auth.users WHERE id IN (
--   'a0000001-0000-0000-0000-000000000001',
--   'a0000001-0000-0000-0000-000000000002',
--   'a0000001-0000-0000-0000-000000000003',
--   'a0000001-0000-0000-0000-000000000004',
--   'a0000001-0000-0000-0000-000000000005',
--   'a0000001-0000-0000-0000-000000000006',
--   'a0000001-0000-0000-0000-000000000007',
--   'a0000001-0000-0000-0000-000000000008',
--   'a0000001-0000-0000-0000-000000000009',
--   'a0000001-0000-0000-0000-000000000010',
--   'a0000001-0000-0000-0000-000000000011',
--   'a0000001-0000-0000-0000-000000000012',
--   'a0000001-0000-0000-0000-000000000013',
--   'a0000001-0000-0000-0000-000000000014',
--   'a0000001-0000-0000-0000-000000000015',
--   'a0000001-0000-0000-0000-000000000016',
--   'a0000001-0000-0000-0000-000000000017',
--   'a0000001-0000-0000-0000-000000000018',
--   'a0000001-0000-0000-0000-000000000019',
--   'a0000001-0000-0000-0000-000000000020',
--   'a0000001-0000-0000-0000-000000000021',
--   'a0000001-0000-0000-0000-000000000022',
--   'a0000001-0000-0000-0000-000000000023',
--   'a0000001-0000-0000-0000-000000000024',
--   'a0000001-0000-0000-0000-000000000025',
--   'a0000001-0000-0000-0000-000000000026',
--   'a0000001-0000-0000-0000-000000000027',
--   'a0000001-0000-0000-0000-000000000028',
--   'a0000001-0000-0000-0000-000000000029',
--   'a0000001-0000-0000-0000-000000000030',
--   'b0000001-0000-0000-0000-000000000001',
--   'b0000001-0000-0000-0000-000000000002',
--   'b0000001-0000-0000-0000-000000000003',
--   'b0000001-0000-0000-0000-000000000004',
--   'b0000001-0000-0000-0000-000000000005',
--   'b0000001-0000-0000-0000-000000000006',
--   'b0000001-0000-0000-0000-000000000007',
--   'b0000001-0000-0000-0000-000000000008',
--   'b0000001-0000-0000-0000-000000000009',
--   'b0000001-0000-0000-0000-000000000010'
-- );
-- Cascading deletes will remove profiles, player_ads, team_ads, etc.
--
-- To also remove the is_seed columns:
-- ALTER TABLE public.profiles    DROP COLUMN IF EXISTS is_seed;
-- ALTER TABLE public.player_ads  DROP COLUMN IF EXISTS is_seed;
-- ALTER TABLE public.team_ads    DROP COLUMN IF EXISTS is_seed;

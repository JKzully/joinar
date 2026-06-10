alter table public.player_ads
  add column if not exists preferred_countries text[] default '{}',
  add column if not exists languages text[] default '{}';

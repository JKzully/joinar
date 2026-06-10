alter table public.player_ads alter column is_active set default false;
alter table public.team_ads alter column is_active set default false;

update public.player_ads ad
set is_active = false
from public.profiles profile
where ad.profile_id = profile.id
  and ad.is_active = true
  and (
    nullif(profile.full_name, '') is null
    or nullif(profile.country, '') is null
    or coalesce(array_length(ad.positions, 1), 0) = 0
    or ad.height_cm is null
    or ad.date_of_birth is null
    or nullif(ad.experience_level::text, '') is null
    or nullif(ad.highlights_url, '') is null
    or coalesce(array_length(ad.preferred_countries, 1), 0) = 0
    or coalesce(array_length(ad.languages, 1), 0) = 0
    or nullif(ad.looking_for, '') is null
  );

update public.team_ads ad
set is_active = false
from public.profiles profile
where ad.profile_id = profile.id
  and ad.is_active = true
  and (
    nullif(profile.country, '') is null
    or nullif(ad.team_name, '') is null
    or nullif(ad.league, '') is null
    or coalesce(array_length(ad.positions_needed, 1), 0) = 0
    or nullif(ad.description, '') is null
    or nullif(ad.what_we_offer, '') is null
  );

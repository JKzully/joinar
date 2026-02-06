import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PlayerFilters from "./PlayerFilters";
import MessageButton from "../MessageButton";

export const metadata = {
  title: "Find Basketball Players — Semi-Pro Talent Across Europe",
};

const POSITION_LABELS = {
  point_guard: "Point Guard",
  shooting_guard: "Shooting Guard",
  small_forward: "Small Forward",
  power_forward: "Power Forward",
  center: "Center",
};

export default async function BrowsePlayersPage({ searchParams }) {
  const params = await searchParams;
  const positionFilter = params?.position || "";
  const countryFilter = params?.country || "";
  const minExp = parseInt(params?.min_exp) || 0;
  const minHeight = parseInt(params?.min_height) || 0;

  const supabase = await createClient();

  // Fetch distinct countries for the filter dropdown
  const { data: countryRows } = await supabase
    .from("profiles")
    .select("country")
    .eq("role", "player")
    .not("country", "is", null)
    .order("country");

  const countries = [...new Set(countryRows?.map((r) => r.country).filter(Boolean))];

  // Build query — join player_profiles with profiles
  let query = supabase
    .from("player_profiles")
    .select("*, profile:id(full_name, avatar_url, country, city)")
    .order("updated_at", { ascending: false });

  if (positionFilter) {
    query = query.eq("position", positionFilter);
  }
  if (minExp) {
    query = query.gte("experience_years", minExp);
  }
  if (minHeight) {
    query = query.gte("height_cm", minHeight);
  }

  const { data: players } = await query;

  // Client-side country filter (country lives on the joined profile)
  const filtered = countryFilter
    ? players?.filter((p) => p.profile?.country === countryFilter)
    : players;

  // Fetch active boosts to mark boosted players
  const boostedIds = new Set();
  if (filtered && filtered.length > 0) {
    const { data: boosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in(
        "profile_id",
        filtered.map((p) => p.id)
      );
    boosts?.forEach((b) => boostedIds.add(b.profile_id));
  }

  // Sort boosted first
  const sorted = filtered
    ? [...filtered].sort((a, b) => {
        const aBoost = boostedIds.has(a.id) ? 1 : 0;
        const bBoost = boostedIds.has(b.id) ? 1 : 0;
        return bBoost - aBoost;
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Find Your Next Player</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Every player here is hungry, available, and ready to prove themselves. Use the filters to find your perfect match.
        </p>
      </div>

      <Suspense>
        <PlayerFilters countries={countries} />
      </Suspense>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        {sorted.length} player{sorted.length !== 1 ? "s" : ""} found
      </p>

      {/* Player grid */}
      {sorted.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              boosted={boostedIds.has(player.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <svg className="mx-auto h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="mt-3 text-sm text-text-muted">No players match those filters</p>
          <p className="mt-1 text-xs text-text-muted">New players sign up every day. Try adjusting your search or check back soon.</p>
        </div>
      )}
    </div>
  );
}

function PlayerCard({ player, boosted }) {
  const profile = player.profile;
  const age = player.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(player.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="group relative rounded-2xl border border-border bg-surface p-5 transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5">
      {boosted && (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Boosted
        </div>
      )}

      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-light text-lg font-semibold text-orange-400">
          {(profile?.full_name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">
            {profile?.full_name || "Unnamed Player"}
          </h3>
          <p className="text-sm text-orange-400">
            {POSITION_LABELS[player.position] || "Position TBD"}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        <StatPill label="PPG" value={player.ppg} />
        <StatPill label="APG" value={player.apg} />
        <StatPill label="RPG" value={player.rpg} />
        <StatPill label="Height" value={player.height_cm ? `${player.height_cm}cm` : "--"} />
      </div>

      {/* Details */}
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        {profile?.country && <span>{profile.country}</span>}
        {age && (
          <>
            <span>&middot;</span>
            <span>{age} years old</span>
          </>
        )}
        {player.experience_years > 0 && (
          <>
            <span>&middot;</span>
            <span>{player.experience_years}y exp</span>
          </>
        )}
      </div>

      {/* Bio preview */}
      {player.bio && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {player.bio}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MessageButton profileId={player.id} />
        <Link
          href={`/dashboard/players/${player.id}`}
          className="rounded-lg border border-border bg-surface-light py-2 text-center text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  const display =
    value !== null && value !== undefined && value !== 0
      ? Number(value).toFixed(1)
      : typeof value === "string"
        ? value
        : "--";

  return (
    <div className="rounded-lg bg-surface-light px-2 py-1.5">
      <p className="text-[10px] text-text-muted">{label}</p>
      <p className="font-semibold text-text-primary">{display}</p>
    </div>
  );
}

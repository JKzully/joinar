import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TeamFilters from "./TeamFilters";
import MessageButton from "../MessageButton";

export const metadata = {
  title: "Find Basketball Teams — Open Roster Spots in Europe",
};

const TIER_LABELS = {
  1: "Tier 1",
  2: "Tier 2",
  3: "Tier 3",
  4: "Tier 4",
};

export default async function BrowseTeamsPage({ searchParams }) {
  const params = await searchParams;
  const countryFilter = params?.country || "";
  const tierFilter = parseInt(params?.tier) || 0;
  const positionFilter = params?.position || "";

  const supabase = await createClient();

  // Fetch distinct countries for filter dropdown
  const { data: countryRows } = await supabase
    .from("profiles")
    .select("country")
    .eq("role", "team")
    .not("country", "is", null)
    .order("country");

  const countries = [...new Set(countryRows?.map((r) => r.country).filter(Boolean))];

  // Build query — join team_ads with profiles
  let query = supabase
    .from("team_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (tierFilter) {
    query = query.eq("league_tier", tierFilter);
  }
  if (positionFilter) {
    query = query.contains("positions_needed", [positionFilter]);
  }

  const { data: teams } = await query;

  // Client-side country filter (country is on the joined profile)
  const filtered = countryFilter
    ? teams?.filter((t) => t.profile?.country === countryFilter)
    : teams;

  // Fetch active boosts
  const boostedIds = new Set();
  if (filtered && filtered.length > 0) {
    const { data: boosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in(
        "profile_id",
        filtered.map((t) => t.profile_id)
      );
    boosts?.forEach((b) => boostedIds.add(b.profile_id));
  }

  // Sort boosted first
  const sorted = filtered
    ? [...filtered].sort((a, b) => {
        const aBoost = boostedIds.has(a.profile_id) ? 1 : 0;
        const bBoost = boostedIds.has(b.profile_id) ? 1 : 0;
        return bBoost - aBoost;
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Find Your Next Team</h1>
        <p className="mt-1 text-sm text-text-secondary">
          These teams have open roster spots and they&apos;re actively looking. Your next opportunity is here.
        </p>
      </div>

      <Suspense>
        <TeamFilters countries={countries} />
      </Suspense>

      {/* Results count */}
      <p className="text-sm text-text-muted">
        {sorted.length} team{sorted.length !== 1 ? "s" : ""} found
      </p>

      {/* Team grid */}
      {sorted.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              boosted={boostedIds.has(team.profile_id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <svg className="mx-auto h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
          <p className="mt-3 text-sm text-text-muted">No teams match those filters right now</p>
          <p className="mt-1 text-xs text-text-muted">New teams join every week — check back or broaden your search.</p>
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, boosted }) {
  const profile = team.profile;
  const positions = team.positions_needed || [];

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

      {/* Team header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-light text-lg font-bold text-orange-400">
          {(team.team_name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-text-primary">
            {team.team_name || "Unnamed Team"}
          </h3>
          <p className="truncate text-sm text-text-secondary">
            {team.league || "League TBD"}
          </p>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
        {profile?.country && <span>{profile.country}</span>}
        {profile?.city && (
          <>
            <span>&middot;</span>
            <span>{profile.city}</span>
          </>
        )}
        {team.league_tier && (
          <>
            <span>&middot;</span>
            <span>{TIER_LABELS[team.league_tier]}</span>
          </>
        )}
      </div>

      {/* Positions needed tags */}
      {positions.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-text-muted">
            Hiring ({positions.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {positions.slice(0, 4).map((pos) => (
              <span
                key={pos}
                className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400"
              >
                {pos}
              </span>
            ))}
            {positions.length > 4 && (
              <span className="rounded-full bg-surface-light px-2.5 py-1 text-xs text-text-muted">
                +{positions.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description preview */}
      {team.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {team.description}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <MessageButton profileId={team.profile_id} />
        <Link
          href={`/dashboard/teams/${team.profile_id}`}
          className="rounded-lg bg-orange-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
        >
          View Team
        </Link>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import TeamFilters from "./TeamFilters";
import MessageButton from "../MessageButton";

export const metadata = { title: "Find Teams — Picked" };

const TIER_LABELS = { 1: "Top Division", 2: "Tier 2", 3: "Tier 3", 4: "Tier 4" };

export default async function BrowseTeamsPage({ searchParams }) {
  const params = await searchParams;
  const countryFilter = params?.country || "";
  const tierFilter = parseInt(params?.tier) || 0;
  const positionFilter = params?.position || "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const canContactTeams = currentProfile?.role === "player";

  let query = supabase
    .from("team_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });
  if (tierFilter) query = query.eq("league_tier", tierFilter);
  if (positionFilter) query = query.contains("positions_needed", [positionFilter]);

  const { data: teams } = await query;
  const countries = [
    ...new Set(teams?.map((team) => team.profile?.country).filter(Boolean)),
  ].sort();
  const filtered = countryFilter
    ? teams?.filter((t) => t.profile?.country === countryFilter)
    : teams;

  const boostedIds = new Set();
  if (filtered && filtered.length > 0) {
    const { data: boosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in("profile_id", filtered.map((t) => t.profile_id));
    boosts?.forEach((b) => boostedIds.add(b.profile_id));
  }

  const sorted = filtered
    ? [...filtered].sort((a, b) => (boostedIds.has(b.profile_id) ? 1 : 0) - (boostedIds.has(a.profile_id) ? 1 : 0))
    : [];

  return (
    <div className="mx-auto max-w-[1340px] px-6 py-8 sm:px-12 sm:py-10 lg:px-16">
      <div className="mb-8">
        <h1 className="display-sm">
          Open roster <span className="serif text-terra">spots.</span>
        </h1>
        <p className="mt-2 text-[14px] text-mute">
          <span className="num font-bold text-ink">{sorted.length}</span> team{sorted.length !== 1 ? "s" : ""} hiring · {countries.length} {countries.length === 1 ? "country" : "countries"}
        </p>
      </div>

      <Suspense>
        <TeamFilters countries={countries} />
      </Suspense>

      {sorted.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              boosted={boostedIds.has(team.profile_id)}
              isSeed={!!team.is_seed}
              canContact={canContactTeams}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line py-20 text-center">
          <p className="text-[14px] font-semibold text-ink">No teams match those filters</p>
          <p className="mt-2 text-[13px] text-mute">New teams join every week — check back or broaden your search.</p>
        </div>
      )}
    </div>
  );
}

function TeamCard({ team, boosted, isSeed, canContact }) {
  const profile = team.profile;
  const positions = team.positions_needed || [];
  const posLabels = positions.map((p) =>
    p.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
  const initial = (team.team_name || "T").charAt(0).toUpperCase();

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper-2 transition-shadow hover:shadow-[0_6px_28px_rgba(19,17,14,0.06)]">
      <div className="flex-1 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#05070A,#0A84FF)" }}>
              {profile?.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={44} height={44} className="h-full w-full rounded-[10px] object-cover" />
              ) : initial}
            </div>
            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.005em]">{team.team_name || "Unnamed Team"}</h3>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
                {team.league || "League TBD"}{team.league_tier ? ` · ${TIER_LABELS[team.league_tier]}` : ""}
              </div>
            </div>
          </div>
          {boosted && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-terra/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-terra-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-terra" /> Boosted
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-2 text-[12px] text-mute">
          {profile?.country && <span>{profile.country}</span>}
          {profile?.city && <><span className="text-line-2">·</span><span>{profile.city}</span></>}
        </div>

        {posLabels.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Hiring ({posLabels.length})</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {posLabels.slice(0, 4).map((p) => (
                <span key={p} className="rounded-full border border-line-2 px-2.5 py-1 text-[11px] font-semibold text-ink">
                  {p}
                </span>
              ))}
              {posLabels.length > 4 && (
                <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[11px] text-mute">
                  +{posLabels.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {team.description && (
          <p className="mt-4 line-clamp-2 text-[13px] leading-[1.55] text-ink-2">{team.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line bg-paper px-5 py-3">
        {canContact ? (
          <MessageButton
            profileId={team.profile_id}
            isSeed={isSeed}
            className="text-[12px] font-semibold text-ink underline-offset-4 hover:underline"
            label="Declare interest"
          />
        ) : (
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
            Roster search
          </span>
        )}
        <Link href={`/dashboard/teams/${team.profile_id}`} className="btn btn-ink" style={{ padding: "8px 14px", fontSize: 12 }}>
          View team →
        </Link>
      </div>
    </div>
  );
}

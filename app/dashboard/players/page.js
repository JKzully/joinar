import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import PlayerFilters from "./PlayerFilters";
import MessageButton from "../MessageButton";

export const metadata = {
  title: "Find Players — Picked",
};

const TONES = ["warm", "rust", "sage", "cool"];
const GRADS = {
  warm: "linear-gradient(180deg,#0A84FF,#063B84 62%,#05070A)",
  rust: "linear-gradient(180deg,#FF4D1D,#961F06 62%,#05070A)",
  sage: "linear-gradient(180deg,#00C853,#087A37 62%,#05070A)",
  cool: "linear-gradient(180deg,#111827,#0B1220 62%,#05070A)",
};

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return Number.isFinite(age) ? age : null;
}

export default async function BrowsePlayersPage({ searchParams }) {
  const params = await searchParams;
  const positionFilter = params?.position || "";
  const countryFilter = params?.country || "";
  const minExp = parseInt(params?.min_exp) || 0;
  const minHeight = parseInt(params?.min_height) || 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const canContactPlayers = currentProfile?.role === "team";

  // Build query
  let query = supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (positionFilter) {
    query = query.contains("positions", [positionFilter]);
  }
  if (minExp) {
    query = query.gte("experience_years", minExp);
  }
  if (minHeight) {
    query = query.gte("height_cm", minHeight);
  }

  const { data: players } = await query;
  const countries = [
    ...new Set(players?.map((player) => player.profile?.country).filter(Boolean)),
  ].sort();

  // Client-side country filter (country is on joined profile)
  const filtered = countryFilter
    ? players?.filter((p) => p.profile?.country === countryFilter)
    : players;

  // Fetch active boosts
  const boostedIds = new Set();
  if (filtered && filtered.length > 0) {
    const { data: boosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in("profile_id", filtered.map((p) => p.profile_id));
    boosts?.forEach((b) => boostedIds.add(b.profile_id));
  }

  // Sort boosted first
  const sorted = filtered
    ? [...filtered].sort((a, b) => {
        const aB = boostedIds.has(a.profile_id) ? 1 : 0;
        const bB = boostedIds.has(b.profile_id) ? 1 : 0;
        return bB - aB;
      })
    : [];

  return (
    <div className="mx-auto max-w-[1340px] px-6 py-8 sm:px-12 sm:py-10 lg:px-16">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display-sm">
            Find your next <span className="serif text-sage-deep">signing.</span>
          </h1>
          <p className="mt-2 text-[14px] text-mute">
            <span className="num font-bold text-ink">{sorted.length}</span> player{sorted.length !== 1 ? "s" : ""} · {countries.length} {countries.length === 1 ? "country" : "countries"}
          </p>
        </div>
        <Link href="/dashboard/ad" className="btn btn-ink">
          Post a position
        </Link>
      </div>

      {/* Layout: filter rail + results */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filter rail — sticky on desktop */}
        <div className="top-6 lg:sticky">
          <Suspense>
            <PlayerFilters countries={countries} />
          </Suspense>
        </div>

        {/* Results */}
        <div>
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((player, i) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  index={i}
                  boosted={boostedIds.has(player.profile_id)}
                  isSeed={!!player.is_seed}
                  canContact={canContactPlayers}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-line py-20 text-center">
              <p className="text-[14px] font-semibold text-ink">No players match those filters</p>
              <p className="mt-2 text-[13px] text-mute">
                Adjust the filters or return when more players declare availability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, index, boosted, isSeed, canContact }) {
  const profile = player.profile;
  const name = profile?.full_name || "Unnamed";
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const positions = player.positions || [];
  const posLabel = positions.length > 0
    ? positions.map((p) => p.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())).join(" · ")
    : "Position TBD";
  const age = calculateAge(player.date_of_birth);
  const tone = TONES[index % TONES.length];
  const jersey = String(((index + 1) * 7) % 99).padStart(2, "0");
  const preferredCountries = player.preferred_countries || [];
  const languages = player.languages || [];
  const hasFilm = !!player.highlights_url;

  const badge = isSeed ? "Sample" : boosted ? "Boosted" : "Available";
  const badgeColor = isSeed ? "#66707D" : boosted ? "#FF4D1D" : "#00C853";

  return (
    <div className="group overflow-hidden rounded-2xl border border-line bg-paper-2">
      {/* Portrait */}
      <Link href={`/dashboard/players/${player.profile_id}`} className="relative block" style={{ aspectRatio: "1.05/1" }}>
        <div className="absolute inset-0 bg-ink" style={{ background: profile?.avatar_url ? undefined : GRADS[tone] }}>
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={`${name} profile photo`}
              fill
              sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-serif italic"
              style={{ fontSize: 130, color: "rgba(255,255,255,0.05)", fontWeight: 400, lineHeight: 1 }}
            >
              {initials}
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 50%,rgba(0,0,0,0.55) 100%)" }} />
        </div>

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: badgeColor }} /> {badge}
          </span>
          {hasFilm && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
              Film
            </span>
          )}
        </div>

        <div className="num absolute right-4 top-3 font-extrabold leading-none text-white/90" style={{ fontSize: 30 }}>
          <span className="font-medium opacity-50" style={{ fontSize: "0.7em", verticalAlign: 7 }}>#</span>
          {jersey}
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-[18px] font-semibold leading-[1.2] tracking-[-0.01em]">{name}</div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] opacity-75">
            {posLabel} · {profile?.country || "—"}
          </div>
        </div>
      </Link>

      {/* Stats row */}
      <div className="grid grid-cols-4 border-t border-line text-center">
        <StatCell label="Age" value={age || "—"} />
        <StatCell label="Height" value={player.height_cm ? `${player.height_cm}` : "—"} border />
        <StatCell label="PPG" value={player.ppg ? Number(player.ppg).toFixed(1) : "—"} border />
        <StatCell label="3PT" value={player.three_pt_pct ? `${Number(player.three_pt_pct).toFixed(0)}%` : "—"} border />
      </div>

      {(preferredCountries.length > 0 || languages.length > 0) && (
        <div className="border-t border-line bg-paper-2 px-4 py-3">
          <div className="truncate text-[11px] font-semibold text-mute">
            {preferredCountries.length > 0 && (
              <span className="text-ink">Wants {preferredCountries.slice(0, 2).join(", ")}</span>
            )}
            {preferredCountries.length > 0 && languages.length > 0 && <span> · </span>}
            {languages.length > 0 && <span>{languages.slice(0, 3).join(", ")}</span>}
          </div>
        </div>
      )}

      {/* Footer with actions */}
      <div className="flex items-center justify-between border-t border-line bg-paper px-4 py-3">
        <span className="text-[11px] font-semibold text-mute">
          {player.experience_years ? `${player.experience_years}y exp` : "No exp listed"}
        </span>
        <div className="flex gap-2">
          {canContact && (
            <MessageButton
              profileId={player.profile_id}
              isSeed={isSeed}
              ariaLabel={`Express interest in ${name}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-2 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper-2"
              label={
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M1.5 3h11v7H6l-3 2v-2H1.5V3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
              }
            />
          )}
          <Link
            href={`/dashboard/players/${player.profile_id}`}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-paper-2 text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper-2"
            aria-label={`View ${name}'s profile`}
            title={`View ${name}'s profile`}
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, border }) {
  return (
    <div className={`py-3 ${border ? "border-l border-line" : ""}`}>
      <div className="num text-[15px] font-bold leading-none tracking-[-0.01em]">{value}</div>
      <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</div>
    </div>
  );
}

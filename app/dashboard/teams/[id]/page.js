import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import MessageButton from "../../MessageButton";

export const metadata = { title: "Team Profile — Picked" };

const TIER_LABELS = { 1: "Top Division", 2: "Tier 2", 3: "Tier 3", 4: "Regional" };

export default async function TeamProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team, error } = await supabase
    .from("team_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("profile_id", id)
    .single();

  if (error || !team) redirect("/dashboard/teams");

  const { data: boost } = await supabase
    .from("boosts")
    .select("id")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  const isSeed = !!team.is_seed;

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();
  const isPlayer = currentProfile?.role === "player";

  const profile = team.profile;
  const positions = (team.positions_needed || []).map((p) =>
    p.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
  const initial = (team.team_name || "T").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-12 sm:py-10 lg:px-16">
      <Link
        href="/dashboard/teams"
        className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-mute hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to teams
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[22px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#05070A,#0A84FF)" }}>
          {profile?.avatar_url ? (
            <Image src={profile.avatar_url} alt="" width={64} height={64} className="h-full w-full rounded-2xl object-cover" />
          ) : initial}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[36px] font-extrabold leading-[1.05] tracking-[-0.025em]">
              {team.team_name || "Unnamed Team"}
            </h1>
            {!!boost && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-terra/12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-terra-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-terra" /> Boosted
              </span>
            )}
            {isSeed && (
              <span className="rounded-full bg-ink/[0.06] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mute">
                Sample
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 text-[12px] font-bold uppercase tracking-[0.1em] text-mute">
            <span>{team.league || "League TBD"}</span>
            {team.league_tier && <><span className="text-line-2">·</span><span>{TIER_LABELS[team.league_tier]}</span></>}
            {team.division && <><span className="text-line-2">·</span><span>{team.division}</span></>}
            {profile?.country && <><span className="text-line-2">·</span><span>{profile.country}{profile.city && `, ${profile.city}`}</span></>}
          </div>
        </div>
      </div>

      {/* Positions */}
      {positions.length > 0 && (
        <div className="mt-8 rounded-2xl border border-line bg-paper-2 p-7">
          <div className="label-meta mb-4 text-mute">Positions needed ({positions.length})</div>
          <div className="flex flex-wrap gap-2">
            {positions.map((p) => (
              <span key={p} className="rounded-full border border-line-2 px-3.5 py-1.5 text-[13px] font-semibold text-ink">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Details grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {team.description && (
          <div className="rounded-2xl border border-line bg-paper-2 p-7">
            <div className="label-meta mb-4 text-mute">About the program</div>
            <p className="text-[15px] leading-[1.55] text-ink-2 whitespace-pre-line">{team.description}</p>
          </div>
        )}
        {team.what_we_offer && (
          <div className="rounded-2xl border border-line bg-paper-2 p-7">
            <div className="label-meta mb-4 text-mute">What we offer</div>
            <p className="text-[15px] leading-[1.55] text-ink-2 whitespace-pre-line">{team.what_we_offer}</p>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-line bg-paper-2 p-7">
        <Detail label="League" value={team.league} />
        <Detail label="Tier" value={team.league_tier ? TIER_LABELS[team.league_tier] : null} />
        <Detail label="Founded" value={team.founded_year} />
        <Detail label="Record" value={team.season_record} />
      </div>

      {team.website && (
        <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-7">
          <div className="label-meta mb-3 text-mute">Website</div>
          <a href={team.website} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold text-sage-deep underline-offset-4 hover:underline">
            {team.website.replace(/^https?:\/\//, "")} →
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        {isPlayer && (
          <MessageButton
            profileId={team.profile_id}
            isSeed={isSeed}
            className="btn btn-terra"
            label="Declare interest"
          />
        )}
        <Link href="/dashboard/teams" className="btn btn-ghost">
          Back to browse
        </Link>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">{label}</div>
      <div className="mt-1 text-[14px] font-semibold text-ink">{value || "—"}</div>
    </div>
  );
}

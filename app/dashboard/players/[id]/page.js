import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MessageButton from "../../MessageButton";
import InviteToTryoutButton from "../../tryouts/InviteToTryoutButton";

export const metadata = {
  title: "Player Profile - Picked",
};

const POSITION_LABELS = {
  point_guard: "Point Guard",
  shooting_guard: "Shooting Guard",
  small_forward: "Small Forward",
  power_forward: "Power Forward",
  center: "Center",
};

export default async function PlayerProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch player profile joined with base profile
  const { data: player, error } = await supabase
    .from("player_profiles")
    .select("*, profile:id(full_name, avatar_url, country, city)")
    .eq("id", id)
    .single();

  if (error || !player) {
    redirect("/dashboard/players");
  }

  // Check boost status
  const { data: boost } = await supabase
    .from("boosts")
    .select("id")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  // Fetch current user's role to conditionally show team actions
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();
  const isTeam = currentProfile?.role === "team";

  const isBoosted = !!boost;
  const profile = player.profile;

  const age = player.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(player.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const stats = [
    { label: "PPG", value: player.ppg },
    { label: "APG", value: player.apg },
    { label: "RPG", value: player.rpg },
    { label: "SPG", value: player.spg },
    { label: "BPG", value: player.bpg },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/players"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to players
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface-light text-2xl font-semibold text-orange-400">
            {(profile?.full_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {profile?.full_name || "Unnamed Player"}
              </h1>
              {isBoosted && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Boosted
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-orange-400">
              {POSITION_LABELS[player.position] || "Position TBD"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              {profile?.country && (
                <span>
                  {profile.country}
                  {profile.city && `, ${profile.city}`}
                </span>
              )}
              {age && (
                <>
                  <span>&middot;</span>
                  <span>{age} years old</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-surface p-4 text-center"
          >
            <p className="text-xs text-text-muted">{stat.label}</p>
            <p className="mt-1 text-xl font-bold text-text-primary">
              {stat.value !== null && stat.value !== undefined && stat.value !== 0
                ? Number(stat.value).toFixed(1)
                : "--"}
            </p>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          My Game
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailItem
            label="Height"
            value={player.height_cm ? `${player.height_cm} cm` : null}
          />
          <DetailItem
            label="Weight"
            value={player.weight_kg ? `${player.weight_kg} kg` : null}
          />
          <DetailItem
            label="Experience"
            value={
              player.experience_years
                ? `${player.experience_years} year${player.experience_years !== 1 ? "s" : ""}`
                : null
            }
          />
          <DetailItem label="Looking for" value={player.looking_for} />
        </div>
      </div>

      {/* Bio */}
      {player.bio && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Where I&apos;ve Been
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {player.bio}
          </p>
        </div>
      )}

      {/* Highlights */}
      {player.highlights_url && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            See Me Play
          </h2>
          <a
            href={player.highlights_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
            </svg>
            Watch highlights
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <MessageButton
          profileId={player.id}
          className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isTeam && <InviteToTryoutButton playerId={player.id} />}
        <Link
          href="/dashboard/players"
          className="flex-1 rounded-xl border border-border bg-surface py-3 text-center text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400"
        >
          Back to Browse
        </Link>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {value || "--"}
      </p>
    </div>
  );
}

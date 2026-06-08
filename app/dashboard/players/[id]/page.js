import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MessageButton from "../../MessageButton";
import InviteToTryoutButton from "../../tryouts/InviteToTryoutButton";

export const metadata = { title: "Player Profile — Picked" };

const EXP_LABELS = { amateur: "Amateur", semi_pro: "Semi-Pro", pro: "Pro" };
const TONES = ["warm", "rust", "sage", "cool"];
const GRADS = {
  warm: "linear-gradient(180deg,#221c17,#3a2f25 60%,#4a3d31)",
  rust: "linear-gradient(180deg,#2a1a16,#4a2a22 60%,#5a3530)",
  sage: "linear-gradient(180deg,#1f2820,#2d3a2a 60%,#3a4a37)",
  cool: "linear-gradient(180deg,#1f262a,#2c373c 60%,#3a4a4f)",
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

export default async function PlayerProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("profile_id", id)
    .single();

  if (error || !player) redirect("/dashboard/players");

  const { data: boost } = await supabase
    .from("boosts")
    .select("id")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("is_seed")
    .eq("id", id)
    .single();
  const isSeed = !!profileRow?.is_seed;

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();
  const isTeam = currentProfile?.role === "team";

  const isBoosted = !!boost;
  const profile = player.profile;
  const name = profile?.full_name || "Unnamed Player";
  const initials = name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const positions = player.positions || [];
  const posLabel = positions.length > 0
    ? positions.map((p) => p.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())).join(" · ")
    : "Position TBD";
  const age = calculateAge(player.date_of_birth);

  // Hash-based tone
  const toneIdx = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % TONES.length;
  const tone = TONES[toneIdx];

  const stats = [
    { label: "PPG", value: player.ppg },
    { label: "APG", value: player.apg },
    { label: "RPG", value: player.rpg },
    { label: "SPG", value: player.spg },
    { label: "BPG", value: player.bpg },
    { label: "3PT%", value: player.three_pt_pct, suffix: "%" },
  ];

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-8 sm:px-12 sm:py-10 lg:px-16">
      {/* Back */}
      <Link
        href="/dashboard/players"
        className="mb-8 inline-flex items-center gap-2 text-[13px] font-semibold text-mute hover:text-ink"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to players
      </Link>

      {/* ─── Hero card ────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Portrait */}
        <div className="relative overflow-hidden rounded-2xl border border-line" style={{ aspectRatio: "0.9/1" }}>
          <div className="absolute inset-0" style={{ background: GRADS[tone] }}>
            <div
              className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 font-serif italic select-none"
              style={{ fontSize: 260, color: "rgba(255,255,255,0.04)", fontWeight: 400, lineHeight: 1, letterSpacing: "-0.04em" }}
            >
              {initials}
            </div>
            <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 70%, rgba(0,0,0,0.45), transparent 70%)" }} />
          </div>

          <div className="absolute left-4 top-4 flex gap-1.5">
            {isSeed && (
              <span className="rounded-full bg-[rgba(252,248,236,0.95)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-mute">
                Sample
              </span>
            )}
            {isBoosted && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(252,248,236,0.95)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E0926F]" /> Boosted
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(252,248,236,0.95)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-sage-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Available
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="flex flex-col">
          <div className="label-meta text-mute">Player profile</div>

          <h1 className="mt-4 text-[42px] font-extrabold leading-[1] tracking-[-0.03em]">
            {name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-bold uppercase tracking-[0.1em] text-mute">
            <span>{posLabel}</span>
            {profile?.country && (
              <>
                <span className="text-line-2">·</span>
                <span>{profile.country}{profile.city && `, ${profile.city}`}</span>
              </>
            )}
            {age && (
              <>
                <span className="text-line-2">·</span>
                <span>{age} yrs</span>
              </>
            )}
            {player.experience_level && (
              <>
                <span className="text-line-2">·</span>
                <span className="text-sage-deep">{EXP_LABELS[player.experience_level]}</span>
              </>
            )}
          </div>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line sm:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-paper-2 px-4 py-4 text-center">
                <div className="num text-[22px] font-extrabold leading-none tracking-[-0.02em]">
                  {s.value != null && s.value !== 0
                    ? `${Number(s.value).toFixed(1)}${s.suffix || ""}`
                    : "—"}
                </div>
                <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-mute">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Detail label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
            <Detail label="Weight" value={player.weight_kg ? `${player.weight_kg} kg` : null} />
            <Detail label="Experience" value={player.experience_years ? `${player.experience_years} years` : null} />
            <Detail label="Exp level" value={player.experience_level ? EXP_LABELS[player.experience_level] : null} />
          </div>

          {/* Actions */}
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <MessageButton
              profileId={player.profile_id}
              isSeed={isSeed}
              className="btn btn-terra"
              label="Send message"
            />
            {isTeam && !isSeed && <InviteToTryoutButton playerId={player.profile_id} />}
            <Link href="/dashboard/players" className="btn btn-ghost">
              Back to browse
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Looking for / Previous teams ──────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {player.looking_for && (
          <div className="rounded-2xl border border-line bg-paper-2 p-7">
            <div className="label-meta mb-4 text-mute">Looking for</div>
            <p className="text-[15px] leading-[1.55] text-ink-2 whitespace-pre-line">
              {player.looking_for}
            </p>
          </div>
        )}

        {player.previous_teams && (
          <div className="rounded-2xl border border-line bg-paper-2 p-7">
            <div className="label-meta mb-4 text-mute">Previous teams</div>
            <p className="text-[15px] leading-[1.55] text-ink-2 whitespace-pre-line">
              {player.previous_teams}
            </p>
          </div>
        )}
      </div>

      {/* Highlights */}
      {player.highlights_url && (
        <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-7">
          <div className="label-meta mb-4 text-mute">Film & highlights</div>
          <a
            href={player.highlights_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-sage-deep underline-offset-4 hover:underline"
          >
            Watch highlights →
          </a>
        </div>
      )}
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

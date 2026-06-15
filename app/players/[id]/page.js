import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerProfileView from "@/app/components/PlayerProfileView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player } = await supabase
    .from("player_ads")
    .select("positions, height_cm, experience_level, profile:profile_id(full_name, country, avatar_url)")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  const name = player?.profile?.full_name || "Player";
  const positions = (player?.positions || [])
    .map((p) => p.replace("_", " "))
    .join(" / ");
  const details = [
    positions,
    player?.height_cm ? `${player.height_cm} cm` : null,
    player?.profile?.country,
  ]
    .filter(Boolean)
    .join(" · ");
  const description = details
    ? `${name} — ${details}. Film, stats and availability on Picked.`
    : `View ${name}'s basketball profile on Picked.`;

  return {
    title: `${name} - Picked Player Profile`,
    description,
    openGraph: {
      title: `${name} — Available now on Picked`,
      description,
      images: player?.profile?.avatar_url
        ? [{ url: player.profile.avatar_url }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Available now on Picked`,
      description,
    },
  };
}

export default async function PublicPlayerPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !player) notFound();

  const { data: boost } = await supabase
    .from("boosts")
    .select("id")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-sand px-6 py-6 text-ink sm:px-10 sm:py-8 lg:px-14">
      <header className="mx-auto mb-8 flex max-w-[1120px] items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2 text-[17px] font-extrabold tracking-wide">
          <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
          <span>Picked</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-[13px] font-bold text-ink hover:underline sm:inline">
            Log in
          </Link>
          <Link href="/signup?role=team" className="btn btn-ink">
            Open roster search
          </Link>
        </div>
      </header>

      <PlayerProfileView
        player={player}
        isBoosted={!!boost}
        isSeed={!!player.is_seed}
        backHref="/"
        backLabel="Back to Picked"
        publicActions={
          <>
            <Link href="/signup?role=team" className="btn btn-terra">
              Declare club interest
            </Link>
            <Link href="/signup?role=player" className="btn btn-ghost">
              Build your profile
            </Link>
          </>
        }
      />
    </main>
  );
}

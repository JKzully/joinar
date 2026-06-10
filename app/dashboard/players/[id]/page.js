import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlayerProfileView from "@/app/components/PlayerProfileView";
import MessageButton from "../../MessageButton";
import InviteToTryoutButton from "../../tryouts/InviteToTryoutButton";

export const metadata = { title: "Player Profile - Picked" };

export default async function PlayerProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: player, error } = await supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("profile_id", id)
    .single();

  if (error || !player) redirect("/dashboard/players");

  const [{ data: boost }, { data: profileRow }, { data: authResult }] = await Promise.all([
    supabase
      .from("boosts")
      .select("id")
      .eq("profile_id", id)
      .eq("is_active", true)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("is_seed")
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  const currentUser = authResult?.user;
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single();

  const isTeam = currentProfile?.role === "team";
  const isSeed = !!profileRow?.is_seed;

  return (
    <PlayerProfileView
      player={player}
      isBoosted={!!boost}
      isSeed={isSeed}
      backHref="/dashboard/players"
      backLabel="Back to players"
      actions={
        <>
          <MessageButton
            profileId={player.profile_id}
            isSeed={isSeed}
            className="btn btn-terra"
            label="Send message"
          />
          {isTeam && !isSeed && <InviteToTryoutButton playerId={player.profile_id} />}
          {player.is_active && (
            <Link href={`/players/${player.profile_id}`} className="btn btn-ghost">
              Public view
            </Link>
          )}
        </>
      }
    />
  );
}

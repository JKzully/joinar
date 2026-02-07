import { createClient } from "@/lib/supabase/server";
import PlayerAdForm from "./PlayerAdForm";
import TeamAdForm from "./TeamAdForm";

export const metadata = {
  title: "My Ad - Picked",
};

export default async function AdPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profile.role === "player") {
    const { data: playerAd } = await supabase
      .from("player_ads")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Player Ad</h1>
          <p className="mt-1 text-sm text-text-secondary">
            This is what teams see when they browse players
          </p>
        </div>
        <PlayerAdForm playerAd={playerAd} />
      </div>
    );
  }

  // Team
  const { data: teamAd } = await supabase
    .from("team_ads")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Team Ad</h1>
        <p className="mt-1 text-sm text-text-secondary">
          This is what players see when they browse teams
        </p>
      </div>
      <TeamAdForm teamAd={teamAd} />
    </div>
  );
}

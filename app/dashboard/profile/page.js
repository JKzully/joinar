import { createClient } from "@/lib/supabase/server";
import PlayerProfileForm from "./PlayerProfileForm";
import TeamProfileForm from "./TeamProfileForm";

export const metadata = {
  title: "Edit Profile - Joinar",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile.role === "player") {
    const { data: playerProfile } = await supabase
      .from("player_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Player Profile</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Update your details to help teams find you
          </p>
        </div>
        <PlayerProfileForm profile={profile} playerProfile={playerProfile} />
      </div>
    );
  }

  // Team
  const { data: teamProfile } = await supabase
    .from("team_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Team Profile</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Update your team details to attract the right players
        </p>
      </div>
      <TeamProfileForm profile={profile} teamProfile={teamProfile} />
    </div>
  );
}

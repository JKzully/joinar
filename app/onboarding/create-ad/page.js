import { createClient } from "@/lib/supabase/server";
import ProgressDots from "../ProgressDots";
import OnboardingPlayerAdForm from "./OnboardingPlayerAdForm";
import OnboardingTeamAdForm from "./OnboardingTeamAdForm";

export default async function OnboardingCreateAd() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "player";
  const table = role === "player" ? "player_ads" : "team_ads";

  const { data: existingAd } = await supabase
    .from(table)
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="animate-fade-in-up">
      <ProgressDots current={2} />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          {role === "player" ? "Create Your Player Ad" : "Create Your Team Ad"}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {role === "player"
            ? "Fill in your details so teams know what you bring to the court"
            : "Tell players about your team and what positions you need"}
        </p>
      </div>

      {role === "player" ? (
        <OnboardingPlayerAdForm playerAd={existingAd} />
      ) : (
        <OnboardingTeamAdForm teamAd={existingAd} />
      )}
    </div>
  );
}

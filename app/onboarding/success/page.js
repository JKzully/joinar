import { createClient } from "@/lib/supabase/server";
import ProgressDots from "../ProgressDots";
import SuccessContent from "./SuccessContent";

export default async function OnboardingSuccess() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url, country, city")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "player";
  const table = role === "player" ? "player_ads" : "team_ads";

  const { data: ad } = await supabase
    .from(table)
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return (
    <div className="animate-fade-in-up">
      <ProgressDots current={3} />
      <SuccessContent profile={profile} ad={ad} />
    </div>
  );
}

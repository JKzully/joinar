import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export const metadata = {
  title: "Build your profile — Picked",
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.onboarding_completed) redirect("/dashboard");

  const adTable = profile.role === "team" ? "team_ads" : "player_ads";
  const { data: ad } = await supabase
    .from(adTable)
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return <OnboardingWizard profile={profile} ad={ad || {}} />;
}

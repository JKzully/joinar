import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProgressDots from "./ProgressDots";

export default async function OnboardingWelcome() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, country")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "player";

  // Check resume state
  const hasAccountData = !!profile?.full_name && !!profile?.country;
  const table = role === "player" ? "player_ads" : "team_ads";
  const { data: ad } = await supabase
    .from(table)
    .select("id")
    .eq("profile_id", user.id)
    .maybeSingle();

  let resumeHref = "/onboarding/account";
  let resumeLabel = null;

  if (ad) {
    resumeHref = "/onboarding/success";
    resumeLabel = "Continue where you left off";
  } else if (hasAccountData) {
    resumeHref = "/onboarding/create-ad";
    resumeLabel = "Continue where you left off";
  }

  return (
    <div className="animate-fade-in-up text-center">
      <ProgressDots current={0} />

      <div className="mx-auto mb-6 text-6xl" style={{ animation: "bounce 2s infinite" }}>
        🏀
      </div>

      <h1 className="text-3xl font-bold text-text-primary">
        Welcome to Picked!
      </h1>
      <p className="mx-auto mt-3 max-w-md text-text-secondary">
        {role === "player"
          ? "Let's set up your profile and create your player ad so teams can find you."
          : "Let's set up your team profile and create your ad so players can find you."}
      </p>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Link
          href={resumeHref}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40"
        >
          {resumeLabel || "Let's Go"} &rarr;
        </Link>
      </div>
    </div>
  );
}

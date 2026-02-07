import { createClient } from "@/lib/supabase/server";
import ProgressDots from "../ProgressDots";
import OnboardingAccountForm from "./OnboardingAccountForm";

export default async function OnboardingAccount() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="animate-fade-in-up">
      <ProgressDots current={1} />

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-text-primary">Tell us about you</h1>
        <p className="mt-2 text-sm text-text-secondary">
          This information will be visible on your profile
        </p>
      </div>

      <OnboardingAccountForm profile={profile} />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ─── Save current step data for player ────────────────────────
export async function savePlayerStep(stepData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Profile-level fields (Step 01)
  const profilePatch = {};
  if (stepData.full_name !== undefined) profilePatch.full_name = stepData.full_name;
  if (stepData.country !== undefined) profilePatch.country = stepData.country;
  if (stepData.city !== undefined) profilePatch.city = stepData.city;

  if (Object.keys(profilePatch).length > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", user.id);
    if (profileError) return { error: profileError.message };
  }

  // Ad-level fields (Steps 02–05)
  const adPatch = { profile_id: user.id, is_active: false };
  const adFields = [
    "positions", "experience_level", "experience_years",
    "height_cm", "weight_kg", "date_of_birth", "previous_teams",
    "highlights_url", "preferred_countries", "languages",
    "ppg", "apg", "rpg", "three_pt_pct", "looking_for",
  ];
  let hasAdData = false;
  for (const f of adFields) {
    if (stepData[f] !== undefined) {
      adPatch[f] = stepData[f];
      hasAdData = true;
    }
  }

  if (hasAdData) {
    const { error: adError } = await supabase
      .from("player_ads")
      .upsert(adPatch, { onConflict: "profile_id" });
    if (adError) return { error: adError.message };
  }

  revalidatePath("/onboarding");
  return { ok: true };
}

// ─── Save current step for team ──────────────────────────────
export async function saveTeamStep(stepData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const profilePatch = {};
  if (stepData.full_name !== undefined) profilePatch.full_name = stepData.full_name;
  if (stepData.country !== undefined) profilePatch.country = stepData.country;
  if (stepData.city !== undefined) profilePatch.city = stepData.city;

  if (Object.keys(profilePatch).length > 0) {
    const { error } = await supabase.from("profiles").update(profilePatch).eq("id", user.id);
    if (error) return { error: error.message };
  }

  const adPatch = { profile_id: user.id, is_active: false };
  const adFields = [
    "team_name", "league", "league_tier", "division", "founded_year",
    "positions_needed", "description", "what_we_offer", "website", "season_record",
  ];
  let hasAdData = false;
  for (const f of adFields) {
    if (stepData[f] !== undefined) {
      adPatch[f] = stepData[f];
      hasAdData = true;
    }
  }

  if (hasAdData) {
    const { error } = await supabase.from("team_ads").upsert(adPatch, { onConflict: "profile_id" });
    if (error) return { error: error.message };
  }

  revalidatePath("/onboarding");
  return { ok: true };
}

// ─── Complete onboarding ──────────────────────────────────────
export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) return { error: error.message };

  redirect("/dashboard");
}

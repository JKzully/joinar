"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updatePlayerProfile(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Update base profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") || null,
      country: formData.get("country") || null,
      city: formData.get("city") || null,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // Upsert player profile
  const playerData = {
    id: user.id,
    position: formData.get("position") || null,
    height_cm: parseInt(formData.get("height_cm")) || null,
    weight_kg: parseInt(formData.get("weight_kg")) || null,
    date_of_birth: formData.get("date_of_birth") || null,
    experience_years: parseInt(formData.get("experience_years")) || 0,
    bio: formData.get("bio") || null,
    highlights_url: formData.get("highlights_url") || null,
    ppg: parseFloat(formData.get("ppg")) || 0,
    apg: parseFloat(formData.get("apg")) || 0,
    rpg: parseFloat(formData.get("rpg")) || 0,
    spg: parseFloat(formData.get("spg")) || 0,
    bpg: parseFloat(formData.get("bpg")) || 0,
    looking_for: formData.get("looking_for") || null,
  };

  const { error: playerError } = await supabase
    .from("player_profiles")
    .upsert(playerData, { onConflict: "id" });

  if (playerError) return { error: playerError.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTeamProfile(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // Update base profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") || null,
      country: formData.get("country") || null,
      city: formData.get("city") || null,
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // Upsert team profile
  const teamData = {
    id: user.id,
    team_name: formData.get("team_name") || "",
    league: formData.get("league") || null,
    league_tier: parseInt(formData.get("league_tier")) || null,
    description: formData.get("description") || null,
    website: formData.get("website") || null,
    founded_year: parseInt(formData.get("founded_year")) || null,
  };

  const { error: teamError } = await supabase
    .from("team_profiles")
    .upsert(teamData, { onConflict: "id" });

  if (teamError) return { error: teamError.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function startConversation(otherProfileId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (user.id === otherProfileId) return { error: "Cannot message yourself" };

  // Check if a conversation already exists between these two users
  const { data: myConversations } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  if (myConversations && myConversations.length > 0) {
    const myConvIds = myConversations.map((c) => c.conversation_id);

    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("profile_id", otherProfileId)
      .in("conversation_id", myConvIds);

    if (shared && shared.length > 0) {
      return { conversationId: shared[0].conversation_id };
    }
  }

  // Create new conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convError) return { error: convError.message };

  // Add both participants
  const { error: partError } = await supabase
    .from("conversation_participants")
    .insert([
      { conversation_id: conversation.id, profile_id: user.id },
      { conversation_id: conversation.id, profile_id: otherProfileId },
    ]);

  if (partError) return { error: partError.message };

  return { conversationId: conversation.id };
}

export async function sendMessage(conversationId, content) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Message cannot be empty" };

  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: trimmed,
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/messages");
  return { message };
}

export async function markMessagesRead(conversationId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);
}

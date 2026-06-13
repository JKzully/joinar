"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePositions } from "@/lib/basketball/positions.mjs";
import {
  sendNewMessageEmail,
  sendTryoutInvitationEmail,
} from "@/lib/email";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function completeOnboarding() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateAccount(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: formData.get("full_name") || null,
      country: formData.get("country") || null,
      city: formData.get("city") || null,
      bio: formData.get("bio") || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function uploadAvatar(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar");
  if (!file || !file.size) return { error: "No file provided" };

  const ALLOWED_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const MAX_SIZE = 5 * 1024 * 1024;

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) return { error: "Only JPG, PNG or WebP images are allowed" };
  if (file.size > MAX_SIZE) return { error: "Image must be under 5MB" };

  const filePath = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let { error: uploadError } = await supabase.storage
    .from("Avatars")
    .upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    });

  // Keep existing deployments working until the owner-only storage policies
  // in the security migration have been applied.
  if (
    uploadError &&
    ["403", "42501"].includes(String(uploadError.statusCode || uploadError.status))
  ) {
    const admin = createAdminClient();
    const fallback = await admin.storage.from("Avatars").upload(filePath, buffer, {
      upsert: true,
      contentType: file.type,
    });
    uploadError = fallback.error;
  }

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage
    .from("Avatars")
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  revalidatePath("/dashboard");
  return { success: true, avatar_url: urlData.publicUrl };
}

export async function updatePlayerAd(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const positions = normalizePositions(formData.getAll("positions"));

  const preferredCountries = parseCommaList(formData.get("preferred_countries"));
  const languages = parseCommaList(formData.get("languages"));

  const adData = {
    profile_id: user.id,
    positions,
    height_cm: parseInt(formData.get("height_cm")) || null,
    weight_kg: parseInt(formData.get("weight_kg")) || null,
    date_of_birth: formData.get("date_of_birth") || null,
    experience_level: formData.get("experience_level") || null,
    experience_years: parseInt(formData.get("experience_years")) || 0,
    previous_teams: formData.get("previous_teams") || null,
    highlights_url: formData.get("highlights_url") || null,
    preferred_countries: preferredCountries,
    languages,
    ppg: parseFloat(formData.get("ppg")) || 0,
    apg: parseFloat(formData.get("apg")) || 0,
    rpg: parseFloat(formData.get("rpg")) || 0,
    spg: parseFloat(formData.get("spg")) || 0,
    bpg: parseFloat(formData.get("bpg")) || 0,
    three_pt_pct: parseFloat(formData.get("three_pt_pct")) || null,
    looking_for: formData.get("looking_for") || null,
  };

  const { error } = await supabase
    .from("player_ads")
    .upsert(adData, { onConflict: "profile_id" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

function parseCommaList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hasText(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function getMissingPublishFields(role, profile, ad) {
  if (role === "team") {
    return [
      [profile?.country, "country"],
      [ad?.team_name, "team name"],
      [ad?.league, "league"],
      [ad?.positions_needed?.length > 0, "positions needed"],
      [ad?.description, "team description"],
      [ad?.what_we_offer, "what you offer"],
    ]
      .filter(([value]) => !hasText(value))
      .map(([, label]) => label);
  }

  return [
    [profile?.full_name, "name"],
    [profile?.country, "country"],
    [ad?.positions?.length > 0, "position"],
    [ad?.height_cm, "height"],
    [ad?.date_of_birth, "date of birth"],
    [ad?.experience_level, "level"],
    [ad?.highlights_url, "film or social link"],
    [ad?.preferred_countries?.length > 0, "preferred countries"],
    [ad?.languages?.length > 0, "languages"],
    [ad?.looking_for, "player description"],
  ]
    .filter(([value]) => !hasText(value))
    .map(([, label]) => label);
}

export async function updateTeamAd(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const positionsNeeded = normalizePositions(formData.getAll("positions_needed"));

  const adData = {
    profile_id: user.id,
    team_name: formData.get("team_name") || null,
    positions_needed: positionsNeeded,
    league: formData.get("league") || null,
    league_tier: parseInt(formData.get("league_tier")) || null,
    division: formData.get("division") || null,
    description: formData.get("description") || null,
    what_we_offer: formData.get("what_we_offer") || null,
    website: formData.get("website") || null,
    founded_year: parseInt(formData.get("founded_year")) || null,
    season_record: formData.get("season_record") || null,
  };

  const { error } = await supabase
    .from("team_ads")
    .upsert(adData, { onConflict: "profile_id" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleAdActive() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, country")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found" };

  const table = profile.role === "player" ? "player_ads" : "team_ads";

  const { data: ad } = await supabase
    .from(table)
    .select("*")
    .eq("profile_id", user.id)
    .single();

  if (!ad) return { error: "No ad found" };

  const newState = !ad.is_active;
  if (newState) {
    const missing = getMissingPublishFields(profile.role, profile, ad);
    if (missing.length > 0) {
      return {
        error: `Finish these before publishing: ${missing.join(", ")}.`,
      };
    }
  }

  const { error } = await supabase
    .from(table)
    .update({ is_active: newState })
    .eq("id", ad.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ad");
  return { success: true, is_active: newState };
}

export async function startConversation(otherProfileId) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };
  if (user.id === otherProfileId) return { error: "Cannot message yourself" };

  // Finds the existing 1:1 conversation or creates one, atomically,
  // with participant inserts locked down behind the RPC.
  const { data: conversationId, error } = await supabase.rpc(
    "start_conversation",
    { other_profile_id: otherProfileId }
  );

  if (error) return { error: error.message };

  return { conversationId };
}

export async function sendMessage(conversationId, content) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Message cannot be empty" };
  if (trimmed.length > 4000) {
    return { error: "Messages must be 4,000 characters or fewer" };
  }

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

  // Send email notification to recipient (fire-and-forget)
  try {
    // Find the other participant
    const { data: otherParticipant } = await supabase
      .from("conversation_participants")
      .select("profile_id")
      .eq("conversation_id", conversationId)
      .neq("profile_id", user.id)
      .single();

    if (otherParticipant) {
      // Check if recipient has been active recently (read a message in last 5 min)
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentReads } = await supabase
        .from("messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("sender_id", user.id)
        .gte("read_at", fiveMinAgo)
        .limit(1);

      // Only email if recipient appears inactive
      if (!recentReads || recentReads.length === 0) {
        const admin = createAdminClient();
        const { data: recipientAuth } = await admin.auth.admin.getUserById(
          otherParticipant.profile_id
        );
        const { data: senderProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (recipientAuth?.user?.email) {
          await sendNewMessageEmail(
            recipientAuth.user.email,
            senderProfile?.full_name || "Someone",
            trimmed,
            conversationId
          );
        }
      }
    }
  } catch (emailErr) {
    console.error("[sendMessage] Email notification failed:", emailErr);
  }

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

export async function createTryoutInvitation(formData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const playerId = formData.get("player_id");
  const tryoutDate = formData.get("tryout_date") || null;
  const location = formData.get("location") || null;
  const message = formData.get("message") || null;
  if (String(location || "").length > 240) {
    return { error: "Location must be 240 characters or fewer" };
  }
  if (String(message || "").length > 2000) {
    return { error: "Message must be 2,000 characters or fewer" };
  }

  // Verify caller is a team
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "team") return { error: "Only teams can send invitations" };

  // Check for existing pending invitation to same player
  const { data: existing } = await supabase
    .from("tryout_invitations")
    .select("id")
    .eq("team_id", user.id)
    .eq("player_id", playerId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return { error: "You already have a pending invitation for this player" };

  // Insert invitation
  const { data: invitation, error } = await supabase
    .from("tryout_invitations")
    .insert({
      team_id: user.id,
      player_id: playerId,
      tryout_date: tryoutDate,
      location,
      message,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) return { error: error.message };

  // Send email notification to player (fire-and-forget)
  try {
    const admin = createAdminClient();
    const { data: playerAuth } = await admin.auth.admin.getUserById(playerId);
    const { data: teamAd } = await supabase
      .from("team_ads")
      .select("team_name")
      .eq("profile_id", user.id)
      .single();

    if (playerAuth?.user?.email) {
      await sendTryoutInvitationEmail(
        playerAuth.user.email,
        teamAd?.team_name || "A team",
        tryoutDate,
        location,
        message
      );
    }
  } catch (emailErr) {
    console.error("[createTryoutInvitation] Email notification failed:", emailErr);
  }

  revalidatePath("/dashboard/tryouts");
  return { success: true, invitation };
}

export async function respondToTryoutInvitation(invitationId, status) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  if (!["accepted", "declined"].includes(status)) {
    return { error: "Invalid status" };
  }

  const { error: rpcError } = await supabase.rpc("respond_to_tryout_invitation", {
    invitation_id: invitationId,
    response: status,
  });

  if (rpcError?.code === "PGRST202") {
    const { data: invitation } = await supabase
      .from("tryout_invitations")
      .select("id, status, player_id")
      .eq("id", invitationId)
      .single();

    if (!invitation) return { error: "Invitation not found" };
    if (invitation.player_id !== user.id) return { error: "Not authorized" };
    if (invitation.status !== "pending") {
      return { error: "Invitation already responded to" };
    }

    const { error: updateError } = await supabase
      .from("tryout_invitations")
      .update({ status })
      .eq("id", invitationId)
      .eq("player_id", user.id)
      .eq("status", "pending");

    if (updateError) return { error: updateError.message };
  } else if (rpcError) {
    return { error: rpcError.message };
  }

  revalidatePath("/dashboard/tryouts");
  return { success: true };
}

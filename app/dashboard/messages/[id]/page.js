import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "./ChatThread";

export const metadata = {
  title: "Conversation - Picked",
};

export default async function ConversationPage({ params }) {
  const { id: conversationId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Verify user is a participant
  const { data: participant } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .single();

  if (!participant) {
    redirect("/dashboard/messages");
  }

  // Get the other participant
  const { data: otherParticipant } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .neq("profile_id", user.id)
    .single();

  let otherProfile = null;
  if (otherParticipant) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url, country, city")
      .eq("id", otherParticipant.profile_id)
      .single();
    otherProfile = data;
  }

  // Load messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .neq("sender_id", user.id)
    .is("read_at", null);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line pb-4">
        <Link
          href="/dashboard/messages"
          className="flex h-9 w-9 items-center justify-center rounded-full text-mute transition-colors hover:bg-paper hover:text-ink"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-[14px] font-bold text-terra">
          {(otherProfile?.full_name || "?").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-ink">
            {otherProfile?.full_name || "Unknown"}
          </h2>
          <p className="text-[12px] capitalize text-mute">
            {otherProfile?.role || "user"}
            {otherProfile?.country && ` \u00B7 ${otherProfile.country}`}
          </p>
        </div>
      </div>

      {/* Chat thread (client component) */}
      <ChatThread
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages || []}
        otherProfile={otherProfile}
      />
    </div>
  );
}

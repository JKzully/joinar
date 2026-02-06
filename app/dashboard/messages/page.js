import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Messages - Joinar",
};

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get all conversation IDs the user is part of
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", user.id);

  const conversationIds = participantRows?.map((r) => r.conversation_id) || [];

  if (conversationIds.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Your conversations with players and teams
          </p>
        </div>
        <EmptyInbox />
      </div>
    );
  }

  // Get all participants for these conversations (to find the other person)
  const { data: allParticipants } = await supabase
    .from("conversation_participants")
    .select("conversation_id, profile_id")
    .in("conversation_id", conversationIds);

  // Get the latest message for each conversation
  const { data: latestMessages } = await supabase
    .from("messages")
    .select("*")
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  // Group: latest message per conversation
  const latestByConv = {};
  latestMessages?.forEach((msg) => {
    if (!latestByConv[msg.conversation_id]) {
      latestByConv[msg.conversation_id] = msg;
    }
  });

  // Count unread per conversation
  const unreadByConv = {};
  latestMessages?.forEach((msg) => {
    if (msg.sender_id !== user.id && !msg.read_at) {
      unreadByConv[msg.conversation_id] =
        (unreadByConv[msg.conversation_id] || 0) + 1;
    }
  });

  // Get the other participant's profile_id for each conversation
  const otherProfileIds = new Set();
  const otherByConv = {};
  allParticipants?.forEach((p) => {
    if (p.profile_id !== user.id) {
      otherByConv[p.conversation_id] = p.profile_id;
      otherProfileIds.add(p.profile_id);
    }
  });

  // Fetch profiles for the other participants
  const profilesMap = {};
  if (otherProfileIds.size > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url, country")
      .in("id", [...otherProfileIds]);

    profiles?.forEach((p) => {
      profilesMap[p.id] = p;
    });
  }

  // Build conversation list, sorted by latest message time
  const conversations = conversationIds
    .map((convId) => ({
      id: convId,
      lastMessage: latestByConv[convId] || null,
      unread: unreadByConv[convId] || 0,
      otherProfile: profilesMap[otherByConv[convId]] || null,
    }))
    .filter((c) => c.lastMessage)
    .sort(
      (a, b) =>
        new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Your conversations with players and teams
        </p>
      </div>

      {conversations.length > 0 ? (
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
          {conversations.map((conv) => (
            <ConversationRow
              key={conv.id}
              conversation={conv}
              currentUserId={user.id}
            />
          ))}
        </div>
      ) : (
        <EmptyInbox />
      )}
    </div>
  );
}

function ConversationRow({ conversation, currentUserId }) {
  const { id, lastMessage, unread, otherProfile } = conversation;
  const name = otherProfile?.full_name || "Unknown";
  const isOwnMessage = lastMessage.sender_id === currentUserId;

  const timeStr = formatRelativeTime(lastMessage.created_at);

  return (
    <Link
      href={`/dashboard/messages/${id}`}
      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-light"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-light text-sm font-semibold text-orange-400">
          {name.charAt(0).toUpperCase()}
        </div>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`truncate text-sm ${
              unread > 0
                ? "font-semibold text-text-primary"
                : "font-medium text-text-primary"
            }`}
          >
            {name}
          </h3>
          <span className="shrink-0 text-xs text-text-muted">{timeStr}</span>
        </div>
        <div className="flex items-center gap-1">
          <p
            className={`truncate text-sm ${
              unread > 0 ? "text-text-secondary" : "text-text-muted"
            }`}
          >
            {isOwnMessage && (
              <span className="text-text-muted">You: </span>
            )}
            {lastMessage.content}
          </p>
        </div>
        <p className="mt-0.5 text-xs capitalize text-text-muted">
          {otherProfile?.role || "user"}
          {otherProfile?.country && ` \u00B7 ${otherProfile.country}`}
        </p>
      </div>

      {/* Chevron */}
      <svg
        className="h-4 w-4 shrink-0 text-text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function EmptyInbox() {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <svg
        className="mx-auto h-10 w-10 text-text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      <p className="mt-3 text-sm text-text-muted">No conversations yet</p>
      <p className="mt-1 text-xs text-text-muted">
        This could be the conversation that changes your career. Browse players or teams to get started.
      </p>
    </div>
  );
}

function formatRelativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardTopNav from "./DashboardTopNav";

export const metadata = {
  title: "Dashboard — Picked",
};

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  // Unread message count — joined to conversations user is a participant in
  let unreadCount = 0;
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id, last_read_at")
    .eq("profile_id", profile.id);

  if (participantRows && participantRows.length > 0) {
    for (const row of participantRows) {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", row.conversation_id)
        .neq("sender_id", profile.id)
        .gt("created_at", row.last_read_at || "1970-01-01");
      unreadCount += count || 0;
    }
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <DashboardTopNav profile={profile} unreadCount={unreadCount} />
      <main>{children}</main>
    </div>
  );
}

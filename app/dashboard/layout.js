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

  // Unread message count — one batched count across conversations user participates in.
  let unreadCount = 0;
  const { data: participantRows } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("profile_id", profile.id);

  if (participantRows && participantRows.length > 0) {
    const conversationIds = participantRows.map((row) => row.conversation_id);
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", conversationIds)
      .neq("sender_id", profile.id)
      .is("read_at", null);
    unreadCount = count || 0;
  }

  return (
    <div className="min-h-screen bg-sand text-ink">
      <DashboardTopNav profile={profile} unreadCount={unreadCount} />
      <main className="mx-auto max-w-[1340px] px-6 py-8 sm:px-12 lg:px-14">
        {children}
      </main>
    </div>
  );
}

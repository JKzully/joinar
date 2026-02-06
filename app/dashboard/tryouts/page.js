import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import TryoutActions from "./TryoutActions";

export const metadata = {
  title: "Tryout Invitations - Joinar",
};

export default async function TryoutsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isTeam = profile?.role === "team";

  if (isTeam) {
    // Team view: invitations this team has sent
    const { data: invitations } = await supabase
      .from("tryout_invitations")
      .select("*, player:player_id(id, profile:id(full_name))")
      .eq("team_id", user.id)
      .order("created_at", { ascending: false });

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Sent Invitations
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              Tryout invitations you&apos;ve sent to players
            </p>
          </div>
          <Link
            href="/dashboard/players"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Invite a Player
          </Link>
        </div>

        {invitations && invitations.length > 0 ? (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/players/${inv.player_id}`}
                      className="text-sm font-semibold text-text-primary hover:text-orange-400 transition-colors"
                    >
                      {inv.player?.profile?.full_name || "Unknown Player"}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                      {inv.tryout_date && (
                        <span className="flex items-center gap-1.5">
                          <CalendarIcon />
                          {formatDate(inv.tryout_date)}
                        </span>
                      )}
                      {inv.location && (
                        <span className="flex items-center gap-1.5">
                          <LocationIcon />
                          {inv.location}
                        </span>
                      )}
                    </div>
                    {inv.message && (
                      <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                        {inv.message}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No invitations sent yet"
            sub="Browse players and invite them to your tryouts"
          />
        )}
      </div>
    );
  }

  // Player view: invitations this player has received
  const { data: invitations } = await supabase
    .from("tryout_invitations")
    .select("*, team:team_id(id, team_name)")
    .eq("player_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Tryout Invitations
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Invitations from teams to attend their tryouts
        </p>
      </div>

      {invitations && invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/teams/${inv.team_id}`}
                    className="text-sm font-semibold text-text-primary hover:text-orange-400 transition-colors"
                  >
                    {inv.team?.team_name || "Unknown Team"}
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
                    {inv.tryout_date && (
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon />
                        {formatDate(inv.tryout_date)}
                      </span>
                    )}
                    {inv.location && (
                      <span className="flex items-center gap-1.5">
                        <LocationIcon />
                        {inv.location}
                      </span>
                    )}
                  </div>
                  {inv.message && (
                    <p className="mt-2 text-sm text-text-secondary line-clamp-2">
                      {inv.message}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {inv.status === "pending" ? (
                    <TryoutActions invitationId={inv.id} />
                  ) : (
                    <StatusBadge status={inv.status} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          message="No tryout invitations yet"
          sub="When a team invites you to try out, it will appear here"
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange-500/15 text-orange-400",
    accepted: "bg-green-500/15 text-green-400",
    declined: "bg-red-500/15 text-red-400",
    cancelled: "bg-surface-light text-text-muted",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
}

function EmptyState({ message, sub }) {
  return (
    <div className="rounded-2xl border border-dashed border-border py-16 text-center">
      <svg
        className="mx-auto h-10 w-10 text-text-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
      <p className="mt-3 text-sm text-text-muted">{message}</p>
      <p className="mt-1 text-xs text-text-muted">{sub}</p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

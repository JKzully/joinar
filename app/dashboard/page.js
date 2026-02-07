import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile.role === "player") {
    return <PlayerDashboard supabase={supabase} profile={profile} />;
  }

  return <TeamDashboard supabase={supabase} profile={profile} />;
}

// ─── Player Dashboard ────────────────────────────────────────

async function PlayerDashboard({ supabase, profile }) {
  const { data: playerAd } = await supabase
    .from("player_ads")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { count: messageCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", profile.id);

  const { data: invitations } = await supabase
    .from("tryout_invitations")
    .select("*")
    .eq("player_id", profile.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch team names for invitations from team_ads
  let invitationsWithTeam = [];
  if (invitations && invitations.length > 0) {
    const teamIds = invitations.map((i) => i.team_id);
    const { data: teamAds } = await supabase
      .from("team_ads")
      .select("profile_id, team_name")
      .in("profile_id", teamIds);
    const teamNameMap = {};
    teamAds?.forEach((t) => { teamNameMap[t.profile_id] = t.team_name; });
    invitationsWithTeam = invitations.map((inv) => ({
      ...inv,
      team_name: teamNameMap[inv.team_id] || "Unknown Team",
    }));
  }

  const { data: activeBoost } = await supabase
    .from("boosts")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const hasAd = !!playerAd;

  // Calculate ad completion
  const completionFields = playerAd
    ? [
        playerAd.positions?.length > 0,
        playerAd.height_cm,
        playerAd.date_of_birth,
        playerAd.experience_years,
        playerAd.looking_for,
        profile.country,
        profile.avatar_url,
      ]
    : [];
  const filledFields = completionFields.filter(Boolean).length;
  const completionPct = hasAd
    ? Math.round((filledFields / completionFields.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {profile.full_name || "Player"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Here&apos;s what&apos;s happening with your profile
        </p>
      </div>

      {/* Ad completion banner */}
      {completionPct < 100 && (
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-text-primary">
                Complete your ad
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                {hasAd
                  ? "Add more details to get noticed by teams."
                  : "Set up your player ad to start getting discovered."}
              </p>
            </div>
            <Link
              href="/dashboard/ad"
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              {hasAd ? "Edit Ad" : "Create Ad"}
            </Link>
          </div>
          {hasAd && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Ad completion</span>
                <span>{completionPct}%</span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-surface-light">
                <div
                  className="h-2 rounded-full bg-orange-500 transition-all"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Profile Views"
          value="--"
          note="Coming soon"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Messages"
          value={messageCount || 0}
          note="Total conversations"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          }
        />
        <StatCard
          label="Tryout Invites"
          value={invitationsWithTeam.length}
          note="Pending"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatCard
          label="Boost Status"
          value={activeBoost ? "Active" : "Inactive"}
          note={activeBoost ? "Your profile is boosted" : "Boost to get seen more"}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          accent={!!activeBoost}
        />
      </div>

      {/* Pending tryout invitations */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Tryout Invitations
          </h2>
          <Link
            href="/dashboard/tryouts"
            className="text-sm font-medium text-orange-400 hover:text-orange-500"
          >
            View all &rarr;
          </Link>
        </div>
        {invitationsWithTeam.length > 0 ? (
          <div className="space-y-3">
            {invitationsWithTeam.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {inv.team_name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {inv.tryout_date
                      ? new Date(inv.tryout_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date TBD"}
                    {inv.location && ` \u00B7 ${inv.location}`}
                  </p>
                </div>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium capitalize text-orange-400">
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No tryout invitations yet"
            sub="When teams invite you to tryouts, they'll show up here."
          />
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          href="/dashboard/teams"
          title="Browse Teams"
          description="Find teams with open positions that match your skills"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/messages"
          title="Messages"
          description="Check your conversations with teams"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/boost"
          title="Boost Profile"
          description="Get more visibility in search results"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ─── Team Dashboard ──────────────────────────────────────────

async function TeamDashboard({ supabase, profile }) {
  const { data: teamAd } = await supabase
    .from("team_ads")
    .select("*")
    .eq("profile_id", profile.id)
    .maybeSingle();

  const { data: invitations } = await supabase
    .from("tryout_invitations")
    .select("*")
    .eq("team_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch player names for invitations
  let invitationsWithPlayer = [];
  if (invitations && invitations.length > 0) {
    const playerIds = invitations.map((i) => i.player_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", playerIds);
    const nameMap = {};
    profiles?.forEach((p) => { nameMap[p.id] = p.full_name; });
    invitationsWithPlayer = invitations.map((inv) => ({
      ...inv,
      player_name: nameMap[inv.player_id] || "Unknown Player",
    }));
  }

  const { data: activeBoost } = await supabase
    .from("boosts")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const hasAd = !!teamAd;
  const openPositions = teamAd?.positions_needed || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {teamAd?.team_name || profile.full_name || "Team"}
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your team and find the right talent
        </p>
      </div>

      {/* Setup banner */}
      {!hasAd && (
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 to-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-text-primary">
                Set up your team ad
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                Add your team details, league info, and list positions needed
                to attract players.
              </p>
            </div>
            <Link
              href="/dashboard/ad"
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Create Ad
            </Link>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Positions Needed"
          value={openPositions.length}
          note="Listed in your ad"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
            </svg>
          }
        />
        <StatCard
          label="Invites Sent"
          value={invitationsWithPlayer.length}
          note="Recent tryout invites"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          }
        />
        <StatCard
          label="Profile Views"
          value="--"
          note="Coming soon"
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Boost Status"
          value={activeBoost ? "Active" : "Inactive"}
          note={activeBoost ? "Team is boosted" : "Boost to attract more players"}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
          accent={!!activeBoost}
        />
      </div>

      {/* Positions needed */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Positions Needed
          </h2>
          <Link
            href="/dashboard/ad"
            className="text-sm font-medium text-orange-400 hover:text-orange-500"
          >
            Edit Ad &rarr;
          </Link>
        </div>
        {openPositions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {openPositions.map((pos) => (
              <span
                key={pos}
                className="rounded-full bg-orange-500/10 px-3 py-1.5 text-sm font-medium text-orange-400"
              >
                {pos}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No positions listed"
            sub="Edit your ad to list positions you need."
          />
        )}
      </div>

      {/* Recent invitations */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            Recent Tryout Invites
          </h2>
          <Link
            href="/dashboard/tryouts"
            className="text-sm font-medium text-orange-400 hover:text-orange-500"
          >
            View all &rarr;
          </Link>
        </div>
        {invitationsWithPlayer.length > 0 ? (
          <div className="space-y-3">
            {invitationsWithPlayer.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {inv.player_name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {inv.tryout_date
                      ? new Date(inv.tryout_date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date TBD"}
                    {inv.location && ` \u00B7 ${inv.location}`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                    inv.status === "accepted"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : inv.status === "declined"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="No tryout invites sent"
            sub="Browse players and invite them to tryouts."
          />
        )}
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction
          href="/dashboard/ad"
          title="Edit Ad"
          description="Update your team listing and positions needed"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/players"
          title="Browse Players"
          description="Search for players by position, country, and more"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/boost"
          title="Boost Team"
          description="Get more visibility from top talent"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────

function StatCard({ label, value, note, icon, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            accent ? "bg-orange-500/15 text-orange-400" : "bg-surface-light text-text-muted"
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{note}</p>
    </div>
  );
}

function QuickAction({ href, title, description, icon }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-border bg-surface p-5 transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-xs text-text-muted">{description}</p>
    </Link>
  );
}

function EmptyState({ message, sub }) {
  return (
    <div className="rounded-xl border border-dashed border-border py-8 text-center">
      <p className="text-sm text-text-muted">{message}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

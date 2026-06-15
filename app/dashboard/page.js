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

  const { count: conversationCount } = await supabase
    .from("conversation_participants")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", profile.id);

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
  const isPublished = !!playerAd?.is_active;
  const hasSeasonStats = !!playerAd && [
    playerAd.ppg,
    playerAd.apg,
    playerAd.rpg,
    playerAd.spg,
    playerAd.bpg,
    playerAd.three_pt_pct,
  ].some((value) => value != null && Number(value) > 0);

  // Calculate ad completion
  const completionFields = playerAd
    ? [
        playerAd.positions?.length > 0,
        playerAd.height_cm,
        playerAd.date_of_birth,
        playerAd.experience_years != null,
        playerAd.looking_for,
        playerAd.highlights_url,
        playerAd.preferred_countries?.length > 0,
        playerAd.languages?.length > 0,
        profile.country,
      ]
    : [];
  const filledFields = completionFields.filter(Boolean).length;
  const completionPct = hasAd
    ? Math.round((filledFields / completionFields.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="label-meta text-terra-deep">Dashboard</p>
        <h1 className="display-sm mt-3">
          Welcome back, {profile.full_name || "Player"}
        </h1>
        <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-ink-2">
          {isPublished
            ? "Your profile is live. Keep the coach scan sharp, then reach out to teams that fit."
            : "Your profile is saved as a draft. Finish the essentials, then publish when you are ready."}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-line bg-paper-2 p-6 sm:p-7">
          <div className={`label-meta ${isPublished ? "text-sage-deep" : "text-terra-deep"}`}>
            {isPublished ? "Profile live" : "Draft profile"}
          </div>
          <h2 className="display-sm mt-4 max-w-[560px]" style={{ fontSize: 38 }}>
            {isPublished ? "Improve the coach scan." : "Finish the coach scan before going live."}
          </h2>
          <p className="mt-4 max-w-[540px] text-[14px] leading-[1.6] text-ink-2">
            {isPublished
              ? "Coaches decide fast. Make sure the profile has film, fit, markets and a clear description."
              : "You can edit safely while hidden from team search. Publish once the profile has enough signal for a manager to judge fit."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {hasAd && isPublished && (
              <Link href={`/players/${profile.id}`} className="btn btn-ink">
                View public profile &rarr;
              </Link>
            )}
            {hasAd && !isPublished && (
              <Link href={`/dashboard/players/${profile.id}`} className="btn btn-ink">
                Preview profile &rarr;
              </Link>
            )}
            {!isPublished ? (
              <Link href="/dashboard/ad" className="btn btn-terra">
                Publish when ready &rarr;
              </Link>
            ) : !hasSeasonStats ? (
              <Link
                href="/dashboard/ad#season-stats"
                className="btn btn-terra"
              >
                Add season stats &rarr;
              </Link>
            ) : (
              <Link href="/dashboard/teams" className="btn btn-terra">
                Browse teams &rarr;
              </Link>
            )}
            <Link href="/dashboard/ad" className="btn btn-ghost">
              Edit profile
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-paper-2 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-bold text-ink">
                Coach scan
              </h2>
              <p className="mt-1 text-[13px] leading-[1.55] text-ink-2">
                {completionPct}% ready for a fast manager read.
              </p>
            </div>
            <span className="num text-[28px] font-bold leading-none text-ink">
              {completionPct}%
            </span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-paper">
            <div
              className="h-2 rounded-full bg-terra transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="mt-5 space-y-3 border-t border-line pt-5">
            <ScanRow label="Visibility" value={isPublished ? "Published" : "Draft"} muted={!isPublished} />
            <ScanRow label="Film" value={playerAd?.highlights_url ? "Added" : "Missing"} />
            <ScanRow label="Markets" value={playerAd?.preferred_countries?.length ? "Added" : "Missing"} />
            <ScanRow label="Languages" value={playerAd?.languages?.length ? "Added" : "Missing"} />
            <ScanRow label="Season stats" value={hasSeasonStats ? "Added" : "Later"} muted={!hasSeasonStats} />
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-line bg-paper-2 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-ink">
              Tryout invitations
            </h2>
            <Link
              href="/dashboard/tryouts"
              className="text-[13px] font-bold text-ink underline-offset-4 hover:underline"
            >
              View all &rarr;
            </Link>
          </div>
          {invitationsWithTeam.length > 0 ? (
            <div className="space-y-3">
              {invitationsWithTeam.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-xl border border-line bg-paper p-4"
                >
                  <div>
                    <p className="text-[14px] font-bold text-ink">
                      {inv.team_name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-mute">
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
                  <span className="rounded-full bg-terra/10 px-3 py-1 text-[11px] font-bold capitalize text-terra">
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="No tryout invitations yet"
              sub="When a team invites you, it will appear here."
            />
          )}
        </section>

        <aside className="space-y-3">
          <SmallAction
            href="/dashboard/messages"
            label="Messages"
            value={conversationCount || 0}
            note="Conversations"
          />
          <SmallAction
            href="/dashboard/boost"
            label="Boost"
            value={activeBoost ? "Active" : "Off"}
            note={activeBoost ? "Profile boosted" : "Optional visibility"}
          />
          <SmallAction href="/dashboard/teams" label="Teams" value="Browse" note="Find roster fits" />
        </aside>
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
  const isPublished = !!teamAd?.is_active;
  const openPositions = teamAd?.positions_needed || [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="display-sm">
          Welcome back, {teamAd?.team_name || profile.full_name || "Team"}
        </h1>
        <p className="mt-2 max-w-[560px] text-[14px] leading-[1.55] text-ink-2">
          {isPublished
            ? "Your roster search is live. Review available players and move qualified interest into a conversation."
            : "Your roster search is saved as a draft. Publish it when the role and offer are ready for players to review."}
        </p>
      </div>

      {/* Setup banner */}
      {!hasAd && (
        <div className="rounded-2xl border border-line bg-paper-2 p-5 shadow-[0_1px_0_rgba(19,17,14,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[15px] font-bold text-ink">
                Set up your team ad
              </h3>
              <p className="mt-1 text-[13px] leading-[1.55] text-ink-2">
                Add your team details, league info, and list positions needed
                to attract players.
              </p>
            </div>
            <Link
              href="/dashboard/ad"
              className="btn btn-terra shrink-0"
            >
              Create Ad
            </Link>
          </div>
        </div>
      )}

      {hasAd && (
        <section className="rounded-2xl border border-line bg-paper-2 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <div className={`label-meta ${isPublished ? "text-sage-deep" : "text-terra-deep"}`}>
              {isPublished ? "Roster search live" : "Draft roster search"}
            </div>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.015em] text-ink">
              {isPublished
                ? "Players can review this opportunity."
                : "Players cannot see this opportunity yet."}
            </h2>
            <p className="mt-1 text-[13px] leading-[1.55] text-ink-2">
              {isPublished
                ? "Keep the open positions, offer and decision timeline current."
                : "Finish the listing, then publish when the roster need is real."}
            </p>
          </div>
          <Link href="/dashboard/ad" className="btn btn-terra mt-4 shrink-0 sm:mt-0">
            {isPublished ? "Review roster search" : "Publish when ready"} &rarr;
          </Link>
        </section>
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
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-ink">
            Positions Needed
          </h2>
          <Link
            href="/dashboard/ad"
            className="text-[13px] font-bold text-ink underline-offset-4 hover:underline"
          >
            Edit Ad &rarr;
          </Link>
        </div>
        {openPositions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {openPositions.map((pos) => (
              <span
                key={pos}
                className="rounded-full border border-line-2 bg-paper px-3 py-1.5 text-[13px] font-bold text-ink"
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
      <div className="rounded-2xl border border-line bg-paper-2 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[18px] font-bold text-ink">
            Recent Tryout Invites
          </h2>
          <Link
            href="/dashboard/tryouts"
            className="text-[13px] font-bold text-ink underline-offset-4 hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
        {invitationsWithPlayer.length > 0 ? (
          <div className="space-y-3">
            {invitationsWithPlayer.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-xl border border-line bg-paper p-4"
              >
                <div>
                  <p className="text-[14px] font-bold text-ink">
                    {inv.player_name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-mute">
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
                      ? "bg-sage/15 text-sage-deep"
                      : inv.status === "declined"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-terra/10 text-terra"
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
    <div className="rounded-2xl border border-line bg-paper-2 p-5 shadow-[0_1px_0_rgba(19,17,14,0.035)]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-mute">{label}</span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent ? "bg-terra/10 text-terra" : "bg-paper text-mute"
          }`}
        >
          {icon}
        </div>
      </div>
      <p className="num mt-3 text-[28px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[12px] text-mute">{note}</p>
    </div>
  );
}

function QuickAction({ href, title, description, icon }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-line bg-paper-2 p-5 transition-all hover:border-ink/25 hover:shadow-[0_8px_28px_rgba(19,17,14,0.06)]"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-terra transition-colors group-hover:bg-terra group-hover:text-white">
        {icon}
      </div>
      <h3 className="text-[14px] font-bold text-ink">{title}</h3>
      <p className="mt-1 text-[12px] leading-[1.5] text-mute">{description}</p>
    </Link>
  );
}

function ScanRow({ label, value, muted }) {
  return (
    <div className="flex items-center justify-between gap-4 text-[13px]">
      <span className="font-semibold text-ink-2">{label}</span>
      <span className={`font-bold ${muted ? "text-mute" : "text-sage-deep"}`}>
        {value}
      </span>
    </div>
  );
}

function SmallAction({ href, label, value, note }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper-2 p-5 transition-all hover:border-ink/25 hover:shadow-[0_8px_28px_rgba(19,17,14,0.06)]"
    >
      <div>
        <div className="text-[13px] font-bold text-ink">{label}</div>
        <div className="mt-1 text-[12px] text-mute">{note}</div>
      </div>
      <div className="num text-[24px] font-bold text-ink">{value}</div>
    </Link>
  );
}

function EmptyState({ message, sub }) {
  return (
    <div className="rounded-xl border border-dashed border-line py-8 text-center">
      <p className="text-[14px] font-semibold text-ink">{message}</p>
      {sub && <p className="mt-1 text-[12px] text-mute">{sub}</p>}
    </div>
  );
}

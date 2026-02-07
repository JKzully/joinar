import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { createClient } from "@/lib/supabase/server";

const FEATURES = [
  {
    title: "Your Basketball Resume",
    description:
      "Stats. Highlights. Experience. Everything a coach needs to see — in one place. Make it count.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Post Your Openings",
    description:
      "Post open positions. Tell us what you need. We'll show you every player that matches — with stats, highlights, and experience.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    title: "Get Discovered",
    description:
      "Teams across 28 countries are actively searching for players like you. Our filters match you with teams that fit your position, level, and ambitions.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    ),
  },
  {
    title: "Direct Messaging",
    description:
      "Direct messages. Real opportunities from real teams. No agents, no middlemen, no politics. Just basketball.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    title: "Tryout Invitations",
    description:
      "Get the call. Tryout invitations with dates, locations, and details. Real chances from real teams.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: "Be Seen First",
    description:
      "Boosted profiles appear at the top of every search. In a pool of talented players, being seen first makes all the difference.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    step: "01",
    title: "Build Your Profile",
    description:
      "Stats. Highlights. Experience. Everything a coach needs to see — in one place. This is your basketball resume. Make it count.",
  },
  {
    step: "02",
    title: "Get Discovered",
    description:
      "Teams across 28 countries are actively searching for players like you. Our filters match you with teams that fit your position, level, and ambitions.",
  },
  {
    step: "03",
    title: "Get the Call",
    description:
      "Direct messages. Tryout invitations. Real opportunities from real teams. No agents, no middlemen, no politics. Just basketball.",
  },
];

export default async function Home() {
  const supabase = await createClient();

  // Fetch featured players (boosted first, then most recently updated, limit 3)
  const { data: allPlayers } = await supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(12);

  const playerProfileIds = allPlayers?.map((p) => p.profile_id) || [];
  const boostedPlayerIds = new Set();
  if (playerProfileIds.length > 0) {
    const { data: pBoosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in("profile_id", playerProfileIds);
    pBoosts?.forEach((b) => boostedPlayerIds.add(b.profile_id));
  }

  const featuredPlayers = (allPlayers || [])
    .sort((a, b) => {
      const aB = boostedPlayerIds.has(a.profile_id) ? 1 : 0;
      const bB = boostedPlayerIds.has(b.profile_id) ? 1 : 0;
      return bB - aB;
    })
    .slice(0, 3);

  // Fetch featured teams (boosted first, then most recently updated, limit 3)
  const { data: allTeams } = await supabase
    .from("team_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(12);

  const teamProfileIds = allTeams?.map((t) => t.profile_id) || [];
  const boostedTeamIds = new Set();
  if (teamProfileIds.length > 0) {
    const { data: tBoosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in("profile_id", teamProfileIds);
    tBoosts?.forEach((b) => boostedTeamIds.add(b.profile_id));
  }

  const featuredTeams = (allTeams || [])
    .sort((a, b) => {
      const aB = boostedTeamIds.has(a.profile_id) ? 1 : 0;
      const bB = boostedTeamIds.has(b.profile_id) ? 1 : 0;
      return bB - aB;
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        {/* Background glow effect */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-400">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              47 players got contacted this week
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Your Talent Deserves{" "}
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                a Stage
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
              You&apos;ve been grinding in empty gyms, playing in leagues no
              scout has ever heard of. That changes today. We connect overlooked
              players with teams that actually need you.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/signup?role=player"
                className="w-full rounded-xl bg-orange-500 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 sm:w-auto"
              >
                Show Me Teams &rarr;
              </Link>
              <Link
                href="/signup?role=team"
                className="w-full rounded-xl border border-border bg-surface px-8 py-3.5 text-center text-sm font-semibold text-text-primary transition-all hover:border-orange-500/50 hover:bg-surface-light sm:w-auto"
              >
                I&apos;m a Team Looking for Players
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-4 gap-8">
              <div>
                <p className="text-2xl font-bold text-orange-400 sm:text-3xl">2,400+</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Players Ready</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400 sm:text-3xl">380+</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Teams Searching</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400 sm:text-3xl">28</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Countries</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-400 sm:text-3xl">650+</p>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">Connections Made</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Players */}
      <section id="players" className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                They Took the Shot
              </h2>
              <p className="mt-2 text-text-secondary">
                These players were exactly where you are. Then they created a profile.
              </p>
            </div>
            <Link
              href="/dashboard/players"
              className="hidden text-sm font-medium text-orange-400 transition-colors hover:text-orange-500 sm:block"
            >
              View all players &rarr;
            </Link>
          </div>

          {featuredPlayers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlayers.map((player) => {
                const profile = player.profile;
                const boosted = boostedPlayerIds.has(player.profile_id);
                const positions = player.positions || [];
                const age = player.date_of_birth
                  ? Math.floor(
                      (Date.now() - new Date(player.date_of_birth).getTime()) /
                        (365.25 * 24 * 60 * 60 * 1000)
                    )
                  : null;

                return (
                  <div
                    key={player.id}
                    className="group relative rounded-2xl border border-border bg-surface p-6 transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
                  >
                    {!!player.is_seed && (
                      <div className="absolute left-4 top-4 rounded-full bg-text-muted/15 px-2.5 py-1 text-xs font-medium text-text-muted">
                        Sample
                      </div>
                    )}
                    {boosted && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        Boosted
                      </div>
                    )}

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-light text-2xl font-semibold text-orange-400">
                      {(profile?.full_name || "?").charAt(0).toUpperCase()}
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary">
                      {profile?.full_name || "Unnamed Player"}
                    </h3>
                    {positions.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {positions.map((pos) => (
                          <span key={pos} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-400">
                            {pos}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-orange-400">Position TBD</p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-text-muted">Age</span>
                        <p className="font-medium text-text-primary">{age || "--"}</p>
                      </div>
                      <div>
                        <span className="text-text-muted">Height</span>
                        <p className="font-medium text-text-primary">
                          {player.height_cm ? `${player.height_cm} cm` : "--"}
                        </p>
                      </div>
                      <div>
                        <span className="text-text-muted">PPG</span>
                        <p className="font-medium text-text-primary">
                          {player.ppg ? Number(player.ppg).toFixed(1) : "--"}
                        </p>
                      </div>
                      <div>
                        <span className="text-text-muted">APG</span>
                        <p className="font-medium text-text-primary">
                          {player.apg ? Number(player.apg).toFixed(1) : "--"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
                      {profile?.country && <span>{profile.country}</span>}
                      {player.experience_years > 0 && (
                        <>
                          {profile?.country && <span>&middot;</span>}
                          <span>{player.experience_years}y exp</span>
                        </>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/players/${player.profile_id}`}
                      className="mt-5 block w-full rounded-lg border border-border bg-surface-light py-2.5 text-center text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400"
                    >
                      View Profile
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-text-muted">
                Players will appear here once they sign up
              </p>
              <Link
                href="/signup?role=player"
                className="mt-3 inline-block text-sm font-medium text-orange-400 hover:text-orange-500"
              >
                Be the first to join &rarr;
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/dashboard/players"
              className="text-sm font-medium text-orange-400 transition-colors hover:text-orange-500"
            >
              View all players &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Teams */}
      <section id="teams" className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                Teams Actively Searching
              </h2>
              <p className="mt-2 text-text-secondary">
                Open roster spots, right now. Your next chapter could be one message away.
              </p>
            </div>
            <Link
              href="/dashboard/teams"
              className="hidden text-sm font-medium text-orange-400 transition-colors hover:text-orange-500 sm:block"
            >
              View all teams &rarr;
            </Link>
          </div>

          {featuredTeams.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredTeams.map((team) => {
                const profile = team.profile;
                const boosted = boostedTeamIds.has(team.profile_id);
                const positions = team.positions_needed || [];

                return (
                  <div
                    key={team.id}
                    className="group relative rounded-2xl border border-border bg-background p-6 transition-all hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
                  >
                    {!!team.is_seed && (
                      <div className="absolute left-4 top-4 rounded-full bg-text-muted/15 px-2.5 py-1 text-xs font-medium text-text-muted">
                        Sample
                      </div>
                    )}
                    {boosted && (
                      <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                        Boosted
                      </div>
                    )}

                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-light text-2xl font-bold text-orange-400">
                      {(team.team_name || "?").charAt(0).toUpperCase()}
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary">
                      {team.team_name || "Unnamed Team"}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {team.league || "League TBD"}
                    </p>

                    {positions.length > 0 && (
                      <div className="mt-4">
                        <span className="text-xs text-text-muted">Open positions</span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {positions.slice(0, 3).map((pos) => (
                            <span
                              key={pos}
                              className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400"
                            >
                              {pos}
                            </span>
                          ))}
                          {positions.length > 3 && (
                            <span className="rounded-full bg-surface-light px-3 py-1 text-xs text-text-muted">
                              +{positions.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div />
                      {profile?.country && (
                        <span className="text-xs text-text-muted">{profile.country}</span>
                      )}
                    </div>

                    <Link
                      href={`/dashboard/teams/${team.profile_id}`}
                      className="mt-5 block w-full rounded-lg bg-orange-500 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
                    >
                      View Details
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
              <p className="text-sm text-text-muted">
                Teams will appear here once they sign up
              </p>
              <Link
                href="/signup?role=team"
                className="mt-3 inline-block text-sm font-medium text-orange-400 hover:text-orange-500"
              >
                List your team &rarr;
              </Link>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/dashboard/teams"
              className="text-sm font-medium text-orange-400 transition-colors hover:text-orange-500"
            >
              View all teams &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              The System Is Broken. We&apos;re Fixing It.
            </h2>
            <p className="mt-3 text-text-secondary">
              If you&apos;re not in the right academy, in the right country, or in front of the right scout — you&apos;re invisible. We built this to fix that.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-surface p-6 transition-all hover:border-orange-500/30"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="border-t border-border bg-surface py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Three Steps to Being Seen
            </h2>
            <p className="mt-3 text-text-secondary">
              Your next opportunity starts here
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-xl font-bold text-orange-400">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-surface to-surface p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-orange-500/10 blur-[80px]" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl lg:text-4xl">
                Every Pro Started{" "}
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  as an Unknown
                </span>
              </h2>
              <p className="mt-4 text-text-secondary">
                You&apos;ve put in the hours. The early mornings. The extra reps
                when nobody was watching. Now it&apos;s time to be seen.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="w-full rounded-xl bg-orange-500 px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 sm:w-auto"
                >
                  Create Your Free Profile &rarr;
                </Link>
              </div>
              <p className="mt-4 text-xs text-text-muted">
                Free forever. No credit card needed. Takes 3 minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

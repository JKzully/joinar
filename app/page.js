import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HomeNav from "./components/HomeNav";

// ─── Icons ────────────────────────────────────────────────────
const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconTeam = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 13c0-1.5 1.5-3 3.5-3M14 13c0-1.5-1.5-3-3.5-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.5 5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 11s4-3.5 4-6.5A4 4 0 002 4.5C2 7.5 6 11 6 11z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

// ─── Open positions (sample data) ─────────────────────────────
const OPEN_POSITIONS = [
  { team: "BC Mornar", league: "ABA Liga 2", cr: "M", role: "Power Forward", sub: "6'8\"+ · Stretch 4", loc: "Bar, Montenegro", pay: "€1,800–2,400", per: "/ month" },
  { team: "Helsinki Seagulls", league: "Korisliiga", cr: "H", role: "Combo Guard", sub: "Score-first", loc: "Helsinki, Finland", pay: "€2,400–3,200", per: "/ month" },
  { team: "Skyliners Academy", league: "NBBL", cr: "S", role: "Wing — Developmental", sub: "Age ≤ 19", loc: "Frankfurt, Germany", pay: "Tuition", per: "+ stipend" },
  { team: "Real Betis B", league: "LEB Plata", cr: "R", role: "Shooting Guard", sub: "40%+ from 3 · 6'3\"", loc: "Sevilla, Spain", pay: "€1,600–2,200", per: "/ month" },
  { team: "KK Tofaş U21", league: "TBL Dev.", cr: "T", role: "Point Guard", sub: "Pure pass-first", loc: "Bursa, Türkiye", pay: "€1,200 + housing", per: "/ month" },
];

const TESTIMONIALS = [
  { q: "I'd been emailing coaches for months — zero replies. Two weeks on Picked, a team in Finland found me through the filters and offered me a spot.", n: "Alejandro G.", r: "SHOOTING GUARD · SPAIN → FINLAND" },
  { q: "As a female player, finding opportunities abroad felt impossible. Picked changed that. I got contacted by three teams in my first month.", n: "Milica T.", r: "GUARD · SERBIA → POLAND" },
  { q: "No agent. No politics. Just a profile, my film, and a coach in Lithuania who saw it. Best basketball year of my life followed.", n: "Tomás H.", r: "CENTER · ARGENTINA → LITHUANIA" },
];

// ─── Page ─────────────────────────────────────────────────────
export default async function Home() {
  const supabase = await createClient();

  const { data: allPlayers } = await supabase
    .from("player_ads")
    .select("*, profile:profile_id(full_name, avatar_url, country, city)")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(8);

  const playerIds = (allPlayers || []).map((p) => p.profile_id);
  const boostedIds = new Set();
  if (playerIds.length > 0) {
    const { data: boosts } = await supabase
      .from("boosts")
      .select("profile_id")
      .eq("is_active", true)
      .in("profile_id", playerIds);
    boosts?.forEach((b) => boostedIds.add(b.profile_id));
  }

  const featuredPlayers = (allPlayers || [])
    .sort((a, b) => (boostedIds.has(b.profile_id) ? 1 : 0) - (boostedIds.has(a.profile_id) ? 1 : 0))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-sand text-ink">
      <HomeNav />

      {/* ─── Hero — full-width editorial ─────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:px-12 sm:pt-24 lg:px-16 lg:pb-28 lg:pt-32">
        {/* Faint concentric rings */}
        <div aria-hidden className="pointer-events-none absolute -right-40 top-0 h-[900px] w-[900px] rounded-full border border-[rgba(19,17,14,0.05)]" />
        <div aria-hidden className="pointer-events-none absolute -right-20 top-20 h-[560px] w-[560px] rounded-full border border-[rgba(19,17,14,0.04)]" />

        <div className="relative mx-auto max-w-[1340px]">
          <div className="mb-10 inline-flex items-center gap-2.5 rounded-full bg-[rgba(77,106,72,0.13)] px-3.5 py-1.5 text-[12px] font-semibold text-sage-deep">
            <span className="pulse-dot" />
            <span>Live · 12 players got contacted today</span>
          </div>

          <h1 className="display-xl max-w-[1100px]">
            Off-season is when careers get <span className="text-terra">picked.</span>
          </h1>

          <p className="mt-8 max-w-[620px] text-[18px] leading-[1.55] text-ink-2">
            The basketball roster network. Build a coach-ready profile, get seen by teams across 28 countries, take the call — without the agents, the politics, or the wait.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup?role=player" className="btn btn-terra btn-xl">
              Create your profile <Arrow />
            </Link>
            <Link href="/signup?role=team" className="btn btn-ghost btn-xl">
              For teams
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-5 border-t border-line pt-8">
            <div className="flex flex-col gap-1">
              <div className="num text-[24px] font-bold tracking-[-0.02em]">127 players</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">in early access</div>
            </div>
            <div className="hidden h-10 w-px bg-line md:block" />
            <div className="flex flex-col gap-1">
              <div className="num text-[24px] font-bold tracking-[-0.02em]">28 countries</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">scouting now</div>
            </div>
            <div className="hidden h-10 w-px bg-line md:block" />
            <div className="flex flex-col gap-1">
              <div className="text-[24px] font-bold tracking-[-0.02em]">Free · forever</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">no agents, no card</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pulse strip ────────────────────────────────────── */}
      <div className="px-6 sm:px-12 lg:px-16">
        <div className="mx-auto flex max-w-[1340px] flex-wrap items-center gap-x-8 gap-y-2 rounded-full border border-line bg-paper px-7 py-4">
          <span className="inline-flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sage-deep">
            <span className="pulse-dot" /> Today
          </span>
          {[
            "Helsinki Seagulls viewed 4 guards",
            "New player from Belgrade signed up",
            "BC Mornar posted PF spot",
            "3 tryout invites this hour",
          ].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3.5 whitespace-nowrap text-[13px] text-ink-2 before:block before:h-[3px] before:w-[3px] before:rounded-full before:bg-line-2 first:before:hidden">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Stats ──────────────────────────────────────────── */}
      <section className="border-b border-line px-6 pb-20 pt-24 sm:px-12 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] grid-cols-1 items-start gap-14 lg:grid-cols-[1.3fr_3fr]">
          <div>
            <h2 className="display-sm">
              A network built for the <span className="text-sage-deep">call.</span>
            </h2>
            <p className="mt-6 max-w-[340px] text-[14px] leading-[1.55] text-mute">
              Picked replaces the cold-email chain with a live, filterable, coach-facing roster. Built for the off-season window — the three months that decide your next year.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { Icon: IconUser, v: "127", l: "Players this month", d: "↑ 18% vs last" },
              { Icon: IconTeam, v: "23", l: "Teams hiring", d: "11 active today" },
              { Icon: IconGlobe, v: "28", l: "Countries", d: "↑ 4 this season" },
              { Icon: IconMail, v: "89", l: "Messages today", d: "14h avg reply" },
            ].map(({ Icon, v, l, d }) => (
              <div key={l} className="rounded-2xl border border-line bg-paper-2 p-5">
                <div className="mb-6 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[rgba(77,106,72,0.13)] text-sage-deep">
                  <Icon />
                </div>
                <div className="num font-bold leading-none tracking-[-0.04em]" style={{ fontSize: 56 }}>
                  {v}
                </div>
                <div className="mt-2 text-[13px] text-mute">{l}</div>
                <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-[rgba(77,106,72,0.13)] px-2.5 py-0.5 text-[11px] font-semibold text-sage-deep">
                  {d}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Players rail ───────────────────────────────────── */}
      <div id="players" className="flex flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-24 sm:px-12 lg:px-16">
        <h2 className="display-md max-w-[780px]">
          Players getting noticed <span className="text-sage-deep">right now.</span>
        </h2>
        <div className="text-right">
          <div className="max-w-[280px] text-[13px] leading-[1.55] text-mute">
            Profiles updated within the last 48 hours, ranked by recent team views.
          </div>
          <Link href="/dashboard/players" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,19,16,0.06)] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-[rgba(22,19,16,0.10)]">
            View all players <Arrow size={11} />
          </Link>
        </div>
      </div>

      {/* Text-only player cards — no portraits */}
      <div className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 sm:px-12 lg:grid-cols-4 lg:px-16">
        {featuredPlayers.length > 0 ? (
          featuredPlayers.map((p, i) => {
            const profile = p.profile;
            const name = profile?.full_name || "Unnamed";
            const role = p.positions?.[0] || "—";
            const age = p.date_of_birth
              ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : null;
            const boosted = boostedIds.has(p.profile_id);

            return (
              <Link
                key={p.id}
                href={`/dashboard/players/${p.profile_id}`}
                className="group flex flex-col rounded-2xl border border-line bg-paper-2 p-6 transition-shadow hover:shadow-[0_4px_24px_rgba(19,17,14,0.06)]"
              >
                <div className="flex items-start justify-between">
                  <div className="num text-[11px] font-bold uppercase tracking-[0.16em] text-mute">
                    {String(i + 1).padStart(2, "0")} / Featured
                  </div>
                  {boosted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(224,146,111,0.18)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8E462B]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E0926F]" /> Boosted
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(77,106,72,0.13)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-sage-deep">
                      <span className="h-1.5 w-1.5 rounded-full bg-sage" /> Available
                    </span>
                  )}
                </div>

                <h3 className="mt-8 text-[26px] font-bold leading-[1.1] tracking-[-0.02em]">
                  {name}
                </h3>
                <div className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-mute">
                  {role} · {profile?.country || "—"}
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-5">
                  <div>
                    <div className="num text-[20px] font-bold leading-none tracking-[-0.02em]">
                      {p.ppg ? Number(p.ppg).toFixed(1) : "—"}
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">PPG</div>
                  </div>
                  <div>
                    <div className="num text-[20px] font-bold leading-none tracking-[-0.02em]">
                      {p.apg ? Number(p.apg).toFixed(1) : "—"}
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">APG</div>
                  </div>
                  <div>
                    <div className="num text-[20px] font-bold leading-none tracking-[-0.02em]">
                      {age || "—"}
                    </div>
                    <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">Yrs</div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-[12px]">
                  <span className="text-mute">View profile</span>
                  <span className="text-ink transition-transform group-hover:translate-x-0.5">
                    <Arrow size={12} />
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-line py-16 text-center text-[14px] text-mute">
            Players will appear here once they sign up.
          </div>
        )}
      </div>

      {/* ─── Pull quote — no italics, bold numerical accent ──── */}
      <section className="mt-24 grid grid-cols-1 gap-14 border-y border-line px-6 py-24 sm:px-12 lg:grid-cols-[0.55fr_2fr] lg:px-16">
        <div className="num font-extrabold text-terra" style={{ fontSize: "clamp(72px, 11vw, 144px)", lineHeight: 0.9, letterSpacing: "-0.05em" }}>
          01
        </div>
        <div>
          <blockquote className="m-0 max-w-[880px] font-bold leading-[1.18] tracking-[-0.02em]" style={{ fontSize: "clamp(26px, 2.8vw, 42px)" }}>
            &ldquo;I uploaded my profile on a Tuesday. By Thursday, <span className="text-sage-deep">two teams</span> had me in their inbox. One flew me out the next week — I&apos;m now in my <span className="text-terra">second season abroad.</span>&rdquo;
          </blockquote>
          <div className="mt-9 flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-ink/10" />
            <div>
              <div className="text-[14px] font-bold">Stefan J.</div>
              <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">Point Guard · Belgrade → Athens</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Open positions ─────────────────────────────────── */}
      <div id="positions" className="flex flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-24 sm:px-12 lg:px-16">
        <h2 className="display-md max-w-[780px]">
          Open roster spots, this <span className="text-terra">window.</span>
        </h2>
        <div className="text-right">
          <div className="max-w-[280px] text-[13px] leading-[1.55] text-mute">
            Live positions from clubs and academies. Apply directly to the coach — no middlemen.
          </div>
          <Link href="/dashboard/teams" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[rgba(22,19,16,0.06)] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-[rgba(22,19,16,0.10)]">
            View all 47 <Arrow size={11} />
          </Link>
        </div>
      </div>

      <div className="px-6 sm:px-12 lg:px-16">
        {/* Desktop table */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[40px_1.6fr_1.4fr_1fr_1fr_110px] items-center border-y border-ink py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mute">
            <div>#</div>
            <div>Team</div>
            <div>Position</div>
            <div>Location</div>
            <div>Salary range</div>
            <div />
          </div>
          {OPEN_POSITIONS.map((r, i) => (
            <div key={i} className="grid cursor-pointer grid-cols-[40px_1.6fr_1.4fr_1fr_1fr_110px] items-center border-b border-line py-5 transition-colors hover:bg-paper">
              <div className="num text-[14px] font-bold text-mute">0{i + 1}</div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#2a241e,#4a3d31)" }}>
                  {r.cr}
                </div>
                <div>
                  <div className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">{r.league}</div>
                </div>
              </div>
              <div className="text-[14px] font-semibold">
                {r.role}
                <div className="mt-0.5 text-[11px] font-normal tracking-[0.04em] text-mute">{r.sub}</div>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
                <IconPin /> {r.loc}
              </div>
              <div className="num text-[13px] font-bold">
                {r.pay}
                <span className="mt-0.5 block text-[11px] font-normal text-mute">{r.per}</span>
              </div>
              <div className="text-right">
                <span className="btn btn-ink" style={{ padding: "9px 14px", fontSize: 12 }}>
                  Apply <Arrow size={11} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile card stack */}
        <div className="space-y-3 border-t border-ink pt-3 md:hidden">
          {OPEN_POSITIONS.map((r, i) => (
            <div key={i} className="rounded-2xl border border-line bg-paper-2 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#2a241e,#4a3d31)" }}>
                    {r.cr}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">{r.league}</div>
                  </div>
                </div>
                <span className="num text-[14px] font-bold text-mute">0{i + 1}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-[13px]">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">Position</div>
                  <div className="mt-1 font-semibold">{r.role}</div>
                  <div className="text-[11px] text-mute">{r.sub}</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">Location</div>
                  <div className="mt-1 flex items-center gap-1.5 text-ink-2">
                    <IconPin /> {r.loc}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mute">Salary</div>
                  <div className="mt-1 num font-bold">
                    {r.pay} <span className="text-[11px] font-normal text-mute">{r.per}</span>
                  </div>
                </div>
              </div>

              <span className="btn btn-ink mt-4 w-full justify-center" style={{ padding: "12px 14px", fontSize: 13 }}>
                Apply <Arrow size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Testimonials ───────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-6 px-6 pb-8 pt-24 sm:px-12 lg:px-16">
        <h2 className="display-md max-w-[780px]">
          They were in your <span className="text-sage-deep">position.</span>
        </h2>
        <div className="max-w-[280px] text-right text-[13px] leading-[1.55] text-mute">
          Real players. Real opportunities. All started with a profile.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 px-6 sm:px-12 lg:grid-cols-3 lg:px-16">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-line bg-paper-2 p-8">
            <div className="num text-[12px] font-bold uppercase tracking-[0.16em] text-terra">
              {String(i + 1).padStart(2, "0")}
            </div>
            <p className="mb-8 mt-4 flex-1 text-[16px] font-medium leading-[1.55] text-ink-2">{t.q}</p>
            <div className="flex items-center gap-3 border-t border-line pt-5">
              <div className="h-9 w-9 rounded-full bg-ink/10" />
              <div>
                <div className="text-[13px] font-bold">{t.n}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">{t.r}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Three steps ────────────────────────────────────── */}
      <section id="how" className="px-6 py-24 sm:px-12 lg:px-16">
        <h2 className="display-md max-w-[780px]">
          Three steps to being <span className="text-sage-deep">seen.</span>
        </h2>
        <div className="mt-2 text-[14px] text-mute">Free, twelve minutes, once. The window is open now.</div>

        <div className="mt-14 grid grid-cols-1 border-t border-ink md:grid-cols-3">
          {[
            { n: "01", h: "Build your résumé", p: "Stats, highlights, measurements, references. Everything a coach evaluates — in one coach-ready link, not a PDF that doesn't open.", t: "~ 12 min", on: 1 },
            { n: "02", h: "Get matched", p: "Teams in 28 countries filter by exactly what they need. If you fit, you appear at the top of their search — not buried below 200 others.", t: "0 — 14 days", on: 2 },
            { n: "03", h: "Get the call", p: "Direct messages and tryout invites from coaches, not agents. Dates, locations, terms — straight to you.", t: "Avg. 14h response", on: 3 },
          ].map((s, i, arr) => (
            <div
              key={s.n}
              className={`relative py-8 ${
                i < arr.length - 1 ? "border-b border-line md:border-b-0" : ""
              } ${i < 2 ? "md:border-r md:border-line md:pr-8" : ""} ${i > 0 ? "md:pl-8" : ""}`}
            >
              <div className="num font-extrabold text-terra" style={{ fontSize: 56, lineHeight: 1, letterSpacing: "-0.04em" }}>
                {s.n}
              </div>
              <h3 className="mt-4 text-[26px] font-bold tracking-[-0.02em]">{s.h}</h3>
              <p className="mt-3.5 max-w-[340px] text-[14px] leading-[1.55] text-ink-2">{s.p}</p>
              <div className="mt-6 flex items-center justify-between border-t border-line pt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
                <span>{s.t}</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map((d) => (
                    <span key={d} className={`h-1.5 w-1.5 rounded-full ${d <= s.on ? "bg-sage" : "bg-line-2"}`} />
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Final CTA ──────────────────────────────────────── */}
      <section className="mx-6 mb-16 mt-4 sm:mx-12 lg:mx-16">
        <div className="relative grid grid-cols-1 items-end gap-12 overflow-hidden rounded-3xl bg-ink p-12 text-sand sm:p-16 lg:grid-cols-[1.6fr_1fr] lg:p-24">
          <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full" style={{ background: "radial-gradient(circle,rgba(184,90,63,0.22) 0%,transparent 60%)" }} />
          <div aria-hidden className="pointer-events-none absolute -bottom-48 left-1/2 h-[480px] w-[480px] rounded-full" style={{ background: "radial-gradient(circle,rgba(86,110,77,0.18) 0%,transparent 60%)" }} />

          <div className="relative">
            <h2 className="display-lg">
              While you wait, teams are picking <span style={{ color: "#B5C9A6" }}>someone else.</span>
            </h2>
            <p className="mt-6 max-w-[480px] text-[15px] leading-[1.55]" style={{ color: "rgba(236,227,208,0.62)" }}>
              Every day a roster spot you would have fit goes to a player whose profile was already there. Twelve minutes today — and the next call could be yours.
            </p>
          </div>
          <div className="relative flex flex-col items-start gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 rounded-full px-7 py-4 text-[15px] font-bold text-ink transition-transform hover:-translate-y-0.5"
              style={{ background: "#B5C9A6" }}
            >
              Create your profile <Arrow size={16} />
            </Link>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "rgba(236,227,208,0.45)" }}>
              Free · No card · 12 min
            </span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="grid grid-cols-1 gap-12 border-t border-line px-6 pb-9 pt-16 sm:grid-cols-2 sm:px-12 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:px-16">
        <div>
          <div className="mb-3.5 flex items-center gap-2 text-[24px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-terra" /> Picked
          </div>
          <div className="max-w-[320px] text-[14px] leading-[1.55] text-ink-2">
            The basketball roster network. Built for players who don&apos;t want to wait, and teams who don&apos;t want to guess.
          </div>
        </div>
        {[
          { h: "Players", links: [["Create profile", "/signup?role=player"], ["Browse teams", "/dashboard/teams"], ["Boost profile", "/dashboard/boost"], ["Player guide", "#"]] },
          { h: "Teams", links: [["List a position", "/signup?role=team"], ["Browse players", "/dashboard/players"], ["Schedule tryouts", "/dashboard/tryouts"], ["Coach login", "/login"]] },
          { h: "Company", links: [["About", "#"], ["Journal", "#"], ["Contact", "#"], ["Privacy · Terms", "/privacy"]] },
        ].map((col) => (
          <div key={col.h}>
            <h4 className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-mute">{col.h}</h4>
            {col.links.map(([label, href]) => (
              <Link key={label} href={href} className="block py-1.5 text-[14px] text-ink hover:text-terra">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </footer>
      <div className="flex flex-col gap-2 border-t border-line px-6 py-6 text-[12px] text-mute sm:flex-row sm:justify-between sm:px-12 lg:px-16">
        <span>© 2026 Picked · Reykjavík / Belgrade</span>
        <span>Built for the off-season.</span>
      </div>
    </div>
  );
}

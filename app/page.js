import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HomeNav from "./components/HomeNav";

// ─── Icons ────────────────────────────────────────────────────
const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M6 11s4-3.5 4-6.5A4 4 0 002 4.5C2 7.5 6 11 6 11z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="6" cy="4.5" r="1.2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

// ─── Open positions (sample data — will be live from team_ads) ──
const OPEN_POSITIONS = [
  { team: "BC Mornar", league: "ABA Liga 2", cr: "M", role: "Power Forward", sub: "6'8\"+ · Stretch 4", loc: "Bar, Montenegro", pay: "€1,800–2,400", per: "/ month", closes: "May 30" },
  { team: "Helsinki Seagulls", league: "Korisliiga", cr: "H", role: "Combo Guard", sub: "Score-first", loc: "Helsinki, Finland", pay: "€2,400–3,200", per: "/ month", closes: "Jun 4" },
  { team: "Skyliners Academy", league: "NBBL", cr: "S", role: "Wing — Developmental", sub: "Age ≤ 19", loc: "Frankfurt, Germany", pay: "Tuition", per: "+ stipend", closes: "Jun 10" },
  { team: "Real Betis B", league: "LEB Plata", cr: "R", role: "Shooting Guard", sub: "40%+ from 3 · 6'3\"", loc: "Sevilla, Spain", pay: "€1,600–2,200", per: "/ month", closes: "Jun 12" },
  { team: "KK Tofaş U21", league: "TBL Dev.", cr: "T", role: "Point Guard", sub: "Pure pass-first", loc: "Bursa, Türkiye", pay: "€1,200 + housing", per: "/ month", closes: "Jun 14" },
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
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-sand text-ink">
      <HomeNav />

      {/* ─── 1. Hero ─────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-20 sm:px-12 sm:pt-28 lg:px-16 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-[1340px]">
          <h1 className="display-xl max-w-[1100px]">
            Off-season is when careers get <span className="text-terra">picked.</span>
          </h1>

          <p className="mt-10 max-w-[640px] text-[19px] leading-[1.5] text-ink-2">
            The basketball roster network for Europe. Build a coach-ready profile in twelve minutes, get seen by teams hiring this window, and take the call directly. No agents.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link href="/signup?role=player" className="btn btn-terra btn-xl">
              Create your profile <Arrow />
            </Link>
            <Link href="/signup?role=team" className="text-[14px] font-semibold text-ink underline-offset-4 hover:underline">
              I&apos;m hiring →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 2. Open positions (the product) ─────────────────── */}
      <section id="positions" className="border-t border-line bg-paper">
        <div className="mx-auto max-w-[1340px] px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-terra">
                The product
              </div>
              <h2 className="display-md mt-4 max-w-[820px]">
                Open roster spots, posted this window.
              </h2>
              <p className="mt-5 max-w-[560px] text-[16px] leading-[1.55] text-ink-2">
                Live positions from clubs and academies across Europe. Apply directly to the coach — your profile lands in their inbox, not on an agent&apos;s desk.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="num text-[44px] font-extrabold leading-none tracking-[-0.03em] text-ink">
                  47
                </div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-mute">
                  Open this window
                </div>
              </div>
              <Link href="/dashboard/teams" className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-ink/[0.10]">
                Browse all <Arrow size={11} />
              </Link>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[44px_1.5fr_1.4fr_1.1fr_1fr_120px] items-center border-y-2 border-ink py-4 text-[11px] font-bold uppercase tracking-[0.16em] text-mute">
              <div>#</div>
              <div>Team</div>
              <div>Position</div>
              <div>Location</div>
              <div>Pay / closes</div>
              <div />
            </div>
            {OPEN_POSITIONS.map((r, i) => (
              <div key={i} className="grid cursor-pointer grid-cols-[44px_1.5fr_1.4fr_1.1fr_1fr_120px] items-center border-b border-line py-6 transition-colors hover:bg-paper-2">
                <div className="num text-[14px] font-bold text-mute">0{i + 1}</div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#2a241e,#4a3d31)" }}>
                    {r.cr}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">{r.league}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[15px] font-bold">{r.role}</div>
                  <div className="mt-0.5 text-[12px] text-mute">{r.sub}</div>
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
                  <IconPin /> {r.loc}
                </div>
                <div>
                  <div className="num text-[14px] font-bold">{r.pay}</div>
                  <div className="mt-0.5 text-[11px] text-mute">
                    {r.per} · closes {r.closes}
                  </div>
                </div>
                <div className="text-right">
                  <span className="btn btn-ink" style={{ padding: "10px 16px", fontSize: 12 }}>
                    Apply <Arrow size={11} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile card stack */}
          <div className="space-y-3 border-t-2 border-ink pt-4 md:hidden">
            {OPEN_POSITIONS.map((r, i) => (
              <div key={i} className="rounded-2xl border border-line bg-paper-2 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#2a241e,#4a3d31)" }}>
                      {r.cr}
                    </div>
                    <div>
                      <div className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</div>
                      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">{r.league}</div>
                    </div>
                  </div>
                  <span className="num text-[14px] font-bold text-mute">0{i + 1}</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Position</div>
                    <div className="mt-1 text-[14px] font-bold">{r.role}</div>
                    <div className="text-[11px] text-mute">{r.sub}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Location</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
                      <IconPin /> {r.loc}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-mute">Pay</div>
                    <div className="mt-1 num text-[14px] font-bold">
                      {r.pay} <span className="text-[11px] font-normal text-mute">{r.per} · closes {r.closes}</span>
                    </div>
                  </div>
                </div>

                <span className="btn btn-ink mt-5 w-full justify-center" style={{ padding: "12px 14px", fontSize: 13 }}>
                  Apply directly <Arrow size={12} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. Players (the supply side) ────────────────────── */}
      <section id="players" className="border-t border-line">
        <div className="mx-auto max-w-[1340px] px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sage-deep">
                The other side
              </div>
              <h2 className="display-md mt-4 max-w-[820px]">
                Players who joined this week.
              </h2>
              <p className="mt-5 max-w-[560px] text-[16px] leading-[1.55] text-ink-2">
                What teams browsing Picked actually see. Every profile is the player&apos;s real stats, real measurements, and a direct line — no agent stands between you.
              </p>
            </div>
            <Link href="/dashboard/players" className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-ink/[0.10]">
              Browse all players <Arrow size={11} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="group flex flex-col rounded-2xl border border-line bg-paper-2 p-7 transition-shadow hover:shadow-[0_6px_28px_rgba(19,17,14,0.06)]"
                  >
                    <div className="flex items-start justify-between">
                      <div className="num text-[11px] font-bold uppercase tracking-[0.16em] text-mute">
                        No. {String(i + 1).padStart(2, "0")}
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

                    <h3 className="mt-10 text-[28px] font-extrabold leading-[1.05] tracking-[-0.025em]">
                      {name}
                    </h3>
                    <div className="mt-2 text-[12px] font-bold uppercase tracking-[0.12em] text-mute">
                      {role} · {profile?.country || "—"}
                    </div>

                    {p.looking_for && (
                      <p className="mt-5 line-clamp-2 text-[13px] leading-[1.55] text-ink-2">
                        {p.looking_for}
                      </p>
                    )}

                    <div className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-6">
                      <div>
                        <div className="num text-[22px] font-extrabold leading-none tracking-[-0.025em]">
                          {p.ppg ? Number(p.ppg).toFixed(1) : "—"}
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">PPG</div>
                      </div>
                      <div>
                        <div className="num text-[22px] font-extrabold leading-none tracking-[-0.025em]">
                          {p.apg ? Number(p.apg).toFixed(1) : "—"}
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">APG</div>
                      </div>
                      <div>
                        <div className="num text-[22px] font-extrabold leading-none tracking-[-0.025em]">
                          {age || "—"}
                        </div>
                        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">Yrs</div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-mute">View profile</span>
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
        </div>
      </section>

      {/* ─── 4. Editorial quote — magazine-style single feature ─── */}
      <section className="border-t border-line bg-ink text-sand">
        <div className="mx-auto grid max-w-[1340px] grid-cols-1 gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-16 lg:py-32">
          <div className="flex flex-col justify-between gap-12">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: "#E0926F" }}>
                Case · 047
              </div>
              <div className="mt-6 text-[13px] font-semibold leading-[1.6] text-sand/70">
                Belgrade → Athens
                <br />
                Two seasons, two contracts. No agent, no email chains.
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-sand/15 pt-8">
              <div>
                <div className="num text-[32px] font-extrabold leading-none tracking-[-0.03em]">
                  48h
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  From upload to inbox
                </div>
              </div>
              <div>
                <div className="num text-[32px] font-extrabold leading-none tracking-[-0.03em]">
                  2
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  Teams reached out
                </div>
              </div>
              <div>
                <div className="num text-[32px] font-extrabold leading-none tracking-[-0.03em]">
                  0
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  Agents involved
                </div>
              </div>
            </div>
          </div>

          <div>
            <blockquote className="m-0 font-extrabold leading-[1.15] tracking-[-0.025em]" style={{ fontSize: "clamp(28px, 3.4vw, 52px)" }}>
              &ldquo;I uploaded my profile on a Tuesday. By Thursday, two teams had me in their inbox. One flew me out the next week — I&apos;m now in my second season abroad, on a contract a coach found through one search filter.&rdquo;
            </blockquote>
            <div className="mt-10 flex items-center gap-4 border-t border-sand/15 pt-8">
              <div className="h-12 w-12 rounded-full bg-sand/15" />
              <div>
                <div className="text-[15px] font-bold">Stefan Janković</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sand/55">
                  Point Guard · Serbia → Greece
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Final CTA ────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1340px] px-6 py-24 sm:px-12 sm:py-28 lg:px-16 lg:py-32">
          <h2 className="display-lg max-w-[1000px]">
            While you wait, teams are picking <span className="text-terra">someone else.</span>
          </h2>
          <p className="mt-8 max-w-[600px] text-[18px] leading-[1.5] text-ink-2">
            Every day a roster spot you would have fit goes to a player whose profile was already there. Twelve minutes today — and the next call could be yours.
          </p>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link href="/signup" className="btn btn-terra btn-xl">
              Create your profile <Arrow />
            </Link>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-mute">
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
            The basketball roster network for Europe. Built for players who don&apos;t want to wait, and teams who don&apos;t want to guess.
          </div>
        </div>
        {[
          { h: "Players", links: [["Create profile", "/signup?role=player"], ["Browse teams", "/dashboard/teams"], ["Boost profile", "/dashboard/boost"]] },
          { h: "Teams", links: [["List a position", "/signup?role=team"], ["Browse players", "/dashboard/players"], ["Coach login", "/login"]] },
          { h: "Company", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "#"]] },
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
        <span>© 2026 Picked</span>
        <span>Built for the off-season.</span>
      </div>
    </div>
  );
}

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
const IconEye = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <path d="M1 7c1.5-3 3.5-4.5 6-4.5S11.5 4 13 7c-1.5 3-3.5 4.5-6 4.5S2.5 10 1 7z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

// ─── Section label (magazine-style consistent treatment) ─────
function SectionLabel({ no, title, color = "terra" }) {
  const colorClass = color === "sage" ? "text-sage-deep" : "text-terra";
  return (
    <div className={`flex items-center gap-3 ${colorClass}`}>
      <span className="num label-meta">§ {no}</span>
      <span className="h-px w-8 bg-current opacity-40" />
      <span className="label-meta">{title}</span>
    </div>
  );
}

// ─── Open positions (sample — will be live from team_ads) ────
const OPEN_POSITIONS = [
  {
    team: "BC Mornar", league: "ABA Liga 2", cr: "M", flag: "🇲🇪",
    role: "Power Forward", sub: "6'8\"+ · Stretch 4",
    loc: "Bar, Montenegro", pay: "€1,800–2,400", per: "/ month",
    closes: "12h", urgent: true, viewed: 47, updated: "3 min ago",
  },
  {
    team: "Helsinki Seagulls", league: "Korisliiga", cr: "H", flag: "🇫🇮",
    role: "Combo Guard", sub: "Score-first",
    loc: "Helsinki, Finland", pay: "€2,400–3,200", per: "/ month",
    closes: "Jun 4", viewed: 132, updated: "1h ago",
  },
  {
    team: "Skyliners Academy", league: "NBBL", cr: "S", flag: "🇩🇪",
    role: "Wing — Developmental", sub: "Age ≤ 19",
    loc: "Frankfurt, Germany", pay: "Tuition", per: "+ stipend",
    closes: "Jun 10", viewed: 23, updated: "yesterday",
  },
  {
    team: "Real Betis B", league: "LEB Plata", cr: "R", flag: "🇪🇸",
    role: "Shooting Guard", sub: "40%+ from 3 · 6'3\"",
    loc: "Sevilla, Spain", pay: "€1,600–2,200", per: "/ month",
    closes: "Jun 12", viewed: 88, updated: "2d ago",
  },
  {
    team: "KK Tofaş U21", league: "TBL Dev.", cr: "T", flag: "🇹🇷",
    role: "Point Guard", sub: "Pure pass-first",
    loc: "Bursa, Türkiye", pay: "€1,200 + housing", per: "/ month",
    closes: "Jun 14", viewed: 41, updated: "4d ago",
  },
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

      {/* ─── 1. Hero (the only huge moment) ─────────────────── */}
      <section className="px-6 pb-24 pt-20 sm:px-12 sm:pt-28 lg:px-16 lg:pb-32 lg:pt-36">
        <div className="mx-auto max-w-[1340px]">
          <h1 className="display-xl max-w-[1100px]">
            Off-season is when careers get <span className="serif text-terra">picked.</span>
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

      {/* ─── 2. Open positions ───────────────────────────────── */}
      <section id="positions" className="border-t border-line bg-paper">
        <div className="mx-auto max-w-[1340px] px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel no="01" title="Open positions" />
              <h2 className="display-md mt-5 max-w-[820px]">
                Forty-seven roster spots, posted this <span className="serif text-terra">window.</span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[14px] leading-[1.6] text-ink-2">
                Live positions from clubs and academies. Your profile lands in the coach&apos;s inbox — not on an agent&apos;s desk.
              </p>
            </div>
            <Link href="/dashboard/teams" className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-ink/[0.10]">
              Browse all <Arrow size={11} />
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[44px_1.5fr_1.4fr_1fr_1fr_120px] items-center border-y-2 border-ink py-4 label-meta text-mute">
              <div>#</div>
              <div>Team</div>
              <div>Position</div>
              <div>Location</div>
              <div>Pay · closes</div>
              <div />
            </div>
            {OPEN_POSITIONS.map((r, i) => (
              <div key={i} className="group grid cursor-pointer grid-cols-[44px_1.5fr_1.4fr_1fr_1fr_120px] items-center border-b border-line py-6 transition-colors hover:bg-paper-2">
                <div className="num text-[14px] font-bold text-mute">0{i + 1}</div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] text-[14px] font-bold text-paper-2" style={{ background: "linear-gradient(135deg,#2a241e,#4a3d31)" }}>
                    {r.cr}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</span>
                      <span className="text-[14px]" aria-hidden>{r.flag}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
                      <span>{r.league}</span>
                      <span className="text-line-2">·</span>
                      <span className="normal-case font-normal tracking-normal">Updated {r.updated}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold">{r.role}</span>
                    {r.urgent && (
                      <span className="rounded-full bg-terra/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-terra">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-mute">{r.sub}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[13px] text-ink-2">
                    <IconPin /> {r.loc}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-mute">
                    <IconEye /> <span className="num">{r.viewed}</span> coaches viewed
                  </div>
                </div>
                <div>
                  <div className="num text-[14px] font-bold">{r.pay}</div>
                  <div className="mt-0.5 text-[11px] text-mute">
                    {r.per} · closes <span className={r.urgent ? "font-bold text-terra" : ""}>{r.closes}</span>
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
                      <div className="flex items-center gap-1.5">
                        <span className="text-[16px] font-bold tracking-[-0.005em]">{r.team}</span>
                        <span className="text-[13px]" aria-hidden>{r.flag}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-mute">{r.league}</div>
                    </div>
                  </div>
                  {r.urgent ? (
                    <span className="rounded-full bg-terra/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-terra">
                      Urgent
                    </span>
                  ) : (
                    <span className="num text-[13px] font-bold text-mute">0{i + 1}</span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4">
                  <div>
                    <div className="label-meta text-mute">Position</div>
                    <div className="mt-1 text-[14px] font-bold">{r.role}</div>
                    <div className="text-[11px] text-mute">{r.sub}</div>
                  </div>
                  <div>
                    <div className="label-meta text-mute">Location</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
                      <IconPin /> {r.loc}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="label-meta text-mute">Pay</div>
                    <div className="mt-1 num text-[14px] font-bold">
                      {r.pay}{" "}
                      <span className="text-[11px] font-normal text-mute">
                        {r.per} · closes <span className={r.urgent ? "font-bold text-terra" : ""}>{r.closes}</span>
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 text-[11px] text-mute">
                    <span className="flex items-center gap-1.5"><IconEye /> <span className="num">{r.viewed}</span> viewed</span>
                    <span className="text-line-2">·</span>
                    <span>Updated {r.updated}</span>
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

      {/* ─── 3. Players — asymmetric staircase ──────────────── */}
      <section id="players" className="border-t border-line">
        <div className="mx-auto max-w-[1340px] px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionLabel no="02" title="The roster" color="sage" />
              <h2 className="display-md mt-5 max-w-[820px]">
                Players who joined this <span className="serif text-sage-deep">week.</span>
              </h2>
              <p className="mt-4 max-w-[520px] text-[14px] leading-[1.6] text-ink-2">
                What a coach sees when they search. Real stats, real measurements, a direct line.
              </p>
            </div>
            <Link href="/dashboard/players" className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.06] px-4 py-2 text-[12px] font-semibold text-ink hover:bg-ink/[0.10]">
              Browse all <Arrow size={11} />
            </Link>
          </div>

          {/* Staircase grid: each card vertically offset on lg */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
            {featuredPlayers.length > 0 ? (
              featuredPlayers.map((p, i) => {
                const profile = p.profile;
                const name = profile?.full_name || "Unnamed";
                const role = p.positions?.[0] || "—";
                const age = p.date_of_birth
                  ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                  : null;
                const boosted = boostedIds.has(p.profile_id);
                // Staircase: 0, 16, 32, 12 (lg only)
                const offsetMt = ["", "lg:mt-16", "lg:mt-32", "lg:mt-12"][i % 4];

                return (
                  <Link
                    key={p.id}
                    href={`/dashboard/players/${p.profile_id}`}
                    className={`group flex flex-col rounded-2xl border border-line bg-paper-2 p-7 transition-shadow hover:shadow-[0_6px_28px_rgba(19,17,14,0.06)] ${offsetMt}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="num label-meta text-mute">
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

                    <h3 className="mt-10 text-[26px] font-semibold leading-[1.1] tracking-[-0.015em]">
                      {name}
                    </h3>
                    <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-mute">
                      {role} · {profile?.country || "—"}
                    </div>

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

                    <div className="mt-5 flex items-center justify-between text-[12px]">
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

      {/* ─── 4. Case study — the emotional peak ─────────────── */}
      <section className="border-t border-line bg-ink text-sand">
        <div className="mx-auto grid max-w-[1340px] grid-cols-1 gap-12 px-6 py-24 sm:px-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-16 lg:py-32">
          <div className="flex flex-col justify-between gap-12">
            <div>
              <div className="flex items-center gap-3" style={{ color: "#E0926F" }}>
                <span className="num label-meta">§ 03</span>
                <span className="h-px w-8 bg-current opacity-40" />
                <span className="label-meta">Case 047</span>
              </div>
              <div className="mt-6 text-[13px] font-semibold leading-[1.6] text-sand/70">
                Belgrade → Athens
                <br />
                Two seasons, two contracts.
                <br />
                No agent, no email chains.
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-sand/15 pt-8">
              <div>
                <div className="num text-[36px] font-extrabold leading-none tracking-[-0.03em]">
                  48h
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  Upload to inbox
                </div>
              </div>
              <div>
                <div className="num text-[36px] font-extrabold leading-none tracking-[-0.03em]">
                  2
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  Teams reached out
                </div>
              </div>
              <div>
                <div className="num text-[36px] font-extrabold leading-none tracking-[-0.03em]">
                  0
                </div>
                <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-sand/55">
                  Agents involved
                </div>
              </div>
            </div>
          </div>

          <div>
            <blockquote className="m-0 font-light leading-[1.18] tracking-[-0.025em]" style={{ fontSize: "clamp(28px, 3.4vw, 52px)" }}>
              &ldquo;I uploaded my profile on a Tuesday. By Thursday, <span className="serif" style={{ color: "#B5C9A6" }}>two teams</span> had me in their inbox. One flew me out the next week — I&apos;m now in my second season abroad, on a contract a coach found through one search filter.&rdquo;
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

      {/* ─── 5. Calm pressure + quiet close ─────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1340px] px-6 py-20 sm:px-12 sm:py-24 lg:px-16 lg:py-28">
          <SectionLabel no="04" title="Off-season" />

          <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <div>
              <div className="space-y-2 font-light leading-[1.2] tracking-[-0.025em]" style={{ fontSize: "clamp(26px, 2.6vw, 40px)" }}>
                <p>Rosters close quietly.</p>
                <p className="text-ink-2/80">Coaches search before agents call.</p>
                <p className="text-ink-2/60">Most contracts happen in silence.</p>
                <p className="pt-6 text-ink">While you wait, teams are picking <span className="serif text-terra">someone else.</span></p>
              </div>
            </div>

            <div className="flex flex-col items-start justify-end gap-5">
              <p className="max-w-[400px] text-[15px] leading-[1.55] text-ink-2">
                Every day a roster spot you would have fit goes to a player whose profile was already there. Twelve minutes today.
              </p>
              <Link href="/signup" className="btn btn-terra btn-lg">
                Create your profile <Arrow />
              </Link>
              <span className="label-meta text-mute">
                Free · No card · 12 min
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer with manifesto ──────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1340px] px-6 pb-9 pt-16 sm:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="mb-5 flex items-center gap-2 text-[24px] font-extrabold">
                <span className="h-2 w-2 rounded-full bg-terra" /> Picked
              </div>
              <p className="max-w-[340px] text-[14px] leading-[1.6] text-ink-2">
                The basketball roster network for Europe. Built for players who don&apos;t want to wait, and coaches who don&apos;t want to guess.
              </p>
              <p className="mt-4 max-w-[340px] text-[13px] leading-[1.6] text-mute">
                Reykjavík / Belgrade. Built for the off-season.
              </p>
            </div>
            {[
              { h: "Players", links: [["Create profile", "/signup?role=player"], ["Browse teams", "/dashboard/teams"], ["Boost profile", "/dashboard/boost"]] },
              { h: "Teams", links: [["List a position", "/signup?role=team"], ["Browse players", "/dashboard/players"], ["Coach login", "/login"]] },
              { h: "Company", links: [["Privacy", "/privacy"], ["Terms", "/terms"], ["Contact", "#"]] },
            ].map((col) => (
              <div key={col.h}>
                <h4 className="mb-5 label-meta text-mute">{col.h}</h4>
                {col.links.map(([label, href]) => (
                  <Link key={label} href={href} className="block py-1.5 text-[14px] text-ink hover:text-terra">
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 text-[12px] text-mute sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Picked</span>
            <span className="num label-meta">
              28 countries · 0 agents required
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

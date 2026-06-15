import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import HomeNav from "./components/HomeNav";

const Arrow = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    className="inline-block align-middle"
  >
    <path
      d="M1 7h12M8 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MARKET_CHIPS = [
  ["es", "Spain"],
  ["de", "Germany"],
  ["fr", "France"],
  ["it", "Italy"],
  ["is", "Iceland"],
  ["rs", "Serbia"],
  ["hr", "Croatia"],
  ["gr", "Greece"],
  ["pl", "Poland"],
  ["nl", "Netherlands"],
  ["se", "Sweden"],
  ["dk", "Denmark"],
];

const Flag = ({ code, country }) => (
  <svg
    viewBox="0 0 30 20"
    role="img"
    aria-label={`${country} flag`}
    className="h-[14px] w-[21px] shrink-0 overflow-hidden rounded-[2px] border border-black/10"
  >
    <use href={`/flags.svg#${code}`} />
  </svg>
);

const PROFILE_FIELDS = [
  ["Position / size", "Role, height, age and current level", "Lets a club place the player against a real roster gap."],
  ["Market status", "Available, draft or signed", "Prevents clubs wasting time on players who are not actually movable."],
  ["Proof", "Film, stats, last club and season context", "Gives managers a first evaluation before a call is scheduled."],
  ["Fit", "Countries, languages, salary range and timing", "Shows whether the opportunity can become a contract conversation."],
];

const MARKET_FLOW = [
  ["01", "Declare availability", "Players enter the market when their profile is ready."],
  ["02", "Open roster search", "Clubs filter by position, country, level, passport and timing."],
  ["03", "Review prospects", "Managers scan film, stats, fit and contract expectations."],
  ["04", "Exchange interest", "Conversations start only when both sides have a real roster reason."],
];

export const metadata = {
  title: "Picked — The European basketball player market",
  description:
    "Enter the European basketball player market. Build your player profile, declare availability and let clubs open roster search across Europe.",
};

export default async function Home() {
  const supabase = await createClient();

  const [{ count: playerCount }, { count: teamCount }, { data: openNeeds }] =
    await Promise.all([
      supabase
        .from("player_ads")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("team_ads")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("team_ads")
        .select("id, team_name, league, positions_needed, what_we_offer, profile:profile_id(country)")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const proofStats = [
    {
      value: playerCount && playerCount > 0 ? `${playerCount}` : "Profile",
      label: playerCount && playerCount > 0 ? "available players" : "built before market entry",
    },
    {
      value: teamCount && teamCount > 0 ? `${teamCount}` : "Search",
      label: teamCount && teamCount > 0 ? "active roster searches" : "opened by clubs",
    },
    { value: "Draft", label: "not live until ready" },
    { value: "Interest", label: "exchanged directly" },
  ];

  return (
    <main className="min-h-screen bg-sand text-ink">
      <HomeNav />

      <section className="px-5 pb-16 pt-8 sm:px-8 sm:pb-20 sm:pt-10 lg:px-10">
        <div className="mx-auto max-w-[1340px] border-t border-line pt-10">
          <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-end">
            <div>
              <p className="label-meta rise rise-1 text-sage-deep">Player market / Europe</p>
              <h1 className="display-xl rise rise-2 mt-7 max-w-[790px] uppercase">
                Enter the European player market.
              </h1>
              <p className="rise rise-3 mt-7 max-w-[610px] text-[18px] font-medium leading-[1.55] text-ink-2">
                Picked is where professional basketball players declare
                availability and clubs open roster search. Build your profile,
                show market fit and exchange interest when the window moves.
              </p>

              <div className="rise rise-4 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/signup?role=player" className="btn btn-terra btn-xl justify-center">
                  Enter the market <Arrow />
                </Link>
                <Link href="/signup?role=team" className="btn btn-ink btn-xl justify-center">
                  Open roster search <Arrow />
                </Link>
              </div>

              <div className="rise rise-5 mt-8 flex max-w-[620px] flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5">
                {["Profile", "Availability", "Film", "Stats", "Passport", "Contract window"].map((item) => (
                  <span key={item} className="text-[12px] font-black uppercase tracking-[0.14em] text-mute">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rise rise-4">
              <div className="overflow-hidden rounded-[18px] border border-line bg-paper-2">
                <div className="relative aspect-[4/3] bg-paper">
                  <Image
                    src="/hero-basketball-action.jpg"
                    alt="Basketball player attacking the rim during a game"
                    fill
                    sizes="(min-width: 1024px) 620px, 100vw"
                    className="object-cover object-[52%_42%]"
                    priority
                  />
                </div>
                <div className="grid border-t border-line sm:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)]">
                  <div className="p-4 sm:p-5">
                    <p className="label-meta text-terra-deep">Player profile</p>
                    <h2 className="mt-2 text-[22px] font-black leading-none text-ink">
                      Sample prospect
                    </h2>
                  </div>
                  <div className="grid grid-cols-[0.75fr_1.2fr_1fr] border-t border-line sm:border-l sm:border-t-0">
                    {[
                      ["PG", "Role"],
                      ["Germany", "Market"],
                      ["Available", "Status"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className="min-w-0 border-r border-line px-3 py-4 last:border-r-0"
                      >
                        <div className="flex min-w-0 items-center gap-1.5 text-[15px] font-black leading-none text-ink lg:text-[16px]">
                          {label === "Market" ? <Flag code="de" country="Germany" /> : null}
                          <span className="min-w-0">{value}</span>
                        </div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-mute">
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-[1340px] border-y border-line py-5">
          <div className="flex flex-wrap gap-2">
            {[...MARKET_CHIPS, [null, "More markets"]].map(([code, country]) => (
              <span
                key={country}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-2 px-3.5 py-2 text-[13px] font-bold text-ink"
              >
                {code ? <Flag code={code} country={country} /> : <span aria-hidden="true">+</span>}
                {country}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto max-w-[1340px]">
          <div className="grid border-b border-line sm:grid-cols-2 lg:grid-cols-4">
            {proofStats.map((stat, index) => (
              <div
                key={stat.label}
                className={`py-6 sm:px-6 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-t lg:border-t-0" : ""}`}
              >
                <div className="num text-[30px] font-black leading-none text-ink">
                  {stat.value}
                </div>
                <div className="mt-2 text-[11px] font-black uppercase tracking-[0.14em] text-mute">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="market" className="border-t border-line bg-paper px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="label-meta text-terra-deep">Market flow</p>
            <h2 className="display-md mt-4 max-w-[620px]">
              Liquidity for roster windows.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {MARKET_FLOW.map(([no, title, body]) => (
              <div key={no} className="bg-paper-2 p-6">
                <div className="num text-[64px] font-extralight leading-none tracking-[-0.04em] text-terra/30">
                  {no}
                </div>
                <h3 className="mt-6 text-[18px] font-bold text-ink">{title}</h3>
                <p className="mt-3 text-[14px] leading-[1.55] text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-[1340px]">
          <h2 className="display-md max-w-[900px]">
            A player market is only useful if every profile is scan-ready.
          </h2>

          <div className="mt-12">
            {PROFILE_FIELDS.map(([label, field, why]) => (
              <div
                key={label}
                className="grid gap-3 border-t border-line py-7 last:border-b md:grid-cols-[200px_1fr_1fr] md:gap-10"
              >
                <div className="label-meta pt-1 text-terra-deep">{label}</div>
                <p className="text-[15px] font-semibold leading-[1.6] text-ink">{field}</p>
                <p className="text-[15px] font-semibold leading-[1.6] text-ink">
                  {why}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roster-search" className="border-t border-line bg-paper px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="label-meta text-sage-deep">Roster search</p>
            <h2 className="display-md mt-4 max-w-[660px]">
              Review prospects who are actually available.
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-ink-2">
              Clubs search the market by position, passport, country fit,
              level, film and timing. Interest belongs in a structured market,
              not a scattered inbox.
            </p>
            <Link href="/signup?role=team" className="btn btn-sage btn-lg mt-8">
              Open roster search <Arrow />
            </Link>
          </div>

          <div className="space-y-3">
            {openNeeds && openNeeds.length > 0 ? (
              openNeeds.map((spot) => (
                <div
                  key={spot.id}
                  className="lift grid gap-4 rounded-2xl border border-line bg-paper-2 p-5 sm:grid-cols-[1.2fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <h3 className="text-[16px] font-bold text-ink">
                      {(spot.positions_needed || []).join(" / ") || "Open tryout"}
                    </h3>
                    <p className="mt-1 text-[13px] text-ink-2">
                      {spot.team_name}
                      {spot.league ? ` · ${spot.league}` : ""}
                    </p>
                  </div>
                  <div className="text-[13px] text-mute">
                    {spot.profile?.country || "Europe"}
                    {spot.what_we_offer ? (
                      <>
                        <br />
                        <span className="line-clamp-2">{spot.what_we_offer}</span>
                      </>
                    ) : null}
                  </div>
                  <Link
                    href="/signup?role=player"
                    className="text-[13px] font-bold text-ink underline-offset-4 hover:underline"
                  >
                    Declare interest
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-paper-2 p-8 text-center">
                <h3 className="text-[16px] font-bold text-ink">
                  No active roster searches yet
                </h3>
                <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-[1.55] text-ink-2">
                  Clubs publish the positions they need to fill. Available
                  players can then review the search and declare interest.
                </p>
                <Link href="/signup?role=team" className="btn btn-sage mt-5">
                  Open the first search <Arrow />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="label-meta text-terra-deep">Market rules</p>
            <h2 className="display-md mt-4 max-w-[480px]">
              Availability has to mean something.
            </h2>
          </div>

          <div>
            {[
              ["Draft first", "A player profile is private until the player chooses to enter the market."],
              ["Professional signal", "Clubs see the information they need for a first scan, not fan content."],
              ["Market context", "Countries, languages and timing matter as much as highlights."],
            ].map(([title, body]) => (
              <div key={title} className="grid gap-3 border-t border-line py-6 last:border-b md:grid-cols-[220px_1fr]">
                <h3 className="text-[16px] font-black text-ink">{title}</h3>
                <p className="text-[15px] leading-[1.65] text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink px-6 py-16 text-sand sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="label-meta text-sand/55">Transfer window</p>
            <h2 className="display-md mt-4 max-w-[780px]">
              Declare availability before the market moves.
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-sand/75">
              Build your profile first. Enter the market only when it
              is strong enough for club review.
            </p>
            <Link
              href="/signup?role=player"
              className="btn btn-terra btn-xl mt-9"
            >
              Build your profile <Arrow />
            </Link>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl lg:block">
            <Image
              src="/seed/players/p06.jpg"
              alt="Player on an outdoor court seen from above the hoop"
              fill
              sizes="(min-width: 1024px) 540px, 0px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-6 pb-8 pt-12 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-[1340px]">
          <div className="flex flex-col gap-10 pb-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Link href="/" className="flex items-baseline gap-2 text-[18px] font-extrabold tracking-wide">
                <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
                <span>Picked</span>
              </Link>
              <p className="mt-3 max-w-[300px] text-[13px] leading-[1.6] text-mute">
                A professional basketball player market for European roster windows.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
              {[
                ["Market", [
                  ["Market flow", "/#market"],
                  ["Roster search", "/#roster-search"],
                ]],
                ["Account", [
                  ["Enter market", "/signup"],
                  ["Log in", "/login"],
                ]],
                ["Legal", [
                  ["Privacy", "/privacy"],
                  ["Terms", "/terms"],
                ]],
              ].map(([heading, links]) => (
                <div key={heading}>
                  <div className="label-meta text-mute">{heading}</div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {links.map(([label, href]) => (
                      <Link
                        key={label}
                        href={href}
                        className="text-[13px] font-semibold text-ink-2 hover:text-ink"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-6 text-[12px] text-mute sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Picked · getpicked.co</span>
            <span>Players enter. Clubs search. Interest moves.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

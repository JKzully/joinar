import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import HomeNav from "./components/HomeNav";

const Arrow = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
    className="inline-block shrink-0 align-middle"
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

const MARKET_COUNTRIES = [
  ["es", "Spain"],
  ["de", "Germany"],
  ["fr", "France"],
  ["it", "Italy"],
  ["gr", "Greece"],
  ["rs", "Serbia"],
  ["hr", "Croatia"],
  ["pl", "Poland"],
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

const SCAN_FIELDS = [
  ["Role", "Position, size, age and level"],
  ["Availability", "Status, timing and contract window"],
  ["Evidence", "Film, stats and previous clubs"],
  ["Market fit", "Passport, countries, languages and salary"],
];

const SAMPLE_SEARCHES = [
  {
    role: "Lead guard",
    market: "Germany",
    code: "de",
    detail: "Pro A / BBL · available now",
  },
  {
    role: "Two-way wing",
    market: "Spain",
    code: "es",
    detail: "LEB Plata · EU passport",
  },
  {
    role: "Stretch forward",
    market: "France",
    code: "fr",
    detail: "NM1 · July arrival",
  },
];

export const metadata = {
  title: "Picked — The European basketball player market",
  description:
    "Players declare availability. Clubs search by position, level, passport and timing. Interest moves directly on Picked.",
};

export default async function Home() {
  const supabase = await createClient();
  const { data: openNeeds } = await supabase
    .from("team_ads")
    .select(
      "id, team_name, league, positions_needed, what_we_offer, profile:profile_id(country)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(3);

  const rosterSearches =
    openNeeds && openNeeds.length > 0
      ? openNeeds.map((spot) => ({
          id: spot.id,
          role: (spot.positions_needed || []).join(" / ") || "Open position",
          market: spot.profile?.country || "Europe",
          detail: [spot.team_name, spot.league].filter(Boolean).join(" · "),
          href: "/signup?role=player",
        }))
      : SAMPLE_SEARCHES.map((search) => ({
          ...search,
          id: `${search.market}-${search.role}`,
          href: "/signup?role=team",
          sample: true,
        }));

  return (
    <main className="min-h-screen overflow-hidden bg-sand text-ink">
      <HomeNav />

      <section className="px-5 pb-10 pt-14 sm:px-8 sm:pb-14 sm:pt-16 lg:px-12 lg:pt-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-12">
            <div className="pb-1">
              <p className="label-meta rise rise-1 text-sage-deep">
                Professional basketball · Europe
              </p>
              <h1 className="hero-title rise rise-2 mt-6 max-w-[720px]">
                Enter the European player market.
              </h1>
              <p className="rise rise-3 mt-7 max-w-[610px] text-[1.125rem] font-medium leading-[1.6] text-ink-2">
                Players declare availability. Clubs search by position, level,
                passport and timing. Interest moves directly when the fit is
                real.
              </p>

              <div className="rise rise-4 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup?role=player"
                  className="btn btn-terra btn-xl justify-center"
                >
                  Enter the market <Arrow />
                </Link>
                <Link
                  href="/signup?role=team"
                  className="btn btn-ghost btn-xl justify-center"
                >
                  Open roster search <Arrow />
                </Link>
              </div>

              <p className="rise rise-5 mt-5 text-[0.8125rem] font-semibold text-mute">
                Draft privately. Publish only when you are ready.
              </p>
            </div>

            <div className="rise rise-4 relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-ink">
                <Image
                  src="/hero-basketball-action.jpg"
                  alt="Professional basketball player attacking the rim during a game"
                  fill
                  sizes="(min-width: 1024px) 680px, 100vw"
                  className="object-cover object-[52%_48%]"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white sm:bottom-7 sm:left-7 sm:right-7">
                  <div>
                    <p className="label-meta text-white/65">Player market</p>
                    <p className="mt-2 max-w-[320px] text-[1.25rem] font-extrabold leading-tight">
                      One profile for the next roster conversation.
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-2 text-[0.75rem] font-extrabold text-ink sm:flex">
                    <span className="h-2 w-2 rounded-full bg-status-live" />
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-14 border-y border-line py-5">
            <div className="no-scrollbar flex items-center gap-5 overflow-x-auto pb-1 sm:gap-7">
              <span className="label-meta shrink-0 text-mute">Active markets</span>
              {MARKET_COUNTRIES.map(([code, country]) => (
                <span
                  key={country}
                  className="inline-flex shrink-0 items-center gap-2 text-[0.8125rem] font-bold text-ink"
                >
                  <Flag code={code} country={country} />
                  {country}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="market" className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="label-meta text-terra-deep">The market, in one view</p>
              <h2 className="section-title mt-4 max-w-[560px]">
                One place to see who is available and who is hiring.
              </h2>
            </div>
            <p className="max-w-[620px] text-[1rem] font-medium leading-[1.65] text-ink-2 lg:justify-self-end">
              Picked turns scattered messages, highlight links and roster needs
              into a structured market. Players control when they go live.
              Clubs review the information that changes a roster decision.
            </p>
          </div>

          <div className="market-board mt-12 overflow-hidden rounded-lg border border-line-2 bg-paper-2">
            <div className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-status-live" />
                <span className="text-[0.8125rem] font-extrabold">Market view</span>
                <span className="text-[0.75rem] font-semibold text-mute">
                  European roster window
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[0.6875rem] font-extrabold uppercase tracking-[0.1em] text-mute">
                <span>Available</span>
                <span>·</span>
                <span>All positions</span>
                <span>·</span>
                <span>Europe</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-line p-5 sm:p-7 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between">
                  <p className="label-meta text-sage-deep">Player scan</p>
                  <span className="text-[0.75rem] font-bold text-mute">
                    Profile preview
                  </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-[180px_1fr]">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-paper">
                    <Image
                      src="/hero-basketball-action.jpg"
                      alt="Example professional basketball player profile"
                      fill
                      sizes="180px"
                      className="object-cover object-[52%_48%]"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-terra-deep">
                          Sample prospect
                        </p>
                        <h3 className="mt-2 text-[1.75rem] font-extrabold leading-none">
                          Available guard
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#EAF8EF] px-3 py-2 text-[0.6875rem] font-extrabold uppercase tracking-[0.08em] text-[#087A3B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-status-live" />
                        Live
                      </span>
                    </div>

                    <div className="mt-7 grid grid-cols-3 border-y border-line">
                      {[
                        ["PG / SG", "Role"],
                        ["193 cm", "Height"],
                        ["EU", "Passport"],
                      ].map(([value, label], index) => (
                        <div
                          key={label}
                          className={`py-4 ${index > 0 ? "border-l border-line pl-4" : ""}`}
                        >
                          <p className="text-[1rem] font-extrabold">{value}</p>
                          <p className="mt-1 text-[0.625rem] font-extrabold uppercase tracking-[0.12em] text-mute">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-3">
                      {["Full game film", "Current season stats", "Market preferences"].map(
                        (item) => (
                          <div
                            key={item}
                            className="flex items-center justify-between border-b border-line pb-3 text-[0.8125rem] font-semibold"
                          >
                            <span>{item}</span>
                            <span className="text-sage-deep">Ready</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div id="roster-search" className="p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <p className="label-meta text-terra-deep">Roster search</p>
                  <span className="text-[0.75rem] font-bold text-mute">
                    {openNeeds && openNeeds.length > 0 ? "Open now" : "Example view"}
                  </span>
                </div>

                <div className="mt-6">
                  {rosterSearches.map((search, index) => (
                    <Link
                      key={search.id}
                      href={search.href}
                      className="group grid grid-cols-[36px_1fr_auto] items-center gap-3 border-t border-line py-5 first:border-t-0 first:pt-0"
                    >
                      <span className="num text-[0.75rem] font-extrabold text-mute">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-[0.9375rem] font-extrabold">
                          {search.code ? (
                            <Flag code={search.code} country={search.market} />
                          ) : null}
                          {search.role}
                        </span>
                        <span className="mt-1 block truncate text-[0.75rem] font-medium text-mute">
                          {search.market}
                          {search.detail ? ` · ${search.detail}` : ""}
                        </span>
                      </span>
                      <span className="text-ink transition-transform group-hover:translate-x-1">
                        <Arrow />
                      </span>
                    </Link>
                  ))}
                </div>

                <Link
                  href="/signup?role=team"
                  className="btn btn-ink mt-5 w-full justify-center"
                >
                  Open roster search <Arrow />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-paper-2 px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-[820px]">
            <p className="label-meta text-sage-deep">First evaluation</p>
            <h2 className="section-title mt-4">
              Built around the questions clubs ask first.
            </h2>
          </div>

          <div className="mt-12 border-b border-line">
            {SCAN_FIELDS.map(([label, detail], index) => (
              <div
                key={label}
                className="grid gap-3 border-t border-line py-6 sm:grid-cols-[64px_220px_1fr] sm:items-center sm:gap-6"
              >
                <span className="num text-[0.75rem] font-extrabold text-mute">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-[1rem] font-extrabold">{label}</h3>
                <p className="text-[0.9375rem] font-medium leading-[1.6] text-ink-2">
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1280px] gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-2">
          <div className="bg-ink p-7 text-paper-2 sm:p-10 lg:p-12">
            <p className="label-meta text-paper-2/55">For players</p>
            <h2 className="mt-12 max-w-[480px] text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[0.98]">
              Build privately. Go live deliberately.
            </h2>
            <p className="mt-6 max-w-[470px] text-[1rem] font-medium leading-[1.65] text-paper-2/72">
              Complete your profile, film, stats and market preferences before
              a club sees anything. Availability stays in your control.
            </p>
            <Link href="/signup?role=player" className="btn btn-terra btn-lg mt-10">
              Build your profile <Arrow />
            </Link>
          </div>

          <div className="bg-sage p-7 text-white sm:p-10 lg:p-12">
            <p className="label-meta text-white/65">For clubs</p>
            <h2 className="mt-12 max-w-[500px] text-[clamp(2.25rem,4vw,4.5rem)] font-extrabold leading-[0.98]">
              Search the market, not your inbox.
            </h2>
            <p className="mt-6 max-w-[470px] text-[1rem] font-medium leading-[1.65] text-white/80">
              Review available players against a real roster need, then open a
              conversation when the profile fits.
            </p>
            <Link
              href="/signup?role=team"
              className="btn btn-lg mt-10 bg-white text-ink hover:bg-paper"
            >
              Review prospects <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <p className="label-meta text-terra-deep">Market entry</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <h2 className="section-title max-w-[900px]">
              Your next contract starts with being visible at the right time.
            </h2>
            <Link href="/signup?role=player" className="btn btn-ink btn-xl">
              Enter the market <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line px-5 pb-8 pt-10 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col gap-8 pb-10 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/"
                className="flex items-baseline gap-2 text-[1.125rem] font-extrabold"
              >
                <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
                <span>Picked</span>
              </Link>
              <p className="mt-3 max-w-[330px] text-[0.8125rem] leading-[1.6] text-mute">
                The professional basketball player market for European roster
                windows.
              </p>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4 text-[0.8125rem] font-semibold text-ink-2">
              <Link href="/#market" className="hover:text-ink">
                Market
              </Link>
              <Link href="/#roster-search" className="hover:text-ink">
                Roster search
              </Link>
              <Link href="/login" className="hover:text-ink">
                Log in
              </Link>
              <Link href="/privacy" className="hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-ink">
                Terms
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-line pt-6 text-[0.75rem] text-mute sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Picked · getpicked.co</span>
            <span>Players enter. Clubs search. Interest moves.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

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

const Check = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2.4 7.3l2.8 2.8 6.4-6.7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PLAYER_FIELDS = [
  "Position, height and availability",
  "Film, stats and previous teams",
  "Countries, salary range and goals",
  "Direct messages from interested teams",
];

const FAQS = [
  [
    "Is Picked really free?",
    "Yes. Creating a profile, being found and messaging teams is free during beta. No card, no agent cut, no placement fee.",
  ],
  [
    "What level is this for?",
    "Amateur, semi-pro and pro players targeting European leagues — and the teams hiring at those levels. You set your level on your profile so coaches filter accurately.",
  ],
  [
    "Do I need an agent to use Picked?",
    "No. Teams message you directly and you negotiate however you want. If you have an agent, you can still use Picked to be visible.",
  ],
  [
    "What should I put on my profile?",
    "The things coaches scan first: position, height, age, level, film link, stats, languages and which countries you are open to. Profiles with film get scanned first.",
  ],
  [
    "How do teams contact me?",
    "Through direct messages on Picked. You get an email notification, and you reply from your dashboard. Tryout invitations show date, location and a personal note.",
  ],
];

export const metadata = {
  title: "Picked — Get seen by teams hiring now",
  description:
    "Create a coach-ready basketball profile for Europe. Share film, stats, measurements and availability so teams can find you and contact you directly.",
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
      value: playerCount && playerCount > 0 ? `${playerCount}` : "12 min",
      label: playerCount && playerCount > 0 ? "player profiles live" : "to build a profile",
    },
    {
      value: teamCount && teamCount > 0 ? `${teamCount}` : "100%",
      label: teamCount && teamCount > 0 ? "teams with open needs" : "free during beta",
    },
    { value: "0", label: "agents required" },
  ];

  return (
    <main className="min-h-screen bg-sand text-ink">
      <HomeNav />

      <section className="px-6 pb-16 pt-16 sm:px-12 sm:pb-20 sm:pt-24 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div>
            <p className="label-meta rise rise-1 text-terra-deep">Basketball recruiting for Europe</p>
            <h1 className="display-xl rise rise-2 mt-5 max-w-[880px] uppercase">
              Get <span className="serif normal-case">picked</span> by teams hiring this window.
            </h1>
            <p className="rise rise-3 mt-8 max-w-[620px] text-[18px] leading-[1.5] text-ink-2">
              Build one coach-ready profile with your film, stats, measurements
              and availability. Teams can find you, scan fast and message
              directly.
            </p>

            <div className="rise rise-4 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/signup?role=player" className="btn btn-terra btn-xl justify-center">
                Start your profile <Arrow />
              </Link>
              <Link href="/signup?role=team" className="btn btn-ghost btn-xl justify-center">
                Post a roster need
              </Link>
            </div>

            <p className="rise rise-5 mt-4 text-[13px] font-semibold text-mute">
              Free to start. No card. Built for players and teams in Europe.
            </p>
          </div>

          <div className="rise rise-4 overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_12px_40px_rgba(19,17,14,0.06)]">
            <div className="relative h-44 bg-ink">
              <Image
                src="/seed/players/p01.jpg"
                alt="Player shooting at an outdoor hoop"
                fill
                sizes="(min-width: 1024px) 560px, 100vw"
                className="object-cover object-[50%_62%]"
                priority
              />
              <span className="absolute right-4 top-4 rounded-full bg-paper-2/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-ink">
                Example
              </span>
            </div>

            <div className="border-b border-line p-5">
              <p className="label-meta text-mute">Coach scan</p>
              <h2 className="mt-2 text-[28px] font-semibold leading-none tracking-[-0.02em]">
                Marco Rossi
              </h2>
              <p className="mt-2 text-[13px] font-bold uppercase tracking-[0.1em] text-terra-deep">
                PG / SG · Italy · Available now
              </p>
            </div>

            <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-line bg-line mt-5">
              {[
                ["18.4", "PPG"],
                ["6.1", "APG"],
                ["41%", "3PT"],
              ].map(([value, label]) => (
                <div key={label} className="bg-paper px-4 py-4 text-center">
                  <div className="num text-[24px] font-extrabold leading-none">{value}</div>
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {PLAYER_FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-3 text-[14px] text-ink-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                    <Check />
                  </span>
                  {field}
                </div>
              ))}
            </div>

            <Link href="/signup?role=player" className="btn btn-ink mt-6 w-full justify-center">
              Build this profile <Arrow />
            </Link>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="mx-auto mt-14 max-w-[1340px] overflow-hidden border-y border-line py-3"
        >
          <div className="ticker">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {[
                  "Point guards", "Shooting guards", "Small forwards",
                  "Power forwards", "Centers", "Spain", "Germany", "France",
                  "Italy", "Nordics", "Balkans", "Film first", "No agents",
                ].map((word) => (
                  <span
                    key={word}
                    className="flex items-center whitespace-nowrap text-[12px] font-bold uppercase tracking-[0.16em] text-mute"
                  >
                    {word}
                    <span className="mx-5 inline-block h-1 w-1 rounded-full bg-terra/60" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-[1340px] grid-cols-1 border-b border-line sm:grid-cols-3">
          {proofStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`py-5 sm:px-6 ${index > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}
            >
              <div className="num text-[28px] font-extrabold leading-none text-ink">
                {stat.value}
              </div>
              <div className="mt-2 text-[12px] font-bold uppercase tracking-[0.12em] text-ink-2">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-line bg-paper px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="label-meta text-terra-deep">How it works</p>
            <h2 className="display-md mt-4 max-w-[620px]">
              One profile. Three fast steps.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
            {[
              ["01", "Add the essentials", "Film, stats, measurements, role and countries you are open to."],
              ["02", "Get found by teams", "Coaches filter by position, market, level and availability."],
              ["03", "Talk directly", "If there is interest, you can message without waiting on a middleman."],
            ].map(([no, title, body]) => (
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
            The old route costs money and waits on other people.{" "}
            <span className="serif">Yours doesn&apos;t have to.</span>
          </h2>

          <div className="mt-12">
            {[
              [
                "Agents",
                "An agent takes a cut and works their own list first.",
                "Your profile works for you every day, for free.",
              ],
              [
                "Paid combines",
                "Flights, fees and one weekend to impress whoever showed up.",
                "Your film and stats are in front of teams all season.",
              ],
              [
                "Cold DMs",
                "Instagram messages get lost between memes and spam.",
                "Teams come here specifically to fill a roster spot.",
              ],
            ].map(([label, oldWay, newWay]) => (
              <div
                key={label}
                className="grid gap-3 border-t border-line py-7 last:border-b md:grid-cols-[200px_1fr_1fr] md:gap-10"
              >
                <div className="label-meta pt-1 text-terra-deep">{label}</div>
                <p className="text-[15px] leading-[1.6] text-mute">{oldWay}</p>
                <p className="text-[15px] font-semibold leading-[1.6] text-ink">
                  {newWay}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="teams" className="border-t border-line bg-paper px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="label-meta text-sage-deep">For teams</p>
            <h2 className="display-md mt-4 max-w-[660px]">
              Find players who are <span className="serif">actually available</span>.
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-ink-2">
              Post a roster need, browse coach-ready profiles and message the
              players who match your market, level and timeline.
            </p>
            <Link href="/signup?role=team" className="btn btn-sage btn-lg mt-8">
              Create team account <Arrow />
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
                    Apply
                  </Link>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-paper-2 p-8 text-center">
                <h3 className="text-[16px] font-bold text-ink">
                  Open roster needs appear here
                </h3>
                <p className="mx-auto mt-2 max-w-[380px] text-[13px] leading-[1.55] text-ink-2">
                  Teams post the positions they need to fill. Be one of the
                  first clubs on Picked and your need shows up right here.
                </p>
                <Link href="/signup?role=team" className="btn btn-sage mt-5">
                  Post the first need <Arrow />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="label-meta text-terra-deep">Questions</p>
            <h2 className="display-md mt-4 max-w-[420px]">
              Before you <span className="serif">commit.</span>
            </h2>
          </div>

          <div className="faq">
            {FAQS.map(([question, answer]) => (
              <details key={question} className="group border-t border-line last:border-b">
                <summary className="flex items-center justify-between gap-6 py-5 text-[16px] font-bold text-ink">
                  {question}
                  <span className="faq-icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-2 text-[15px] font-semibold leading-none">
                    +
                  </span>
                </summary>
                <p className="max-w-[640px] pb-6 text-[14px] leading-[1.65] text-ink-2">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(([question, answer]) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            })),
          }),
        }}
      />

      <section className="border-t border-line bg-ink px-6 py-16 text-sand sm:px-12 sm:py-20 lg:px-16">
        <div className="mx-auto grid max-w-[1340px] gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="label-meta text-sand/55">Start before the roster closes</p>
            <h2 className="display-md mt-4 max-w-[780px]">
              Your profile can be <span className="serif">live today.</span>
            </h2>
            <p className="mt-5 max-w-[520px] text-[15px] leading-[1.6] text-sand/75">
              Add the information coaches scan first. Update it any time.
            </p>
            <Link
              href="/signup?role=player"
              className="btn btn-terra btn-xl mt-9"
            >
              Start free <Arrow />
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
                One coach-ready profile. Direct messages.
                Built for players and teams in Europe.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 sm:gap-16">
              {[
                ["Product", [
                  ["How it works", "/#how"],
                  ["For teams", "/#teams"],
                ]],
                ["Account", [
                  ["Start free", "/signup"],
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
            <span>Get picked. Not passed over.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

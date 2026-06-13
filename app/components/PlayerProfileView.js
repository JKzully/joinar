import Image from "next/image";
import Link from "next/link";

const EXP_LABELS = { amateur: "Amateur", semi_pro: "Semi-Pro", pro: "Pro" };

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return Number.isFinite(age) ? age : null;
}

function formatPosition(position) {
  return position.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function stripProtocol(url) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// Returns an embeddable player URL for YouTube/Vimeo links, or null
function getVideoEmbedUrl(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
      const match = parsed.pathname.match(/^\/(shorts|embed)\/([\w-]+)/);
      return match ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

export default function PlayerProfileView({
  player,
  isBoosted = false,
  isSeed = false,
  backHref,
  backLabel,
  actions,
  publicActions,
}) {
  const profile = player.profile;
  const name = profile?.full_name || "Unnamed Player";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const positions = player.positions || [];
  const posLabel = positions.length > 0
    ? positions.map(formatPosition).join(" / ")
    : "Position TBD";
  const age = calculateAge(player.date_of_birth);
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
  const preferredCountries = player.preferred_countries || [];
  const languages = player.languages || [];
  const hasCoachScan =
    player.highlights_url ||
    preferredCountries.length > 0 ||
    languages.length > 0 ||
    player.looking_for;
  const videoEmbedUrl = getVideoEmbedUrl(player.highlights_url);

  const stats = [
    { label: "PPG", value: player.ppg },
    { label: "APG", value: player.apg },
    { label: "RPG", value: player.rpg },
    { label: "3PT", value: player.three_pt_pct, suffix: "%" },
  ];

  return (
    <div className="mx-auto max-w-[1120px]">
      {backHref && (
        <Link
          href={backHref}
          className="mb-7 inline-flex items-center gap-2 text-[13px] font-semibold text-mute hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </Link>
      )}

      <section className="grid gap-7 lg:grid-cols-[390px_1fr] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-line bg-paper-2">
          <div className="relative aspect-[0.86/1] bg-ink">
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`${name} profile photo`}
                fill
                sizes="(min-width: 1024px) 390px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#0A84FF,#05070A)]">
                <div className="absolute inset-0 flex items-center justify-center text-[150px] font-black text-white/10">
                  {initials}
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/75 to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
              <Badge tone="sage">Available</Badge>
              {isBoosted && <Badge tone="terra">Boosted</Badge>}
              {isSeed && <Badge>Sample</Badge>}
            </div>
            <div className="absolute bottom-5 left-5 right-5 text-paper-2">
              <p className="label-meta text-paper-2/70">Coach scan</p>
              <h1 className="mt-2 text-[34px] font-extrabold leading-[1] tracking-[-0.03em]">
                {name}
              </h1>
              <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.12em] text-paper-2/75">
                {posLabel}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4 lg:grid-cols-2">
            <InfoTile label="Age" value={age || null} />
            <InfoTile label="Height" value={player.height_cm ? `${player.height_cm} cm` : null} />
            <InfoTile label="Level" value={player.experience_level ? EXP_LABELS[player.experience_level] : null} />
            <InfoTile label="Location" value={location || null} />
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-line bg-paper-2 p-6 sm:p-7">
            <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="label-meta text-terra-deep">What a manager sees first</p>
                <h2 className="display-sm mt-3 max-w-[620px]">
                  Fast read. Film first. Fit before small talk.
                </h2>
              </div>
              <div className="shrink-0 rounded-full bg-sage/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-sage-deep">
                Live profile
              </div>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-paper px-5 py-5">
                  <div className="num text-[28px] font-extrabold leading-none tracking-[-0.02em]">
                    {stat.value != null && stat.value !== 0
                      ? `${Number(stat.value).toFixed(stat.suffix ? 0 : 1)}${stat.suffix || ""}`
                      : "--"}
                  </div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-mute">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {videoEmbedUrl && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-ink">
                <div className="relative aspect-video">
                  <iframe
                    src={videoEmbedUrl}
                    title={`${name} highlight film`}
                    allow="accelerometer; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 h-full w-full"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {hasCoachScan && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <ScanBlock label="Film / social">
                  {player.highlights_url ? (
                    <a
                      href={player.highlights_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-ink underline-offset-4 hover:underline"
                    >
                      {stripProtocol(player.highlights_url)}
                    </a>
                  ) : (
                    <span className="text-mute">No film link yet</span>
                  )}
                </ScanBlock>
                <ScanBlock label="Target markets">
                  <ChipList items={preferredCountries} empty="Open to the right fit" />
                </ScanBlock>
                <ScanBlock label="Languages">
                  <ChipList items={languages} empty="Not listed" />
                </ScanBlock>
                <ScanBlock label="Experience">
                  {player.experience_years != null ? `${player.experience_years} years` : "Not listed"}
                </ScanBlock>
              </div>
            )}

            {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
            {publicActions && <div className="mt-7 flex flex-wrap gap-3">{publicActions}</div>}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <TextPanel label="About the player" text={player.looking_for} fallback="No player description added yet." />
            <TextPanel label="Previous teams" text={player.previous_teams} fallback="Previous teams not listed yet." />
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ children, tone }) {
  const colors = {
    sage: "bg-sage/90 text-white",
    terra: "bg-terra/90 text-white",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] ${colors[tone] || "bg-paper-2/95 text-ink"}`}>
      {children}
    </span>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="bg-paper px-5 py-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-mute">{label}</div>
      <div className="mt-1 text-[14px] font-bold text-ink">{value || "--"}</div>
    </div>
  );
}

function ScanBlock({ label, children }) {
  return (
    <div className="rounded-xl border border-line bg-paper px-4 py-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.13em] text-mute">{label}</div>
      <div className="mt-2 text-[14px] leading-[1.45] text-ink-2">{children}</div>
    </div>
  );
}

function ChipList({ items, empty }) {
  if (!items || items.length === 0) return <span className="text-mute">{empty}</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full border border-line-2 px-2.5 py-1 text-[12px] font-bold text-ink">
          {item}
        </span>
      ))}
    </div>
  );
}

function TextPanel({ label, text, fallback }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-2 p-6">
      <div className="label-meta text-mute">{label}</div>
      <p className="mt-4 whitespace-pre-line text-[14px] leading-[1.65] text-ink-2">
        {text || fallback}
      </p>
    </div>
  );
}

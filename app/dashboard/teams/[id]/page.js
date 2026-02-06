import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import MessageButton from "../../MessageButton";

export const metadata = {
  title: "Team Profile - Joinar",
};

const POSITION_LABELS = {
  point_guard: "Point Guard",
  shooting_guard: "Shooting Guard",
  small_forward: "Small Forward",
  power_forward: "Power Forward",
  center: "Center",
};

const TIER_LABELS = {
  1: "Tier 1",
  2: "Tier 2",
  3: "Tier 3",
  4: "Tier 4",
};

export default async function TeamProfilePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch team profile joined with base profile
  const { data: team, error } = await supabase
    .from("team_profiles")
    .select("*, profile:id(full_name, avatar_url, country, city)")
    .eq("id", id)
    .single();

  if (error || !team) {
    redirect("/dashboard/teams");
  }

  // Fetch open positions
  const { data: positions } = await supabase
    .from("team_positions")
    .select("*")
    .eq("team_id", id)
    .eq("is_open", true)
    .order("created_at", { ascending: false });

  // Check boost status
  const { data: boost } = await supabase
    .from("boosts")
    .select("id")
    .eq("profile_id", id)
    .eq("is_active", true)
    .maybeSingle();

  const isBoosted = !!boost;
  const profile = team.profile;
  const openPositions = positions || [];

  // Compute salary range across all open positions
  const salaryMins = openPositions.map((p) => p.salary_min).filter(Boolean);
  const salaryMaxs = openPositions.map((p) => p.salary_max).filter(Boolean);
  const lowestSalary = salaryMins.length > 0 ? Math.min(...salaryMins) : null;
  const highestSalary = salaryMaxs.length > 0 ? Math.max(...salaryMaxs) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/teams"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Back to teams
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-light text-2xl font-bold text-orange-400">
            {(team.team_name || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                {team.team_name}
              </h1>
              {isBoosted && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Boosted
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium text-text-secondary">
              {team.league || "League TBD"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              {profile?.country && (
                <span>
                  {profile.country}
                  {profile?.city && `, ${profile.city}`}
                </span>
              )}
              {team.league_tier && (
                <>
                  <span>&middot;</span>
                  <span>{TIER_LABELS[team.league_tier]}</span>
                </>
              )}
              {team.founded_year && (
                <>
                  <span>&middot;</span>
                  <span>Est. {team.founded_year}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Open positions */}
      {openPositions.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Open Positions ({openPositions.length})
          </h2>
          <div className="mt-4 space-y-3">
            {openPositions.map((pos) => (
              <div
                key={pos.id}
                className="rounded-xl border border-border bg-surface-light p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-400">
                      {POSITION_LABELS[pos.position] || pos.position}
                    </span>
                    {pos.title && (
                      <p className="mt-2 text-sm font-medium text-text-primary">
                        {pos.title}
                      </p>
                    )}
                    {pos.description && (
                      <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                        {pos.description}
                      </p>
                    )}
                  </div>
                  {pos.salary_min && pos.salary_max && (
                    <p className="shrink-0 text-sm font-medium text-text-secondary">
                      {pos.currency || "EUR"}{" "}
                      {pos.salary_min.toLocaleString()}&ndash;{pos.salary_max.toLocaleString()}/mo
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {lowestSalary && highestSalary && (
            <p className="mt-4 text-xs text-text-muted">
              Salary range:{" "}
              <span className="font-medium text-text-secondary">
                {openPositions[0]?.currency || "EUR"}{" "}
                {lowestSalary.toLocaleString()}&ndash;{highestSalary.toLocaleString()}/mo
              </span>
            </p>
          )}
        </div>
      )}

      {/* Details */}
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Details
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <DetailItem label="League" value={team.league} />
          <DetailItem
            label="Tier"
            value={team.league_tier ? TIER_LABELS[team.league_tier] : null}
          />
          <DetailItem
            label="Founded"
            value={team.founded_year ? String(team.founded_year) : null}
          />
          <DetailItem
            label="Open Roles"
            value={openPositions.length > 0 ? String(openPositions.length) : "0"}
          />
        </div>
      </div>

      {/* Description */}
      {team.description && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            About
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
            {team.description}
          </p>
        </div>
      )}

      {/* Website */}
      {team.website && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            Website
          </h2>
          <a
            href={team.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
              <path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
            </svg>
            {team.website}
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <MessageButton
          profileId={team.id}
          className="flex-1 rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <Link
          href="/dashboard/teams"
          className="flex-1 rounded-xl border border-border bg-surface py-3 text-center text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400"
        >
          Back to Browse
        </Link>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">
        {value || "--"}
      </p>
    </div>
  );
}

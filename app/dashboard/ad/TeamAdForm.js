"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeamAd, toggleAdActive } from "../actions";
import {
  BASKETBALL_POSITIONS,
  normalizePositions,
} from "@/lib/basketball/positions.mjs";

const POSITIONS = BASKETBALL_POSITIONS;

const LEAGUE_TIERS = [
  { value: "", label: "Select tier" },
  { value: "1", label: "Tier 1" },
  { value: "2", label: "Tier 2" },
  { value: "3", label: "Tier 3" },
  { value: "4", label: "Tier 4" },
];

const inputClass =
  "w-full rounded-xl border border-line-2 bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-mute outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/10";

export default function TeamAdForm({ teamAd, profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState(
    normalizePositions(teamAd?.positions_needed || [])
  );
  const [isActive, setIsActive] = useState(teamAd?.is_active ?? false);
  const [toggling, setToggling] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await updateTeamAd(formData);

    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Ad saved successfully" });
      router.refresh();
    }
  }

  async function handleToggle() {
    setToggling(true);
    const result = await toggleAdActive();
    setToggling(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setIsActive(result.is_active);
      setMessage({
        type: "success",
        text: result.is_active ? "Team ad published" : "Team ad moved to draft",
      });
      router.refresh();
    }
  }

  function togglePosition(pos) {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <PublishReadiness
        ad={teamAd}
        profile={profile}
        isActive={isActive}
        toggling={toggling}
        onToggle={handleToggle}
      />

      {/* Team Info */}
      <Section title="Team Info" description="Basic information about your team">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Team Name" name="team_name" defaultValue={teamAd?.team_name} placeholder="BC Milano" className="sm:col-span-2" />
          <Field label="League" name="league" defaultValue={teamAd?.league} placeholder="Serie A2" />
          <div>
            <label htmlFor="team-league-tier" className="mb-1.5 block text-[13px] font-bold text-ink-2">League Tier</label>
            <select
              id="team-league-tier"
              name="league_tier"
              defaultValue={teamAd?.league_tier || ""}
              className={inputClass}
            >
              {LEAGUE_TIERS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <Field label="Division" name="division" defaultValue={teamAd?.division} placeholder="Eastern Conference" />
          <Field label="Founded Year" name="founded_year" type="number" defaultValue={teamAd?.founded_year} placeholder="1995" />
        </div>
      </Section>

      {/* Positions Needed */}
      <Section title="Positions Needed" description="Select positions you're looking to fill">
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => {
            const selected = selectedPositions.includes(pos.value);
            return (
              <button
                key={pos.value}
                type="button"
                onClick={() => togglePosition(pos.value)}
                aria-pressed={selected}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border border-ink bg-ink text-paper-2"
                    : "border border-line-2 bg-paper text-ink hover:border-ink/40"
                }`}
              >
                {pos.abbr}
              </button>
            );
          })}
        </div>
        {selectedPositions.map((pos) => (
          <input key={pos} type="hidden" name="positions_needed" value={pos} />
        ))}
      </Section>

      {/* About */}
      <Section title="About" description="Tell players about your team and what you offer">
        <div className="space-y-4">
          <div>
            <label htmlFor="team-description" className="mb-1.5 block text-[13px] font-bold text-ink-2">Description</label>
            <textarea
              id="team-description"
              name="description"
              maxLength={2000}
              rows={4}
              defaultValue={teamAd?.description}
              placeholder="Tell players about your team's history, playing style, and culture..."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="team-offer" className="mb-1.5 block text-[13px] font-bold text-ink-2">What We Offer</label>
            <textarea
              id="team-offer"
              name="what_we_offer"
              maxLength={2000}
              rows={3}
              defaultValue={teamAd?.what_we_offer}
              placeholder="Salary, housing, coaching staff, facilities, development opportunities..."
              className={inputClass}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website" name="website" type="url" defaultValue={teamAd?.website} placeholder="https://bcmilano.com" />
            <Field label="Season Record" name="season_record" defaultValue={teamAd?.season_record} placeholder="18-6" />
          </div>
        </div>
      </Section>

      {/* Message + Submit */}
      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          className={`rounded-xl border px-4 py-3 text-[14px] ${
            message.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-terra disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saving ? "Saving..." : "Save Ad"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-2 p-6">
      <div className="mb-5">
        <h2 className="text-[18px] font-bold text-ink">{title}</h2>
        <p className="mt-1 text-[13px] text-mute">{description}</p>
      </div>
      {children}
    </div>
  );
}

function PublishReadiness({ ad, profile, isActive, toggling, onToggle }) {
  const items = [
    { label: "Country", done: Boolean(profile?.country) },
    { label: "Team name", done: Boolean(ad?.team_name) },
    { label: "League", done: Boolean(ad?.league) },
    { label: "Positions needed", done: (ad?.positions_needed || []).length > 0 },
    { label: "Team description", done: Boolean(ad?.description) },
    { label: "What you offer", done: Boolean(ad?.what_we_offer) },
  ];
  const completeCount = items.filter((item) => item.done).length;
  const isReady = completeCount === items.length;
  const primaryText = isActive
    ? "Unpublish team ad"
    : isReady
      ? "Publish team ad"
      : "Complete missing details";

  return (
    <section className="rounded-2xl border border-line bg-paper-2 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-[560px]">
          <div className={`label-meta ${isActive ? "text-sage-deep" : "text-terra-deep"}`}>
            {isActive ? "Published" : "Draft"}
          </div>
          <h2 className="mt-3 text-[24px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
            {isActive
              ? "Players can see this team ad."
              : isReady
                ? "Ready to go live."
                : "Finish the essentials before going live."}
          </h2>
          <p className="mt-2 text-[13px] leading-[1.55] text-ink-2">
            {isActive
              ? "You can unpublish anytime if you want to edit privately."
              : "Draft team ads stay hidden from player search until the listing is clear enough to judge fit."}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-full border border-line bg-paper px-4 py-2 text-[12px] font-bold text-ink">
            {completeCount}/{items.length} ready
          </div>
          <button
            type="button"
            onClick={onToggle}
            disabled={toggling || (!isActive && !isReady)}
            className={`btn ${
              isActive || isReady ? "btn-terra" : "btn-ghost"
            } disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0`}
          >
            {toggling ? "Updating..." : primaryText}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-2 border-t border-line pt-5 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper px-3 py-2.5"
          >
            <span className="text-[13px] font-semibold text-ink-2">{item.label}</span>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                item.done
                  ? "bg-sage/15 text-sage-deep"
                  : "bg-terra/10 text-terra-deep"
              }`}
            >
              {item.done ? "Done" : "Missing"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Field({ label, className, ...props }) {
  const id = props.id || props.name;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-bold text-ink-2">{label}</label>
      <input
        id={id}
        {...props}
        className={inputClass}
      />
    </div>
  );
}

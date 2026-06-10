"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePlayerAd, toggleAdActive } from "../actions";

const POSITIONS = [
  { value: "PG", label: "PG" },
  { value: "SG", label: "SG" },
  { value: "SF", label: "SF" },
  { value: "PF", label: "PF" },
  { value: "C", label: "C" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "Select level" },
  { value: "amateur", label: "Amateur" },
  { value: "semi_pro", label: "Semi-Pro" },
  { value: "pro", label: "Pro" },
];

const STAT_TOOLTIPS = {
  PPG: "Points Per Game",
  APG: "Assists Per Game",
  RPG: "Rebounds Per Game",
  SPG: "Steals Per Game",
  BPG: "Blocks Per Game",
  "3PT%": "Three-Point Percentage",
};

const inputClass =
  "w-full rounded-xl border border-line-2 bg-paper px-4 py-3 text-[14px] text-ink placeholder:text-mute outline-none transition-colors focus:border-ink focus:ring-1 focus:ring-ink/10";

export default function PlayerAdForm({ playerAd, profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState(
    playerAd?.positions || []
  );
  const [isActive, setIsActive] = useState(playerAd?.is_active ?? false);
  const [toggling, setToggling] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await updatePlayerAd(formData);

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
        text: result.is_active ? "Profile published" : "Profile moved to draft",
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
        ad={playerAd}
        profile={profile}
        isActive={isActive}
        toggling={toggling}
        onToggle={handleToggle}
      />

      {/* Positions */}
      <Section title="Positions" description="Select all positions you can play">
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => {
            const selected = selectedPositions.includes(pos.value);
            return (
              <button
                key={pos.value}
                type="button"
                onClick={() => togglePosition(pos.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "border border-ink bg-ink text-paper-2"
                    : "border border-line-2 bg-paper text-ink hover:border-ink/40"
                }`}
              >
                {pos.label}
              </button>
            );
          })}
        </div>
        {selectedPositions.map((pos) => (
          <input key={pos} type="hidden" name="positions" value={pos} />
        ))}
      </Section>

      {/* Physical */}
      <Section title="Physical" description="Your physical attributes">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Height (cm)" name="height_cm" type="number" defaultValue={playerAd?.height_cm} placeholder="185" />
          <Field label="Weight (kg)" name="weight_kg" type="number" defaultValue={playerAd?.weight_kg} placeholder="82" />
          <Field label="Date of birth" name="date_of_birth" type="date" defaultValue={playerAd?.date_of_birth} />
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience" description="Your basketball experience">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-ink-2">Experience Level</label>
            <select
              name="experience_level"
              defaultValue={playerAd?.experience_level || ""}
              className={inputClass}
            >
              {EXPERIENCE_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <Field label="Years of experience" name="experience_years" type="number" defaultValue={playerAd?.experience_years} placeholder="5" />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[13px] font-bold text-ink-2">Previous Teams</label>
            <textarea
              name="previous_teams"
              rows={3}
              defaultValue={playerAd?.previous_teams}
              placeholder="List your previous teams, leagues, and seasons..."
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section id="season-stats" title="Season Stats" description="Your average stats per game">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <StatField label="PPG" name="ppg" defaultValue={playerAd?.ppg} />
          <StatField label="APG" name="apg" defaultValue={playerAd?.apg} />
          <StatField label="RPG" name="rpg" defaultValue={playerAd?.rpg} />
          <StatField label="SPG" name="spg" defaultValue={playerAd?.spg} />
          <StatField label="BPG" name="bpg" defaultValue={playerAd?.bpg} />
          <StatField label="3PT%" name="three_pt_pct" defaultValue={playerAd?.three_pt_pct} />
        </div>
      </Section>

      {/* About */}
      <Section title="About" description="Highlights and what you're looking for">
        <div className="space-y-4">
          <Field
            label="Highlights URL"
            name="highlights_url"
            type="url"
            defaultValue={playerAd?.highlights_url}
            placeholder="https://youtube.com/watch?v=..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Preferred countries"
              name="preferred_countries"
              defaultValue={(playerAd?.preferred_countries || []).join(", ")}
              placeholder="Spain, Germany, Iceland"
            />
            <Field
              label="Languages"
              name="languages"
              defaultValue={(playerAd?.languages || []).join(", ")}
              placeholder="English, Serbian, Spanish"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-bold text-ink-2">What are you looking for?</label>
            <textarea
              name="looking_for"
              rows={3}
              defaultValue={playerAd?.looking_for}
              placeholder="Describe the type of team, league level, country, or opportunity you're seeking..."
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {/* Message + Submit */}
      {message && (
        <div
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

function Section({ id, title, description, children }) {
  return (
    <div id={id} className="scroll-mt-28 rounded-2xl border border-line bg-paper-2 p-6">
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
    { label: "Name and country", done: Boolean(profile?.full_name && profile?.country) },
    { label: "Position", done: (ad?.positions || []).length > 0 },
    { label: "Height and date of birth", done: Boolean(ad?.height_cm && ad?.date_of_birth) },
    { label: "Playing level", done: Boolean(ad?.experience_level) },
    { label: "Film or social link", done: Boolean(ad?.highlights_url) },
    { label: "Preferred countries", done: (ad?.preferred_countries || []).length > 0 },
    { label: "Languages", done: (ad?.languages || []).length > 0 },
    { label: "Player description", done: Boolean(ad?.looking_for) },
  ];
  const completeCount = items.filter((item) => item.done).length;
  const isReady = completeCount === items.length;
  const primaryText = isActive
    ? "Unpublish profile"
    : isReady
      ? "Publish profile"
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
              ? "Teams can see this profile."
              : isReady
                ? "Ready to go live."
                : "Finish the essentials before going live."}
          </h2>
          <p className="mt-2 text-[13px] leading-[1.55] text-ink-2">
            {isActive
              ? "You can unpublish anytime if you want to edit privately."
              : "Draft profiles stay hidden from team search until the coach scan has enough signal."}
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
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[13px] font-bold text-ink-2">{label}</label>
      <input
        {...props}
        className={inputClass}
      />
    </div>
  );
}

function StatField({ label, name, defaultValue }) {
  const tooltip = STAT_TOOLTIPS[label];
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-ink-2">
        {label}
        {tooltip && (
          <span title={tooltip} className="inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-paper text-[10px] text-mute">
            ?
          </span>
        )}
      </label>
      <input
        name={name}
        type="number"
        step="0.1"
        defaultValue={defaultValue}
        placeholder="0.0"
        className={inputClass}
      />
    </div>
  );
}

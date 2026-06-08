"use client";

import { useState } from "react";
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

export default function PlayerAdForm({ playerAd }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState(
    playerAd?.positions || []
  );
  const [isActive, setIsActive] = useState(playerAd?.is_active ?? true);
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
    }
  }

  function togglePosition(pos) {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Active/Inactive Toggle */}
      {playerAd && (
        <div className="flex items-center justify-between rounded-2xl border border-line bg-paper-2 p-5">
          <div>
            <h2 className="text-[14px] font-bold text-ink">Ad Status</h2>
            <p className="mt-0.5 text-[12px] text-mute">
              {isActive ? "Your ad is visible to teams" : "Your ad is hidden from search"}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-sage/15 text-sage-deep"
                : "bg-paper text-mute"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-sage-deep" : "bg-mute"}`} />
            {toggling ? "..." : isActive ? "Live" : "Hidden"}
          </button>
        </div>
      )}

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
      <Section title="Season Stats" description="Your average stats per game">
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

"use client";

import { useState } from "react";
import { updatePlayerProfile } from "../actions";

const POSITIONS = [
  { value: "", label: "Select position" },
  { value: "point_guard", label: "Point Guard" },
  { value: "shooting_guard", label: "Shooting Guard" },
  { value: "small_forward", label: "Small Forward" },
  { value: "power_forward", label: "Power Forward" },
  { value: "center", label: "Center" },
];

export default function PlayerProfileForm({ profile, playerProfile }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await updatePlayerProfile(formData);

    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Profile saved successfully" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Info */}
      <Section title="Personal Information" description="Your basic details visible to teams">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" name="full_name" defaultValue={profile.full_name} placeholder="Marco Rossi" />
          <Field label="Country" name="country" defaultValue={profile.country} placeholder="Italy" />
          <Field label="City" name="city" defaultValue={profile.city} placeholder="Milan" className="sm:col-span-2" />
        </div>
      </Section>

      {/* Physical & Position */}
      <Section title="Physical & Position" description="Help teams find the right fit">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Position</label>
            <select
              name="position"
              defaultValue={playerProfile?.position || ""}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            >
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <Field label="Height (cm)" name="height_cm" type="number" defaultValue={playerProfile?.height_cm} placeholder="185" />
          <Field label="Weight (kg)" name="weight_kg" type="number" defaultValue={playerProfile?.weight_kg} placeholder="82" />
          <Field label="Date of birth" name="date_of_birth" type="date" defaultValue={playerProfile?.date_of_birth} />
          <Field label="Years of experience" name="experience_years" type="number" defaultValue={playerProfile?.experience_years} placeholder="5" />
        </div>
      </Section>

      {/* Stats */}
      <Section title="Season Stats" description="Your average stats per game">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Field label="PPG" name="ppg" type="number" step="0.1" defaultValue={playerProfile?.ppg} placeholder="0.0" />
          <Field label="APG" name="apg" type="number" step="0.1" defaultValue={playerProfile?.apg} placeholder="0.0" />
          <Field label="RPG" name="rpg" type="number" step="0.1" defaultValue={playerProfile?.rpg} placeholder="0.0" />
          <Field label="SPG" name="spg" type="number" step="0.1" defaultValue={playerProfile?.spg} placeholder="0.0" />
          <Field label="BPG" name="bpg" type="number" step="0.1" defaultValue={playerProfile?.bpg} placeholder="0.0" />
        </div>
      </Section>

      {/* Bio & Links */}
      <Section title="About You" description="Tell teams about yourself and what you're looking for">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Bio</label>
            <textarea
              name="bio"
              rows={4}
              defaultValue={playerProfile?.bio}
              placeholder="Describe your playing style, strengths, achievements..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
          <Field
            label="Highlights URL"
            name="highlights_url"
            type="url"
            defaultValue={playerProfile?.highlights_url}
            placeholder="https://youtube.com/watch?v=..."
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">What are you looking for?</label>
            <textarea
              name="looking_for"
              rows={3}
              defaultValue={playerProfile?.looking_for}
              placeholder="Describe the type of team, league level, country, or opportunity you're seeking..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
        </div>
      </Section>

      {/* Message + Submit */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, className, ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
      />
    </div>
  );
}

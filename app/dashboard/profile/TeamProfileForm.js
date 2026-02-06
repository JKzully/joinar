"use client";

import { useState } from "react";
import { updateTeamProfile } from "../actions";

export default function TeamProfileForm({ profile, teamProfile }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.target);
    const result = await updateTeamProfile(formData);

    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Team profile saved successfully" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact / Owner Info */}
      <Section title="Contact Information" description="The primary contact for this team account">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact name" name="full_name" defaultValue={profile.full_name} placeholder="John Smith" />
          <div>{/* spacer */}</div>
        </div>
      </Section>

      {/* Team Info */}
      <Section title="Team Information" description="Details about your club or organization">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Team name" name="team_name" defaultValue={teamProfile?.team_name} placeholder="BC Adriatic Split" required />
          <Field label="Country" name="country" defaultValue={profile.country} placeholder="Croatia" />
          <Field label="City" name="city" defaultValue={profile.city} placeholder="Split" />
          <Field label="Founded year" name="founded_year" type="number" defaultValue={teamProfile?.founded_year} placeholder="1995" />
        </div>
      </Section>

      {/* League */}
      <Section title="League" description="Your current league and competition level">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="League name" name="league" defaultValue={teamProfile?.league} placeholder="Croatian A1 Liga" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">League tier</label>
            <select
              name="league_tier"
              defaultValue={teamProfile?.league_tier || ""}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            >
              <option value="">Select tier</option>
              <option value="1">Tier 1 (Top division)</option>
              <option value="2">Tier 2 (Second division)</option>
              <option value="3">Tier 3 (Third division)</option>
              <option value="4">Tier 4 (Regional / lower)</option>
            </select>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About the Team" description="Tell players about your organization">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Description</label>
            <textarea
              name="description"
              rows={5}
              defaultValue={teamProfile?.description}
              placeholder="Describe your team, playing style, facilities, ambitions, and what you offer to players..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
          <Field
            label="Website"
            name="website"
            type="url"
            defaultValue={teamProfile?.website}
            placeholder="https://your-team-website.com"
          />
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
          {saving ? "Saving..." : "Save Team Profile"}
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

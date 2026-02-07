"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTeamAd } from "@/app/dashboard/actions";

const POSITIONS = [
  { value: "PG", label: "PG" },
  { value: "SG", label: "SG" },
  { value: "SF", label: "SF" },
  { value: "PF", label: "PF" },
  { value: "C", label: "C" },
];

const LEAGUE_TIERS = [
  { value: "", label: "Select tier" },
  { value: "1", label: "Tier 1" },
  { value: "2", label: "Tier 2" },
  { value: "3", label: "Tier 3" },
  { value: "4", label: "Tier 4" },
];

export default function OnboardingTeamAdForm({ teamAd }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedPositions, setSelectedPositions] = useState(
    teamAd?.positions_needed || []
  );

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
      router.push("/onboarding/success");
    }
  }

  function togglePosition(pos) {
    setSelectedPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Team Info */}
      <Section title="Team Info" description="Basic information about your team">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Team Name" name="team_name" defaultValue={teamAd?.team_name} placeholder="BC Milano" className="sm:col-span-2" />
          <Field label="League" name="league" defaultValue={teamAd?.league} placeholder="Serie A2" />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">League Tier</label>
            <select
              name="league_tier"
              defaultValue={teamAd?.league_tier || ""}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-orange-500 text-white"
                    : "bg-surface-light text-text-secondary hover:bg-surface-light/80"
                }`}
              >
                {pos.label}
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
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={teamAd?.description}
              placeholder="Tell players about your team's history, playing style, and culture..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">What We Offer</label>
            <textarea
              name="what_we_offer"
              rows={3}
              defaultValue={teamAd?.what_we_offer}
              placeholder="Salary, housing, coaching staff, facilities, development opportunities..."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website" name="website" type="url" defaultValue={teamAd?.website} placeholder="https://bcmilano.com" />
            <Field label="Season Record" name="season_record" defaultValue={teamAd?.season_record} placeholder="18-6" />
          </div>
        </div>
      </Section>

      {/* Message */}
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

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Publishing..." : "Publish Team Ad \u2192"}
      </button>
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

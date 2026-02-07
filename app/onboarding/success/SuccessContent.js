"use client";

import { useState } from "react";
import Link from "next/link";
import { completeOnboarding } from "@/app/dashboard/actions";

export default function SuccessContent({ profile, ad }) {
  const [loading, setLoading] = useState(false);
  const role = profile?.role || "player";

  async function handleGoToDashboard() {
    setLoading(true);
    await completeOnboarding();
  }

  return (
    <div className="text-center">
      {/* Celebration */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10" style={{ animation: "scaleIn 0.5s ease-out" }}>
        <svg className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-text-primary">You&apos;re Live!</h1>
      <p className="mx-auto mt-3 max-w-md text-text-secondary">
        {role === "player"
          ? "Your player ad is now visible. Teams can find you and reach out."
          : "Your team ad is now visible. Players can find you and reach out."}
      </p>

      {/* Preview Card */}
      <div className="mx-auto mt-8 max-w-sm rounded-2xl border border-border bg-surface p-6 text-left">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-500/15 text-lg font-semibold text-orange-400">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              (profile?.full_name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-text-primary">
              {role === "team" ? (ad?.team_name || profile?.full_name || "Your Team") : (profile?.full_name || "Your Name")}
            </h3>
            <p className="text-sm text-text-muted">
              {[profile?.city, profile?.country].filter(Boolean).join(", ") || "Location not set"}
            </p>
          </div>
        </div>

        {role === "player" && ad?.positions?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {ad.positions.map((pos) => (
              <span key={pos} className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-400">
                {pos}
              </span>
            ))}
          </div>
        )}

        {role === "team" && ad?.positions_needed?.length > 0 && (
          <div className="mt-4">
            <p className="mb-1.5 text-xs text-text-muted">Looking for:</p>
            <div className="flex flex-wrap gap-1.5">
              {ad.positions_needed.map((pos) => (
                <span key={pos} className="rounded-full bg-orange-500/15 px-2.5 py-0.5 text-xs font-medium text-orange-400">
                  {pos}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <button
          onClick={handleGoToDashboard}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Go to Dashboard \u2192"}
        </button>

        <div className="mt-2 flex gap-4">
          <Link
            href={role === "player" ? "/dashboard/teams" : "/dashboard/players"}
            className="text-sm text-text-secondary transition-colors hover:text-orange-400"
          >
            Browse {role === "player" ? "Teams" : "Players"}
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-sm text-xs text-text-muted">
        Pro tip: The more complete your profile, the more likely you are to get noticed. You can always update your ad from the dashboard.
      </p>

      <style jsx>{`
        @keyframes scaleIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

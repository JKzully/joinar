"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BASKETBALL_POSITIONS as POSITIONS } from "@/lib/basketball/positions.mjs";

export default function PlayerFilters({ countries }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/dashboard/players?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAll() {
    router.push("/dashboard/players");
  }

  const activePosition = searchParams.get("position") || "";
  const activeCountry = searchParams.get("country") || "";
  const activeExp = searchParams.get("min_exp") || "";
  const activeHeight = searchParams.get("min_height") || "";
  const hasFilters = activePosition || activeCountry || activeExp || activeHeight;

  return (
    <div className="rounded-2xl border border-line bg-paper-2 p-6">
      <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
        <h3 className="text-[14px] font-bold">Filter</h3>
        {hasFilters && (
          <button type="button" onClick={clearAll} className="min-h-11 px-2 text-[11px] font-semibold text-terra hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Position */}
      <fieldset className="mb-5">
        <legend className="label-meta mb-3 text-mute">Position</legend>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => updateFilter("position", "")}
            aria-pressed={!activePosition}
            className={`min-h-11 rounded-full border px-4 py-2.5 text-[11px] font-semibold transition-colors ${
              !activePosition
                ? "border-ink bg-ink text-paper-2"
                : "border-line-2 bg-paper text-ink hover:border-ink/40"
            }`}
          >
            All
          </button>
          {POSITIONS.map((p) => (
            <button
              type="button"
              key={p.value}
              onClick={() => updateFilter("position", activePosition === p.value ? "" : p.value)}
              aria-pressed={activePosition === p.value}
              className={`min-h-11 rounded-full border px-4 py-2.5 text-[11px] font-semibold transition-colors ${
                activePosition === p.value
                  ? "border-ink bg-ink text-paper-2"
                  : "border-line-2 bg-paper text-ink hover:border-ink/40"
              }`}
            >
              {p.abbr}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Country */}
      <div className="mb-5">
        <label htmlFor="player-filter-country" className="label-meta mb-3 block text-mute">Country</label>
        <select
          id="player-filter-country"
          value={activeCountry}
          onChange={(e) => updateFilter("country", e.target.value)}
          className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Min Height + Experience */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="player-filter-height" className="label-meta mb-3 block text-mute">Height</label>
          <select
            id="player-filter-height"
            value={activeHeight}
            onChange={(e) => updateFilter("min_height", e.target.value)}
            className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Any</option>
            <option value="175">175+ cm</option>
            <option value="185">185+ cm</option>
            <option value="195">195+ cm</option>
            <option value="205">205+ cm</option>
          </select>
        </div>
        <div>
          <label htmlFor="player-filter-experience" className="label-meta mb-3 block text-mute">Experience</label>
          <select
            id="player-filter-experience"
            value={activeExp}
            onChange={(e) => updateFilter("min_exp", e.target.value)}
            className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
          >
            <option value="">Any</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="8">8+ years</option>
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-4">
          {activePosition && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {POSITIONS.find((p) => p.value === activePosition)?.label || activePosition}
              <button type="button" aria-label="Remove position filter" onClick={() => updateFilter("position", "")} className="relative flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30 after:absolute after:-inset-3.5 after:content-['']">×</button>
            </span>
          )}
          {activeCountry && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeCountry}
              <button type="button" aria-label="Remove country filter" onClick={() => updateFilter("country", "")} className="relative flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30 after:absolute after:-inset-3.5 after:content-['']">×</button>
            </span>
          )}
          {activeHeight && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeHeight}+ cm
              <button type="button" aria-label="Remove height filter" onClick={() => updateFilter("min_height", "")} className="relative flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30 after:absolute after:-inset-3.5 after:content-['']">×</button>
            </span>
          )}
          {activeExp && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeExp}+ yrs exp
              <button type="button" aria-label="Remove experience filter" onClick={() => updateFilter("min_exp", "")} className="relative flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30 after:absolute after:-inset-3.5 after:content-['']">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

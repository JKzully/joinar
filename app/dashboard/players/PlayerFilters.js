"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const POSITIONS = [
  { value: "point_guard", label: "Point Guard", abbr: "PG" },
  { value: "shooting_guard", label: "Shooting Guard", abbr: "SG" },
  { value: "small_forward", label: "Small Forward", abbr: "SF" },
  { value: "power_forward", label: "Power Forward", abbr: "PF" },
  { value: "center", label: "Center", abbr: "C" },
];

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
          <button onClick={clearAll} className="text-[11px] font-semibold text-terra hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Position */}
      <div className="mb-5">
        <div className="label-meta mb-3 text-mute">Position</div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => updateFilter("position", "")}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              !activePosition
                ? "border-ink bg-ink text-paper-2"
                : "border-line-2 bg-paper text-ink hover:border-ink/40"
            }`}
          >
            All
          </button>
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              onClick={() => updateFilter("position", activePosition === p.value ? "" : p.value)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                activePosition === p.value
                  ? "border-ink bg-ink text-paper-2"
                  : "border-line-2 bg-paper text-ink hover:border-ink/40"
              }`}
            >
              {p.abbr}
            </button>
          ))}
        </div>
      </div>

      {/* Country */}
      <div className="mb-5">
        <div className="label-meta mb-3 text-mute">Country</div>
        <select
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
          <div className="label-meta mb-3 text-mute">Height</div>
          <select
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
          <div className="label-meta mb-3 text-mute">Experience</div>
          <select
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
              <button onClick={() => updateFilter("position", "")} className="flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30">×</button>
            </span>
          )}
          {activeCountry && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeCountry}
              <button onClick={() => updateFilter("country", "")} className="flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30">×</button>
            </span>
          )}
          {activeHeight && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeHeight}+ cm
              <button onClick={() => updateFilter("min_height", "")} className="flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30">×</button>
            </span>
          )}
          {activeExp && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1 text-[11px] font-semibold text-paper-2">
              {activeExp}+ yrs exp
              <button onClick={() => updateFilter("min_exp", "")} className="flex h-4 w-4 items-center justify-center rounded-full bg-sand/15 text-[10px] hover:bg-sand/30">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

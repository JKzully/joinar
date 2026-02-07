"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const POSITIONS = [
  { value: "", label: "All Positions" },
  { value: "PG", label: "Point Guard" },
  { value: "SG", label: "Shooting Guard" },
  { value: "SF", label: "Small Forward" },
  { value: "PF", label: "Power Forward" },
  { value: "C", label: "Center" },
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

  const hasFilters =
    searchParams.get("position") ||
    searchParams.get("country") ||
    searchParams.get("min_exp") ||
    searchParams.get("min_height");

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
        {/* Position */}
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-text-muted">Position</label>
          <select
            value={searchParams.get("position") || ""}
            onChange={(e) => updateFilter("position", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50"
          >
            {POSITIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-text-muted">Country</label>
          <select
            value={searchParams.get("country") || ""}
            onChange={(e) => updateFilter("country", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50"
          >
            <option value="">All Countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Min Experience */}
        <div className="w-[130px]">
          <label className="mb-1 block text-xs font-medium text-text-muted">Min Experience</label>
          <select
            value={searchParams.get("min_exp") || ""}
            onChange={(e) => updateFilter("min_exp", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50"
          >
            <option value="">Any</option>
            <option value="1">1+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
            <option value="8">8+ years</option>
          </select>
        </div>

        {/* Min Height */}
        <div className="w-[130px]">
          <label className="mb-1 block text-xs font-medium text-text-muted">Min Height</label>
          <select
            value={searchParams.get("min_height") || ""}
            onChange={(e) => updateFilter("min_height", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50"
          >
            <option value="">Any</option>
            <option value="175">175+ cm</option>
            <option value="185">185+ cm</option>
            <option value="195">195+ cm</option>
            <option value="205">205+ cm</option>
          </select>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearAll}
            className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-light hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

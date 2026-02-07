"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const POSITIONS = [
  { value: "", label: "Any Position" },
  { value: "PG", label: "Point Guard" },
  { value: "SG", label: "Shooting Guard" },
  { value: "SF", label: "Small Forward" },
  { value: "PF", label: "Power Forward" },
  { value: "C", label: "Center" },
];

export default function TeamFilters({ countries }) {
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
      router.push(`/dashboard/teams?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAll() {
    router.push("/dashboard/teams");
  }

  const hasFilters =
    searchParams.get("country") ||
    searchParams.get("tier") ||
    searchParams.get("position");

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-end gap-3">
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

        {/* League tier */}
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-text-muted">League Tier</label>
          <select
            value={searchParams.get("tier") || ""}
            onChange={(e) => updateFilter("tier", e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50"
          >
            <option value="">Any Tier</option>
            <option value="1">Tier 1 (Top division)</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
            <option value="4">Tier 4 (Regional)</option>
          </select>
        </div>

        {/* Position needed */}
        <div className="min-w-[160px] flex-1">
          <label className="mb-1 block text-xs font-medium text-text-muted">Hiring For</label>
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

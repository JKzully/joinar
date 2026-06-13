"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { BASKETBALL_POSITIONS } from "@/lib/basketball/positions.mjs";

const POSITIONS = [
  { value: "", label: "Any Position" },
  ...BASKETBALL_POSITIONS,
];

export default function TeamFilters({ countries }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`/dashboard/teams?${params.toString()}`);
    },
    [router, searchParams]
  );

  function clearAll() {
    router.push("/dashboard/teams");
  }

  const hasFilters = searchParams.get("country") || searchParams.get("tier") || searchParams.get("position");

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-paper-2 p-5">
      <div className="min-w-[160px] flex-1">
        <label htmlFor="team-filter-country" className="label-meta mb-2 block text-mute">Country</label>
        <select
          id="team-filter-country"
          value={searchParams.get("country") || ""}
          onChange={(e) => updateFilter("country", e.target.value)}
          className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="min-w-[160px] flex-1">
        <label htmlFor="team-filter-tier" className="label-meta mb-2 block text-mute">Tier</label>
        <select
          id="team-filter-tier"
          value={searchParams.get("tier") || ""}
          onChange={(e) => updateFilter("tier", e.target.value)}
          className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
        >
          <option value="">Any Tier</option>
          <option value="1">Top Division</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
          <option value="4">Regional</option>
        </select>
      </div>
      <div className="min-w-[160px] flex-1">
        <label htmlFor="team-filter-position" className="label-meta mb-2 block text-mute">Hiring for</label>
        <select
          id="team-filter-position"
          value={searchParams.get("position") || ""}
          onChange={(e) => updateFilter("position", e.target.value)}
          className="w-full rounded-xl border border-line-2 bg-paper px-3.5 py-2.5 text-[13px] text-ink focus:border-ink focus:outline-none"
        >
          {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {hasFilters && (
        <button onClick={clearAll} className="btn btn-ghost" style={{ padding: "10px 16px", fontSize: 12 }}>
          Clear all
        </button>
      )}
    </div>
  );
}

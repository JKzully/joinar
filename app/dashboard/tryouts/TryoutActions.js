"use client";

import { useState } from "react";
import { respondToTryoutInvitation } from "../actions";

export default function TryoutActions({ invitationId }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleRespond(status) {
    setLoading(true);
    const res = await respondToTryoutInvitation(invitationId, status);
    if (res.error) {
      setResult({ error: res.error });
      setLoading(false);
    } else {
      setResult({ status });
    }
  }

  if (result?.status) {
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          result.status === "accepted"
            ? "bg-sage/15 text-sage-deep"
            : "bg-red-500/15 text-red-400"
        }`}
      >
        {result.status === "accepted" ? "Accepted" : "Declined"}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {result?.error && (
        <p className="text-xs text-red-400">{result.error}</p>
      )}
      <button
        onClick={() => handleRespond("accepted")}
        disabled={loading}
        className="rounded-xl bg-sage-deep px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-sage disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "..." : "Accept"}
      </button>
      <button
        onClick={() => handleRespond("declined")}
        disabled={loading}
        className="rounded-xl border border-line-2 bg-paper px-4 py-2 text-[12px] font-bold text-ink transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "..." : "Decline"}
      </button>
    </div>
  );
}

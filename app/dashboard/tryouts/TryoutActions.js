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
            ? "bg-green-500/15 text-green-400"
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
        className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Accept"}
      </button>
      <button
        onClick={() => handleRespond("declined")}
        disabled={loading}
        className="rounded-lg bg-surface-light px-4 py-2 text-xs font-semibold text-text-primary transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "..." : "Decline"}
      </button>
    </div>
  );
}

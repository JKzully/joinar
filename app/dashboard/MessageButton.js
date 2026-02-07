"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startConversation } from "./actions";

export default function MessageButton({ profileId, className, label, isSeed }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (isSeed) {
      setShowSeedModal(true);
      return;
    }

    setLoading(true);

    const result = await startConversation(profileId);

    if (result.conversationId) {
      router.push(`/dashboard/messages/${result.conversationId}`);
    } else {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={
          className ||
          "w-full rounded-lg border border-border bg-surface-light py-2 text-center text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {loading ? "Opening..." : label || "Message"}
      </button>

      {showSeedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSeedModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-text-muted/15 text-text-muted">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              Sample Profile
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              This is a sample profile to show you what Picked looks like in action. Real players and teams are joining every day — browse real profiles or create your own!
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                href="/dashboard/players"
                className="flex-1 rounded-lg bg-orange-500 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                Browse Real Profiles
              </Link>
              <button
                onClick={() => setShowSeedModal(false)}
                className="flex-1 rounded-lg border border-border bg-surface-light py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

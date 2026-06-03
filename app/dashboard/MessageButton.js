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
          "w-full rounded-xl border border-line-2 bg-paper py-2.5 text-center text-[13px] font-semibold text-ink transition-colors hover:border-ink hover:bg-paper-2 disabled:opacity-50 disabled:cursor-not-allowed"
        }
      >
        {loading ? "Opening…" : label || "Message"}
      </button>

      {showSeedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60"
          onClick={() => setShowSeedModal(false)}
        >
          <div
            className="mx-4 w-full max-w-sm rounded-2xl border border-line bg-paper-2 p-7 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ink/[0.06] text-mute">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-bold text-ink">Sample Profile</h3>
            <p className="mt-2 text-[14px] leading-[1.55] text-ink-2">
              This is a sample profile to show what Picked looks like. Real players and teams are joining every day.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/dashboard/players"
                className="btn btn-terra flex-1 justify-center"
              >
                Browse real profiles
              </Link>
              <button
                onClick={() => setShowSeedModal(false)}
                className="btn btn-ghost flex-1 justify-center"
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

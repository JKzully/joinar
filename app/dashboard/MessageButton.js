"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startConversation } from "./actions";

export default function MessageButton({ profileId, className, label }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    const result = await startConversation(profileId);

    if (result.conversationId) {
      router.push(`/dashboard/messages/${result.conversationId}`);
    } else {
      setLoading(false);
    }
  }

  return (
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
  );
}

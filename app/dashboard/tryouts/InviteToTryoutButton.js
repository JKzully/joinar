"use client";

import { useState } from "react";
import { createTryoutInvitation } from "../actions";

export default function InviteToTryoutButton({ playerId }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const formData = new FormData(e.target);
    formData.set("player_id", playerId);

    const res = await createTryoutInvitation(formData);

    if (res.error) {
      setFeedback({ type: "error", text: res.error });
      setLoading(false);
    } else {
      setFeedback({ type: "success", text: "Tryout invitation sent! They'll receive an email notification. Fingers crossed — you might have just found your next key player." });
      setLoading(false);
      setTimeout(() => setOpen(false), 1500);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          setFeedback(null);
        }}
        className="flex-1 rounded-xl border border-border bg-surface py-3 text-center text-sm font-semibold text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400"
      >
        Invite to Tryout
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold text-text-primary">
              Invite to Tryout
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              This is it — you&apos;re giving someone a real shot. Fill in the details and let them know you&apos;re serious.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tryout Date
                </label>
                <input
                  type="date"
                  name="tryout_date"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Main Arena, City"
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Personal Message
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Why you'd like this player to try out..."
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-orange-500 focus:outline-none"
                />
              </div>

              {feedback && (
                <p
                  className={`text-sm font-medium ${
                    feedback.type === "error"
                      ? "text-red-400"
                      : "text-green-400"
                  }`}
                >
                  {feedback.text}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-border bg-surface-light py-2.5 text-sm font-medium text-text-primary transition-colors hover:text-text-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

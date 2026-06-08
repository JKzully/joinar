"use client";

import { useState } from "react";
import { createTryoutInvitation } from "../actions";

const inputClass =
  "mt-1 w-full rounded-xl border border-line-2 bg-paper px-3 py-2 text-[14px] text-ink placeholder:text-mute focus:border-ink focus:outline-none";

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
        className="flex-1 rounded-xl border border-line-2 bg-paper py-3 text-center text-[13px] font-bold text-ink transition-colors hover:border-ink/40"
      >
        Invite to Tryout
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-paper-2 p-6 shadow-xl">
            <h2 className="text-[20px] font-bold text-ink">
              Invite to Tryout
            </h2>
            <p className="mt-1 text-[14px] leading-[1.55] text-ink-2">
              This is it — you&apos;re giving someone a real shot. Fill in the details and let them know you&apos;re serious.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-ink-2">
                  Tryout Date
                </label>
                <input
                  type="date"
                  name="tryout_date"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-ink-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Main Arena, City"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-ink-2">
                  Personal Message
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Why you'd like this player to try out..."
                  className={`${inputClass} resize-none`}
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
                  className="btn btn-terra flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-line-2 bg-paper py-2.5 text-[13px] font-bold text-ink transition-colors hover:border-ink/30"
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

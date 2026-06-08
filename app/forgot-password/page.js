"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStatus("If an account exists for that email, a reset link is on its way.");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink px-14 py-14 text-sand lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute left-[30%] -top-[100px] h-[780px] w-[780px] rounded-full border border-sand/[0.05]" />
        <div className="relative z-10">
          <Link href="/" className="mb-16 flex items-baseline gap-2 text-[22px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>
          <h1 className="display-lg" style={{ color: "var(--color-sand)" }}>
            Reset your <span className="serif" style={{ color: "#B5C9A6" }}>password.</span>
          </h1>
          <p className="mt-8 max-w-[420px] text-[16px] leading-[1.55] text-sand/65">
            Get a secure link, choose a new password, and get back to your roster work.
          </p>
        </div>
      </div>

      <div className="flex flex-col bg-sand px-6 py-8 sm:px-14 sm:py-12 lg:py-14">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 text-[18px] font-extrabold lg:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>
          <span className="ml-auto text-[13px] text-mute">
            Remembered it?{" "}
            <Link href="/login" className="font-bold text-ink underline-offset-4 hover:underline">
              Log in
            </Link>
          </span>
        </div>

        <div className="mx-auto my-auto w-full max-w-[440px] py-10">
          <h2 className="display-md">
            Need a <span className="serif text-terra">new key?</span>
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
            Enter your account email and we will send a reset link.
          </p>

          <form onSubmit={handleReset} className="mt-10 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
                Email
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="block w-full rounded-xl border border-line-2 bg-paper-2 px-4 py-3.5 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
                {error}
              </div>
            )}
            {status && (
              <div className="rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-[13px] text-sage-deep">
                {status}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-terra mt-2 w-full justify-center disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ padding: "16px 22px", fontSize: 15 }}
            >
              {loading ? "Sending..." : (<>Send reset link <Arrow /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

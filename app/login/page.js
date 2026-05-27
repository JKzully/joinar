"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ─── Left: brand pane ─────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-ink px-14 py-14 text-sand lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute left-[30%] -top-[100px] h-[780px] w-[780px] rounded-full border border-sand/[0.05]" />
        <div aria-hidden className="pointer-events-none absolute left-[50%] top-[120px] h-[480px] w-[480px] rounded-full border border-sand/[0.04]" />

        <div className="relative z-10">
          <Link href="/" className="mb-16 flex items-baseline gap-2 text-[22px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>

          <h1 className="display-lg" style={{ color: "var(--color-sand)" }}>
            Welcome <span className="serif" style={{ color: "#B5C9A6" }}>back.</span>
          </h1>

          <p className="mt-8 max-w-[420px] text-[16px] leading-[1.55] text-sand/65">
            Sign in to see who&apos;s viewed your profile, respond to coaches, and keep your roster spot.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-9 border-t border-sand/10 pt-8">
          <div>
            <div className="num text-[24px] font-semibold tracking-[-0.02em]">312</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sand/50">Active profiles</div>
          </div>
          <div>
            <div className="num text-[24px] font-semibold tracking-[-0.02em]">47</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sand/50">Open spots · now</div>
          </div>
        </div>
      </div>

      {/* ─── Right: form pane ─────────────────────────────── */}
      <div className="flex flex-col bg-sand px-6 py-8 sm:px-14 sm:py-12 lg:py-14">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2 text-[18px] font-extrabold lg:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>
          <span className="ml-auto text-[13px] text-mute">
            New here?{" "}
            <Link href="/signup" className="font-bold text-ink underline-offset-4 hover:underline">
              Create a profile →
            </Link>
          </span>
        </div>

        <div className="mx-auto my-auto w-full max-w-[440px] py-10">
          <h2 className="display-md">
            Log <span className="serif text-terra">in.</span>
          </h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
            Resume where you left off.
          </p>

          <form onSubmit={handleLogin} className="mt-10 space-y-4">
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

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
                  Password
                </span>
                <Link href="/forgot-password" className="text-[11px] font-bold text-ink underline-offset-4 hover:underline">
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="block w-full rounded-xl border border-line-2 bg-paper-2 px-4 py-3.5 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-terra mt-2 w-full justify-center disabled:opacity-50 disabled:hover:translate-y-0"
              style={{ padding: "16px 22px", fontSize: 15 }}
            >
              {loading ? "Signing in…" : (<>Log in <Arrow /></>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

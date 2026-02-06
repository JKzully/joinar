"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function SignUpForm() {
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role");

  const [step, setStep] = useState(preselectedRole ? 2 : 1);
  const [role, setRole] = useState(preselectedRole || "");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function selectRole(selectedRole) {
    setRole(selectedRole);
    setStep(2);
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setConfirmationSent(true);
  }

  // Confirmation sent screen
  if (confirmationSent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
          <svg className="h-8 w-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Check your email</h1>
        <p className="mt-3 text-text-secondary">
          We sent a confirmation link to{" "}
          <span className="font-medium text-text-primary">{email}</span>.
          Click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-sm font-medium text-orange-400 transition-colors hover:text-orange-500"
        >
          Go to login &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center justify-center gap-2">
        <span className="text-2xl" aria-hidden="true">🏀</span>
        <span className="text-lg font-bold tracking-tight text-text-primary">
          JOINAR
        </span>
      </Link>

      {/* Step 1: Role selection */}
      {step === 1 && (
        <div>
          <h1 className="text-center text-2xl font-bold text-text-primary">
            Let&apos;s Get You Seen
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Choose how you want to use the platform
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => selectRole("player")}
              className="group rounded-2xl border border-border bg-surface p-6 text-center transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-primary">Player</h3>
              <p className="mt-1 text-xs text-text-muted">
                Get your talent in front of teams that need you
              </p>
            </button>

            <button
              onClick={() => selectRole("team")}
              className="group rounded-2xl border border-border bg-surface p-6 text-center transition-all hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 transition-colors group-hover:bg-orange-500/20">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-text-primary">Team</h3>
              <p className="mt-1 text-xs text-text-muted">
                Tell us what you need and find the right player
              </p>
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-orange-400 hover:text-orange-500">
              Log in
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Registration form */}
      {step === 2 && (
        <div>
          <h1 className="text-center text-2xl font-bold text-text-primary">
            Let&apos;s Get You Seen
          </h1>
          <p className="mt-2 text-center text-sm text-text-secondary">
            Signing up as{" "}
            <button
              onClick={() => { setStep(1); setRole(""); }}
              className="font-medium text-orange-400 capitalize hover:text-orange-500"
            >
              {role} &mdash; change
            </button>
          </p>

          <form onSubmit={handleSignUp} className="mt-8 space-y-4">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text-secondary">
                {role === "team" ? "Team name" : "Full name"}
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "team" ? "e.g. BC Adriatic Split" : "e.g. Marco Rossi"}
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-text-secondary hover:text-orange-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-text-secondary hover:text-orange-400">
              Privacy Policy
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-orange-400 hover:text-orange-500">
              Log in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

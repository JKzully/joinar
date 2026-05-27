"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlayer = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconTeam = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="5.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="10.5" cy="6" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 13c0-1.5 1.5-3 3.5-3M14 13c0-1.5-1.5-3-3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function SignUpForm() {
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role");

  const [role, setRole] = useState(preselectedRole === "team" ? "team" : "player");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the terms to continue.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const fullName = `${firstName} ${lastName}`.trim();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
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

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* ─── Left: brand pane (desktop only) ──────────────── */}
      <div className="relative hidden overflow-hidden bg-ink px-14 py-14 text-sand lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="pointer-events-none absolute left-[30%] -top-[100px] h-[780px] w-[780px] rounded-full border border-sand/[0.05]" />
        <div aria-hidden className="pointer-events-none absolute left-[50%] top-[120px] h-[480px] w-[480px] rounded-full border border-sand/[0.04]" />

        <div className="relative z-10">
          <Link href="/" className="mb-16 flex items-baseline gap-2 text-[22px] font-extrabold">
            <span className="h-2 w-2 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>

          <h1 className="display-lg" style={{ color: "var(--color-sand)" }}>
            Twelve minutes.
            <br />
            A coach-ready{" "}
            <span className="serif" style={{ color: "#B5C9A6" }}>profile.</span>
            <br />
            The <span className="serif" style={{ color: "#E0926F" }}>call</span> follows.
          </h1>

          <p className="mt-8 max-w-[420px] text-[16px] leading-[1.55] text-sand/65">
            Every season, 380+ teams across 28 countries post open roster spots on Picked. Your profile is the only thing standing between you and that call.
          </p>

          <div className="mt-12 max-w-[480px] border-l-2 border-terra pl-8">
            <p className="font-light leading-[1.35] tracking-[-0.015em]" style={{ fontSize: 24 }}>
              &ldquo;I uploaded my profile on a Tuesday. By Thursday,{" "}
              <span className="serif" style={{ color: "#B5C9A6" }}>two teams</span> had me in their inbox.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-sand/15" />
              <div>
                <div className="text-[13px] font-bold">Stefan J.</div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-sand/55">
                  Point Guard · Belgrade → Athens
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-9 border-t border-sand/10 pt-8">
          <div>
            <div className="num text-[24px] font-semibold tracking-[-0.02em]">127</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sand/50">Players · this month</div>
          </div>
          <div>
            <div className="num text-[24px] font-semibold tracking-[-0.02em]">23</div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sand/50">Teams · hiring now</div>
          </div>
          <div>
            <div className="text-[24px] font-semibold tracking-[-0.02em]">
              <span className="serif" style={{ color: "#B5C9A6" }}>14h</span>
            </div>
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sand/50">Avg coach reply</div>
          </div>
        </div>
      </div>

      {/* ─── Right: form pane ─────────────────────────────── */}
      <div className="flex flex-col bg-sand px-6 py-8 sm:px-14 sm:py-12 lg:py-14">
        <div className="flex items-center justify-between">
          {/* Mobile brand */}
          <Link href="/" className="flex items-baseline gap-2 text-[18px] font-extrabold lg:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-terra" />
            <span>Picked</span>
          </Link>
          <span className="ml-auto text-[13px] text-mute">
            Already have a profile?{" "}
            <Link href="/login" className="font-bold text-ink underline-offset-4 hover:underline">
              Log in →
            </Link>
          </span>
        </div>

        <div className="mx-auto my-auto w-full max-w-[480px] py-10">
          {confirmationSent ? (
            <ConfirmationView email={email} />
          ) : (
            <>
              <h2 className="display-md">
                Get <span className="serif text-terra">picked.</span>
              </h2>
              <p className="mt-3 text-[15px] leading-[1.55] text-ink-2">
                Create your free profile in twelve minutes. No credit card. No agent. No politics.
              </p>

              {/* Role toggle */}
              <div className="mt-9 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-paper p-1.5">
                <RoleOption
                  active={role === "player"}
                  onClick={() => setRole("player")}
                  icon={<IconPlayer />}
                  title="I'm a player"
                  desc="Build a profile, get found"
                />
                <RoleOption
                  active={role === "team"}
                  onClick={() => setRole("team")}
                  icon={<IconTeam />}
                  title="I'm a team"
                  desc="Find players, post spots"
                />
              </div>

              <form onSubmit={handleSignUp} className="mt-7">
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput
                    label="First name"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="Marko"
                    required
                  />
                  <FieldInput
                    label="Last name"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Kovač"
                    required
                  />
                </div>
                <div className="mt-4">
                  <FieldInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@email.com"
                    required
                  />
                </div>
                <div className="mt-4">
                  <FieldInput
                    label="Password"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="Min 8 characters"
                    minLength={8}
                    required
                  />
                </div>

                {/* Terms */}
                <label className="mt-6 flex cursor-pointer items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    aria-pressed={agreed}
                    className={`relative mt-0.5 h-[18px] w-[18px] flex-none rounded-[5px] border-[1.5px] transition-colors ${
                      agreed ? "border-ink bg-ink" : "border-line-2 bg-paper-2"
                    }`}
                  >
                    {agreed && (
                      <span
                        aria-hidden
                        className="absolute left-[4px] top-[1px] h-[10px] w-[5px] rotate-45 border-b-[2px] border-r-[2px] border-sand"
                      />
                    )}
                  </button>
                  <span className="text-[13px] leading-[1.5] text-ink-2">
                    I agree to Picked&apos;s{" "}
                    <Link href="/terms" className="font-bold text-ink underline">Terms</Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-bold text-ink underline">Privacy Policy</Link>
                    , and to coaches contacting me through my profile.
                  </span>
                </label>

                {error && (
                  <div className="mt-5 rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-terra mt-6 w-full justify-center disabled:opacity-50 disabled:hover:translate-y-0"
                  style={{ padding: "16px 22px", fontSize: 15 }}
                >
                  {loading ? "Creating profile…" : (<>Create my profile <Arrow size={14} /></>)}
                </button>

                <div className="mt-7 border-t border-line pt-5 text-center text-[13px] text-mute">
                  By signing up you join 127 players from 28 countries — free, forever.
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-mute">
                  <span>✓ Free forever</span>
                  <span>✓ No agent</span>
                  <span>✓ Profile in 12 min</span>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RoleOption({ active, onClick, icon, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-4 text-center transition-all ${
        active
          ? "bg-paper-2 shadow-[0_1px_0_rgba(19,17,14,0.05),0_4px_12px_rgba(19,17,14,0.04)]"
          : "bg-transparent hover:bg-paper-2/50"
      }`}
    >
      <div
        className={`mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          active ? "bg-sage text-white" : "bg-[rgba(77,106,72,0.13)] text-sage-deep"
        }`}
      >
        {icon}
      </div>
      <div className="text-[14px] font-bold tracking-[-0.005em]">{title}</div>
      <div className={`mt-1 text-[12px] ${active ? "text-ink-2" : "text-mute"}`}>{desc}</div>
    </button>
  );
}

function FieldInput({ label, type = "text", value, onChange, placeholder, required, minLength }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="block w-full rounded-xl border border-line-2 bg-paper-2 px-4 py-3.5 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function ConfirmationView({ email }) {
  return (
    <div>
      <div className="mb-7 inline-flex items-center gap-3 text-terra">
        <span className="num label-meta">§ 01</span>
        <span className="h-px w-8 bg-current opacity-40" />
        <span className="label-meta">Inbox check</span>
      </div>
      <h2 className="display-md">
        Check your <span className="serif text-sage-deep">inbox.</span>
      </h2>
      <p className="mt-5 text-[15px] leading-[1.55] text-ink-2">
        We sent a confirmation link to <span className="font-bold text-ink">{email}</span>.
        Click the link to activate your profile and start building.
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-paper-2 p-5">
        <div className="label-meta text-mute">What&apos;s next</div>
        <ol className="mt-3 space-y-2 text-[13px] leading-[1.55] text-ink-2">
          <li>
            <span className="num font-bold text-ink">01.</span> Click the link in your email
          </li>
          <li>
            <span className="num font-bold text-ink">02.</span> Build your profile — measurements, stats, highlights
          </li>
          <li>
            <span className="num font-bold text-ink">03.</span> Get matched to teams hiring this window
          </li>
        </ol>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/login" className="text-[13px] font-bold text-ink underline-offset-4 hover:underline">
          Go to log in →
        </Link>
        <span className="text-[12px] text-mute">Didn&apos;t arrive? Check spam.</span>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

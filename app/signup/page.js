"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const Arrow = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    fill="none"
    className="inline-block align-middle"
  >
    <path
      d="M1 7h12M8 2l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function getSignUpErrorMessage(error) {
  const message = error?.message || String(error || "");

  if (/failed to fetch|fetch failed|network/i.test(message)) {
    return "Signup is temporarily unavailable because Picked is not connected to a live auth project yet.";
  }

  if (/invalid api key|jwt|apikey|api key/i.test(message)) {
    return "Signup is connected to Supabase, but the public auth key does not match this project yet.";
  }

  return message || "We could not create your account. Please try again.";
}

function isEmailRateLimit(error) {
  const message = error?.message || String(error || "");
  return /rate limit|email rate|too many/i.test(message);
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const preselectedRole = searchParams.get("role");

  const [role, setRole] = useState(preselectedRole === "team" ? "team" : "player");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isTeam = role === "team";
  const roleCopy = isTeam
    ? {
        title: "Create your team account.",
        intro: "Open roster search and review available player dossiers.",
        cta: "Open roster search",
        nameLabel: "Your name",
        namePlaceholder: "Sofia Marin",
      }
    : {
        title: "Build your player dossier.",
        intro: "Create the account first. You decide when to declare availability.",
        cta: "Build my dossier",
        nameLabel: "Full name",
        namePlaceholder: "Marko Kovac",
      };

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Agree to the terms to create your account.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        if (isEmailRateLimit(signUpError)) {
          setError(
            "Email delivery is temporarily rate limited. Wait a few minutes, then try again."
          );
          return;
        }

        setError(getSignUpErrorMessage(signUpError));
        return;
      }

      setConfirmationSent(true);
    } catch (signUpError) {
      setError(getSignUpErrorMessage(signUpError));
    } finally {
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return <ConfirmationView email={email} />;
  }

  return (
    <form onSubmit={handleSignUp} className="rounded-2xl border border-line bg-paper-2 p-6 shadow-[0_12px_40px_rgba(19,17,14,0.06)] sm:p-8">
      <div>
        <p className="label-meta text-terra-deep">
          {isTeam ? "Team signup" : "Player signup"}
        </p>
        <h1 className="display-sm mt-3">{roleCopy.title}</h1>
        <p className="mt-4 text-[15px] leading-[1.55] text-ink-2">
          {roleCopy.intro}
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-paper p-1.5">
        <RoleOption
          active={role === "player"}
          onClick={() => setRole("player")}
          title="Player"
          desc="Build dossier"
        />
        <RoleOption
          active={role === "team"}
          onClick={() => setRole("team")}
          title="Team"
          desc="Roster search"
        />
      </div>

      <div className="mt-6 space-y-4">
        <FieldInput
          label={roleCopy.nameLabel}
          value={fullName}
          onChange={setFullName}
          placeholder={roleCopy.namePlaceholder}
          autoComplete="name"
          required
        />
        <FieldInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@email.com"
          autoComplete="email"
          required
        />
        <FieldInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 rounded border-line-2 accent-ink"
        />
        <span className="text-[13px] leading-[1.5] text-ink-2">
          I agree to Picked&apos;s{" "}
          <Link href="/terms" className="font-bold text-ink underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-bold text-ink underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-terra mt-6 w-full justify-center disabled:opacity-50 disabled:hover:translate-y-0"
        style={{ padding: "16px 22px", fontSize: 15 }}
      >
        {loading ? "Creating account..." : (
          <>
            {roleCopy.cta} <Arrow />
          </>
        )}
      </button>

      <p className="mt-5 text-center text-[13px] text-mute">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-ink underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}

function RoleOption({ active, onClick, title, desc }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl px-4 py-3.5 text-left transition-all ${
        active
          ? "bg-paper-2 shadow-[0_1px_0_rgba(19,17,14,0.05),0_4px_12px_rgba(19,17,14,0.04)]"
          : "hover:bg-paper-2/50"
      }`}
    >
      <div className="text-[14px] font-bold text-ink">{title}</div>
      <div className="mt-1 text-[12px] text-mute">{desc}</div>
    </button>
  );
}

function FieldInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
}) {
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
        autoComplete={autoComplete}
        className="block w-full rounded-xl border border-line-2 bg-paper px-4 py-3.5 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
      />
    </label>
  );
}

function ConfirmationView({ email }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-2 p-6 shadow-[0_12px_40px_rgba(19,17,14,0.06)] sm:p-8">
      <p className="label-meta text-sage-deep">Check your email</p>
      <h1 className="display-sm mt-3">Confirm your account.</h1>
      <p className="mt-4 text-[15px] leading-[1.55] text-ink-2">
        We sent a confirmation link to{" "}
        <span className="font-bold text-ink">{email}</span>. Click it to open
        Picked and finish your profile.
      </p>
      <div className="mt-7 rounded-2xl border border-line bg-paper p-5">
        <div className="label-meta text-mute">Next</div>
        <ol className="mt-3 space-y-2 text-[13px] leading-[1.55] text-ink-2">
          <li><span className="num font-bold text-ink">01.</span> Confirm your email</li>
          <li><span className="num font-bold text-ink">02.</span> Build your player dossier</li>
          <li><span className="num font-bold text-ink">03.</span> Declare availability when ready</li>
        </ol>
      </div>
      <Link href="/login" className="btn btn-ink mt-7 w-full justify-center">
        Go to log in <Arrow />
      </Link>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-sand px-6 py-7 text-ink sm:px-10">
      <div className="mx-auto flex max-w-[1040px] items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 text-[18px] font-extrabold">
          <span className="h-1.5 w-1.5 rounded-full bg-terra" />
          <span>Picked</span>
        </Link>
        <Link href="/login" className="text-[13px] font-bold text-ink underline-offset-4 hover:underline">
          Log in
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1040px] gap-8 py-10 lg:grid-cols-[0.85fr_1fr] lg:items-center lg:py-16">
        <section className="hidden lg:block">
          <p className="label-meta text-terra-deep">Market entry</p>
          <h2 className="display-lg mt-5 max-w-[520px]">
            Build first. Enter when ready.
          </h2>
          <p className="mt-6 max-w-[420px] text-[16px] leading-[1.6] text-ink-2">
            Add the dossier details clubs review first: role, size, film,
            stats, market fit and availability.
          </p>
          <div className="mt-8 grid max-w-[420px] gap-3 text-[14px] text-ink-2">
            <ProofItem text="Draft private until you publish" />
            <ProofItem text="Direct club and player interest" />
            <ProofItem text="Built for European roster windows" />
          </div>
        </section>

        <Suspense>
          <SignUpForm />
        </Suspense>
      </div>
    </main>
  );
}

function ProofItem({ text }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-2 w-2 rounded-full bg-sage" />
      {text}
    </div>
  );
}

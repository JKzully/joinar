"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { savePlayerStep, saveTeamStep, completeOnboarding } from "./actions";

const Arrow = ({ size = 14, dir = "right" }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    {dir === "right" ? (
      <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M13 7H1M6 2L1 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

// ─── Position options (player_position enum) ─────────────────
const POSITIONS = [
  { v: "point_guard",     abbr: "PG", n: "Point Guard" },
  { v: "shooting_guard",  abbr: "SG", n: "Shooting Guard" },
  { v: "small_forward",   abbr: "SF", n: "Small Forward" },
  { v: "power_forward",   abbr: "PF", n: "Power Forward" },
  { v: "center",          abbr: "C",  n: "Center" },
];

const EXP_LEVELS = [
  { v: "amateur", n: "Amateur", d: "Club, school, or recreational" },
  { v: "semi_pro", n: "Semi-pro", d: "Paid contract, lower divisions" },
  { v: "pro", n: "Pro", d: "Top tier or international" },
];

// ─── Player steps definition ─────────────────────────────────
const PLAYER_STEPS = [
  { n: "01", t: "Basics",        d: "Name, country, contact" },
  { n: "02", t: "Position",      d: "How you play" },
  { n: "03", t: "Measurements",  d: "Height, weight, experience" },
  { n: "04", t: "Season stats",  d: "PPG, FG%, APG, more" },
  { n: "05", t: "Availability",  d: "Looking for, last team" },
  { n: "06", t: "Film & highlights", d: "Coming soon", locked: true },
  { n: "07", t: "References",    d: "Coming soon", locked: true },
  { n: "08", t: "Combine verify", d: "Coming soon", locked: true },
];

const TEAM_STEPS = [
  { n: "01", t: "Basics",        d: "Contact, country, city" },
  { n: "02", t: "Team identity", d: "Name, league, division" },
  { n: "03", t: "Positions",     d: "What you're hiring for" },
  { n: "04", t: "Pitch",         d: "About the program" },
  { n: "05", t: "Details",       d: "Website, founded, record" },
  { n: "06", t: "Open positions", d: "Coming soon", locked: true },
  { n: "07", t: "Tryout calendar", d: "Coming soon", locked: true },
  { n: "08", t: "Verification",  d: "Coming soon", locked: true },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function OnboardingWizard({ profile, ad }) {
  const isPlayer = profile.role !== "team";
  const STEPS = isPlayer ? PLAYER_STEPS : TEAM_STEPS;
  const ACTIVE_STEPS = 5; // Steps 06-08 locked

  // Resume from furthest filled step
  const initialStep = computeInitialStep(profile, ad, isPlayer);
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useTransition();
  const [error, setError] = useState("");

  // Form data state — initialized from existing values
  const [form, setForm] = useState({
    // Profile
    full_name: profile.full_name || "",
    country: profile.country || "",
    city: profile.city || "",
    // Player ad
    positions: ad.positions || [],
    experience_level: ad.experience_level || "",
    experience_years: ad.experience_years ?? "",
    height_cm: ad.height_cm ?? "",
    weight_kg: ad.weight_kg ?? "",
    date_of_birth: ad.date_of_birth || "",
    previous_teams: ad.previous_teams || "",
    ppg: ad.ppg ?? "",
    apg: ad.apg ?? "",
    rpg: ad.rpg ?? "",
    three_pt_pct: ad.three_pt_pct ?? "",
    looking_for: ad.looking_for || "",
    // Team ad
    team_name: ad.team_name || "",
    league: ad.league || "",
    league_tier: ad.league_tier ?? "",
    division: ad.division || "",
    founded_year: ad.founded_year ?? "",
    positions_needed: ad.positions_needed || [],
    description: ad.description || "",
    what_we_offer: ad.what_we_offer || "",
    website: ad.website || "",
    season_record: ad.season_record || "",
  });

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function togglePosition(positionValue, key = "positions") {
    setForm((prev) => {
      const current = prev[key] || [];
      const next = current.includes(positionValue)
        ? current.filter((p) => p !== positionValue)
        : [...current, positionValue];
      return { ...prev, [key]: next };
    });
  }

  function getStepPayload(currentStep) {
    // Return fields to save for the current step
    if (isPlayer) {
      switch (currentStep) {
        case 1: return pick(form, ["full_name", "country", "city"]);
        case 2: return { positions: form.positions, experience_level: form.experience_level || null };
        case 3: return {
          height_cm: numOrNull(form.height_cm),
          weight_kg: numOrNull(form.weight_kg),
          date_of_birth: form.date_of_birth || null,
          experience_years: numOrNull(form.experience_years) ?? 0,
        };
        case 4: return {
          ppg: numOrNull(form.ppg) ?? 0,
          apg: numOrNull(form.apg) ?? 0,
          rpg: numOrNull(form.rpg) ?? 0,
          three_pt_pct: numOrNull(form.three_pt_pct),
        };
        case 5: return {
          looking_for: form.looking_for || null,
          previous_teams: form.previous_teams || null,
        };
        default: return {};
      }
    } else {
      switch (currentStep) {
        case 1: return pick(form, ["full_name", "country", "city"]);
        case 2: return {
          team_name: form.team_name || null,
          league: form.league || null,
          league_tier: numOrNull(form.league_tier),
          division: form.division || null,
          founded_year: numOrNull(form.founded_year),
        };
        case 3: return { positions_needed: form.positions_needed };
        case 4: return {
          description: form.description || null,
          what_we_offer: form.what_we_offer || null,
        };
        case 5: return {
          website: form.website || null,
          season_record: form.season_record || null,
        };
        default: return {};
      }
    }
  }

  async function handleNext() {
    setError("");
    const payload = getStepPayload(step);
    const saveAction = isPlayer ? savePlayerStep : saveTeamStep;

    setSaving(async () => {
      const result = await saveAction(payload);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (step < ACTIVE_STEPS) {
        setStep(step + 1);
      } else {
        // Last active step — complete onboarding
        const complete = await completeOnboarding();
        if (complete?.error) setError(complete.error);
      }
    });
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function jumpToStep(targetStep) {
    if (targetStep <= ACTIVE_STEPS) setStep(targetStep);
  }

  const progress = (step / ACTIVE_STEPS) * 100;

  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* ─── Top bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-paper-2 px-6 py-4 sm:px-10">
        <Link href="/" className="flex items-baseline gap-2 text-[17px] font-extrabold tracking-wide">
          <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
          <span>Picked</span>
        </Link>

        <div className="hidden items-center gap-3.5 md:flex">
          <div className="relative h-[5px] w-[240px] overflow-hidden rounded-full bg-ink/[0.08]">
            <div
              className="absolute left-0 top-0 h-full bg-sage transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[12px] font-mono tracking-[0.04em] text-mute">
            <b className="font-bold text-ink">STEP {step} / {ACTIVE_STEPS}</b>
            <span className="ml-2">· ~ {Math.max(2, (ACTIVE_STEPS - step) * 2)} min remaining</span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[12px] text-mute">
          <span className="hidden items-center gap-1.5 text-sage-deep font-semibold sm:inline-flex">
            <span className="pulse-dot" /> Saved
          </span>
          <Link href="/dashboard" className="rounded-full border border-line-2 px-3.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-paper">
            Save & exit
          </Link>
        </div>
      </div>

      {/* Mobile progress (between top bar and content) */}
      <div className="border-b border-line bg-paper-2 px-6 py-3 md:hidden">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
          <span>Step {step} / {ACTIVE_STEPS} · {STEPS[step - 1].t}</span>
          <span className="num">{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full bg-ink/[0.08]">
          <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ─── Layout: rail + main ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* Step rail */}
        <aside className="hidden border-r border-line bg-paper-2 px-7 py-10 lg:block">
          <div className="mb-7 border-b border-line pb-6">
            <h2 className="display-sm" style={{ fontSize: 28, lineHeight: 1.05 }}>
              Build your<br /><span className="serif text-sage-deep">profile.</span>
            </h2>
            <div className="mt-2 text-[12px] text-mute">12 minutes, once. Free forever.</div>
          </div>

          <div className="flex flex-col gap-1">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isDone = stepNum < step && !s.locked;
              const isActive = stepNum === step;
              const isLocked = !!s.locked;
              return (
                <button
                  key={s.n}
                  type="button"
                  onClick={() => !isLocked && jumpToStep(stepNum)}
                  disabled={isLocked}
                  className={`flex items-center gap-3.5 rounded-[10px] px-3.5 py-3 text-left transition-colors ${
                    isActive
                      ? "bg-ink text-paper-2"
                      : isLocked
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-ink/[0.04]"
                  }`}
                >
                  <div
                    className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-[1.5px] font-mono text-[11px] font-bold ${
                      isDone
                        ? "border-sage bg-sage text-white"
                        : isActive
                          ? "border-terra bg-terra text-white"
                          : "border-line-2 bg-paper-2 text-mute"
                    }`}
                  >
                    {isDone ? "✓" : s.n}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-[13px] font-semibold tracking-[-0.005em] ${isActive ? "text-paper-2" : ""}`}>
                      {s.t}
                    </div>
                    <div className={`mt-0.5 text-[11px] ${isActive ? "text-paper-2/55" : "text-mute"}`}>
                      {s.d}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-9 border-t border-line pt-6">
            <h4 className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.14em] text-mute">// Tip</h4>
            <div className="rounded-xl bg-paper p-4 text-[12px] leading-[1.55] text-ink-2">
              {isPlayer ? (
                <>
                  Most coaches reject profiles missing measurements.{" "}
                  <span className="serif text-terra">Be exact</span> — height and experience are worth more than PPG to most scouts.
                </>
              ) : (
                <>
                  Players filter by <span className="serif text-terra">league level</span> first. Being specific about division and what you offer beats vague hype every time.
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="max-w-[980px] px-6 py-10 sm:px-12 sm:py-14">
          <div className="mb-6 inline-flex items-center gap-3.5 rounded-full border border-line bg-paper-2 py-1.5 pl-1.5 pr-3.5">
            <span className="rounded-full bg-terra px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.06em] text-white">
              {String(step).padStart(2, "0")} / {String(ACTIVE_STEPS).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-mute">
              Step {step === 1 ? "one" : step === 2 ? "two" : step === 3 ? "three" : step === 4 ? "four" : "five"} · {STEPS[step - 1].t}
            </span>
          </div>

          {/* Step content */}
          {isPlayer ? (
            <PlayerStep step={step} form={form} update={update} togglePosition={(p) => togglePosition(p, "positions")} />
          ) : (
            <TeamStep step={step} form={form} update={update} togglePosition={(p) => togglePosition(p, "positions_needed")} />
          )}

          {error && (
            <div className="mt-6 rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
              {error}
            </div>
          )}

          {/* Step footer */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-7">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleBack}
                disabled={step === 1 || saving}
                className="btn btn-ghost disabled:opacity-40"
              >
                <Arrow dir="left" size={12} /> Back
              </button>
              {step < ACTIVE_STEPS && (
                <span className="text-[13px] text-mute">
                  Don&apos;t have these yet?{" "}
                  <button
                    onClick={handleNext}
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    Skip & come back
                  </button>
                </span>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={saving}
              className="btn btn-terra disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {saving
                ? "Saving…"
                : step === ACTIVE_STEPS
                  ? <>Complete profile <Arrow /></>
                  : <>Save & continue <Arrow /></>}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLAYER STEPS
// ═══════════════════════════════════════════════════════════
function PlayerStep({ step, form, update, togglePosition }) {
  if (step === 1) return <Step01Basics form={form} update={update} />;
  if (step === 2) return <PlayerStep02Position form={form} update={update} togglePosition={togglePosition} />;
  if (step === 3) return <PlayerStep03Measurements form={form} update={update} />;
  if (step === 4) return <PlayerStep04Stats form={form} update={update} />;
  if (step === 5) return <PlayerStep05Availability form={form} update={update} />;
  return null;
}

function Step01Basics({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Let&apos;s start with the <span className="serif text-sage-deep">basics.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Your name and where you&apos;re based. Coaches filter by country and city to find players within reach.
      </p>

      <FormSection title="About you" help="Visible on your profile.">
        <Grid cols={2}>
          <Field label="Full name" required>
            <Input value={form.full_name} onChange={(v) => update("full_name", v)} placeholder="Marko Kovač" />
          </Field>
          <Field label="Country" required>
            <Input value={form.country} onChange={(v) => update("country", v)} placeholder="Serbia" />
          </Field>
          <Field label="City">
            <Input value={form.city} onChange={(v) => update("city", v)} placeholder="Belgrade" />
          </Field>
        </Grid>
      </FormSection>
    </>
  );
}

function PlayerStep02Position({ form, update, togglePosition }) {
  return (
    <>
      <h1 className="display-md">
        How do you <span className="serif text-sage-deep">play?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Pick every position you can play. Most pros play 2 — your primary, plus the position you cover when needed.
      </p>

      <FormSection title="Positions" help="Select all that apply.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {POSITIONS.map((p) => {
            const on = form.positions.includes(p.v);
            return (
              <button
                key={p.v}
                type="button"
                onClick={() => togglePosition(p.v)}
                className={`rounded-xl border-[1.5px] px-4 py-5 text-center transition-all ${
                  on ? "border-ink bg-ink text-paper-2" : "border-line-2 bg-paper hover:border-ink/40"
                }`}
              >
                <div className="text-[22px] font-extrabold tracking-[-0.015em]">{p.abbr}</div>
                <div className={`mt-1 text-[11px] tracking-[0.04em] ${on ? "text-paper-2/55" : "text-mute"}`}>
                  {p.n}
                </div>
              </button>
            );
          })}
        </div>
      </FormSection>

      <FormSection title="Experience level" help="How seriously you've played so far.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {EXP_LEVELS.map((e) => {
            const on = form.experience_level === e.v;
            return (
              <button
                key={e.v}
                type="button"
                onClick={() => update("experience_level", e.v)}
                className={`rounded-xl border-[1.5px] p-4 text-left transition-all ${
                  on ? "border-ink bg-paper-2 shadow-[0_1px_0_rgba(19,17,14,0.05)]" : "border-line-2 bg-paper hover:border-ink/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`relative h-[18px] w-[18px] flex-none rounded-full border-[1.5px] ${on ? "border-ink" : "border-line-2"}`}>
                    {on && <span className="absolute left-[3px] top-[3px] h-[10px] w-[10px] rounded-full bg-ink" />}
                  </div>
                  <div className="text-[14px] font-bold">{e.n}</div>
                </div>
                <div className="mt-2 text-[12px] leading-[1.5] text-ink-2">{e.d}</div>
              </button>
            );
          })}
        </div>
      </FormSection>
    </>
  );
}

function PlayerStep03Measurements({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Your <span className="serif text-sage-deep">measurements.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Coaches filter by height first, weight second. Get these right and you&apos;ll surface in twice the searches.
      </p>

      <FormSection title="Essentials" help="Required for your profile to appear in coach searches.">
        <Grid cols={3}>
          <Field label="Height" required hint={form.height_cm ? `≈ ${(form.height_cm / 30.48).toFixed(1)} ft` : null}>
            <InputWithUnit
              value={form.height_cm}
              onChange={(v) => update("height_cm", v)}
              unit="cm"
              type="number"
              placeholder="193"
            />
          </Field>
          <Field label="Weight" required hint={form.weight_kg ? `≈ ${Math.round(form.weight_kg * 2.205)} lb` : null}>
            <InputWithUnit
              value={form.weight_kg}
              onChange={(v) => update("weight_kg", v)}
              unit="kg"
              type="number"
              placeholder="87"
            />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={form.date_of_birth} onChange={(v) => update("date_of_birth", v)} />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="Experience" help="Years actively competing.">
        <Grid cols={1}>
          <Field label="Years played competitively">
            <InputWithUnit
              value={form.experience_years}
              onChange={(v) => update("experience_years", v)}
              unit="years"
              type="number"
              placeholder="6"
            />
          </Field>
        </Grid>
      </FormSection>
    </>
  );
}

function PlayerStep04Stats({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Your last <span className="serif text-sage-deep">season.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Be honest. Coaches verify against game footage. Inflated stats lose more contracts than missing ones.
      </p>

      <FormSection title="Per-game averages" help="From your most recent full season.">
        <Grid cols={3}>
          <Field label="Points (PPG)">
            <InputWithUnit value={form.ppg} onChange={(v) => update("ppg", v)} unit="ppg" type="number" step="0.1" placeholder="14.2" />
          </Field>
          <Field label="Assists (APG)">
            <InputWithUnit value={form.apg} onChange={(v) => update("apg", v)} unit="apg" type="number" step="0.1" placeholder="5.1" />
          </Field>
          <Field label="Rebounds (RPG)">
            <InputWithUnit value={form.rpg} onChange={(v) => update("rpg", v)} unit="rpg" type="number" step="0.1" placeholder="4.2" />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="Shooting" help="3-point efficiency is the #2 filter for combo guards and wings.">
        <Grid cols={1}>
          <Field label="3-point percentage">
            <InputWithUnit value={form.three_pt_pct} onChange={(v) => update("three_pt_pct", v)} unit="%" type="number" step="0.1" placeholder="38.5" />
          </Field>
        </Grid>
      </FormSection>
    </>
  );
}

function PlayerStep05Availability({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        What are you <span className="serif text-terra">looking for?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Tell coaches what you want. Specific is better than vague — "score-first SG in EuroBasket-level program" beats "any opportunity."
      </p>

      <FormSection title="Looking for" help="2–4 sentences. Specific level, role, region.">
        <Textarea
          value={form.looking_for}
          onChange={(v) => update("looking_for", v)}
          rows={4}
          placeholder="A semi-pro contract in Northern Europe. Score-first combo guard role with real minutes. Open to relocation from August 2026."
        />
      </FormSection>

      <FormSection title="Last team" help="Optional. Builds credibility.">
        <Textarea
          value={form.previous_teams}
          onChange={(v) => update("previous_teams", v)}
          rows={3}
          placeholder="Mega Basket U19 (2024–25)&#10;OKK Beograd (2023–24)"
        />
      </FormSection>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// TEAM STEPS
// ═══════════════════════════════════════════════════════════
function TeamStep({ step, form, update, togglePosition }) {
  if (step === 1) return <Step01Basics form={form} update={update} />;
  if (step === 2) return <TeamStep02Identity form={form} update={update} />;
  if (step === 3) return <TeamStep03Positions form={form} togglePosition={togglePosition} />;
  if (step === 4) return <TeamStep04Pitch form={form} update={update} />;
  if (step === 5) return <TeamStep05Details form={form} update={update} />;
  return null;
}

function TeamStep02Identity({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Your team <span className="serif text-sage-deep">identity.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        The name on your jersey, the league you compete in, the level you play.
      </p>

      <FormSection title="Team" help="As it appears in league standings.">
        <Grid cols={2}>
          <Field label="Team name" required>
            <Input value={form.team_name} onChange={(v) => update("team_name", v)} placeholder="BC Mornar" />
          </Field>
          <Field label="Founded">
            <Input type="number" value={form.founded_year} onChange={(v) => update("founded_year", v)} placeholder="1955" />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="League" help="Players filter by league first.">
        <Grid cols={3}>
          <Field label="League">
            <Input value={form.league} onChange={(v) => update("league", v)} placeholder="ABA Liga 2" />
          </Field>
          <Field label="Tier (1–5)" hint="1 = top flight">
            <Input type="number" min="1" max="5" value={form.league_tier} onChange={(v) => update("league_tier", v)} placeholder="2" />
          </Field>
          <Field label="Division">
            <Input value={form.division} onChange={(v) => update("division", v)} placeholder="Senior · men" />
          </Field>
        </Grid>
      </FormSection>
    </>
  );
}

function TeamStep03Positions({ form, togglePosition }) {
  return (
    <>
      <h1 className="display-md">
        Who are you <span className="serif text-terra">hiring?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Select the positions you have open spots for this window. Be specific — narrow searches get faster replies.
      </p>

      <FormSection title="Open positions" help="Select all that apply.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {POSITIONS.map((p) => {
            const on = form.positions_needed.includes(p.v);
            return (
              <button
                key={p.v}
                type="button"
                onClick={() => togglePosition(p.v)}
                className={`rounded-xl border-[1.5px] px-4 py-5 text-center transition-all ${
                  on ? "border-ink bg-ink text-paper-2" : "border-line-2 bg-paper hover:border-ink/40"
                }`}
              >
                <div className="text-[22px] font-extrabold tracking-[-0.015em]">{p.abbr}</div>
                <div className={`mt-1 text-[11px] tracking-[0.04em] ${on ? "text-paper-2/55" : "text-mute"}`}>
                  {p.n}
                </div>
              </button>
            );
          })}
        </div>
      </FormSection>
    </>
  );
}

function TeamStep04Pitch({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Why should they <span className="serif text-sage-deep">choose you?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Top players have options. Tell them what your program offers — culture, development, the role, the city.
      </p>

      <FormSection title="About the program" help="3–6 sentences. Real specifics, no buzzwords.">
        <Textarea
          value={form.description}
          onChange={(v) => update("description", v)}
          rows={5}
          placeholder="ABA Liga 2 club competing for promotion. Young roster, ex-pro coaching staff, full-court pressure system."
        />
      </FormSection>

      <FormSection title="What you offer" help="Pay range, housing, travel, development, exposure.">
        <Textarea
          value={form.what_we_offer}
          onChange={(v) => update("what_we_offer", v)}
          rows={4}
          placeholder="€1,800–2,400 / month based on role. Apartment provided. Two flights home per season. EU-eligible passports preferred but not required."
        />
      </FormSection>
    </>
  );
}

function TeamStep05Details({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        A few <span className="serif text-terra">final details.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Optional — but recent record and a website give serious players the proof points they need.
      </p>

      <FormSection title="Public presence" help="Where players can verify you're real.">
        <Grid cols={1}>
          <Field label="Website" hint="Optional">
            <Input type="url" value={form.website} onChange={(v) => update("website", v)} placeholder="https://bcmornar.com" />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="Last season" help="Recent record, finals, notable wins.">
        <Textarea
          value={form.season_record}
          onChange={(v) => update("season_record", v)}
          rows={3}
          placeholder="2024–25: 22–8 regular season. Reached Liga 2 semifinal. Promoted to ABA Liga 1 in 2026–27."
        />
      </FormSection>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// REUSABLE FORM COMPONENTS
// ═══════════════════════════════════════════════════════════
function FormSection({ title, help, children }) {
  return (
    <div className="mt-5 rounded-2xl border border-line bg-paper-2 p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
        <h3 className="text-[18px] font-bold tracking-[-0.01em]">{title}</h3>
        {help && <div className="max-w-[300px] text-right text-[12px] text-mute">{help}</div>}
      </div>
      {children}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  const cls = cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return <div className={`grid gap-3.5 ${cls}`}>{children}</div>;
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
        {label}
        {required && <span className="ml-2 font-normal normal-case tracking-normal text-mute/70">required</span>}
        {hint && !required && <span className="ml-2 font-normal normal-case tracking-normal text-sage-deep">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({ type = "text", value, onChange, placeholder, ...rest }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full rounded-xl border border-line-2 bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
      {...rest}
    />
  );
}

function InputWithUnit({ value, onChange, unit, type = "text", ...rest }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-line-2 bg-paper py-3 pl-4 pr-16 text-[15px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
        {...rest}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[12px] tracking-[0.04em] text-mute">
        {unit}
      </span>
    </div>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="block w-full resize-none rounded-xl border border-line-2 bg-paper px-4 py-3 text-[15px] leading-[1.55] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
    />
  );
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function pick(obj, keys) {
  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {});
}

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function computeInitialStep(profile, ad, isPlayer) {
  if (!profile.full_name || !profile.country) return 1;
  if (isPlayer) {
    if (!ad.positions || ad.positions.length === 0) return 2;
    if (!ad.height_cm) return 3;
    if (ad.ppg == null || ad.ppg === 0) return 4;
    if (!ad.looking_for) return 5;
    return 5;
  } else {
    if (!ad.team_name) return 2;
    if (!ad.positions_needed || ad.positions_needed.length === 0) return 3;
    if (!ad.description) return 4;
    return 5;
  }
}

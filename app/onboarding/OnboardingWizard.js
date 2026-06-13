"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { uploadAvatar } from "@/app/dashboard/actions";
import { savePlayerStep, saveTeamStep, completeOnboarding } from "./actions";
import { BASKETBALL_POSITIONS } from "@/lib/basketball/positions.mjs";

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
const POSITIONS = BASKETBALL_POSITIONS.map((position) => ({
  v: position.value,
  abbr: position.abbr,
  n: position.label,
}));

const EXP_LEVELS = [
  { v: "amateur", n: "Amateur", d: "Club, school, or recreational" },
  { v: "semi_pro", n: "Semi-pro", d: "Paid contract, lower divisions" },
  { v: "pro", n: "Pro", d: "Top tier or international" },
];

const PREFERRED_COUNTRIES = [
  "Spain",
  "Germany",
  "Iceland",
  "Denmark",
  "Sweden",
  "Norway",
  "Finland",
  "France",
  "Italy",
  "Serbia",
  "Lithuania",
  "Poland",
];

const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "German",
  "Serbian",
  "Icelandic",
  "French",
  "Italian",
  "Lithuanian",
  "Finnish",
  "Danish",
  "Swedish",
  "Norwegian",
];

// ─── Player steps definition ─────────────────────────────────
const PLAYER_STEPS = [
  { n: "01", t: "Identity", d: "Photo and location" },
  { n: "02", t: "Player fit", d: "Role, size, level" },
  { n: "03", t: "Coach scan", d: "Proof and preferences" },
];

const TEAM_STEPS = [
  { n: "01", t: "Basics", d: "Contact and location" },
  { n: "02", t: "Roster need", d: "Team and positions" },
  { n: "03", t: "Pitch", d: "Program and offer" },
];

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function OnboardingWizard({ profile, ad }) {
  const isPlayer = profile.role !== "team";
  const STEPS = isPlayer ? PLAYER_STEPS : TEAM_STEPS;
  const ACTIVE_STEPS = 3;

  // Resume from furthest filled step
  const initialStep = computeInitialStep(profile, ad, isPlayer);
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useTransition();
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef(null);

  // Form data state — initialized from existing values
  const [form, setForm] = useState({
    // Profile
    full_name: profile.full_name || "",
    country: profile.country || "",
    city: profile.city || "",
    avatar_url: profile.avatar_url || "",
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
    highlights_url: ad.highlights_url || "",
    preferred_countries: ad.preferred_countries || [],
    languages: ad.languages || [],
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

  function toggleListValue(key, value) {
    setForm((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : parseList(prev[key]);
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function getStepPayload(currentStep) {
    // Return fields to save for the current step
    if (isPlayer) {
      switch (currentStep) {
        case 1: return pick(form, ["full_name", "country", "city"]);
        case 2: return {
          positions: form.positions,
          experience_level: form.experience_level || null,
          height_cm: numOrNull(form.height_cm),
          weight_kg: numOrNull(form.weight_kg),
          date_of_birth: form.date_of_birth || null,
        };
        case 3: return {
          experience_years: numOrNull(form.experience_years) ?? 0,
          highlights_url: form.highlights_url || null,
          preferred_countries: form.preferred_countries,
          languages: form.languages,
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
          positions_needed: form.positions_needed,
        };
        case 3: return {
          description: form.description || null,
          what_we_offer: form.what_we_offer || null,
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

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError("");

    const formData = new FormData();
    formData.append("avatar", file);
    const result = await uploadAvatar(formData);

    setUploadingAvatar(false);

    if (result?.error) {
      setError(result.error);
      return;
    }

    setAvatarUrl(result.avatar_url);
    update("avatar_url", result.avatar_url);
  }

  const progress = (step / ACTIVE_STEPS) * 100;
  const currentStep = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-sand text-ink">
      {/* ─── Top bar ────────────────────────────────────────── */}
      <div className="border-b border-line bg-paper-2">
        <div className="mx-auto flex max-w-[920px] flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2 text-[17px] font-extrabold tracking-wide">
            <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
            <span>Picked</span>
          </Link>

          <div className="flex items-center gap-4 text-[12px] text-mute">
            <span className="hidden items-center gap-1.5 font-semibold text-sage-deep sm:inline-flex">
              <span className="pulse-dot" /> Saved
            </span>
            <Link href="/dashboard" className="rounded-full border border-line-2 px-3.5 py-1.5 text-[12px] font-semibold text-ink hover:bg-paper">
              Save & exit
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[820px] px-5 py-9 sm:px-6 sm:py-12">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-4 text-[12px]">
            <span className="font-bold uppercase tracking-[0.14em] text-terra-deep">
              Step {step} of {ACTIVE_STEPS}
            </span>
            <span className="text-mute">{currentStep.t}</span>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-ink/[0.08]">
            <div
              className="h-full rounded-full bg-sage transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        {isPlayer ? (
          <PlayerStep
            step={step}
            form={form}
            update={update}
            avatarUrl={avatarUrl}
            uploadingAvatar={uploadingAvatar}
            fileRef={fileRef}
            onAvatarChange={handleAvatarChange}
            togglePosition={(p) => togglePosition(p, "positions")}
            toggleListValue={toggleListValue}
          />
        ) : (
          <TeamStep step={step} form={form} update={update} togglePosition={(p) => togglePosition(p, "positions_needed")} />
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-terra/30 bg-terra/10 px-4 py-3 text-[13px] text-terra-deep">
            {error}
          </div>
        )}

        {/* Step footer */}
        <div className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <button
            onClick={handleBack}
            disabled={step === 1 || saving}
            className="btn btn-ghost disabled:opacity-40"
          >
            <Arrow dir="left" size={12} /> Back
          </button>
          <div className="flex flex-wrap items-center justify-end gap-4">
            {step < ACTIVE_STEPS && (
              <button
                onClick={handleNext}
                disabled={saving}
                className="text-[13px] font-semibold text-mute underline-offset-4 hover:text-ink hover:underline disabled:opacity-50"
              >
                Skip for now
              </button>
            )}
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
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLAYER STEPS
// ═══════════════════════════════════════════════════════════
function PlayerStep({
  step,
  form,
  update,
  avatarUrl,
  uploadingAvatar,
  fileRef,
  onAvatarChange,
  togglePosition,
  toggleListValue,
}) {
  if (step === 1) {
    return (
      <Step01Basics
        form={form}
        update={update}
        avatarUrl={avatarUrl}
        uploadingAvatar={uploadingAvatar}
        fileRef={fileRef}
        onAvatarChange={onAvatarChange}
      />
    );
  }
  if (step === 2) return <PlayerStep02Position form={form} update={update} togglePosition={togglePosition} />;
  if (step === 3) return <PlayerStep03CoachScan form={form} update={update} toggleListValue={toggleListValue} />;
  return null;
}

function Step01Basics({
  form,
  update,
  avatarUrl,
  uploadingAvatar,
  fileRef,
  onAvatarChange,
}) {
  const hasPhotoUpload = Boolean(onAvatarChange);

  return (
    <>
      <h1 className="display-md">
        {hasPhotoUpload ? (
          <>Let&apos;s make you <span className="serif text-sage-deep">recognizable.</span></>
        ) : (
          <>Let&apos;s start with the <span className="serif text-sage-deep">basics.</span></>
        )}
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        {hasPhotoUpload
          ? "A clear photo and location help coaches trust the profile before they scan the basketball details."
          : "Your name and where you're based. Players filter by country and city to understand fit."}
      </p>

      {hasPhotoUpload && (
        <FormSection title="Photo" help="Optional, but it makes the profile feel real.">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper text-[28px] font-extrabold text-terra">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                (form.full_name || "?").charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="btn btn-ghost disabled:opacity-50"
              >
                {uploadingAvatar ? "Uploading..." : "Upload photo"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
              <p className="mt-2 text-[12px] text-mute">
                JPG, PNG or WebP. A simple headshot works best.
              </p>
            </div>
          </div>
        </FormSection>
      )}

      <FormSection title="Location" help="Visible on your profile.">
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
        Coaches scan position, size, age and level first. Make that information easy to trust.
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

      <FormSection title="Size and age" help="Height and age are common roster filters.">
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
          <Field label="Weight" hint={form.weight_kg ? `≈ ${Math.round(form.weight_kg * 2.205)} lb` : "Optional"}>
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
    </>
  );
}

function PlayerStep03CoachScan({ form, update, toggleListValue }) {
  return (
    <>
      <h1 className="display-md">
        Give coaches enough to <span className="serif text-sage-deep">judge fit.</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Add proof, where you want to play, and how teams can understand you quickly.
      </p>

      <FormSection title="Proof" help="YouTube, Instagram reel, Hudl, Drive or another public link.">
        <Grid cols={2}>
          <Field label="Highlight / social link" hint="Optional">
            <Input
              type="url"
              value={form.highlights_url}
              onChange={(v) => update("highlights_url", v)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </Field>
          <Field label="Last team" hint="Optional">
            <Input value={form.previous_teams} onChange={(v) => update("previous_teams", v)} placeholder="Mega Basket U19" />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="Preferences" help="Select the markets and languages that help a manager judge fit.">
        <Grid cols={2}>
          <Field label="Preferred countries">
            <ChoiceDropdown
              label="Choose countries"
              options={PREFERRED_COUNTRIES}
              selected={form.preferred_countries}
              onToggle={(value) => toggleListValue("preferred_countries", value)}
            />
          </Field>
          <Field label="Languages">
            <ChoiceDropdown
              label="Choose languages"
              options={LANGUAGE_OPTIONS}
              selected={form.languages}
              onToggle={(value) => toggleListValue("languages", value)}
            />
          </Field>
        </Grid>
      </FormSection>

      <FormSection title="About you" help="Short player description coaches can scan.">
        <Textarea
          value={form.looking_for}
          onChange={(v) => update("looking_for", v)}
          rows={4}
          placeholder="Tell coaches what kind of player you are, what level you have played, and what you bring to a team."
        />
        <div className="mt-3 max-w-[260px]">
          <Field label="Years played competitively">
            <InputWithUnit
              value={form.experience_years}
              onChange={(v) => update("experience_years", v)}
              unit="years"
              type="number"
              placeholder="6"
            />
          </Field>
        </div>
      </FormSection>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// TEAM STEPS
// ═══════════════════════════════════════════════════════════
function TeamStep({ step, form, update, togglePosition }) {
  if (step === 1) return <Step01Basics form={form} update={update} />;
  if (step === 2) return <TeamStep02RosterNeed form={form} update={update} togglePosition={togglePosition} />;
  if (step === 3) return <TeamStep03Pitch form={form} update={update} />;
  return null;
}

function TeamStep02RosterNeed({ form, update, togglePosition }) {
  return (
    <>
      <h1 className="display-md">
        What are you <span className="serif text-terra">hiring?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Add your team, league and open positions. Players need to know the level before they answer.
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

function TeamStep03Pitch({ form, update }) {
  return (
    <>
      <h1 className="display-md">
        Why should players <span className="serif text-sage-deep">answer?</span>
      </h1>
      <p className="mt-3 max-w-[560px] text-[15px] leading-[1.55] text-ink-2">
        Keep it concrete: role, salary range, housing, league level and timeline beat broad hype.
      </p>

      <FormSection title="About the opportunity" help="Specific beats polished.">
        <Textarea
          value={form.description}
          onChange={(v) => update("description", v)}
          rows={4}
          placeholder="ABA Liga 2 club competing for promotion. Looking for a stretch 4 with immediate rotation minutes."
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

      <FormSection title="Proof" help="Optional, but helps players trust the listing.">
        <Grid cols={2}>
          <Field label="Website" hint="Optional">
            <Input type="url" value={form.website} onChange={(v) => update("website", v)} placeholder="https://bcmornar.com" />
          </Field>
          <Field label="Last season" hint="Optional">
            <Input value={form.season_record} onChange={(v) => update("season_record", v)} placeholder="22-8, semifinal" />
          </Field>
        </Grid>
      </FormSection>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// REUSABLE FORM COMPONENTS
// ═══════════════════════════════════════════════════════════
function FormSection({ title, help, children }) {
  return (
    <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <h3 className="text-[18px] font-bold tracking-[-0.01em]">{title}</h3>
        {help && <div className="max-w-[340px] text-left text-[12px] leading-[1.5] text-mute sm:text-right">{help}</div>}
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
      <span className="mb-1.5 flex min-h-[18px] flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[11px] font-bold uppercase tracking-[0.1em] text-mute">
        <span>{label}</span>
        {required && <span className="font-normal normal-case tracking-normal text-mute/70">required</span>}
        {hint && !required && <span className="font-normal normal-case tracking-normal text-sage-deep">{hint}</span>}
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

function ChoiceDropdown({ label, options, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const selectedValues = Array.isArray(selected) ? selected : parseList(selected);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-line-2 bg-paper px-4 py-3 text-left text-[15px] text-ink transition-colors hover:border-ink/40 focus:border-ink focus:outline-none"
      >
        <span className={selectedValues.length > 0 ? "font-semibold" : "text-mute"}>
          {selectedValues.length > 0
            ? `${selectedValues.length} selected`
            : label}
        </span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 13 13"
          fill="none"
          aria-hidden="true"
          className={`shrink-0 text-mute transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l3.5 3L10 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedValues.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-paper-2"
            >
              {item}
              <button
                type="button"
                onClick={() => onToggle(item)}
                aria-label={`Remove ${item}`}
                className="rounded-full text-paper-2/70 hover:text-paper-2"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-[260px] overflow-auto rounded-xl border border-line-2 bg-paper-2 p-2 shadow-[0_14px_35px_rgba(19,17,14,0.12)]">
          {options.map((option) => {
            const on = selectedValues.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-semibold transition-colors ${
                  on ? "bg-ink text-paper-2" : "text-ink hover:bg-paper"
                }`}
              >
                <span>{option}</span>
                {on && (
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M2.5 6.8l2.3 2.2 5.7-5.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
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

function parseList(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function computeInitialStep(profile, ad, isPlayer) {
  if (!profile.full_name || !profile.country) return 1;
  if (isPlayer) {
    if (!ad.positions || ad.positions.length === 0 || !ad.experience_level || !ad.height_cm) return 2;
    if (!ad.highlights_url || !ad.looking_for) return 3;
    return 3;
  } else {
    if (!ad.team_name || !ad.positions_needed || ad.positions_needed.length === 0) return 2;
    if (!ad.description) return 3;
    return 3;
  }
}

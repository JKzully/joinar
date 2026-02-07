"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateAccount, uploadAvatar } from "@/app/dashboard/actions";
import { COUNTRIES } from "@/lib/countries";

export default function OnboardingAccountForm({ profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const formData = new FormData(e.target);

    if (!formData.get("full_name")?.trim()) {
      setSaving(false);
      setMessage({ type: "error", text: "Full name is required" });
      return;
    }

    const result = await updateAccount(formData);

    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      router.push("/onboarding/create-ad");
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);
    const result = await uploadAvatar(formData);

    setUploading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setAvatarUrl(result.avatar_url);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <Section title="Profile Photo" description="Upload a photo so others can recognize you">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-light text-2xl font-semibold text-orange-400">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              (profile.full_name || "?").charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-border bg-surface-light px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50 hover:text-orange-400 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload Photo"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="mt-1.5 text-xs text-text-muted">JPG, PNG or WebP. Max 2MB.</p>
          </div>
        </div>
      </Section>

      {/* Personal Info */}
      <Section title="Personal Information" description="Your basic details">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Full name <span className="text-orange-400">*</span>
            </label>
            <input
              name="full_name"
              required
              defaultValue={profile.full_name}
              placeholder={profile.role === "team" ? "e.g. BC Adriatic Split" : "e.g. Marco Rossi"}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Country</label>
            <select
              name="country"
              defaultValue={profile.country || ""}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          <Field label="City" name="city" defaultValue={profile.city} placeholder="e.g. Milan" />
        </div>
      </Section>

      {/* Bio */}
      <Section title="Bio" description="A short intro about yourself">
        <textarea
          name="bio"
          rows={3}
          defaultValue={profile.bio}
          placeholder="A short bio about yourself..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
        />
      </Section>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-400"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save & Continue \u2192"}
      </button>
    </form>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function Field({ label, className, ...props }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
      />
    </div>
  );
}

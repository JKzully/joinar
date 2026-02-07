"use client";

import { useState, useRef } from "react";
import { updateAccount, uploadAvatar } from "../actions";

export default function AccountForm({ profile }) {
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
    const result = await updateAccount(formData);

    setSaving(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "Account saved successfully" });
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
      setMessage({ type: "success", text: "Avatar updated" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Avatar */}
      <Section title="Profile Photo" description="Upload a photo so teams and players can recognize you">
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
              {uploading ? "Uploading..." : "Change Photo"}
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
          <Field label="Full name" name="full_name" defaultValue={profile.full_name} placeholder="Marco Rossi" />
          <Field label="Country" name="country" defaultValue={profile.country} placeholder="Italy" />
          <Field label="City" name="city" defaultValue={profile.city} placeholder="Milan" className="sm:col-span-2" />
        </div>
      </Section>

      {/* Bio */}
      <Section title="Bio" description="Tell people a bit about yourself">
        <textarea
          name="bio"
          rows={4}
          defaultValue={profile.bio}
          placeholder="A short bio about yourself..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50"
        />
      </Section>

      {/* Message + Submit */}
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

      <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Account"}
        </button>
      </div>
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

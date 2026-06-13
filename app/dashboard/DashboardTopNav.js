"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DashboardTopNav({ profile, unreadCount = 0 }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const isPlayer = profile.role !== "team";

  // Primary nav — role-aware
  const primaryLinks = isPlayer
    ? [
        { href: "/dashboard/teams", label: "Teams" },
        { href: "/dashboard/players", label: "Players" },
        { href: "/dashboard/messages", label: "Messages", badge: unreadCount },
      ]
    : [
        { href: "/dashboard/players", label: "Players" },
        { href: "/dashboard/teams", label: "Teams" },
        { href: "/dashboard/messages", label: "Messages", badge: unreadCount },
      ];

  // Account dropdown items
  const accountLinks = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/ad", label: isPlayer ? "Edit my profile" : "Edit team profile" },
    { href: "/dashboard/tryouts", label: "Tryout invites" },
    { href: "/dashboard/boost", label: "Boost" },
    { href: "/dashboard/account", label: "Account settings" },
  ];

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const initials = (profile.full_name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="px-6 pt-6 sm:px-12 sm:pt-7 lg:px-14">
      <div className="mx-auto max-w-[1340px]">
        <div className="flex items-center justify-between rounded-full border border-line bg-paper-2 py-2.5 pl-6 pr-2.5 shadow-[0_1px_0_rgba(22,19,16,0.04)]">
          {/* Left: brand + primary links */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-baseline gap-2 text-[17px] font-extrabold tracking-wide">
              <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
              <span>Picked</span>
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              {primaryLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-[13px] font-medium transition-colors ${
                    isActive(l.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {l.label}
                    {l.badge > 0 && (
                      <span className="num inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terra px-1 text-[10px] font-bold text-white">
                        {l.badge > 9 ? "9+" : l.badge}
                      </span>
                    )}
                  </span>
                  {isActive(l.href) && (
                    <span className="absolute -bottom-[7px] left-0 right-0 h-[2px] rounded-full bg-ink" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: account button */}
          <div className="flex items-center gap-2">
            {/* Account dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2.5 rounded-full bg-paper pl-1.5 pr-3.5 py-1.5 transition-colors hover:bg-sand"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[11px] font-bold text-sand">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" width={28} height={28} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-[13px] font-semibold leading-none text-ink">
                  {(profile.full_name || "Account").split(" ")[0]}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-mute">
                  · {isPlayer ? "Player" : "Coach"}
                </span>
                <span className="ml-0.5 text-mute"><Chevron /></span>
              </button>

              {accountOpen && (
                <>
                  <button
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setAccountOpen(false)}
                    className="fixed inset-0 z-30 cursor-default"
                  />
                  <div className="absolute right-0 top-full z-40 mt-3 w-[280px] overflow-hidden rounded-2xl border border-line bg-paper-2 shadow-[0_8px_28px_rgba(19,17,14,0.08)]">
                    <div className="border-b border-line p-4">
                      <div className="text-[13px] font-bold text-ink">{profile.full_name || "Account"}</div>
                      <div className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-mute">
                        {isPlayer ? "Player profile" : "Team / Coach"}
                      </div>
                    </div>
                    <div className="p-1.5">
                      {accountLinks.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setAccountOpen(false)}
                          className={`block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                            isActive(l.href) && l.href !== "/dashboard"
                              ? "bg-paper text-ink"
                              : "text-ink-2 hover:bg-paper hover:text-ink"
                          }`}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                    <form action={signOut} className="border-t border-line p-1.5">
                      <button
                        type="submit"
                        className="block w-full rounded-lg px-3 py-2 text-left text-[13px] font-medium text-mute hover:bg-paper hover:text-terra"
                      >
                        Sign out →
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper md:hidden"
            >
              {mobileOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mt-3 rounded-2xl border border-line bg-paper-2 p-3 md:hidden">
            <div className="border-b border-line p-3 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink text-[12px] font-bold text-sand">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-ink">{profile.full_name || "Account"}</div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-mute">
                    {isPlayer ? "Player" : "Team / Coach"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col py-2">
              {[...primaryLinks, ...accountLinks].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-[14px] font-medium transition-colors ${
                    isActive(l.href) && l.href !== "/dashboard"
                      ? "bg-paper text-ink"
                      : "text-ink-2 hover:bg-paper hover:text-ink"
                  }`}
                >
                  <span>{l.label}</span>
                  {l.badge > 0 && (
                    <span className="num inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terra px-1 text-[10px] font-bold text-white">
                      {l.badge > 9 ? "9+" : l.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <form action={signOut} className="border-t border-line pt-2">
              <button
                type="submit"
                className="block w-full rounded-xl px-4 py-3 text-left text-[14px] font-medium text-mute hover:bg-paper hover:text-terra"
              >
                Sign out →
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

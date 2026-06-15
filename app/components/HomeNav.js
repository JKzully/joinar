"use client";

import { useState } from "react";
import Link from "next/link";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LINKS = [
  { href: "#market", label: "Market view" },
  { href: "#roster-search", label: "Roster search" },
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-ink px-5 py-2.5 text-center text-[11px] font-bold tracking-[0.04em] text-paper-2 sm:px-8">
        Roster window · Profiles stay private until published
      </div>
      <header className="border-b border-line bg-sand px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex min-h-16 items-center justify-between">
          <div className="flex items-center gap-9">
            <Link href="/" className="flex items-baseline gap-2 text-[17px] font-extrabold tracking-wide">
              <span className="inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-terra" />
              <span>Picked</span>
            </Link>
            <div className="hidden items-center gap-7 md:flex">
              {LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-[13px] font-medium text-ink-2 hover:text-ink">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="px-3 text-[13px] font-medium text-ink-2 hover:text-ink">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-ink">
              Enter the market <Arrow />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-11 w-11 items-center justify-center text-ink hover:bg-paper md:hidden"
          >
            {open ? (
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

          {/* Mobile dropdown */}
          {open && (
          <div className="border-t border-line bg-sand py-3 md:hidden">
            <div className="flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="px-1 py-3 text-[15px] font-medium text-ink hover:text-sage-deep"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-line" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="px-1 py-3 text-[15px] font-medium text-ink-2 hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="btn btn-ink mt-2 justify-center"
                style={{ padding: "13px 18px", fontSize: 14 }}
              >
                Enter the market <Arrow />
              </Link>
            </div>
          </div>
        )}
      </div>
      </header>
    </>
  );
}

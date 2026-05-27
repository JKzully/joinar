"use client";

import { useState } from "react";
import Link from "next/link";

const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="inline-block align-middle">
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LINKS = [
  { href: "#players", label: "Players" },
  { href: "#teams", label: "Teams" },
  { href: "#positions", label: "Open spots" },
  { href: "#how", label: "How it works" },
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-6 pt-6 sm:px-12 sm:pt-8 lg:px-14">
      <div className="mx-auto max-w-[1340px]">
        <div className="flex items-center justify-between rounded-full border border-line bg-paper-2 py-3 pl-7 pr-3 shadow-[0_1px_0_rgba(22,19,16,0.04)]">
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
              Create profile <Arrow />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-paper md:hidden"
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
          <div className="mt-3 rounded-2xl border border-line bg-paper-2 p-3 md:hidden">
            <div className="flex flex-col">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-ink hover:bg-paper"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 border-t border-line" />
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-ink-2 hover:bg-paper"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="btn btn-ink mt-2 justify-center"
                style={{ padding: "13px 18px", fontSize: 14 }}
              >
                Create profile <Arrow />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

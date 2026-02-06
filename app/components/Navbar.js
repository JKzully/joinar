"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Picked" width={80} height={36} priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#players"
            className="text-sm text-text-secondary transition-colors hover:text-orange-400"
          >
            Find Players
          </Link>
          <Link
            href="#teams"
            className="text-sm text-text-secondary transition-colors hover:text-orange-400"
          >
            Find Teams
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-text-secondary transition-colors hover:text-orange-400"
          >
            How It Works
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Sign Up Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-light md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            <Link
              href="#players"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              Find Players
            </Link>
            <Link
              href="#teams"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              Find Teams
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              How It Works
            </Link>
            <hr className="border-border" />
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-light hover:text-text-primary"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-orange-500 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-orange-600"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

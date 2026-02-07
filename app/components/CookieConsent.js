"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface p-4 sm:p-0">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 sm:flex-row sm:justify-between sm:px-6 sm:py-4">
        <p className="text-center text-sm text-text-secondary sm:text-left">
          We use essential cookies to make Picked work. By continuing, you agree to our{" "}
          <Link href="/privacy" className="text-orange-400 underline underline-offset-2 hover:text-orange-300">
            Privacy Policy
          </Link>.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleAccept}
            className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Accept
          </button>
          <Link
            href="/privacy"
            className="rounded-lg border border-border bg-surface-light px-5 py-2 text-sm font-medium text-text-primary transition-colors hover:border-orange-500/50"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

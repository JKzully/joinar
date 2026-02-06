import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">🏀</span>
              <span className="text-lg font-bold tracking-tight text-text-primary">
                PICKED
              </span>
            </Link>
            <p className="mt-3 text-sm text-text-muted">
              Get Picked.
            </p>
          </div>

          {/* Players */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              For Players
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/signup" className="transition-colors hover:text-orange-400">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link href="/teams" className="transition-colors hover:text-orange-400">
                  Browse Teams
                </Link>
              </li>
              <li>
                <Link href="/boost" className="transition-colors hover:text-orange-400">
                  Boost Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Teams */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              For Teams
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/signup" className="transition-colors hover:text-orange-400">
                  List Positions
                </Link>
              </li>
              <li>
                <Link href="/players" className="transition-colors hover:text-orange-400">
                  Browse Players
                </Link>
              </li>
              <li>
                <Link href="/tryouts" className="transition-colors hover:text-orange-400">
                  Schedule Tryouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-primary">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/about" className="transition-colors hover:text-orange-400">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-orange-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition-colors hover:text-orange-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Picked. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="text-text-muted transition-colors hover:text-orange-400"
              aria-label="Twitter"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-text-muted transition-colors hover:text-orange-400"
              aria-label="Instagram"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

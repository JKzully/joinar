import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Privacy Policy - Picked",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-primary">Privacy Policy</h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: February 7, 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Who We Are</h2>
            <p>
              Picked (<a href="https://getpicked.co" className="text-orange-400 hover:text-orange-300">getpicked.co</a>) is a marketplace that connects semi-professional basketball players with teams across Europe. When we say "we," "us," or "Picked," we mean the team behind getpicked.co.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">What Data We Collect</h2>
            <p className="mb-3">We collect only what's needed to run the platform:</p>
            <ul className="list-inside list-disc space-y-2">
              <li><strong className="text-text-primary">Account info</strong> — email address and password (hashed, we never see it in plain text)</li>
              <li><strong className="text-text-primary">Profile info</strong> — name, country, city, role (player or team)</li>
              <li><strong className="text-text-primary">Player data</strong> — positions, stats (PPG, APG, RPG, etc.), height, weight, experience, highlights link, previous teams</li>
              <li><strong className="text-text-primary">Team data</strong> — team name, league, tier, open positions, description, season record</li>
              <li><strong className="text-text-primary">Messages</strong> — conversations between players and teams on the platform</li>
              <li><strong className="text-text-primary">Usage data</strong> — basic analytics (page views, device type) via Vercel Analytics, no personal identifiers</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">How We Use Your Data</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>Display your profile to teams or players searching on the platform</li>
              <li>Enable messaging between players and teams</li>
              <li>Send transactional emails (signup confirmation, password reset, tryout invitations)</li>
              <li>Improve the platform based on aggregate usage patterns</li>
            </ul>
            <p className="mt-3">We do <strong className="text-text-primary">not</strong> sell your data. We do <strong className="text-text-primary">not</strong> show ads. Your profile data exists to connect you with basketball opportunities — that's it.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Data Storage</h2>
            <p>
              Your data is stored securely on <strong className="text-text-primary">Supabase</strong> (hosted on AWS infrastructure in the EU). Passwords are hashed using bcrypt. All connections use HTTPS/TLS encryption.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Cookies</h2>
            <p>
              We use <strong className="text-text-primary">essential cookies only</strong> — specifically, authentication session cookies that keep you logged in. We do not use tracking cookies, advertising cookies, or any third-party cookie-based analytics.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Third-Party Services</h2>
            <p className="mb-3">We use a small number of trusted services to run Picked:</p>
            <ul className="list-inside list-disc space-y-2">
              <li><strong className="text-text-primary">Supabase</strong> — database, authentication, and real-time messaging</li>
              <li><strong className="text-text-primary">Vercel</strong> — hosting and privacy-friendly analytics (no personal data collected)</li>
              <li><strong className="text-text-primary">Resend</strong> — transactional emails (signup confirmations, password resets)</li>
            </ul>
            <p className="mt-3">None of these services receive your data for advertising or profiling purposes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Your Rights (GDPR)</h2>
            <p className="mb-3">If you're in the EU/EEA, you have the right to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li><strong className="text-text-primary">Access</strong> — request a copy of all data we hold about you</li>
              <li><strong className="text-text-primary">Rectify</strong> — correct any inaccurate data via your profile settings</li>
              <li><strong className="text-text-primary">Delete</strong> — request permanent deletion of your account and all associated data</li>
              <li><strong className="text-text-primary">Export</strong> — request a portable copy of your data</li>
              <li><strong className="text-text-primary">Object</strong> — object to processing of your data</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:privacy@getpicked.co" className="text-orange-400 hover:text-orange-300">privacy@getpicked.co</a>.
              We'll respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Data Retention</h2>
            <p>
              We keep your data for as long as your account is active. If you delete your account, we remove all your personal data within 30 days. Anonymized, aggregate analytics data may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Children</h2>
            <p>
              Picked is not intended for users under 16. We do not knowingly collect data from children. If you believe a child has created an account, contact us and we'll remove it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. If we make significant changes, we'll notify you via email or a notice on the platform. The "last updated" date at the top always reflects the latest version.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Contact</h2>
            <p>
              Questions about your privacy? Reach out at{" "}
              <a href="mailto:privacy@getpicked.co" className="text-orange-400 hover:text-orange-300">privacy@getpicked.co</a>.
            </p>
          </section>

          <div className="border-t border-border pt-6">
            <p className="text-xs text-text-muted">
              See also: <Link href="/terms" className="text-orange-400 hover:text-orange-300">Terms of Service</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

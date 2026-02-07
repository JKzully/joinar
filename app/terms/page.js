import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "Terms of Service - Picked",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-primary">Terms of Service</h1>
        <p className="mt-2 text-sm text-text-muted">Last updated: February 7, 2026</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-text-secondary">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Welcome to Picked</h2>
            <p>
              These terms govern your use of Picked (<a href="https://getpicked.co" className="text-orange-400 hover:text-orange-300">getpicked.co</a>), a platform that connects semi-professional basketball players with teams. By creating an account or using the platform, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Your Account</h2>
            <ul className="list-inside list-disc space-y-2">
              <li>You must be at least 16 years old to create an account</li>
              <li>You're responsible for keeping your login credentials secure</li>
              <li>One account per person or organization — don't create duplicate or fake accounts</li>
              <li>The information on your profile should be accurate and truthful</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Acceptable Use</h2>
            <p className="mb-3">Picked is a professional platform for basketball opportunities. You agree not to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>Post false, misleading, or fraudulent profile information</li>
              <li>Harass, spam, or send abusive messages to other users</li>
              <li>Impersonate another person, player, or organization</li>
              <li>Use the platform for anything unrelated to basketball recruitment</li>
              <li>Scrape, crawl, or use automated tools to extract data from the platform</li>
              <li>Attempt to access accounts or data belonging to other users</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Your Content</h2>
            <p>
              You own your data. Your profile information, stats, highlight links, and messages belong to you. By posting content on Picked, you grant us a license to display it on the platform for the purpose of connecting players with teams. If you delete your account, your content is removed.
            </p>
            <p className="mt-3">
              We don't claim ownership over anything you create. We won't use your content for advertising or sell it to third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">No Guarantee of Placement</h2>
            <p>
              Picked is a tool to help players and teams find each other. We do <strong className="text-text-primary">not</strong> guarantee that creating a profile will result in a tryout, contract, or any specific outcome. We connect — what happens next is between you and the other party.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Pricing</h2>
            <p>
              Creating an account and using the core features of Picked (profile, browsing, messaging) is free. We may introduce optional paid features in the future (such as profile boosts or premium visibility). Any paid features will be clearly marked with pricing before you commit.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Termination</h2>
            <p>
              You can delete your account at any time from your account settings. We may also suspend or terminate accounts that violate these terms, engage in abuse, or are inactive for an extended period. If we terminate your account, we'll notify you by email with the reason.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Limitation of Liability</h2>
            <p>
              Picked is provided "as is." To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the platform. This includes (but is not limited to) missed opportunities, inaccurate information posted by other users, or platform downtime.
            </p>
            <p className="mt-3">
              We do our best to keep the platform running smoothly, but we don't guarantee 100% uptime or that the platform will be free of errors.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Disputes Between Users</h2>
            <p>
              Picked is a marketplace, not a party to agreements between players and teams. Any disputes arising from contact made through the platform are between the users involved. We'll help where we can, but we're not responsible for resolving disputes over contracts, tryouts, or other arrangements.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. If we make significant changes, we'll let you know via email or a notice on the platform. Continued use after changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-text-primary">Contact</h2>
            <p>
              Questions about these terms? Reach out at{" "}
              <a href="mailto:hello@getpicked.co" className="text-orange-400 hover:text-orange-300">hello@getpicked.co</a>.
            </p>
          </section>

          <div className="border-t border-border pt-6">
            <p className="text-xs text-text-muted">
              See also: <Link href="/privacy" className="text-orange-400 hover:text-orange-300">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

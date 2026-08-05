import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | TheMonkeyType",
  description: "Learn what data TheMonkeyType collects, how we use it, and what choices you have.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/TMT_Logo_2_new.png"
            alt="TMT Logo"
            width={150}
            height={40}
            priority
            style={{ width: "auto", height: "auto" }}
          />
          <span className="sr-only">TMT - Typing Trainer</span>
        </Link>
        <nav className="text-white/70 flex gap-4 text-sm">
          <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
          <Link href="/stats" className="hover:text-white">Stats</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </header>

      <section className="flex-1 max-w-4xl mx-auto leading-relaxed space-y-5 px-6 py-10">
        <h1 className="text-3xl font-bold text-brand mb-2">Privacy Policy</h1>
        <p className="text-sm text-white/50">Last updated: August 5, 2026</p>

        <p>
          This Privacy Policy explains how TheMonkeyType ("we", "our", "us") collects,
          uses, stores, and protects personal information when you use themonkeytype.com
          and related services.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">What data we collect</h2>
        <p>
          Depending on how you use the website, we may collect account information,
          public profile information, typing test results, challenge results, leaderboard
          data, settings, local preferences, IP-related log information, and basic device
          or browser information needed to keep the service secure and functional.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How we collect data</h2>
        <p>
          We collect information when you create an account, sign in, complete typing tests,
          participate in challenges, save settings, submit scores, contact us, or interact
          with pages and analytics tools on the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How we use data</h2>
        <p>
          We use collected information to operate the typing service, store your settings,
          save and display scores, maintain leaderboards, support challenge features,
          detect abuse or cheating, improve site performance, analyze usage trends, and
          communicate with you when needed.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Advertising, cookies, and third-party vendors</h2>
        <p>
          We may display advertising on TheMonkeyType using third-party advertising partners,
          including Google AdSense. Third-party vendors, including Google, may use cookies,
          web beacons, IP addresses, local storage, or similar technologies to serve ads
          based on a user&apos;s prior visits to this website or other websites.
        </p>
        <p>
          Google&apos;s use of advertising cookies enables it and its partners to serve ads to
          users based on visits to this site and/or other sites on the Internet. Users may
          opt out of personalized advertising by visiting Google&apos;s Ads Settings at{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:text-white"
          >
            google.com/settings/ads
          </a>
          . You can also learn more about how Google uses information from sites and apps at{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noreferrer"
            className="text-brand hover:text-white"
          >
            policies.google.com/technologies/partner-sites
          </a>
          .
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Consent and regional privacy choices</h2>
        <p>
          Where required by law, including for users in the EEA, the UK, and Switzerland,
          we may show a consent message or use a consent management platform before serving
          certain personalised ads or using certain advertising technologies. Users in these
          regions may be asked to review or update their privacy choices before ad-supported
          features are fully enabled.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Analytics and essential cookies</h2>
        <p>
          We use cookies and similar technologies for authentication, saved settings,
          security, service reliability, and analytics. Third-party providers may also use
          cookies or similar tools to help us measure usage and improve performance.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How we store and protect data</h2>
        <p>
          We store data using third-party infrastructure and take reasonable technical and
          organizational measures to protect it. No system can be guaranteed to be perfectly
          secure, but we work to reduce risk and limit access to what is necessary.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Sharing of information</h2>
        <p>
          We do not sell your personal information. We may share limited information with
          service providers that help operate the site, such as hosting, authentication,
          database, analytics, advertising, and support partners. We may also disclose
          information if required by law or to protect the service and its users.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Your rights and choices</h2>
        <p>
          You can clear browser-stored local data at any time. Subject to applicable law,
          you may also request access, correction, or deletion of account-related data.
          If you want to make a request, contact us at <em>support@themonkeytype.com</em>.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">External links</h2>
        <p>
          Our website may link to third-party websites and services. Their privacy practices
          are governed by their own policies, not this Privacy Policy.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest version will always
          be available on this page, and continued use of the service after updates means you
          accept the revised policy.
        </p>
      </section>

      <Footer />
    </main>
  );
}

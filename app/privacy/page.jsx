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
            src="/TMT_Logo_2.png"
            alt="TMT Logo"
            width={40}
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
        <p className="text-sm text-white/50">Last updated: April 10, 2026</p>

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
          with pages, ads, and analytics tools on the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How we use data</h2>
        <p>
          We use collected information to operate the typing service, store your settings,
          save and display scores, maintain leaderboards, support challenge features,
          detect abuse or cheating, improve site performance, analyze usage trends, and
          communicate with you when needed.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Cookies, analytics, and ads</h2>
        <p>
          We use cookies and similar technologies for authentication, saved settings,
          analytics, and advertising. Third-party services such as Google AdSense and
          analytics providers may use cookies or similar tools to measure usage,
          personalize ads where permitted, and improve performance. In some regions,
          ad-related consent choices may be required before personalized advertising is shown.
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
          database, analytics, crash reporting, and advertising partners. We may also disclose
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

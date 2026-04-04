import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

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

      <section className="flex-1 max-w-4xl mx-auto leading-relaxed space-y-4 px-6 py-10">
        <h1 className="text-3xl font-bold text-brand mb-4">Privacy Policy</h1>

        <p>
          This Privacy Policy explains how TheMonkeyType ("we", "our", "us") collects,
          uses, and protects information when you visit themonkeytype.com.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Information We Collect</h2>
        <p>
          We collect limited information needed to operate the typing test,
          leaderboard, and challenge features. This may include usernames, profile
          images, scores, typing statistics, and account identifiers supplied by
          authentication providers such as Clerk.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Cookies, Ads, and Analytics</h2>
        <p>
          We use cookies and similar technologies for authentication, security,
          analytics, and performance measurement. We may also display ads through
          Google AdSense, which can use cookies to personalize ads and measure ad
          performance subject to applicable law and your consent choices.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How We Use Information</h2>
        <p>
          We use collected information to run the service, save your progress,
          display leaderboards, prevent abuse, improve site performance, and
          understand how visitors use the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share limited data with
          service providers that help us operate the site, such as hosting,
          authentication, analytics, database, and advertising partners.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Your Choices</h2>
        <p>
          You can clear browser-stored local data at any time. If you want your
          account data or leaderboard entries reviewed or deleted, contact us at
          <em> support@themonkeytype.com</em>.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Updates</h2>
        <p>
          We may update this Privacy Policy from time to time. The latest version
          will always be posted on this page.
        </p>
      </section>

      <Footer />
    </main>
  );
}

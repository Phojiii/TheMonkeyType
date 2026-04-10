import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Security Policy | TheMonkeyType",
  description: "How to responsibly report security issues affecting TheMonkeyType.",
};

export default function SecurityPolicyPage() {
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
        <h1 className="text-3xl font-bold text-brand mb-2">Security Policy</h1>
        <p className="text-sm text-white/50">Last updated: April 10, 2026</p>

        <p>
          We take security seriously and appreciate responsible disclosure of potential
          vulnerabilities affecting TheMonkeyType.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">How to report a vulnerability</h2>
        <p>
          If you discover a possible security issue, please report it to
          <em> support@themonkeytype.com</em> with a clear description, affected URLs,
          reproduction steps, impact, and any relevant screenshots or proof of concept.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">What we ask from researchers</h2>
        <p>
          Please act in good faith, avoid privacy violations, avoid service disruption,
          and do not access, modify, or delete data that does not belong to you. Do not
          exploit a vulnerability beyond what is reasonably necessary to demonstrate it.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Out of scope behavior</h2>
        <p>
          The following is not permitted: denial-of-service attacks, spam, social engineering,
          credential stuffing, physical attacks, mass scanning that harms availability,
          and attempts to extract third-party secrets or user data unrelated to proving an issue.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Safe harbor</h2>
        <p>
          If you follow this policy and act responsibly, we will treat your research as an
          authorized effort to improve the security of the site. This does not grant permission
          to violate law or access data beyond what is necessary to document a vulnerability.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Response process</h2>
        <p>
          We aim to review legitimate reports promptly, investigate the issue, and take
          reasonable steps toward remediation. Response times may vary depending on severity,
          complexity, and available resources.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Rewards</h2>
        <p>
          At this time, TheMonkeyType does not promise a bug bounty or financial reward for
          vulnerability reports unless explicitly stated otherwise.
        </p>
      </section>

      <Footer />
    </main>
  );
}

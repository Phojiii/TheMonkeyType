import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service | TheMonkeyType",
  description: "Read the terms governing use of TheMonkeyType, including accounts, content, and acceptable use.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-brand mb-2">Terms of Service</h1>
        <p className="text-sm text-white/50">Last updated: April 10, 2026</p>

        <p>
          By using TheMonkeyType ("Service"), you agree to these Terms of Service.
          If you do not agree, please do not use the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Eligibility and acceptable use</h2>
        <p>
          You may use the Service only in compliance with applicable laws. You may not abuse,
          disrupt, reverse engineer, overload, scrape, exploit, or interfere with the website,
          its infrastructure, its ads, its leaderboards, or other users.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Accounts and leaderboards</h2>
        <p>
          If you create an account or submit scores, you are responsible for the information
          associated with your account. We may investigate, moderate, remove, or restrict
          suspicious scores, cheating behavior, automation, or abuse at our discretion.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Prohibited conduct</h2>
        <p>
          You agree not to use bots, scripts, macros, exploits, or automated methods to submit
          scores, manipulate challenges, distort analytics, or bypass restrictions. You also
          agree not to probe, attack, or test the security of the website except as described
          in our Security Policy.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Content and intellectual property</h2>
        <p>
          TheMonkeyType retains ownership of the website, software, branding, design, and
          original content unless otherwise stated. You may not copy, resell, republish, or
          distribute substantial portions of the site without permission.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Third-party services</h2>
        <p>
          Parts of the Service may depend on third-party providers such as authentication,
          analytics, hosting, and advertising platforms. We are not responsible for outages,
          policy changes, or behavior of third-party services beyond our control.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Disclaimer and limitation of liability</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind.
          To the maximum extent permitted by law, TheMonkeyType is not liable for indirect,
          incidental, or consequential damages resulting from your use of the Service.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Termination</h2>
        <p>
          We may suspend or terminate access to the Service if we reasonably believe a user
          is cheating, abusing the platform, violating these terms, or creating risk for the
          website or its users.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Changes to these terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use of the Service
          after changes become effective means you accept the revised terms.
        </p>

        <p className="mt-6">
          Questions about these terms can be sent to <em>support@themonkeytype.com</em>.
        </p>
      </section>

      <Footer />
    </main>
  );
}

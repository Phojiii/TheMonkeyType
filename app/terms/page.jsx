import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/TMT_Logo_2.png" alt="TMT Logo" width={40} height={40} priority />
            <span className="sr-only">TMT - Typing Trainer</span>
          </Link>
          <nav className="text-white/70 flex gap-4 text-sm">
            <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
            <Link href="/stats" className="hover:text-white">Stats</Link>
            <a href="https://github.com" className="hover:text-white" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
        </header>
      <section className="flex-1 max-w-4xl mx-auto leading-relaxed space-y-4 px-6 py-10">
        <h1 className="text-3xl font-bold text-brand mb-4">Terms of Service</h1>

        <p>
          By using TheMonkeyType (“Service”), you agree to these Terms of Service
          and to comply with all applicable laws. If you disagree with any part
          of these terms, please discontinue use of the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Use of the Service</h2>
        <p>
          TheMonkeyType is provided for personal, non-commercial use. You may
          not copy, redistribute, or modify any part of the site without written
          permission. We reserve the right to limit or revoke access in case of
          misuse.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">User Content & Scores</h2>
        <p>
          By submitting scores or a profile, you grant TheMonkeyType a
          non-exclusive right to display that information on our leaderboard.
          We do not claim ownership of your user data and will never sell it.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Limitation of Liability</h2>
        <p>
          The service is provided “as is” without warranties of any kind.
          We are not liable for data loss, downtime, or any damages arising
          from use of the site.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use
          of TheMonkeyType after changes take effect constitutes acceptance of
          the new terms.
        </p>

        <p className="mt-6">
          If you have questions about these terms, contact us at 
          <em>support@themonkeytype.com</em>.
        </p>
      </section>
      <Footer />
    </main>
  );
}

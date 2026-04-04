import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

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

      <section className="flex-1 max-w-4xl mx-auto leading-relaxed space-y-4 px-6 py-10">
        <h1 className="text-3xl font-bold text-brand mb-4">Terms of Service</h1>

        <p>
          By using TheMonkeyType ("Service"), you agree to these Terms of Service
          and to comply with applicable laws. If you do not agree with these terms,
          please stop using the website.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Use of the Service</h2>
        <p>
          TheMonkeyType is intended for personal and lawful use. You may not use the
          service to abuse leaderboards, automate submissions, interfere with the
          website, or attempt to access data or systems you are not authorized to use.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Accounts and Scores</h2>
        <p>
          If you create an account or submit scores, you are responsible for the
          accuracy of the information you provide. We may moderate, remove, or refuse
          suspicious or abusive leaderboard entries at our discretion.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Intellectual Property</h2>
        <p>
          The website design, branding, original text, and software powering the
          service remain the property of TheMonkeyType unless otherwise stated. You
          may not copy or redistribute site materials except as allowed by law.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Disclaimer and Liability</h2>
        <p>
          The service is provided "as is" without warranties of any kind. We do not
          guarantee uninterrupted availability and are not liable for losses resulting
          from downtime, errors, or use of the service.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Changes to These Terms</h2>
        <p>
          We may update these Terms of Service from time to time. Continued use of
          TheMonkeyType after changes become effective means you accept the revised terms.
        </p>

        <p className="mt-6">
          Questions about these terms can be sent to
          <em> support@themonkeytype.com</em>.
        </p>
      </section>

      <Footer />
    </main>
  );
}

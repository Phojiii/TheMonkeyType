import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact | TheMonkeyType",
  description: "Contact TheMonkeyType for support, partnerships, bug reports, or advertising inquiries.",
};

export default function ContactPage() {
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
          <Link href="/about" className="hover:text-white">About</Link>
        </nav>
      </header>

      <section className="flex-1 max-w-4xl mx-auto leading-relaxed space-y-5 px-6 py-10">
        <h1 className="text-3xl font-bold text-brand mb-2">Contact</h1>
        <p className="text-white/80">
          If you need help with your account, want to report a bug, discuss a partnership,
          or reach out about advertising, you can contact TheMonkeyType directly.
        </p>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-brand">Email</h2>
            <p className="mt-1 text-white/80">support@themonkeytype.com</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand">Best for</h2>
            <ul className="mt-2 space-y-2 text-white/75 list-disc pl-5">
              <li>General support and account issues</li>
              <li>Leaderboard or challenge disputes</li>
              <li>Bug reports and feature suggestions</li>
              <li>Business and advertising inquiries</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-brand">Response time</h2>
            <p className="mt-1 text-white/75">
              We aim to respond within 2 to 5 business days.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

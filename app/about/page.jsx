import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-brand mb-4">About TheMonkeyType</h1>
        <p className="text-white/80 leading-relaxed mb-4">
          <strong>TheMonkeyType</strong> is an online typing test built for learners,
          coders, and professionals who want to sharpen their typing speed and accuracy.
          Each session measures your words per minute (WPM) and real-time precision,
          helping you practice and track your progress over time.
        </p>
        <p className="text-white/80 leading-relaxed mb-4">
          You can choose test durations of <strong>15 s</strong>, <strong>30 s</strong>,
          <strong>60 s</strong>, or <strong>120 s</strong> and compare your results on
          our global leaderboard. Every test you take improves your rhythm and hand-eye
          coordination — making TheMonkeyType more than a tool; it's a daily trainer for
          speed and focus.
        </p>
        <p className="text-white/80 leading-relaxed mb-4">
          The platform is privacy-friendly, ad-supported, and built with Next.js.
          No unnecessary trackers — just clean code, fast performance, and a fun,
          competitive typing experience.
        </p>
        <p className="text-white/70 text-sm mt-8">
          For inquiries, collaborations, or reporting bugs, contact us at:
          <br /><strong>support@themonkeytype.com</strong>
        </p>
      </div>
      </section>
      <Footer />
    </main>
  );
}

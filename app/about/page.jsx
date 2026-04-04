import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function AboutPage() {
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
        <h1 className="text-3xl font-bold text-brand mb-4">About TheMonkeyType</h1>

        <p className="text-white/80 leading-relaxed">
          <strong>TheMonkeyType</strong> is an online typing trainer built for learners,
          developers, students, and professionals who want to improve typing speed
          and accuracy through fast, focused practice.
        </p>

        <p className="text-white/80 leading-relaxed">
          The site offers timed tests, local performance tracking, competitive mode,
          public leaderboards, and one-on-one typing challenges. The goal is to make
          daily typing practice feel simple, measurable, and fun.
        </p>

        <p className="text-white/80 leading-relaxed">
          We built TheMonkeyType with a lightweight experience in mind: clean design,
          quick page loads, and useful feedback without unnecessary clutter. Over time,
          we plan to keep expanding the platform with better stats, more practice
          formats, and richer community features.
        </p>

        <p className="text-white/70 text-sm mt-8">
          For inquiries, business requests, bug reports, or AdSense-related contact,
          reach us at:
          <br />
          <strong>support@themonkeytype.com</strong>
        </p>
      </section>

      <Footer />
    </main>
  );
}

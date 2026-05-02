import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import { FaRegKeyboard } from "react-icons/fa";
import { TfiStatsUp } from "react-icons/tfi";
import { BsClipboardData } from "react-icons/bs";
import { LiaBugSolid } from "react-icons/lia";

export const metadata = {
  title: "About | TheMonkeyType",
  description:
    "Learn what TheMonkeyType is, how it works, and how to get the most out of your typing practice.",
};

const highlights = [
  {
    title: "Built for steady practice",
    text: "TheMonkeyType is designed for learners, students, developers, and professionals who want to improve typing speed without losing accuracy.",
  },
  {
    title: "Simple, measurable progress",
    text: "Timed tests, saved stats, leaderboards, and challenge mode help you see growth over time instead of guessing whether you are improving.",
  },
  {
    title: "Fast and lightweight",
    text: "We keep the experience focused: quick loading pages, clear feedback, and a clean interface that stays out of the way while you practice.",
  },
];

const statNotes = [
  {
    label: "WPM",
    text: "Words per minute is based on correctly typed characters, grouped in sets of five, then normalized to one minute.",
  },
  {
    label: "Accuracy",
    text: "Accuracy shows the percentage of keys you pressed correctly during the test.",
  },
  {
    label: "Characters",
    text: "Character totals help you compare correct and incorrect keystrokes after the run is complete.",
  },
  {
    label: "Duration",
    text: "Test duration changes the pace of the run. Short tests reward sharp bursts, while longer tests reveal consistency and focus.",
  },
  {
    label: "Words",
    text: "Words reflects how much correct text you completed, giving a helpful view of both rhythm and control.",
  },
];

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
          <Link href="/leaderboard" className="hover:text-white">
            Leaderboard
          </Link>
          <Link href="/stats" className="hover:text-white">
            Stats
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </nav>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <section className="max-w-6xl mx-auto mt-8 bg-white/5 rounded-[2rem] p-8 md:p-10 border border-white/10">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
              <div className="space-y-5">
                <p className="text-xs uppercase tracking-[0.3em] text-brand/80">
                  About TheMonkeyType
                </p>
                <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                  A friendly place to practice typing with more focus and less noise.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                  TheMonkeyType is an online typing trainer built to help you grow one
                  session at a time. Whether you are learning touch typing, warming up
                  before work, or chasing a higher score, the goal is the same: make
                  practice feel clear, motivating, and easy to return to.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href="/"
                    className="btn-primary"
                  >
                    Start a typing test
                  </Link>
                  <Link
                    href="/blog"
                    className="btn-secondary"
                  >
                    Read our guides
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <h2 className="text-lg font-semibold text-brand">{item.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-white/70">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-brand/15 p-3 text-brand">
                  <FaRegKeyboard className="text-2xl" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold">Quick keybind</h2>
                  <p className="text-xs text-white/55">Stay in flow without reaching for the mouse.</p>
                </div>
              </div>
              <p className="mt-5 text-white/75 leading-7">
                You can press <kbd className="rounded bg-white/10 px-2 py-1 text-white">Tab</kbd>{" "}
                then <kbd className="rounded bg-white/10 px-2 py-1 text-white">Enter</kbd> to restart
                the typing test quickly. It is a small shortcut, but it makes repeat
                practice feel smoother and more natural.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-brand/15 p-3 text-brand">
                  <BsClipboardData className="text-2xl" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold">Results that stay useful</h2>
                  <p className="text-xs text-white/55">Feedback should help you improve, not just impress you.</p>
                </div>
              </div>
              <p className="mt-5 text-white/75 leading-7">
                After each run, your results are there to help you understand what
                happened: how fast you typed, how accurate you were, and how stable your
                pace felt. The idea is not only to chase bigger numbers, but to build
                cleaner habits over time.
              </p>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-brand/15 p-3 text-brand">
                <TfiStatsUp className="text-2xl" />
              </span>
              <div>
                <h2 className="text-2xl font-semibold">How the stats work</h2>
                <p className="text-xs text-white/55">A quick guide to the numbers you see after each test.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {statNotes.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-black/20 p-5"
                >
                  <h3 className="text-lg font-semibold text-brand">{item.label}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-brand/15 p-3 text-brand">
                  <LiaBugSolid className="text-2xl" />
                </span>
                <div>
                  <h2 className="text-2xl font-semibold">Bug reports and feature requests</h2>
                  <p className="text-xs text-white/55">We genuinely want to hear what would make the site better.</p>
                </div>
              </div>
              <p className="mt-5 text-white/75 leading-7">
                If you find a bug, spot confusing behavior, or have an idea that would
                make practice more helpful, please let us know. Friendly feedback from
                real users shapes the best updates.
              </p>
              <p className="mt-4 text-white/75 leading-7">
                You can reach us at <strong>support@themonkeytype.com</strong> or join
                the community through our Discord server from the homepage navigation.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
              <h2 className="text-2xl font-semibold">What we want this site to feel like</h2>
              <p className="mt-4 text-white/75 leading-7">
                Calm, quick, and encouraging. Some people come here to compete. Others
                just want a better daily practice routine. We try to support both by
                keeping the experience straightforward, polite, and easy to enjoy.
              </p>
              <p className="mt-4 text-white/75 leading-7">
                If TheMonkeyType helps you practice a little more consistently or makes
                typing feel less frustrating, then it is doing its job.
              </p>
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

//Ads Component
import InPagePush from "@/components/InPagePush";
import PushNotification from "@/components/PushNotification";
import VignetteBanner from "@/components/VignetteBanner";

import {
  FaBolt,
  FaChartLine,
  FaFlagCheckered,
  FaKeyboard,
  FaListOl,
  FaSignal,
  FaTrophy,
  FaUserFriends,
} from "react-icons/fa";

export const metadata = {
  title: "Guide | TheMonkeyType",
  description:
    "Learn how TheMonkeyType works, including typing tests, rankings, stats, competitive mode, and 1v1 challenges.",
};

const overviewCards = [
  {
    title: "Typing tests",
    text: "Practice with timed tests or fixed word-count tests, then adjust punctuation, numbers, and language.",
    icon: FaKeyboard,
  },
  {
    title: "Rankings",
    text: "Compare your best saved scores on the leaderboard by mode, duration, and region.",
    icon: FaTrophy,
  },
  {
    title: "1v1 challenges",
    text: "Challenge online players to live competitive duels and race on the same shared text.",
    icon: FaUserFriends,
  },
  {
    title: "Stats and history",
    text: "Track local progress over time, review past runs, and keep your challenge history in one place.",
    icon: FaChartLine,
  },
];

const challengeRequirements = [
  "You must be signed in to send or accept a challenge.",
  "The other player must be online recently enough to appear as available.",
  "You cannot challenge yourself.",
  "Only one active or pending challenge can exist between the same two players at a time.",
  "Challenges use competitive mode rules and a shared text for both players.",
];

const rankingRules = [
  "Classic and Competitive are tracked separately.",
  "Each duration category keeps its own best saved result.",
  "Global view compares you against everyone in that mode.",
  "Country view filters rankings by country when country data is available.",
  "All-time view picks each player's strongest entry inside the selected mode, then sorts by WPM, accuracy, and recency.",
];

const statsIncludes = [
  "Best WPM",
  "Best accuracy",
  "Average WPM",
  "Total tests",
  "Total words typed",
  "Performance chart over time",
  "Filtered results by duration",
  "Challenge history with wins, losses, draws, and win rate",
];

const adsAndConsentNotes = [
  "Ad scripts only load after you accept ad consent.",
  "You can continue using the website without accepting ads.",
  "Ads help support hosting, maintenance, and future improvements.",
  "Core typing, guides, rankings, stats, and challenges remain usable even if you decline ad consent.",
];

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.28em] text-brand/75">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold text-white">{title}</h2>
      <div className="mt-5 space-y-4 text-white/75 leading-8">{children}</div>
    </section>
  );
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      <InPagePush />
      <PushNotification />
      <VignetteBanner />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-4 pt-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/TMT_Logo_2_new.png"
            alt="TMT Logo"
            width={150}
            height={40}
            priority
            style={{ width: "auto", height: "auto" }}
          />
          <span className="sr-only">TMT - Typing Trainer</span>
        </Link>
        <nav className="hidden gap-4 text-sm text-white/70 md:flex">
          <Link href="/" className="hover:text-white">
            Test
          </Link>
          <Link href="/leaderboard" className="hover:text-white">
            Leaderboard
          </Link>
          <Link href="/stats" className="hover:text-white">
            Stats
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
        </nav>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand/80">Website Guide</p>
                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                  Everything you need to know about how TheMonkeyType works.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
                  This page is your full guide to the website. It explains how tests work, what the numbers mean,
                  how rankings are calculated, how 1v1 challenges work, how the new word-based tests behave, and
                  what you can expect from pages like Stats, Leaderboard, Blog, and the live lobby.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <Link href="/" className="btn-primary">
                    Start a typing test
                  </Link>
                  <Link href="/leaderboard" className="btn-secondary">
                    Open leaderboard
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3 text-brand">
                  <FaListOl className="text-xl" />
                  <h2 className="text-lg font-semibold text-white">On this page</h2>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-white/70">
                  <a href="#typing-tests" className="hover:text-white">1. Typing tests</a>
                  <a href="#competitive-mode" className="hover:text-white">2. Competitive mode</a>
                  <a href="#leaderboard" className="hover:text-white">3. Leaderboard and rankings</a>
                  <a href="#challenges" className="hover:text-white">4. Live challenges</a>
                  <a href="#stats-page" className="hover:text-white">5. Stats page</a>
                  <a href="#accounts" className="hover:text-white">6. Accounts and saved data</a>
                  <a href="#ads-and-consent" className="hover:text-white">7. Ads and consent</a>
                  <a href="#tips" className="hover:text-white">8. Tips and common questions</a>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overviewCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
                    <Icon className="text-2xl" />
                  </span>
                  <h2 className="mt-4 text-xl font-semibold">{card.title}</h2>
                  <p className="mt-2 text-sm leading-7 text-white/70">{card.text}</p>
                </div>
              );
            })}
          </section>

          <Section id="typing-tests" eyebrow="Core Experience" title="Typing tests">
            <p>
              TheMonkeyType is built around two main test styles: timed tests and fixed word-count tests. In timed
              mode, you type for the selected duration. In word mode, you finish a chosen number of words such as
              10, 25, 50, or 100, and the result shows how quickly and cleanly you completed them.
            </p>
            <p>
              Before starting a test, you can change language, duration, punctuation, and number settings. Shorter
              timed tests like 15 seconds reward quick bursts, while longer tests like 60 or 120 seconds reveal consistency,
              endurance, and rhythm. Word mode is useful when you want a fixed-size challenge instead of a countdown.
            </p>
            <p>
              Useful shortcut: press <kbd className="rounded bg-white/10 px-2 py-1 text-white">Tab</kbd> and then{" "}
              <kbd className="rounded bg-white/10 px-2 py-1 text-white">Enter</kbd> to restart quickly.
            </p>
          </Section>

          <Section id="competitive-mode" eyebrow="Scoring Rules" title="Competitive mode">
            <p>
              Competitive mode is a stricter version of the typing test. It is designed for more serious comparison
              and is also the mode used in live 1v1 challenges.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <FaBolt className="text-brand" />
                  <h3 className="text-lg font-semibold">Key rule</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  In competitive mode, pressing Backspace does not erase mistakes normally. Instead, each Backspace
                  adds a time penalty. This makes accuracy matter more during pressure situations.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <FaFlagCheckered className="text-brand" />
                  <h3 className="text-lg font-semibold">Why it exists</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Competitive mode creates a fairer head-to-head format by rewarding clean typing under pressure
                  instead of heavy correction after mistakes.
                </p>
              </div>
            </div>
          </Section>

          <Section id="leaderboard" eyebrow="Public Rankings" title="How the leaderboard works">
            <p>
              The leaderboard tracks best saved results, not every single run. It separates results by mode and
              duration, so a player&apos;s classic 60-second result does not overwrite their competitive 60-second result.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-white/75">
              {rankingRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p>
              You can also use the <strong>Update Records</strong> action on the leaderboard to sync your strongest local
              runs back to your online record when you are signed in.
            </p>
          </Section>

          <Section id="challenges" eyebrow="Live Play" title="How 1v1 challenges work">
            <p>
              The live lobby shows recently online players. If you are signed in, you can challenge someone directly
              from the lobby or from the competitive leaderboard.
            </p>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center gap-3">
                <FaUserFriends className="text-brand" />
                <h3 className="text-lg font-semibold">Challenge requirements</h3>
              </div>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-white/70">
                {challengeRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p>
              Once a challenge is accepted, both players type the same generated text. The winner is decided by WPM
              first, then accuracy, then finish time if the scores are still tied. If one player finishes first, the
              other player can still submit and the result will update when both sides are in.
            </p>
          </Section>

          <Section id="stats-page" eyebrow="Personal Progress" title="What the Stats page contains">
            <p>
              The Stats page is your local progress dashboard. It helps you understand not only your best scores,
              but also how your typing changes over time.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <FaChartLine className="text-brand" />
                  <h3 className="text-lg font-semibold">Typing history</h3>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-white/70">
                  {statsIncludes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <FaSignal className="text-brand" />
                  <h3 className="text-lg font-semibold">How to read it</h3>
                </div>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  The chart helps you spot trends over time. The results table helps you inspect specific sessions.
                  Challenge history gives you a personal record of wins, losses, draws, and the opponents you played.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Most of this page is powered by local browser storage, which means it follows your current device
                  and browser unless you sync or export it elsewhere later.
                </p>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Word-mode results and details like backspace usage are useful for personal review, but only the
                  standard timed records are used for leaderboard syncing.
                </p>
              </div>
            </div>
          </Section>

          <Section id="accounts" eyebrow="Accounts and Data" title="What is saved locally and what is saved online">
            <p>
              Some parts of the site are public, while others depend on being signed in. You can practice without an
              account, but account-based features give you online identity, rankings, and challenge access.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-brand">Saved locally</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Preferences, many past test runs, filtered stats views, and challenge history are stored in your
                  browser so your experience feels fast and personal. That also includes newer result details such as
                  word-mode runs and local challenge history.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-brand">Saved online</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  Best scores used for the leaderboard, your signed-in identity, and active challenge state are stored
                  online so they can be shared across rankings and multiplayer features.
                </p>
              </div>
            </div>
          </Section>

          <Section id="ads-and-consent" eyebrow="Website Support" title="Ads and consent">
            <p>
              TheMonkeyType now uses ads in selected parts of the website to help support hosting, maintenance,
              and future feature work. Because of that, the site includes a bottom consent banner before ad scripts
              are loaded.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-white/75">
              {adsAndConsentNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
            <p>
              The goal is to stay transparent about how the site is supported while keeping practice accessible for
              people who prefer not to load ads.
            </p>
          </Section>

          <Section id="tips" eyebrow="Helpful Notes" title="Tips and common questions">
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-brand">Why is my leaderboard rank different from my latest run?</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  The leaderboard only reflects your best saved results for the selected mode and duration, not every
                  session. A recent lower score will not push your best rank down.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-brand">Why can&apos;t I challenge someone?</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  Usually because you are not signed in, the other player is offline, or there is already an active
                  or pending challenge between the same two accounts.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <h3 className="text-lg font-semibold text-brand">Where should I start?</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">
                  Start with classic 60-second tests or 25-word sessions, focus on accuracy first, and only use
                  competitive mode once you feel comfortable typing without heavy correction.
                </p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export const metadata = {
  title: "FAQ | TheMonkeyType",
  description:
    "Answers to common questions about typing tests, scores, rankings, accounts, beginner lessons, privacy, and support on TheMonkeyType.",
};

const faqs = [
  {
    question: "What is TheMonkeyType and who is it for?",
    answer:
      "TheMonkeyType is a browser-based typing trainer designed for students, professionals, developers, and beginners who want a cleaner place to improve typing speed and accuracy. It supports short daily practice, longer consistency sessions, guided beginner lessons, public rankings, and live challenge features.",
  },
  {
    question: "What is the difference between time mode and word mode?",
    answer:
      "Time mode measures how well you type within a chosen countdown such as 15, 30, 60, or 120 seconds. Word mode gives you a fixed target like 10, 25, 50, or 100 words and measures how fast and accurately you complete that set. Time mode is useful for rhythm and endurance, while word mode is useful for fixed-size practice goals.",
  },
  {
    question: "How is WPM calculated?",
    answer:
      "Words per minute is calculated from correctly typed characters, grouped into sets of five, and then normalized to a one-minute rate. That means WPM is not simply based on how many words visually appear on the screen. It is intended to provide a more consistent performance measurement across different tests.",
  },
  {
    question: "What does accuracy mean on the results screen?",
    answer:
      "Accuracy reflects how many of your keystrokes matched the expected input. A strong typing score is not only about speed. Accuracy helps you understand whether you are typing cleanly or relying too much on corrections. In normal tests, backspace count is also shown in the results so you can judge how correction-heavy a run felt.",
  },
  {
    question: "What is competitive mode?",
    answer:
      "Competitive mode is a stricter rule set designed for more serious comparison. It is also the rule set used during live player challenges. In competitive mode, backspace creates a time penalty instead of acting like a normal correction tool, so cleaner typing matters more under pressure.",
  },
  {
    question: "How do rankings work?",
    answer:
      "Rankings are based on best saved results rather than every test you ever run. Classic and competitive scores are tracked separately, and different duration categories keep their own best results. Global rankings compare all eligible users, while country-based views use available regional data when present.",
  },
  {
    question: "How do live challenges work?",
    answer:
      "If another player is online, you can challenge them to a 1v1 typing duel. Both players receive the same text and compete under the challenge rule set. The winner is decided primarily by WPM, then accuracy, and then finish timing if needed. You must be signed in to send or accept challenges, and you cannot challenge yourself.",
  },
  {
    question: "What is saved locally and what is saved online?",
    answer:
      "Some progress is stored locally in your browser, such as certain personal practice history and lesson-related data. Account-based features such as online identity, profile information, leaderboard participation, challenges, and synced results depend on signed-in storage. This mix helps the website stay lightweight for casual practice while still supporting richer competitive features.",
  },
  {
    question: "What is Beginner Mode?",
    answer:
      "Beginner Mode is a guided training path built for users who are learning key placement and typing habits from the ground up. It uses a lesson-based structure, an on-screen keyboard, and hand guidance to help new typists understand which fingers should be used for different keys. Lessons can be retried, advanced manually, and reviewed later from saved lesson progress.",
  },
  {
    question: "What is focus mode in beginner lessons?",
    answer:
      "Focus mode is designed to reduce distractions while you are practicing guided lessons. It keeps attention on the active lesson and keyboard training area. In the latest beginner flow, focus mode activates when a lesson begins and exits when the lesson is completed, which makes the learning experience feel more controlled and less cluttered.",
  },
  {
    question: "Do I need an account to use the site?",
    answer:
      "No. You can use the core typing test experience without signing in. However, signing in unlocks features like profiles, public rankings, synced results, challenges, and better continuity across devices. If you want the social and competitive side of the website, an account is strongly recommended.",
  },
  {
    question: "How do I contact support or report a bug?",
    answer:
      "You can use the Contact page to send support requests, bug reports, feedback, feature suggestions, or partnership inquiries. The form supports categories and optional images, which makes it easier to send screenshots when something breaks or behaves unexpectedly.",
  },
  {
    question: "Does TheMonkeyType use advertising cookies?",
    answer:
      "The site may use third-party advertising technologies, including Google AdSense, and those services may rely on cookies or similar technologies to serve ads, measure performance, and personalize experiences where allowed. For more detail, the Privacy Policy explains advertising cookies, third-party vendors, user choices, and consent considerations.",
  },
  {
    question: "How can I improve faster on the site?",
    answer:
      "The best improvement comes from short, repeatable sessions with a focus on clean typing. Beginners should work on accuracy and finger placement first. Intermediate typists should alternate between shorter bursts and longer sessions. Advanced typists should review accuracy, backspace use, and consistency instead of chasing only peak speed numbers.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
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
        <nav className="text-white/70 flex gap-4 text-sm">
          <Link href="/guide" className="hover:text-white">Guide</Link>
          <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-brand/80">Frequently Asked Questions</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
              Clear answers about typing tests, rankings, beginner mode, accounts, privacy, and support.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              This page collects the most common questions users ask about TheMonkeyType. It is here to make the
              website easier to understand before you start practicing, competing, or reaching out for help.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/" className="btn-primary">Start typing</Link>
              <Link href="/guide" className="btn-secondary">Read full guide</Link>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {faqs.map((item) => (
              <article key={item.question} className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-7">
                <h2 className="text-xl font-semibold text-brand">{item.question}</h2>
                <p className="mt-4 text-sm leading-8 text-white/74 md:text-[15px]">{item.answer}</p>
              </article>
            ))}
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

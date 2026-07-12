import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  FaBolt,
  FaBookOpen,
  FaGlobe,
  FaKeyboard,
  FaListAlt,
  FaMobileAlt,
  FaRegUserCircle,
  FaRocket,
  FaShieldAlt,
  FaTrophy,
  FaUserFriends,
} from "react-icons/fa";

export const metadata = {
  title: "Release Notes | TheMonkeyType",
  description:
    "Read the full release history of TheMonkeyType, from the first launch through major updates like competitive mode, live challenges, profiles, beginner mode, blogs, guides, and more.",
};

const releases = [
  {
    version: "Day One",
    title: "The first public typing experience",
    icon: FaKeyboard,
    summary:
      "TheMonkeyType started with the core practice flow: fast typing tests, a clean dark interface, timing controls, and the foundation for a focused typing experience.",
    updates: [
      "Core timed typing tests went live.",
      "The original minimalist typing layout and result flow were introduced.",
      "Basic speed and accuracy tracking became part of each run.",
    ],
  },
  {
    version: "V1",
    title: "Stats and leaderboard foundation",
    icon: FaTrophy,
    summary:
      "Once the main test loop was stable, the site expanded into progress tracking and public comparison.",
    updates: [
      "Stats pages were added to help users review typing progress.",
      "Leaderboard support was introduced for saved records and public ranking.",
      "Result tracking became more useful for repeat practice and performance comparison.",
    ],
  },
  {
    version: "V2",
    title: "Content, structure, and site readiness",
    icon: FaBookOpen,
    summary:
      "The website grew from a tool into a fuller product with pages, policies, support content, and blog infrastructure.",
    updates: [
      "Blog pages were added for typing guides, articles, and updates.",
      "About, Contact, Privacy Policy, Terms of Service, and Security Policy pages were created.",
      "Guide content was introduced to explain rankings, stats, challenges, and site features.",
      "The footer and shared page structure were expanded to support the larger site.",
    ],
  },
  {
    version: "V3",
    title: "Competitive mode arrives",
    icon: FaBolt,
    summary:
      "TheMonkeyType moved beyond casual practice by introducing a stricter ruleset for more serious sessions.",
    updates: [
      "Competitive mode was added as a dedicated typing mode.",
      "Backspace penalties were introduced to make clean typing matter more under pressure.",
      "Competitive leaderboard support was separated from classic mode records.",
      "Competitive stats and scoring behavior were aligned for fairer comparisons.",
    ],
  },
  {
    version: "V4",
    title: "Live 1v1 challenges and presence",
    icon: FaUserFriends,
    summary:
      "Real-time interaction became part of the product with online presence, challenge requests, and live typing duels.",
    updates: [
      "Presence tracking and online player visibility were added.",
      "Players can challenge available users to a live 1v1 typing duel.",
      "Challenge accept and reject flows were introduced.",
      "Shared-text challenge racing was added for direct player-versus-player competition.",
      "Challenge history and challenge outcomes became part of user progress tracking.",
    ],
  },
  {
    version: "V5",
    title: "Word-count tests and richer result details",
    icon: FaListAlt,
    summary:
      "The test system expanded beyond timer-only sessions to support fixed targets and more useful feedback.",
    updates: [
      "Word-based tests were added alongside timed tests.",
      "Users can now practice fixed lengths like 10, 25, 50, and 100 words.",
      "Result modals were expanded to show word targets, time, characters, and backspace counts.",
      "The typing controls were updated to switch between time and words more naturally.",
    ],
  },
  {
    version: "V6",
    title: "Profiles, sharing, and connected identity",
    icon: FaRegUserCircle,
    summary:
      "The website gained a more personal layer with public profiles, profile editing, and sharable results.",
    updates: [
      "Public user profiles were introduced.",
      "Profile editing support was added for bio, title, layout, and social links.",
      "Profile stats, placements, and personal best information were brought together on profile pages.",
      "Result sharing cards were added so runs can be downloaded or shared more easily.",
      "Discord-linked personal best announcements became part of the connected user experience.",
    ],
  },
  {
    version: "V7",
    title: "Mobile polish and UI refresh",
    icon: FaMobileAlt,
    summary:
      "A major UI pass made the website cleaner, more consistent, and far more usable across screen sizes.",
    updates: [
      "Mobile layouts were redesigned for the home page and leaderboard.",
      "Buttons, controls, and navigation styling were unified across the site.",
      "The live lobby panel and footer interactions were refined for better usability.",
      "General layout polish improved readability, spacing, and day-to-day flow.",
    ],
  },
  {
    version: "V8",
    title: "Guides, release communication, and admin tools",
    icon: FaGlobe,
    summary:
      "The site became easier to maintain and easier for users to understand through internal tooling and documentation.",
    updates: [
      "Admin blog editing was added to manage blog posts directly from the site.",
      "Announcement tooling and site update messaging were improved.",
      "Guide coverage expanded to explain the platform more clearly.",
      "Dedicated release communication became part of the product workflow.",
    ],
  },
  {
    version: "V9",
    title: "Beginner Mode launches",
    icon: FaRocket,
    summary:
      "TheMonkeyType now supports learners from their very first lessons with a guided beginner training experience.",
    updates: [
      "Beginner Mode was introduced as a structured lesson path.",
      "Thirty lessons were added to take users from basic anchor keys toward broader keyboard coverage.",
      "The guided keyboard and finger hints were added to support learning placement and movement.",
      "Lesson progression, local beginner records, retry flow, next lesson flow, and manual lesson selection were introduced.",
      "Lesson scores can be reset from the profile page when users want to start over.",
      "Focus mode was integrated into beginner lessons to reduce distractions during guided practice.",
    ],
  },
  {
    version: "V10",
    title: "Contact form, Discord support, and beginner focus polish",
    icon: FaBookOpen,
    summary:
      "This release makes it easier for users to reach the team directly and smooths out the guided beginner lesson flow.",
    updates: [
      "The Contact page was upgraded with a full submission form.",
      "Guests can now send support requests, bug reports, feature ideas, and business inquiries without signing in.",
      "Signed-in users can include their username automatically in submissions.",
      "Category-based contact submissions help organize support, reports, and feedback.",
      "Optional image attachments were added for screenshots and issue evidence.",
      "Every contact submission is now sent directly to the team through Discord for faster review.",
      "Beginner Mode focus flow was improved so focus mode now activates automatically when a lesson starts.",
      "Beginner lesson focus mode now exits cleanly when the lesson is completed.",
    ],
  },
  {
    version: "Today",
    title: "TheMonkeyType as it exists now",
    icon: FaShieldAlt,
    summary:
      "The current website combines guided learning, competitive play, personal progress, public identity, editorial content, and polished navigation in one place.",
    updates: [
      "Classic tests, competitive mode, beginner lessons, stats, profiles, blogs, guides, and live challenges now work as part of one connected product.",
      "Site pages, policies, support information, and release notes now make the platform easier to trust, understand, and revisit.",
      "The product continues to grow through practical improvements aimed at both new typists and competitive users.",
    ],
  },
];

function ReleaseCard({ release }) {
  const Icon = release.icon;

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
              <Icon className="text-2xl" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-brand/75">{release.version}</p>
              <h2 className="mt-1 text-2xl font-semibold text-white md:text-3xl">{release.title}</h2>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-white/72 md:text-base">
            {release.summary}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {release.updates.map((update) => (
          <div
            key={update}
            className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white/72"
          >
            {update}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ReleaseNotesPage() {
  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
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
          <Link href="/guide" className="hover:text-white">
            Guide
          </Link>
          <Link href="/about" className="hover:text-white">
            About
          </Link>
          <Link href="/blog" className="hover:text-white">
            Blog
          </Link>
        </nav>
      </header>

      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand/80">Release Notes</p>
                <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
                  The full story of how TheMonkeyType has grown from day one.
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
                  This page is the running product history of the website. It collects the major updates,
                  feature launches, improvements, content additions, and experience changes that shaped
                  TheMonkeyType into what it is today.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <Link href="/" className="btn-primary">
                    Start a typing test
                  </Link>
                  <Link href="/guide" className="btn-secondary">
                    Read the guide
                  </Link>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center gap-3 text-brand">
                  <FaRocket className="text-xl" />
                  <h2 className="text-lg font-semibold text-white">Highlights</h2>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-white/70">
                  <p>Core typing tests and results</p>
                  <p>Stats and leaderboard tracking</p>
                  <p>Competitive mode and live 1v1 duels</p>
                  <p>Blogs, guides, support, and policy pages</p>
                  <p>Profiles, share cards, and Discord integrations</p>
                  <p>Mobile UI refresh and Beginner Mode</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
                <FaKeyboard className="text-2xl" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Practice</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Timed tests, word-count tests, beginner lessons, and focused typing sessions.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
                <FaTrophy className="text-2xl" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Competition</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Separate classic and competitive rankings, plus live online challenges.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
                <FaRegUserCircle className="text-2xl" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Identity</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Profiles, social links, personal bests, lesson records, and share cards.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <span className="inline-flex rounded-2xl bg-brand/15 p-3 text-brand">
                <FaBookOpen className="text-2xl" />
              </span>
              <h2 className="mt-4 text-xl font-semibold">Content</h2>
              <p className="mt-2 text-sm leading-7 text-white/70">
                Guides, blog posts, release notes, support pages, and product communication.
              </p>
            </div>
          </section>

          <div className="space-y-6">
            {releases.map((release) => (
              <ReleaseCard key={`${release.version}-${release.title}`} release={release} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

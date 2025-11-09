import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-brand mb-4">Privacy Policy</h1>

        <p>
          This Privacy Policy explains how TheMonkeyType (“we”, “our”, “us”)
          collects, uses, and protects the information of visitors to our
          website themonkeytype.com.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Information We Collect</h2>
        <p>
          We collect limited data necessary to operate the typing test and
          leaderboard — such as usernames, scores, and performance statistics.
          If you sign in via Clerk, we store your user ID and profile image.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Cookies & Analytics</h2>
        <p>
          We use cookies and similar technologies for authentication and
          analytics. Google AdSense may also use cookies to serve relevant ads
          based on your interaction with this and other websites.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Data Security</h2>
        <p>
          All communication with our servers is encrypted via HTTPS. We do not
          sell, trade, or share your personal information with third parties
          beyond services essential to site operation (e.g., Clerk, MongoDB,
          Google AdSense).
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Your Choices</h2>
        <p>
          You can clear local typing data stored in your browser at any time.
          If you wish to delete your account or leaderboard data, please contact
          us at <em>support@themonkeytype.com</em>.
        </p>

        <h2 className="text-xl font-semibold text-brand mt-6">Updates</h2>
        <p>
          We may revise this Privacy Policy occasionally. The latest version
          will always be available on this page.
        </p>
      </section>
      <Footer />
    </main>
  );
}

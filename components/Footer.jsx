import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-black/20 fixed pt-6 bottom-0 right-0">
        <div className="max-w-6xl mx-auto px-6 pb-6 text-xs text-white/50 flex flex-wrap justify-center gap-4 ">
            <Link href="/about">About</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <span>© {new Date().getFullYear()} TheMonkeyType</span>
            <span>#323437 / #E2B714 • Roboto Mono</span>
        </div>
    </footer>
  );
}
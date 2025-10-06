'use client';
import { useEffect, useState } from "react";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import { gsap } from "gsap";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [lang, setLang] = useState("english");
  const [duration, setDuration] = useState(60);
  const [paragraph, setParagraph] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadParagraph(selectedLang = lang) {
    setLoading(true);
    try {
      const r = await fetch(`/api/paragraph?lang=${encodeURIComponent(selectedLang)}`, { cache: "no-store" });
      const data = await r.json();
      setParagraph(data.paragraph || "");
    } catch (e) {
      setParagraph("keep calm and type on — if this text appears your paragraph fetch failed");
    } finally {
      setLoading(false);
    }
  }

  // page entrance
  useEffect(() => {
    gsap.fromTo(".page-stagger", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" });
  }, []);

  // fetch a random paragraph on first load & whenever language changes
  useEffect(() => { loadParagraph(lang); }, [lang]);

  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      {/* Top header */}
      <header className="page-stagger w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/TMT_Logo.png" alt="TMT Logo" width={80} height={40} priority />
          <span className="sr-only">TMT - Typing Trainer</span>
        </Link>
        <nav className="text-white/70 flex gap-4 text-sm">
          <Link href="/test" className="hover:text-white">Test</Link>
          <Link href="/focus" className="hover:text-white">Focus</Link>
          <a href="https://github.com" className="hover:text-white" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </header>

      {/* Controls bar */}
      <div className="page-stagger">
        <TopBar lang={lang} setLang={setLang} duration={duration} setDuration={setDuration} />
      </div>

      {/* Centered typing area */}
      <section className="flex-1 page-stagger flex items-start md:items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl">
          {/* Reroll + tiny controls */}
          <div className="mb-4 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => loadParagraph(lang)}
              className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 hover:bg-white/15 transition"
              aria-label="Get a different paragraph"
              title="Get a different paragraph"
            >
              ↻ Reroll text
            </button>
            <span className="text-white/40">•</span>
            <span className="text-white/60">Language: <span className="text-white">{lang}</span></span>
            <span className="text-white/40">•</span>
            <span className="text-white/60">Duration: <span className="text-white">{duration}s</span></span>
          </div>

          {loading ? (
            <div className="skeleton h-40 w-full max-w-5xl mx-auto" />
          ) : paragraph ? (
            <TypingTest text={paragraph} durationSec={duration} />
          ) : (
            <div className="text-center text-white/60">No paragraph loaded.</div>
          )}
        </div>
      </section>

      {/* Footer (optional, minimal) */}
      <footer className="page-stagger w-full max-w-6xl mx-auto px-6 pb-6">
        <div className="text-xs text-white/40 flex items-center justify-between">
          <span>TMT © {new Date().getFullYear()}</span>
          <span>#323437 / #E2B714 • Roboto Mono</span>
        </div>
      </footer>
    </main>
  );
}

'use client';
import { useEffect, useRef, useState, useCallback } from "react";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import { makeStreamGenerator } from "@/lib/textbanks";
import Link from "next/link";
import Image from "next/image";
import AdUnit from "@/components/AdUnit";
import Footer from "@/components/Footer";

const PREF_KEY = "tmt_prefs";

export default function Home() {
  // ---- preferences (load from localStorage once)
  const [lang, setLang] = useState("english");
  const [duration, setDuration] = useState(60);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);

  // focus mode
  const [focus, setFocus] = useState(false);

  // text streaming
  const genRef = useRef(null);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0); // remount TypingTest cleanly

  // results modal trigger (handled inside TypingTest but we lift a boolean)
  const [testCompleted, setTestCompleted] = useState(false);

  // ---- load prefs once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.lang) setLang(p.lang);
      if (Number.isFinite(p.duration)) setDuration(p.duration);
      if (typeof p.punctuation === "boolean") setPunctuation(p.punctuation);
      if (typeof p.numbers === "boolean") setNumbers(p.numbers);
    } catch {}
  }, []);

  // store prefs when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ lang, duration, punctuation, numbers })
      );
    } catch {}
  }, [lang, duration, punctuation, numbers]);

  // ---- generator (and restart)
  const rebuildGenerator = useCallback(() => {
    setLoading(true);
    try {
      genRef.current = makeStreamGenerator({ lang, punctuation, numbers });
      const chunk = genRef.current.nextChunk(80);
      setInitialText(chunk);
    } catch (e) {
      console.error("Generator error:", e);
      setInitialText("keep calm and type on — generator failed to produce text");
    }
    // clean remount and state
    setSessionId((s) => s + 1);
    setFocus(false);
    setTestCompleted(false);
    setLoading(false);
  }, [lang, punctuation, numbers]);

  // Rebuild when language/punctuation/numbers change.
  // (Duration is handled inside TypingTest for accurate countdown reset.)
  useEffect(() => {
    rebuildGenerator();
  }, [lang, punctuation, numbers, rebuildGenerator]);

  // Stable "supplyMore" for TypingTest
  const supplyMore = useCallback(async () => {
    if (!genRef.current) return "";
    try {
      return genRef.current.nextChunk(60);
    } catch (e) {
      console.error("SupplyMore error:", e);
      return "";
    }
  }, []);

  // Keyboard shortcut: Tab + Enter to restart and shuffle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && e.getModifierState("Tab")) {
        e.preventDefault();
        rebuildGenerator();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rebuildGenerator]);

  const handleTestComplete = () => setTestCompleted(true);

  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      {/* Header (hidden in focus mode) */}
      {!focus && (
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
      )}

      {/* Controls (hidden in focus mode) */}
      {!focus && (
        <TopBar
          lang={lang} setLang={setLang}
          duration={duration} setDuration={setDuration}
          punctuation={punctuation} setPunctuation={setPunctuation}
          numbers={numbers} setNumbers={setNumbers}
        />
      )}

      <section className="flex-1 flex items-start md:items-center justify-center px-6 py-10">
        <div className="w-full max-w-5xl">
          {loading ? (
            <div className="skeleton h-40 w-full max-w-5xl mx-auto" />
          ) : (
            <TypingTest
              key={sessionId}
              initialText={initialText}
              supplyMore={supplyMore}
              durationSec={duration}
              focusMode={focus}
              onFocusStart={() => setFocus(true)}
              onFocusEnd={() => setFocus(false)}
              onRestart={rebuildGenerator}
              onTestComplete={handleTestComplete}
              showResults={testCompleted}
            />
          )}

          {/* Restart button (always shown; matches Tab+Enter) */}
          <div className="mb-4 mt-4 flex items-center justify-center gap-3 text-sm">
            <button
              onClick={rebuildGenerator}
              className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 hover:bg-white/15 transition"
              aria-label="Restart test"
              title="Restart test"
            >
              ↻ Restart
            </button>
          </div>

          {/* Hotkey hint (always visible, including focus mode) */}
          <div className="flex flex-col items-center justify-center text-center mt-10">
            <span className="mt-1 text-[11px] text-white/40 tracking-wide">
              <kbd className="bg-white/10 px-1 rounded">Tab</kbd> + <kbd className="bg-white/10 px-1 rounded">Enter</kbd> — Restart Test
            </span>
          </div>
        </div>
      </section>

      {/* Ads (keep as-is; you can also hide during focus if you prefer) */}
      <aside className="absolute right-0 top-1/4">
        {!loading && <AdUnit
          slot="9194878710"
          fixed
          style={{ display: "block", width: 300, height: 250 }}
          format="rectangle"
          responsive={false}
        />}
      </aside>
      <div style={{ maxWidth: "100%", margin: "24px auto 0" }}>
        {!loading && <AdUnit slot="6053710056" style={{ display: "block", width: "100%" }} /> }
      </div>

      {/* Footer (hidden in focus mode) */}
      {!focus && (
        <Footer />
      )}
    </main>
  );
}

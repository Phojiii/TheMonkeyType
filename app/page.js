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

  // ✅ NEW: Competitive mode
  const [competitiveMode, setCompetitiveMode] = useState(false);

  // focus mode
  const [focus, setFocus] = useState(false);

  // text streaming
  const genRef = useRef(null);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);

  // results modal trigger
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
      if (typeof p.competitiveMode === "boolean") setCompetitiveMode(p.competitiveMode);
    } catch {}
  }, []);

  // store prefs when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ lang, duration, punctuation, numbers, competitiveMode })
      );
    } catch {}
  }, [lang, duration, punctuation, numbers, competitiveMode]);

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
    setSessionId((s) => s + 1);
    setFocus(false);
    setTestCompleted(false);
    setLoading(false);
  }, [lang, punctuation, numbers]);

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
      {focus && <div className="mt-20"></div>}

      {/* Header (hidden in focus mode) */}
      {!focus && (
        <header className="w-full max-w-6xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
          <Link href="/" className="md:flex hidden items-center gap-3">
            <Image src="/TMT_Logo_2.png" alt="TMT Logo" width={40} height={40} priority />
            <span className="sr-only">TMT - Typing Trainer</span>
          </Link>
          <nav className="text-white/70 text-sm text-center block md:m-0 m-auto">
            <Link href="https://discord.gg/5G2WvTYbPR" className="hover:text-white mx-2">Discord</Link>
            <Link href="/stats" className="hover:text-white mx-2">Stats</Link>
            <a href="https://github.com" className="hover:text-white mx-2" target="_blank" rel="noreferrer">GitHub</a>
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
        <h1 className="sr-only">Master Your Typing Speed with a Customizable, Minimalist Typing Test with The Monkey Type</h1>
        <h2 className="sr-only">Compare Your Typing Speed: Words-Per-Minute (WPM) Tool</h2>
        <h2 className="sr-only">Free Online Typing tool that gives you different typing modes</h2>
        <h2 className="sr-only">Improve your typing accuracy with a free test on The Monkey Type</h2>

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
              // ✅ NEW
              competitiveMode={competitiveMode}
            />
          )}

          {/* Buttons */}
          <div className="mb-4 mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              onClick={rebuildGenerator}
              className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 hover:bg-white/15 transition"
              aria-label="Restart test"
              title="Restart test"
            >
              ↻ Restart
            </button>

            {/* ✅ Competitive Mode toggle */}
            <button
              onClick={() => setCompetitiveMode(v => !v)}
              className={`px-3 py-1.5 rounded-md border transition ${
                competitiveMode
                  ? "bg-brand text-ink border-brand shadow-[0_0_10px_rgba(226,183,20,0.35)]"
                  : "bg-white/10 text-white border-white/10 hover:bg-white/15"
              }`}
              aria-label="Toggle competitive mode"
              title="Competitive Mode"
            >
              🏁 Competitive: {competitiveMode ? "ON" : "OFF"}
            </button>

            {competitiveMode && (
              <span className="text-xs text-white/50">
                Backspace = -0.5s penalty
              </span>
            )}
          </div>

          {/* Hotkey hint */}
          <div className="flex flex-col items-center justify-center text-center mt-10">
            <span className="mt-1 text-[11px] text-white/40 tracking-wide">
              <kbd className="bg-white/10 px-1 rounded">Tab</kbd> +{" "}
              <kbd className="bg-white/10 px-1 rounded">Enter</kbd> — Restart Test
            </span>
          </div>
        </div>
      </section>

      {/* Ads */}
      <aside className="absolute right-0 top-1/4">
        {!loading && (
          <AdUnit
            slot="9194878710"
            fixed
            style={{ display: "block", width: 300, height: 250 }}
            format="rectangle"
            responsive={false}
          />
        )}
      </aside>

      <div style={{ maxWidth: "100%", margin: "24px auto 0" }}>
        {!loading && <AdUnit slot="6053710056" style={{ display: "block", width: "100%" }} />}
      </div>

      {/* Footer */}
      {!focus && <Footer />}
    </main>
  );
}

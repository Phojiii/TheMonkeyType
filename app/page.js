'use client';
import { useEffect, useRef, useState, useCallback } from "react";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import { makeStreamGenerator } from "@/lib/textbanks";
import Link from "next/link";
import Image from "next/image";
import AdUnit from "@/components/AdUnit";

export default function Home() {
  const [lang, setLang] = useState("english");
  const [duration, setDuration] = useState(60);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [focus, setFocus] = useState(false);

  const genRef = useRef(null);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0); // remount TypingTest cleanly

  // Track if test is completed to control result display
  const [testCompleted, setTestCompleted] = useState(false);

  // Rebuild generator and reset test state
  const rebuildGenerator = useCallback(() => {
    setLoading(true);
    genRef.current = makeStreamGenerator({ lang, punctuation, numbers });
    const chunk = genRef.current.nextChunk(80);
    setInitialText(chunk);
    setSessionId(s => s + 1);
    setFocus(false);
    setLoading(false);
    setTestCompleted(false); // Reset result state
  }, [lang, punctuation, numbers]);

  // Rebuild whenever options change (language/toggles)
  useEffect(() => { rebuildGenerator(); }, [lang, punctuation, numbers, rebuildGenerator]);

  async function supplyMore() {
    if (!genRef.current) return "";
    return genRef.current.nextChunk(60);
  }

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

  // Handler to be called when test completes
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
            <Link href="/test" className="hover:text-white">TMT</Link>
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
          {/* Helper row (hidden in focus mode) */}
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
          {!focus && (
            <div className="mb-4 mt-4 flex items-center justify-center gap-3 text-sm">
              <button
                onClick={rebuildGenerator}
                className="px-3 py-1.5 rounded-md bg-white/10 border border-white/10 hover:bg-white/15 transition"
                aria-label="Get different text"
                title="Get different text">
                ↻ Reroll text
              </button>
              {/* <span className="text-white/40">•</span>
              <span className="text-white/60">Language: <span className="text-white">{lang}</span></span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">Duration: <span className="text-white">{duration}s</span></span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">Punct: <span className="text-white">{punctuation ? "on" : "off"}</span></span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">Numbers: <span className="text-white">{numbers ? "on" : "off"}</span></span> */}
            </div>
          )}
        </div>
      </section>
      <aside className="absolute right-0 top-1/4">
        <AdUnit
          slot="9194878710"
          fixed
          style={{ display: "block", width: 300, height: 250 }}
          format="rectangle"        // or keep "auto"; width/height will be respected
          responsive={false}
        />
      </aside>
      <div style={{ maxWidth: "100%", margin: "24px auto 0" }}>
        <AdUnit slot="6053710056" style={{ display: "block", width: "100%" }} />
      </div>
      {/* Footer (hidden in focus mode) */}
      {!focus && (
        <footer className="w-full max-w-6xl mx-auto px-6 pb-6">
          <div className="text-xs text-white/40 flex items-center justify-between">
            <span>TMT © {new Date().getFullYear()}</span>
            <span>#323437 / #E2B714 • Roboto Mono</span>
          </div>
        </footer>
      )}
    </main>
  );
}

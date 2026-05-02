'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import AdUnit from "@/components/AdUnit";
import Footer from "@/components/Footer";
import { makeStreamGenerator } from "@/lib/textbanks";

const PREF_KEY = "tmt_prefs";

export default function Home() {
  const [lang, setLang] = useState("english");
  const [duration, setDuration] = useState(60);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [competitiveMode, setCompetitiveMode] = useState(false);
  const [focus, setFocus] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);

  const genRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;

      const prefs = JSON.parse(raw);
      if (prefs.lang) setLang(prefs.lang);
      if (Number.isFinite(prefs.duration)) setDuration(prefs.duration);
      if (typeof prefs.punctuation === "boolean") setPunctuation(prefs.punctuation);
      if (typeof prefs.numbers === "boolean") setNumbers(prefs.numbers);
      if (typeof prefs.competitiveMode === "boolean") setCompetitiveMode(prefs.competitiveMode);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ lang, duration, punctuation, numbers, competitiveMode })
      );
    } catch {}
  }, [lang, duration, punctuation, numbers, competitiveMode]);

  const rebuildGenerator = useCallback(() => {
    setLoading(true);
    try {
      genRef.current = makeStreamGenerator({ lang, punctuation, numbers });
      setInitialText(genRef.current.nextChunk(80));
    } catch (error) {
      console.error("Generator error:", error);
      setInitialText("Keep calm and type on - the generator could not load fresh text.");
    }

    setSessionId((current) => current + 1);
    setFocus(false);
    setTestCompleted(false);
    setLoading(false);
  }, [lang, punctuation, numbers]);

  useEffect(() => {
    rebuildGenerator();
  }, [rebuildGenerator]);

  const supplyMore = useCallback(async () => {
    if (!genRef.current) return "";
    try {
      return genRef.current.nextChunk(60);
    } catch (error) {
      console.error("SupplyMore error:", error);
      return "";
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter" && event.getModifierState("Tab")) {
        event.preventDefault();
        rebuildGenerator();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rebuildGenerator]);

  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      {focus && <div className="mt-20" />}

      {!focus && (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 pb-4 pt-8">
          <Link href="/" className="hidden items-center gap-3 md:flex">
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

          <nav className="m-auto block text-center text-sm text-white/70 md:m-0">
            <Link href="https://discord.gg/5G2WvTYbPR" className="mx-2 hover:text-white">
              Discord
            </Link>
            <Link href="/stats" className="mx-2 hover:text-white">
              Stats
            </Link>
            <a href="https://github.com" className="mx-2 hover:text-white" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </header>
      )}

      {!focus && (
        <TopBar
          lang={lang}
          setLang={setLang}
          duration={duration}
          setDuration={setDuration}
          punctuation={punctuation}
          setPunctuation={setPunctuation}
          numbers={numbers}
          setNumbers={setNumbers}
        />
      )}

      <section className="flex flex-1 items-start justify-center px-6 py-10 md:items-center">
        <h1 className="sr-only">
          Master your typing speed with a customizable minimalist typing test on The Monkey Type
        </h1>
        <h2 className="sr-only">Compare your typing speed with a words-per-minute typing tool</h2>
        <h2 className="sr-only">Free online typing practice with multiple training modes</h2>
        <h2 className="sr-only">Improve your typing accuracy with focused practice on The Monkey Type</h2>

        <div className="w-full max-w-5xl">
          {loading ? (
            <div className="skeleton mx-auto h-40 w-full max-w-5xl" />
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
              onTestComplete={() => setTestCompleted(true)}
              showResults={testCompleted}
              competitiveMode={competitiveMode}
            />
          )}

          <div className="mb-4 mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <button
              onClick={rebuildGenerator}
              className="btn-secondary"
              aria-label="Restart test"
              title="Restart test"
            >
              Restart test
            </button>

            <button
              onClick={() => setCompetitiveMode((value) => !value)}
              className={competitiveMode ? "btn-primary" : "btn-secondary"}
              aria-label="Toggle competitive mode"
              title="Competitive mode"
            >
              Competitive: {competitiveMode ? "On" : "Off"}
            </button>

            {competitiveMode && (
              <span className="text-xs text-white/50">Backspace adds a 0.5s penalty.</span>
            )}
          </div>

          <div className="mt-10 flex flex-col items-center justify-center text-center">
            <span className="mt-1 text-[11px] tracking-wide text-white/40">
              <kbd className="rounded bg-white/10 px-1">Tab</kbd> +{" "}
              <kbd className="rounded bg-white/10 px-1">Enter</kbd> - Restart test
            </span>
          </div>
        </div>
      </section>

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

      {!focus && <Footer />}
    </main>
  );
}

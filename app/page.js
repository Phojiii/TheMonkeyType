'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { makeStreamGenerator } from "@/lib/textbanks";
import { FaGlobeAmericas, FaRedoAlt } from "react-icons/fa";
import { FaDonate } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";

const PREF_KEY = "tmt_prefs";

export default function Home() {
  const [lang, setLang] = useState("english");
  const [testType, setTestType] = useState("time");
  const [duration, setDuration] = useState(60);
  const [wordCount, setWordCount] = useState(50);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [competitiveMode, setCompetitiveMode] = useState(false);
  const [focus, setFocus] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);
  const [donationOpen, setDonationOpen] = useState(false);

  const genRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (!raw) return;

      const prefs = JSON.parse(raw);
      if (prefs.lang) setLang(prefs.lang);
      if (prefs.testType === "time" || prefs.testType === "words") setTestType(prefs.testType);
      if (Number.isFinite(prefs.duration)) setDuration(prefs.duration);
      if (Number.isFinite(prefs.wordCount)) setWordCount(prefs.wordCount);
      if (typeof prefs.punctuation === "boolean") setPunctuation(prefs.punctuation);
      if (typeof prefs.numbers === "boolean") setNumbers(prefs.numbers);
      if (typeof prefs.competitiveMode === "boolean") setCompetitiveMode(prefs.competitiveMode);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({ lang, testType, duration, wordCount, punctuation, numbers, competitiveMode })
      );
    } catch {}
  }, [lang, testType, duration, wordCount, punctuation, numbers, competitiveMode]);

  const rebuildGenerator = useCallback(() => {
    setLoading(true);
    try {
      genRef.current = makeStreamGenerator({ lang, punctuation, numbers });
      setInitialText(
        testType === "words"
          ? genRef.current.nextChunk(wordCount).trim()
          : genRef.current.nextChunk(80)
      );
    } catch (error) {
      console.error("Generator error:", error);
      setInitialText("Keep calm and type on - the generator could not load fresh text.");
    }

    setSessionId((current) => current + 1);
    setFocus(false);
    setLoading(false);
  }, [lang, punctuation, numbers, testType, wordCount]);

  useEffect(() => {
    rebuildGenerator();
  }, [rebuildGenerator]);

  useEffect(() => {
    if (testType === "words" && competitiveMode) {
      setCompetitiveMode(false);
    }
  }, [testType, competitiveMode]);

  const supplyMore = useCallback(async () => {
    if (testType !== "time") return "";
    if (!genRef.current) return "";
    try {
      return genRef.current.nextChunk(60);
    } catch (error) {
      console.error("SupplyMore error:", error);
      return "";
    }
  }, [testType]);

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
        <header className="mx-auto hidden w-full max-w-6xl items-center justify-between px-6 pb-4 pt-8 md:flex">
          <Link href="/" className="hidden items-center gap-3 md:flex">
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

          <nav className="m-auto block text-center text-sm text-white/70 md:m-0">
          <button onClick={() => setDonationOpen(true)} className="mx-2 hover:text-white">
              Donate <FaDonate className="inline-block" />
            </button>
            <Link href="https://discord.gg/5G2WvTYbPR" className="mx-2 hover:text-white">
              Discord
            </Link>
            <a href="https://github.com" className="mx-2 hover:text-white" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </header>
        
      )}
            {donationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#1f2023]/95 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand/80">Support</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Support TheMonkeyType</h3>
              </div>
              <button
                onClick={() => setDonationOpen(false)}
                className="btn-ghost px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>

            <p className="mb-5 text-sm leading-7 text-white/65">
              Thank you for thinking about supporting this project. Your support helps keep
              TheMonkeyType improving, maintained, and available for everyone.
              <FaHeart className="ml-1 inline-block text-red-400" />
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <span className="donate-glow">
                <Link
                  href="https://ko-fi.com/themonkeytype"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary min-w-[11rem]"
                >
                  Donate <FaDonate className="inline-block" />
                </Link>
              </span>

              <button
                onClick={() => setDonationOpen(false)}
                className="btn-secondary"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {!focus && (
        <TopBar
          lang={lang}
          setLang={setLang}
          testType={testType}
          setTestType={setTestType}
          duration={duration}
          setDuration={setDuration}
          wordCount={wordCount}
          setWordCount={setWordCount}
          punctuation={punctuation}
          setPunctuation={setPunctuation}
          numbers={numbers}
          setNumbers={setNumbers}
        />
      )}

      <section className="flex flex-1 items-start justify-center px-4 py-8 md:px-6 md:py-10 md:items-center">
        <h1 className="sr-only">
          Master your typing speed with a customizable minimalist typing test on The Monkey Type
        </h1>
        <h2 className="sr-only">Compare your typing speed with a words-per-minute typing tool</h2>
        <h2 className="sr-only">Free online typing practice with multiple training modes</h2>
        <h2 className="sr-only">Improve your typing accuracy with focused practice on The Monkey Type</h2>

        <div className="w-full max-w-5xl">
          <div className="mb-8 flex items-center justify-center gap-2 text-base text-white/38 md:hidden">
            <FaGlobeAmericas className="text-sm" />
            <span className="lowercase tracking-[0.08em]">{lang}</span>
          </div>

          {loading ? (
            <div className="skeleton mx-auto h-40 w-full max-w-5xl" />
          ) : (
            <TypingTest
              key={sessionId}
              initialText={initialText}
              supplyMore={supplyMore}
              durationSec={duration}
              testType={testType}
              targetWordCount={wordCount}
              focusMode={focus}
              onFocusStart={() => setFocus(true)}
              onFocusEnd={() => setFocus(false)}
              onRestart={rebuildGenerator}
              competitiveMode={competitiveMode}
            />
          )}

          <div className="mb-4 mt-8 hidden flex-wrap items-center justify-center gap-3 text-sm md:flex">
            <button
              onClick={rebuildGenerator}
              className="btn-secondary"
              aria-label="Restart test"
              title="Restart test"
            >
              Restart test
            </button>

            <button
              onClick={() => {
                if (testType === "words") return;
                setCompetitiveMode((value) => !value);
              }}
              disabled={testType === "words"}
              className={
                testType === "words"
                  ? "btn-secondary opacity-60"
                  : competitiveMode
                    ? "btn-primary"
                    : "btn-secondary"
              }
              aria-label="Toggle competitive mode"
              title="Competitive mode"
            >
              {testType === "words"
                ? "Competitive unavailable in words mode"
                : `Competitive: ${competitiveMode ? "On" : "Off"}`}
            </button>

            {competitiveMode && (
              <span className="text-xs text-white/50">Backspace adds a 0.5s penalty.</span>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center md:hidden">
            <button
              onClick={rebuildGenerator}
              className="rounded-full p-3 text-white/45 transition hover:bg-white/5 hover:text-white/70"
              aria-label="Restart test"
              title="Restart test"
            >
              <FaRedoAlt className="text-xl" />
            </button>
          </div>

          <div className="mt-10 hidden flex-col items-center justify-center text-center md:flex">
            <span className="mt-1 text-[11px] tracking-wide text-white/40">
              <kbd className="rounded bg-white/10 px-1">Tab</kbd> +{" "}
              <kbd className="rounded bg-white/10 px-1">Enter</kbd> - Restart test
            </span>
          </div>
        </div>
      </section>

      {!focus && <Footer />}
    </main>
  );
}


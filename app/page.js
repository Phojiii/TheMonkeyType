'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import LocalizedHomeContent from "@/components/LocalizedHomeContent";
import { makeStreamGenerator } from "@/lib/textbanks";
import { BEGINNER_LESSONS, getLessonWordCount } from "@/lib/beginnerLessons";
import { FaGlobeAmericas, FaRedoAlt } from "react-icons/fa";
import { FaDonate } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { localePathForLanguage } from "@/lib/locales";
import { LOCALIZED_HOME_COPY } from "@/lib/localizedHomeCopy";

const PREF_KEY = "tmt_prefs";
const BEGINNER_PROGRESS_KEY = "tmt_beginner_progress_v4";

export default function Home({ locale = "english" }) {
  const router = useRouter();
  const [lang, setLang] = useState(locale);
  const [testType, setTestType] = useState("time");
  const [duration, setDuration] = useState(60);
  const [wordCount, setWordCount] = useState(50);
  const [punctuation, setPunctuation] = useState(false);
  const [numbers, setNumbers] = useState(false);
  const [competitiveMode, setCompetitiveMode] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const [beginnerLessonIndex, setBeginnerLessonIndex] = useState(0);
  const [beginnerProgress, setBeginnerProgress] = useState({});
  const [focus, setFocus] = useState(false);
  const [initialText, setInitialText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(0);
  const [donationOpen, setDonationOpen] = useState(false);
  const [showHomeIntro, setShowHomeIntro] = useState(false);
  const localizedHomeCopy = LOCALIZED_HOME_COPY[locale] || null;

  const genRef = useRef(null);

  useEffect(() => {
    if (locale !== "english") {
      setLang(locale);
      return;
    }

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
      if (typeof prefs.beginnerMode === "boolean") setBeginnerMode(prefs.beginnerMode);
      if (Number.isFinite(prefs.beginnerLessonIndex)) {
        setBeginnerLessonIndex(
          Math.min(Math.max(0, prefs.beginnerLessonIndex), BEGINNER_LESSONS.length - 1)
        );
      }
    } catch {}
  }, [locale]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEGINNER_PROGRESS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        const cleaned = Object.fromEntries(
          Object.entries(parsed).filter(([lessonId, value]) => {
            const lessonIndex = Number(value?.lessonIndex);
            if (!Number.isFinite(lessonIndex)) return false;

            const lessonAtIndex = BEGINNER_LESSONS[lessonIndex];
            if (!lessonAtIndex || lessonAtIndex.id !== lessonId) return false;

            return true;
          })
        );
        setBeginnerProgress(cleaned);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        PREF_KEY,
        JSON.stringify({
          lang,
          testType,
          duration,
          wordCount,
          punctuation,
          numbers,
          competitiveMode,
          beginnerMode,
          beginnerLessonIndex,
        })
      );
    } catch {}
  }, [lang, testType, duration, wordCount, punctuation, numbers, competitiveMode, beginnerMode, beginnerLessonIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(BEGINNER_PROGRESS_KEY, JSON.stringify(beginnerProgress));
    } catch {}
  }, [beginnerProgress]);

  useEffect(() => {
    if (!beginnerMode) return;
    setLang("english");
    setPunctuation(false);
    setNumbers(false);
    setCompetitiveMode(false);
    setTestType("words");
  }, [beginnerMode]);

  const rebuildGenerator = useCallback(() => {
    setLoading(true);
    try {
      if (beginnerMode) {
        const lesson = BEGINNER_LESSONS[beginnerLessonIndex] || BEGINNER_LESSONS[0];
        setInitialText(lesson.text.trim());
      } else {
        genRef.current = makeStreamGenerator({ lang, punctuation, numbers });
        setInitialText(
          testType === "words"
            ? genRef.current.nextChunk(wordCount).trim()
            : genRef.current.nextChunk(80)
        );
      }
    } catch (error) {
      console.error("Generator error:", error);
      setInitialText("Keep calm and type on - the generator could not load fresh text.");
    }

    setSessionId((current) => current + 1);
    setFocus(false);
    setLoading(false);
  }, [beginnerLessonIndex, beginnerMode, lang, numbers, punctuation, testType, wordCount]);

  useEffect(() => {
    rebuildGenerator();
  }, [rebuildGenerator]);

  const handleLanguageChange = useCallback((nextLanguage) => {
    if (beginnerMode) return;
    setLang(nextLanguage);
    router.push(localePathForLanguage(nextLanguage));
  }, [beginnerMode, router]);

  useEffect(() => {
    if (testType === "words" && competitiveMode) {
      setCompetitiveMode(false);
    }
  }, [testType, competitiveMode]);

  const activeBeginnerLesson = beginnerMode
    ? BEGINNER_LESSONS[Math.min(beginnerLessonIndex, BEGINNER_LESSONS.length - 1)]
    : null;

  const beginnerProgressLabel = beginnerMode
    ? `${beginnerLessonIndex + 1}/${BEGINNER_LESSONS.length}`
    : "";

  const highestCompletedLessonIndex = Object.values(beginnerProgress).reduce((max, item) => {
    if (!item?.completed) return max;
    const index = Number(item.lessonIndex);
    return Number.isFinite(index) ? Math.max(max, index) : max;
  }, -1);

  const highestUnlockedLessonIndex = Math.min(
    BEGINNER_LESSONS.length - 1,
    Math.max(0, highestCompletedLessonIndex + 1)
  );

  useEffect(() => {
    if (beginnerLessonIndex > highestUnlockedLessonIndex) {
      setBeginnerLessonIndex(highestUnlockedLessonIndex);
    }
  }, [beginnerLessonIndex, highestUnlockedLessonIndex]);

  const completedBeginnerLessonOptions = BEGINNER_LESSONS
    .map((lesson, index) => {
      const progress = beginnerProgress[lesson.id] || null;
      return {
        index,
        id: lesson.id,
        label: `Lesson ${index + 1}`,
        completed: Boolean(progress?.completed),
        bestWpm: Number(progress?.bestWpm || 0),
        bestAccuracy: Number(progress?.bestAccuracy || 0),
      };
    })
    .filter((lesson) => lesson.completed);

  const currentBeginnerLessonOption = activeBeginnerLesson
    ? {
        index: beginnerLessonIndex,
        id: activeBeginnerLesson.id,
        label: `Lesson ${beginnerLessonIndex + 1}`,
        completed:
          Boolean(beginnerProgress[activeBeginnerLesson.id]?.completed) &&
          Number(beginnerProgress[activeBeginnerLesson.id]?.lessonIndex) === beginnerLessonIndex,
        bestWpm:
          Number(beginnerProgress[activeBeginnerLesson.id]?.lessonIndex) === beginnerLessonIndex
            ? Number(beginnerProgress[activeBeginnerLesson.id]?.bestWpm || 0)
            : 0,
        bestAccuracy:
          Number(beginnerProgress[activeBeginnerLesson.id]?.lessonIndex) === beginnerLessonIndex
            ? Number(beginnerProgress[activeBeginnerLesson.id]?.bestAccuracy || 0)
            : 0,
      }
    : null;

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

  useEffect(() => {
    const updateIntroVisibility = () => setShowHomeIntro(window.scrollY >= 500);

    updateIntroVisibility();
    window.addEventListener("scroll", updateIntroVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateIntroVisibility);
  }, []);

  const handleNextBeginnerLesson = useCallback(() => {
    if (!beginnerMode) return;
    setBeginnerLessonIndex((current) => Math.min(current + 1, BEGINNER_LESSONS.length - 1));
  }, [beginnerMode]);

  const handleBeginnerComplete = useCallback((stats) => {
    if (!beginnerMode) return;

    const completedLessonId = stats?.lessonId || "";
    const completedLessonIndex = Number(stats?.lessonIndex);
    if (!completedLessonId || !Number.isFinite(completedLessonIndex)) return;

    setBeginnerProgress((current) => {
      const previous = current[completedLessonId] || {};
      return {
        ...current,
        [completedLessonId]: {
          lessonIndex: completedLessonIndex,
          completed: true,
          bestWpm: Math.max(Number(previous.bestWpm || 0), Math.round(Number(stats?.wpm || 0))),
          bestAccuracy: Math.max(
            Number(previous.bestAccuracy || 0),
            Math.round(Number(stats?.accuracy || 0))
          ),
          lastCompletedAt: new Date().toISOString(),
        },
      };
    });
  }, [activeBeginnerLesson, beginnerLessonIndex, beginnerMode]);

  const hasNextBeginnerLesson = beginnerMode && beginnerLessonIndex < BEGINNER_LESSONS.length - 1;

  return (
    <main className="min-h-screen bg-ink text-white flex flex-col">
      {focus && <div className="mt-20" />}

      <div className={!focus ? "relative" : ""}>
        <div
          className={
            !focus
              ? `sticky top-0 z-0 min-h-[100svh] bg-ink transition-[opacity,transform] duration-500 ease-out ${
                  showHomeIntro
                    ? "pointer-events-none -translate-y-3 opacity-0"
                    : "translate-y-0 opacity-100"
                }`
              : ""
          }
        >
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

          <nav className="m-auto flex items-center gap-3 text-sm text-white/70 md:m-0">
            <button onClick={() => setDonationOpen(true)} className="btn-secondary px-4 py-2 text-sm">
              Donate <FaDonate className="ml-1 inline-block" />
            </button>
            <Footer embedded />
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
          setLang={handleLanguageChange}
          testType={testType}
          setTestType={setTestType}
          beginnerMode={beginnerMode}
          setBeginnerMode={setBeginnerMode}
          duration={duration}
          setDuration={setDuration}
          wordCount={wordCount}
          setWordCount={setWordCount}
          punctuation={punctuation}
          setPunctuation={setPunctuation}
          numbers={numbers}
          setNumbers={setNumbers}
          beginnerLessonIndex={beginnerLessonIndex}
          setBeginnerLessonIndex={setBeginnerLessonIndex}
          beginnerLessonOptions={completedBeginnerLessonOptions}
          currentBeginnerLessonOption={currentBeginnerLessonOption}
        />
      )}

      <section
        className={`flex flex-1 items-start justify-center px-4 py-8 md:px-6 md:py-10 md:mt-28 `}
      >
        <p className="sr-only">
          Master your typing speed with a customizable minimalist typing test on The Monkey Type
        </p>
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
              durationSec={beginnerMode ? 120 : duration}
              testType={beginnerMode ? "words" : testType}
              targetWordCount={beginnerMode ? getLessonWordCount(activeBeginnerLesson) : wordCount}
              focusMode={focus}
              onFocusStart={() => setFocus(true)}
              onFocusEnd={() => setFocus(false)}
              onRestart={rebuildGenerator}
              competitiveMode={competitiveMode}
              beginnerMode={beginnerMode}
              beginnerLesson={activeBeginnerLesson}
              beginnerLessonIndex={beginnerLessonIndex}
              beginnerProgressLabel={beginnerProgressLabel}
              beginnerFeedback={null}
              beginnerPassRequirement=""
              onNextLesson={beginnerMode ? handleNextBeginnerLesson : undefined}
              hasNextLesson={hasNextBeginnerLesson}
              onComplete={beginnerMode ? handleBeginnerComplete : undefined}
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
                if (beginnerMode) return;
                if (testType === "words") return;
                setCompetitiveMode((value) => !value);
              }}
              disabled={testType === "words" || beginnerMode}
              className={
                testType === "words" || beginnerMode
                  ? "btn-secondary opacity-60"
                  : competitiveMode
                    ? "btn-primary"
                    : "btn-secondary"
              }
              aria-label="Toggle competitive mode"
              title="Competitive mode"
            >
              {beginnerMode
                ? "Competitive unavailable in beginner mode"
                : testType === "words"
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
            <span className="mt-1 text-[14px] tracking-wide text-white/40">
              Build and Maintain by - <a href="https://lemsee.agency" target="_blank" rel="noreferrer" className="rounded bg-brand/80 px-1 text-black transition hover:bg-brand hover:text-ink">LemSee.</a>
            </span>
          </div>
        </div>
      </section>
      </div>

      {!focus ? (
        <div className="pointer-events-none relative z-10 -mt-[100svh] min-h-[calc(100svh+500px)] pt-[500px]">
          <section
            aria-hidden={!showHomeIntro}
            className={`mx-auto w-full max-w-6xl px-6 pb-20 transition-all duration-500 ease-out md:px-8 ${
              showHomeIntro
                ? "pointer-events-auto translate-y-0 opacity-100"
                : "pointer-events-none translate-y-8 opacity-0"
            }`}
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.16)] md:p-10">
              {localizedHomeCopy ? <LocalizedHomeContent copy={localizedHomeCopy} /> : <>
              <p className="text-xs uppercase tracking-[0.3em] text-brand/80">Free typing practice</p>
              <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-white md:text-5xl">
                Monkey Type - Free Online Typing Test &amp; Typing Trainer
              </h1>
              <p className="mt-6 max-w-4xl text-base leading-8 text-white/75 md:text-lg">
                The Monkey Type is a free online typing trainer and typing speed test. Take a 15, 30, 60 or 120-second test, or type a fixed number of words, and see your words per minute (WPM), accuracy and mistakes the moment you finish. Practice in 15 languages, add punctuation and numbers, race other typists live, and track every result over time. No download and no sign-up needed: just start typing.
              </p>

              <div className="mt-10 grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-brand/80">How it works</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">What is The Monkey Type?</h2>
                </div>
                <p className="text-base leading-8 text-white/70">
                  The Monkey Type is a minimalist, browser-based typing test that measures how fast and how accurately you type. It works like a personal online typing trainer: each test gives you instant feedback, your results are saved to your{" "}
                  <Link href="/stats" className="text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-white">typing stats</Link>, and your best scores can appear on the{" "}
                  <Link href="/leaderboard" className="text-brand underline decoration-brand/40 underline-offset-4 transition hover:text-white">global typing leaderboard</Link>. It is built for beginners learning touch typing, students and professionals who type every day, and competitive typists chasing a new personal best.
                </p>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Practice your way</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Everything you need to type faster</h2>
                <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Timed typing tests</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Choose a 15s, 30s, 60s, or 120s test. The 1-minute typing test is the standard way to measure WPM, while 15 seconds makes a quick warm-up.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Word-count tests</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Type a fixed number of words instead of racing the clock. It is ideal for building rhythm and consistency.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Punctuation and numbers</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Turn on punctuation and numbers to practice the way you really type emails, code, and reports.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Beginner mode</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Start with simpler words while you learn correct finger placement and home-row technique.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Typing tests in 15 languages</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Practice in English, Spanish, French, German, Portuguese, Russian, Arabic, Urdu, Hindi, Bengali, Punjabi, Sindhi, Indonesian, Japanese, and Chinese.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Competitive mode</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Stricter rules keep ranked runs fair. Read more in the <Link href="/guide" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">website guide</Link>.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Live 1v1 typing races</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Join the live lobby and challenge another player to a real-time duel on the same text. The fastest accurate typist wins.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Leaderboards</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Compare your best scores globally or in your country, by test length, on the daily and all-time <Link href="/leaderboard" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Monkey Type leaderboard</Link>.</p>
                  </article>
                  <article className="rounded-2xl border border-white/10 bg-black/10 p-5">
                    <h3 className="font-semibold text-white">Stats and history</h3>
                    <p className="mt-2 text-sm leading-6 text-white/65">Your <Link href="/stats" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">typing stats</Link> chart WPM over 12 hours to 30 days, list past runs, and keep your 1v1 challenge record.</p>
                  </article>
                </div>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Getting started</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">How the online typing test works</h2>
                <ol className="mt-7 grid gap-4 md:grid-cols-2">
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">1. Pick a mode.</span> Choose time or words, a duration, a language, and whether to include punctuation or numbers.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">2. Start typing.</span> The test begins with your first keystroke. Correct letters, errors, and your live speed appear as you go.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">3. Review your result.</span> See WPM, accuracy, characters, words, duration, and backspaces. Press Tab then Enter to restart instantly.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">4. Track and compete.</span> Results save to <Link href="/stats" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Stats</Link>; your best runs can rank on the <Link href="/leaderboard" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Leaderboard</Link>.</li>
                </ol>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Read your results</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">How your typing speed is measured</h2>
                <dl className="mt-7 grid gap-x-8 gap-y-6 md:grid-cols-2">
                  <div><dt className="font-semibold text-white">WPM (words per minute)</dt><dd className="mt-2 text-sm leading-6 text-white/65">Your typing speed. One word is counted as five characters, including spaces, so results are comparable across languages and texts.</dd></div>
                  <div><dt className="font-semibold text-white">Accuracy</dt><dd className="mt-2 text-sm leading-6 text-white/65">The percentage of keystrokes typed correctly. Aim for 95% or higher before chasing speed.</dd></div>
                  <div><dt className="font-semibold text-white">Characters</dt><dd className="mt-2 text-sm leading-6 text-white/65">Correct and incorrect characters typed during the test.</dd></div>
                  <div><dt className="font-semibold text-white">Words and duration</dt><dd className="mt-2 text-sm leading-6 text-white/65">How many words you completed and how long the test lasted.</dd></div>
                  <div><dt className="font-semibold text-white">Backspaces</dt><dd className="mt-2 text-sm leading-6 text-white/65">How often you corrected yourself. Fewer backspaces usually means a smoother rhythm.</dd></div>
                </dl>
                <p className="mt-8 text-sm leading-6 text-white/70">See the full breakdown in the <Link href="/guide" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">guide to how The Monkey Type works</Link>.</p>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Find your level</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">What is a good typing speed?</h2>
                <p className="mt-4 text-sm leading-6 text-white/70">Most adults type around 40 WPM. Use this table to see where your typing test result sits.</p>
                <div className="mt-7 overflow-x-auto rounded-2xl border border-white/10">
                  <table className="min-w-[42rem] w-full text-left text-sm">
                    <thead className="bg-white/[0.06] text-white"><tr><th className="px-5 py-4 font-semibold">WPM</th><th className="px-5 py-4 font-semibold">Level</th><th className="px-5 py-4 font-semibold">What it means</th></tr></thead>
                    <tbody className="divide-y divide-white/10 text-white/70">
                      <tr><td className="px-5 py-4 text-brand">Under 30</td><td className="px-5 py-4 text-white">Beginner</td><td className="px-5 py-4">Still looking at the keyboard; focus on touch-typing basics.</td></tr>
                      <tr><td className="px-5 py-4 text-brand">30-40</td><td className="px-5 py-4 text-white">Average</td><td className="px-5 py-4">Comfortable for everyday use.</td></tr>
                      <tr><td className="px-5 py-4 text-brand">40-60</td><td className="px-5 py-4 text-white">Above average</td><td className="px-5 py-4">Fast enough for most office and study work.</td></tr>
                      <tr><td className="px-5 py-4 text-brand">60-80</td><td className="px-5 py-4 text-white">Professional</td><td className="px-5 py-4">Ideal for writers, developers, and data-entry roles.</td></tr>
                      <tr><td className="px-5 py-4 text-brand">80-100</td><td className="px-5 py-4 text-white">Advanced</td><td className="px-5 py-4">Top tier for everyday typists.</td></tr>
                      <tr><td className="px-5 py-4 text-brand">100+</td><td className="px-5 py-4 text-white">Competitive</td><td className="px-5 py-4">Leaderboard territory.</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-6 text-sm leading-6 text-white/70">Stuck around 30 WPM? Follow our <Link href="/blog/how-to-increase-typing-speed-from-30-wpm-to-60-wpm-complete-beginner-s-guide" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">step-by-step guide to reach 60 WPM</Link>.</p>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Built for every typist</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Who uses The Monkey Type?</h2>
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  {[
                    ["Students", "Finish assignments faster and prepare for computer-based exams."],
                    ["Office professionals", "Write emails, reports, and spreadsheets with fewer errors."],
                    ["Developers", "Practice punctuation and numbers to type code without hunting for symbols."],
                    ["Job seekers and data entry operators", "Hit the WPM and accuracy targets employers ask for."],
                    ["Writers and content creators", "Keep up with your thoughts and stay in flow."],
                    ["Multilingual learners", "Build speed in your native language or one you are learning."],
                    ["Competitive typists and gamers", "Race 1v1 and climb the global and country leaderboards."],
                    ["Teachers", "Run quick classroom typing tests and track students' improvement."],
                  ].map(([title, description]) => <article key={title} className="rounded-2xl border border-white/10 bg-black/10 p-5"><h3 className="font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-white/65">{description}</p></article>)}
                </div>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Make progress daily</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">A 15-minute daily typing practice plan</h2>
                <p className="mt-4 text-sm leading-6 text-white/70">Short, regular sessions beat occasional long ones. Try this routine on The Monkey Type.</p>
                <ol className="mt-7 grid gap-4 md:grid-cols-2">
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">1. Warm up (3 min).</span> Take two or three 30-second tests in beginner mode.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">2. Accuracy focus (5 min).</span> Use 60-second tests and slow down until accuracy is above 95%.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">3. Real-world practice (4 min).</span> Turn on punctuation and numbers.</li>
                  <li className="rounded-2xl border border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/65"><span className="font-semibold text-brand">4. Speed push (3 min).</span> Take one 60-second test in competitive mode and check your <Link href="/stats" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">stats</Link>.</li>
                </ol>
                <p className="mt-6 text-sm leading-6 text-white/70">New to touch typing? Start with the <Link href="/blog/beginner-s-guide-to-touch-typing-learn-to-type-without-looking-at-the-keyboard" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">beginner's guide to typing without looking at the keyboard</Link> and the <Link href="/blog/best-typing-exercise-to-improve-speed-and-accuracy" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">best typing exercises for speed and accuracy</Link>.</p>
              </div>

              <div className="mt-12 grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-2">
                <div><p className="text-xs uppercase tracking-[0.25em] text-brand/80">Compete worldwide</p><h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Climb the leaderboard and race the world</h2><p className="mt-4 text-sm leading-7 text-white/70">Every saved run counts towards your best score. Check the <Link href="/leaderboard" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">all-time and daily leaderboards</Link> to see how you compare worldwide or in your country, then head to the live lobby to challenge a typist to a 1v1 race. Rankings are explained in the <Link href="/guide" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">guide</Link>.</p></div>
                <div><p className="text-xs uppercase tracking-[0.25em] text-brand/80">Keep learning</p><h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Typing guides from our blog</h2><ul className="mt-4 space-y-3 text-sm"><li><Link href="/blog/online-typing-tool-for-free-the-monkey-type" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Online Typing Tool for Free - The Monkey Type</Link></li><li><Link href="/blog/how-to-increase-typing-speed-from-30-wpm-to-60-wpm-complete-beginner-s-guide" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">How to Increase Typing Speed from 30 WPM to 60 WPM</Link></li><li><Link href="/blog/beginner-s-guide-to-touch-typing-learn-to-type-without-looking-at-the-keyboard" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Beginner's Guide to Touch Typing</Link></li><li><Link href="/blog/best-typing-exercise-to-improve-speed-and-accuracy" className="text-brand underline decoration-brand/40 underline-offset-4 hover:text-white">Best Typing Exercise to Improve Speed and Accuracy</Link></li><li><Link href="/blog" className="font-semibold text-white underline decoration-brand underline-offset-4 hover:text-brand">See all typing guides</Link></li></ul></div>
              </div>

              <div className="mt-12 border-t border-white/10 pt-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand/80">Answers at a glance</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Frequently asked questions</h2>
                <div className="mt-7 grid gap-4 md:grid-cols-2">
                  {[
                    ["Is The Monkey Type free?", "Yes. Every typing test, practice mode, language, leaderboard, and 1v1 challenge is free. Sign in to save scores online and join live challenges."],
                    ["What is an online typing trainer?", "It is a website that helps improve typing speed and accuracy through repeated tests and feedback. The Monkey Type works in your browser, so there is nothing to install."],
                    ["How do I take a typing speed test?", "Pick a time or word count, then start typing. Your WPM and accuracy appear as soon as the test ends."],
                    ["What does WPM mean?", "WPM means words per minute. One word equals five characters, the standard used by most typing tests."],
                    ["What is a good WPM?", "Around 40 WPM is average. 60-80 WPM is professional level, and 100+ WPM is competitive."],
                    ["Which languages can I practice?", "English, Spanish, French, German, Portuguese, Russian, Arabic, Urdu, Hindi, Bengali, Punjabi, Sindhi, Indonesian, Japanese, and Chinese (Simplified)."],
                    ["Can I race other people?", "Yes. Sign in, join the live lobby, and challenge another player to a 1v1 typing race on the same text."],
                    ["How do the leaderboards work?", "Your best saved scores are ranked by test mode and duration, globally or within your country, on daily and all-time boards."],
                    ["Does it work on mobile?", "The Monkey Type runs in any modern browser. For accurate WPM results, use a physical keyboard."],
                    ["Who runs The Monkey Type?", "The Monkey Type is managed and maintained by LemSee Agency. For business or partnership inquiries, email info@lemsee.agency."],
                  ].map(([question, answer]) => <article key={question} className="rounded-2xl border border-white/10 bg-black/10 p-5"><h3 className="font-semibold text-white">{question}</h3><p className="mt-2 text-sm leading-6 text-white/65">{answer}</p></article>)}
                </div>
              </div>

              <div className="mt-12 rounded-3xl border border-brand/30 bg-brand/10 p-7 text-center md:p-10">
                <p className="text-xs uppercase tracking-[0.25em] text-brand">Start today</p>
                <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">Start your free typing test</h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75">Every fast typist started somewhere. Take a 60-second test now, note your WPM, and come back tomorrow to beat it. The Monkey Type tracks the rest.</p>
                <div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="btn-primary">Start typing test</button><Link href="/leaderboard" className="btn-secondary">View leaderboard</Link></div>
              </div>
              </>}
            </div>
          </section>
        </div>
      ) : null}
      </div>
    </main>
  );
}



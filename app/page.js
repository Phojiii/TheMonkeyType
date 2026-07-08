'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import Footer from "@/components/Footer";
import { makeStreamGenerator } from "@/lib/textbanks";
import { BEGINNER_LESSONS, getLessonWordCount } from "@/lib/beginnerLessons";
import { FaGlobeAmericas, FaRedoAlt } from "react-icons/fa";
import { FaDonate } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";

const PREF_KEY = "tmt_prefs";
const BEGINNER_PROGRESS_KEY = "tmt_beginner_progress_v4";

export default function Home() {
  const [lang, setLang] = useState("english");
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
      if (typeof prefs.beginnerMode === "boolean") setBeginnerMode(prefs.beginnerMode);
      if (Number.isFinite(prefs.beginnerLessonIndex)) {
        setBeginnerLessonIndex(
          Math.min(Math.max(0, prefs.beginnerLessonIndex), BEGINNER_LESSONS.length - 1)
        );
      }
    } catch {}
  }, []);

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
          </div>
        </div>
      </section>

      {!focus && <Footer />}
    </main>
  );
}

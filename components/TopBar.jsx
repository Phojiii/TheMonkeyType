'use client';

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { IoMdSettings } from "react-icons/io";
import { LANGUAGES } from "@/lib/textbanks";

export default function TopBar({
  lang,
  setLang,
  testType,
  setTestType,
  beginnerMode,
  setBeginnerMode,
  duration,
  setDuration,
  wordCount,
  setWordCount,
  punctuation,
  setPunctuation,
  numbers,
  setNumbers,
  beginnerLessonIndex,
  setBeginnerLessonIndex,
  beginnerLessonOptions = [],
  currentBeginnerLessonOption = null,
}) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef(null);
  const times = [15, 30, 60, 120];
  const words = [10, 25, 50, 100];

  useEffect(() => {
    gsap.fromTo(".topbar-stagger", { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.03 });
  }, []);

  const pulse = (element) =>
    gsap.fromTo(
      element,
      { boxShadow: "0 0 0 rgba(226,183,20,0)" },
      { boxShadow: "0 0 18px rgba(226,183,20,0.6)", duration: 0.18, yoyo: true, repeat: 1 }
    );

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const getToggleClass = (active) =>
    [
      "topbar-stagger btn-pill px-3 py-1.5 transition-all",
      active
        ? "border-brand/80 bg-brand/12 font-semibold text-brand"
        : "border-white/10 bg-transparent text-white/70 hover:bg-white/5 hover:text-white",
    ].join(" ");

  const selectedLesson = currentBeginnerLessonOption;
  const selectedLessonLabel = selectedLesson
    ? selectedLesson.completed
      ? `${selectedLesson.label} - ${selectedLesson.bestWpm}wpm - ${selectedLesson.bestAccuracy}% Acc`
      : `${selectedLesson.label} - New`
    : "Select lesson";

  const Controls = ({ compact = false }) => (
    <div className={(compact ? "flex flex-col gap-3" : "flex items-center gap-3") + " text-sm"}>
      <div className={compact ? "flex gap-2" : "flex flex-wrap items-center gap-2"}>
        <button
          onClick={(event) => {
            if (beginnerMode) return;
            setPunctuation((value) => !value);
            pulse(event.currentTarget);
          }}
          className={getToggleClass(punctuation) + (beginnerMode ? " cursor-not-allowed opacity-45" : "")}
        >
          @ Punctuation
        </button>
        <button
          onClick={(event) => {
            if (beginnerMode) return;
            setNumbers((value) => !value);
            pulse(event.currentTarget);
          }}
          className={getToggleClass(numbers) + (beginnerMode ? " cursor-not-allowed opacity-45" : "")}
        >
          # Numbers
        </button>
      </div>

      {!compact && <div className="mx-1 h-5 w-px bg-white/10" />}

      <div className={compact ? "grid grid-cols-3 gap-2" : "flex items-center gap-2"}>
        <button
          onClick={(event) => {
            setBeginnerMode(false);
            setTestType("time");
            pulse(event.currentTarget);
          }}
          className={getToggleClass(!beginnerMode && testType === "time")}
        >
          Time
        </button>
        <button
          onClick={(event) => {
            setBeginnerMode(false);
            setTestType("words");
            pulse(event.currentTarget);
          }}
          className={getToggleClass(!beginnerMode && testType === "words")}
        >
          Words
        </button>
        <button
          onClick={(event) => {
            setBeginnerMode(true);
            pulse(event.currentTarget);
          }}
          className={getToggleClass(beginnerMode)}
        >
          Beginner
        </button>
      </div>

      {!compact && <div className="mx-1 h-5 w-px bg-white/10" />}

      <div className={compact ? "grid grid-cols-4 gap-2" : "flex items-center gap-2"}>
        {beginnerMode ? (
          <select
            value={beginnerLessonIndex}
            onChange={(event) => {
              setBeginnerLessonIndex(Number(event.target.value));
            }}
            className={`topbar-stagger rounded-full border border-brand/25 bg-brand/10 px-4 py-2 text-xs font-medium tracking-[0.02em] text-brand/90 focus:outline-none focus:ring-2 focus:ring-brand ${
              compact ? "col-span-4 w-full" : "min-w-[18rem]"
            }`}
            aria-label="Beginner lesson selector"
          >
            {selectedLesson ? (
              <option value={selectedLesson.index}>
                {selectedLessonLabel}
              </option>
            ) : null}
            {beginnerLessonOptions
              .filter((lesson) => lesson.index !== selectedLesson?.index)
              .map((lesson) => (
                <option key={lesson.id} value={lesson.index}>
                  {`${lesson.label} - ${lesson.bestWpm}wpm - ${lesson.bestAccuracy}% Acc`}
                </option>
              ))}
          </select>
        ) : (
          (testType === "time" ? times : words).map((value) => (
            <button
              key={`${testType}-${value}`}
              onClick={(event) => {
                if (testType === "time") {
                  setDuration(value);
                } else {
                  setWordCount(value);
                }
                pulse(event.currentTarget);
              }}
              className={getToggleClass(testType === "time" ? duration === value : wordCount === value)}
            >
              {testType === "time" ? `${value}s` : `${value}`}
            </button>
          ))
        )}
      </div>

      {!compact && <div className="mx-1 h-5 w-px bg-white/10" />}

      <label className={compact ? "block text-white/70" : "sr-only"} htmlFor="lang">
        Language
      </label>
      <select
        id="lang"
        value={lang}
        onChange={(event) => {
          if (beginnerMode) return;
          setLang(event.target.value);
        }}
        className={`topbar-stagger rounded-full border border-white/10 bg-black/40 px-4 py-2 text-white/90 focus:outline-none focus:ring-2 focus:ring-brand ${
          beginnerMode ? "cursor-not-allowed opacity-45" : ""
        }`}
        aria-label="Language"
        disabled={beginnerMode}
      >
        {LANGUAGES.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <div className="mx-auto mt-4 mb-2 hidden w-max items-center justify-center gap-3 rounded-full bg-black/20 px-4 py-2 backdrop-blur-sm md:flex">
        <Controls />
      </div>

      <div className="mb-2 mt-4 flex justify-center md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/6 bg-black/18 px-5 py-2.5 text-base text-white/35 transition hover:bg-white/[0.04] hover:text-white/60"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="settings-modal"
        >
          <IoMdSettings className="text-base text-white/45" />
          <span className="lowercase tracking-[0.08em]">test settings</span>
        </button>
      </div>

      {open && (
        <div id="settings-modal" className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            ref={modalRef}
            className="absolute left-1/2 top-1/2 w-[92%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#1f1f20] p-5 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-brand">Test Settings</h2>
              <button onClick={() => setOpen(false)} className="btn-ghost px-3 py-1.5" aria-label="Close settings">
                Close
              </button>
            </div>

            <Controls compact />

            <div className="mt-5 flex justify-end">
              <button onClick={() => setOpen(false)} className="btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

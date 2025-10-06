'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

/**
 * Fixes:
 * - Accurate countdown using requestAnimationFrame (no "missing a second")
 * - Progresses even on wrong keys; wrong chars remain red
 * - Backspace to correct previous char (updates hits/errors)
 * - Clean resets when duration or text changes
 */
export default function TypingTest({ text, durationSec = 60 }) {
  // --- core state
  const [startedAt, setStartedAt] = useState(null); // ms timestamp
  const [ended, setEnded] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);

  // rendered bookkeeping
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const rafRef = useRef(null);

  // normalize text
  const fullText = useMemo(
    () => (typeof text === "string" ? text : (text || []).join(" ")),
    [text]
  );

  // per-char marks: 0=untouched, 1=correct, -1=wrong
  const [marks, setMarks] = useState([]);

  // countdown seconds remaining (integer)
  const [remaining, setRemaining] = useState(durationSec);

  // derived stats
  const elapsedSec = startedAt ? Math.max(0, (Date.now() - startedAt) / 1000) : 0;
  const wpm = startedAt ? (hits / 5) / Math.max(1, elapsedSec / 60) : 0;
  const accuracy = hits + errors ? (hits / (hits + errors)) * 100 : 100;

  // --- init & reset on text or duration change
  useEffect(() => {
    const m = new Array(fullText.length).fill(0);
    setMarks(m);
    setIdx(0);
    setHits(0);
    setErrors(0);
    setEnded(false);
    setStartedAt(null);
    setRemaining(durationSec);
  }, [fullText, durationSec]);

  // autofocus + enter animation
  useEffect(() => {
    inputRef.current?.focus();
    gsap.fromTo(
      wrapRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  // --- smooth, accurate countdown with rAF
  useEffect(() => {
    if (!startedAt || ended) return;

    const tick = () => {
      const secondsLeft = Math.max(
        0,
        Math.ceil(durationSec - (Date.now() - startedAt) / 1000)
      );
      setRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        setEnded(true);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt, ended, durationSec]);

  function onKeyDown(e) {
    if (ended) return;

    // --- Backspace: allow correcting the previous char
    if (e.key === "Backspace") {
      if (idx > 0) {
        setIdx((i) => {
          const j = i - 1;
          setMarks((prev) => {
            const next = [...prev];
            const prevMark = next[j];
            if (prevMark === 1) setHits((h) => Math.max(0, h - 1));
            if (prevMark === -1) setErrors((er) => Math.max(0, er - 1));
            next[j] = 0; // clear the mark
            return next;
          });
          return j;
        });
      }
      e.preventDefault();
      return;
    }

    // only printable chars, include space
    const k = e.key.length === 1 ? e.key : (e.key === " " ? " " : "");
    if (!k) return;

    // start the timer on first valid key
    if (!startedAt) setStartedAt(Date.now());

    const currentChar = fullText[idx] || "";
    const ok = k === currentChar;

    setMarks((old) => {
      const next = [...old];
      next[idx] = ok ? 1 : -1;
      return next;
    });

    // stats & visuals
    if (ok) {
      setHits((h) => h + 1);
      gsap.fromTo(
        ".caret",
        { boxShadow: "0 0 0px rgba(226,183,20,0.0)" },
        { boxShadow: "0 0 18px rgba(226,183,20,0.7)", duration: 0.12, yoyo: true, repeat: 1 }
      );
    } else {
      setErrors((e) => e + 1);
      // subtle shake
      gsap.fromTo(wrapRef.current, { x: -3 }, { x: 0, duration: 0.15, ease: "power2.out" });
    }

    // ALWAYS advance, even on wrong press (requested behavior)
    setIdx((i) => Math.min(i + 1, fullText.length));

    e.preventDefault();
  }

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto">
      {/* stats */}
      <div className="mb-8 flex items-center justify-center gap-8 text-sm">
        <Stat label="WPM" value={wpm.toFixed(0)} />
        <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
        <Stat label="Time" value={`${remaining}s`} />
      </div>

      {/* text */}
      <div className="relative font-mono text-2xl md:text-3xl leading-[2.2rem] md:leading-[2.6rem] text-center">
        {fullText.split("").map((ch, i) => {
          const mark = marks[i]; // -1 wrong, 1 correct, 0 untouched
          const active = i === idx;
          let cls = "";
          if (mark === 1) cls = "text-brand";
          else if (mark === -1) cls = "text-red-500";
          else cls = "text-white/70";

          if (active) cls += " caret underline decoration-2 text-white";

          return (
            <span key={i} className={cls}>
              {ch}
            </span>
          );
        })}
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          className="absolute left-0 top-0 w-px h-px opacity-0"
        />
      </div>

      {ended && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <button
            onClick={() => {
              setMarks(new Array(fullText.length).fill(0));
              setIdx(0);
              setErrors(0);
              setHits(0);
              setEnded(false);
              setStartedAt(null);
              setRemaining(durationSec);
              inputRef.current?.focus();
            }}
            className="btn-primary"
          >
            Retry
          </button>
        </motion.div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-white/60">{label}</div>
      <div className="text-xl drop-neon">{value}</div>
    </div>
  );
}

'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";

/**
 * Endless streaming + 3-line viewport + focus mode hooks
 * Props:
 *  - initialText: string
 *  - supplyMore: async () => string
 *  - durationSec: number
 *  - focusMode: boolean            // active? (parent controls)
 *  - onFocusStart: () => void      // called on first keystroke
 *  - onFocusEnd: () => void        // called when timer ends
 */
export default function TypingTest({
  initialText = "",
  supplyMore,
  durationSec = 60,
  preloadThreshold = 80,
  focusMode = false,
  onFocusStart,
  onFocusEnd,
}) {
  // core state
  const [startedAt, setStartedAt] = useState(null);
  const [ended, setEnded] = useState(false);
  const [idx, setIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [errors, setErrors] = useState(0);

  // refs & DOM
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const viewRef = useRef(null);
  const scrollerRef = useRef(null);
  const charRefs = useRef([]);
  const rafRef = useRef(null);

  const [buffer, setBuffer] = useState(initialText || "");
  const [marks, setMarks] = useState(new Array((initialText || "").length).fill(0));
  const [remaining, setRemaining] = useState(durationSec);

  const [lineHeightPx, setLineHeightPx] = useState(0);
  const [scrolledLines, setScrolledLines] = useState(0);

  // reset on text/duration change
  useEffect(() => {
    const base = typeof initialText === "string" ? initialText : (initialText || "").toString();
    setBuffer(base);
    setMarks(new Array(base.length).fill(0));
    setIdx(0); setHits(0); setErrors(0);
    setEnded(false); setStartedAt(null);
    setRemaining(durationSec);
    setScrolledLines(0);
    gsap.set(scrollerRef.current, { y: 0 });
    // ensure focus after any switch
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [initialText, durationSec]);

  // focus + entrance
  useEffect(() => {
    inputRef.current?.focus();
    gsap.fromTo(wrapRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
  }, []);

  // refocus whenever focusMode toggles (prevents lost focus)
  useEffect(() => {
    if (!ended) inputRef.current?.focus();
  }, [focusMode, ended]);

  // keep focus on any key press
  useEffect(() => {
    const h = () => { if (!ended) inputRef.current?.focus(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [ended]);

  // measure line-height => viewport = 3 lines
  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const recalc = () => {
      const lh = parseFloat(getComputedStyle(el).lineHeight) || 36;
      setLineHeightPx(lh);
      el.style.height = `${lh * 3}px`;
      gsap.set(scrollerRef.current, { y: -(scrolledLines * lh) });
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, [scrolledLines]);

  // timer (rAF)
  useEffect(() => {
    if (!startedAt || ended) return;
    const tick = () => {
      const secondsLeft = Math.max(0, Math.ceil(durationSec - (Date.now() - startedAt) / 1000));
      setRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        setEnded(true);
        onFocusEnd && onFocusEnd();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startedAt, ended, durationSec, onFocusEnd]);

  async function maybePreloadMore(nextIndex) {
    const left = buffer.length - nextIndex;
    if (left < preloadThreshold && supplyMore && !ended) {
      const more = await supplyMore();
      if (more && more.length) {
        setBuffer(prev => prev + more);
        setMarks(prev => prev.concat(new Array(more.length).fill(0)));
      }
    }
  }

  // scroll up when caret enters 3rd visual line
  useEffect(() => {
    if (!lineHeightPx || !viewRef.current || !charRefs.current[idx]) return;
    const caretRect = charRefs.current[idx].getBoundingClientRect();
    const viewRect = viewRef.current.getBoundingClientRect();
    const relTop = caretRect.top - viewRect.top;
    const currentLine = Math.floor(relTop / lineHeightPx + 0.0001);
    if (currentLine >= 2) {
      setScrolledLines(s => {
        const ns = s + 1;
        gsap.to(scrollerRef.current, { y: -(ns * lineHeightPx), duration: 0.15, ease: "power2.out" });
        return ns;
      });
    }
  }, [idx, lineHeightPx]);

  function onKeyDown(e) {
    if (ended) return;

    // Backspace correction
    if (e.key === "Backspace") {
      if (idx > 0) {
        setIdx(i => {
          const j = i - 1;
          setMarks(prev => {
            const next = [...prev];
            const prevMark = next[j];
            if (prevMark === 1) setHits(h => Math.max(0, h - 1));
            if (prevMark === -1) setErrors(er => Math.max(0, er - 1));
            next[j] = 0;
            return next;
          });
          return j;
        });
      }
      e.preventDefault();
      return;
    }

    // printable + space
    const k = e.key.length === 1 ? e.key : (e.key === " " ? " " : "");
    if (!k) return;

    // First valid key => start + enter focus
    if (!startedAt) {
      setStartedAt(Date.now());
      onFocusStart && onFocusStart();
    }

    const ch = buffer[idx] || "";
    const ok = k === ch;

    setMarks(old => {
      const next = [...old];
      next[idx] = ok ? 1 : -1;
      return next;
    });

    if (ok) {
      setHits(h => h + 1);
      gsap.fromTo(".caret", { boxShadow: "0 0 0px rgba(226,183,20,0.0)" }, { boxShadow: "0 0 18px rgba(226,183,20,0.7)", duration: 0.12, yoyo: true, repeat: 1 });
    } else {
      setErrors(e => e + 1);
      gsap.fromTo(wrapRef.current, { x: -3 }, { x: 0, duration: 0.15, ease: "power2.out" });
    }

    const nextIndex = Math.min(idx + 1, buffer.length);
    setIdx(nextIndex);
    maybePreloadMore(nextIndex);

    e.preventDefault();
  }

  const elapsedSec = startedAt ? Math.max(0, (Date.now() - startedAt) / 1000) : 0;
  const wpm = startedAt ? (hits / 5) / Math.max(1, elapsedSec / 60) : 0;
  const accuracy = hits + errors ? (hits / (hits + errors)) * 100 : 100;

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto" onMouseDown={() => inputRef.current?.focus()}>
      {/* normal stats (hidden in focus mode) */}
      {!focusMode && (
        <div className="mb-6 flex items-center justify-center gap-8 text-sm">
          <Stat label="WPM" value={wpm.toFixed(0)} />
          <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
          <Stat label="Time" value={`${remaining}s`} />
        </div>
      )}

      {/* floating timer HUD (shown in focus mode) */}
      {focusMode && (
        <div className="fixed -top-10 left-1/2 -translate-x-1/2 text-base md:text-2xl font-semibold text-brand drop-neon z-50">
          {remaining}s
        </div>
      )}

      {/* 3-line viewport */}
      <div
        ref={viewRef}
        className="relative font-mono text-2xl md:text-3xl leading-[2.2rem] md:leading-[2.6rem] overflow-hidden text-center"
      >
        <div ref={scrollerRef}>
          {buffer.split("").map((ch, i) => {
            const mark = marks[i];
            const active = i === idx;
            let cls = "";
            if (mark === 1) cls = "text-brand";
            else if (mark === -1) cls = "text-red-500";
            else cls = "text-white/70";
            if (active) cls += " caret underline decoration-2 text-white";
            return (
              <span
                key={i}
                ref={(el) => (charRefs.current[i] = el)}
                className={cls}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <input
          ref={inputRef}
          onKeyDown={onKeyDown}
          className="absolute left-0 top-0 w-px h-px opacity-0"
        />
      </div>

      {ended && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => {
              setBuffer(initialText || "");
              setMarks(new Array((initialText || "").length).fill(0));
              setIdx(0); setErrors(0); setHits(0);
              setEnded(false); setStartedAt(null);
              setRemaining(durationSec);
              setScrolledLines(0);
              gsap.set(scrollerRef.current, { y: 0 });
              inputRef.current?.focus();
            }}
            className="btn-primary">
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

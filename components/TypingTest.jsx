'use client';
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import ResultModal from "./ResultModal";

/**
 * Streaming + 3-line viewport + focus mode + Tab→Enter restart
 * - If durationSec === 60: primary = WPM
 * - If durationSec !== 60: primary = Words (session), sub = WPM
 *
 * ✅ Competitive Mode:
 * - Backspace doesn't delete
 * - Each Backspace press deducts 0.5s from clock
 * - Shows tiny "-0.5s" toast
 */
export default function TypingTest({
  initialText = "",
  supplyMore,
  durationSec = 60,
  preloadThreshold = 80,
  focusMode = false,
  onFocusStart,
  onFocusEnd,
  onRestart,
  competitiveMode = false, // ✅ NEW
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

  // buffer & marks
  const [buffer, setBuffer] = useState(initialText || "");
  const [marks, setMarks] = useState(new Array((initialText || "").length).fill(0));
  const [typed, setTyped] = useState([]);

  // time left
  const [remaining, setRemaining] = useState(durationSec);

  // ✅ penalty tracking (0.5s per backspace)
  const penaltyMsRef = useRef(0);
  const [showPenaltyToast , setShowPenaltyToast] = useState(false);
  const toastTimerRef = useRef(null);

  // 3-line scroll
  const [lineHeightPx, setLineHeightPx] = useState(0);
  const [scrolledLines, setScrolledLines] = useState(0);

  // Cleanup Effect
  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  // Force-Hide Toast on Test End
  useEffect(() => {
    if (ended) {
      setShowPenaltyToast(false);
      clearTimeout(toastTimerRef.current);
    }
  }, [ended]);

  // Results modal
  const [showResults, setShowResults] = useState(false);
  useEffect(() => {
    if (ended) {
      const timer = setTimeout(() => setShowResults(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [ended]);

  // --- Tab → Enter arming ---
  const tabArmedRef = useRef(false);
  const tabTimerRef = useRef(null);
  const [showTabHint, setShowTabHint] = useState(false);

  // ✅ penalty toast
  const [penaltyToastKey, setPenaltyToastKey] = useState(0);

  const triggerPenaltyToast = () => {
    setShowPenaltyToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowPenaltyToast(false), 700);
  };


  // reset on text/duration change
  useEffect(() => {
    const base = typeof initialText === "string" ? initialText : (initialText || "").toString();
    setBuffer(base);
    setMarks(new Array(base.length).fill(0));
    setIdx(0); setHits(0); setErrors(0);
    setTyped([]);
    setEnded(false); setStartedAt(null);
    setRemaining(durationSec);
    setScrolledLines(0);
    gsap.set(scrollerRef.current, { y: 0 });

    penaltyMsRef.current = 0; // ✅ reset penalty

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [initialText, durationSec]);

  // focus + entrance
  useEffect(() => {
    inputRef.current?.focus();
    gsap.fromTo(wrapRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
  }, []);

  // refocus when focusMode toggles
  useEffect(() => {
    if (!ended) inputRef.current?.focus();
  }, [focusMode, ended]);

  // keep focus on any key press
  useEffect(() => {
    const h = () => { if (!ended) inputRef.current?.focus(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [ended]);

  // measure line-height => 3-line viewport
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

  // ✅ effective elapsed includes penalty
  const getEffectiveElapsedMs = () => {
    if (!startedAt) return 0;
    return (Date.now() - startedAt) + penaltyMsRef.current;
  };

  // timer (rAF)
  useEffect(() => {
    if (!startedAt || ended) return;

    const tick = () => {
      const effectiveElapsedMs = getEffectiveElapsedMs();
      const secondsLeft = Math.max(0, Math.ceil(durationSec - (effectiveElapsedMs / 1000)));

      setRemaining(secondsLeft);

      if (secondsLeft <= 0) {
        setEnded(true);
        onFocusEnd && onFocusEnd();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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

  // unified reset
  function resetTest() {
    setBuffer(initialText || "");
    setMarks(new Array((initialText || "").length).fill(0));
    setIdx(0);
    setTyped([]);
    setErrors(0);
    setHits(0);
    setEnded(false);
    setStartedAt(null);
    setRemaining(durationSec);
    setScrolledLines(0);
    setShowPenaltyToast(false);
    clearTimeout(toastTimerRef.current);
    gsap.set(scrollerRef.current, { y: 0 });

    penaltyMsRef.current = 0; // ✅ reset penalty

    gsap.fromTo(wrapRef.current, { scale: 0.98 }, { scale: 1, duration: 0.15, ease: "power2.out" });
    inputRef.current?.focus();
  }

  function applyBackspacePenalty() {
    // deduct 0.5 seconds from clock
    penaltyMsRef.current += 500;
    
    // Update toast key to retrigger animation
    setPenaltyToastKey(k => k + 1);
    triggerPenaltyToast();

    // if started, force UI update by nudging remaining right away
    if (startedAt) {
      const secondsLeft = Math.max(0, Math.ceil(durationSec - (getEffectiveElapsedMs() / 1000)));
      setRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        setEnded(true);
        onFocusEnd && onFocusEnd();
      }
    }
  }

  function onKeyDown(e) {
    if (ended) return;

    // Tab → Enter restart (call onRestart for reroll)
    if (e.key === "Tab") {
      e.preventDefault();
      tabArmedRef.current = true;
      setShowTabHint(true);
      clearTimeout(tabTimerRef.current);
      tabTimerRef.current = setTimeout(() => {
        tabArmedRef.current = false;
        setShowTabHint(false);
      }, 1200);
      return;
    }
    if (e.key === "Enter" && tabArmedRef.current) {
      e.preventDefault();
      tabArmedRef.current = false;
      setShowTabHint(false);
      if (onRestart) onRestart();
      return;
    }

    // ✅ Competitive Mode: block Backspace + penalty
    if (e.key === "Backspace") {
      e.preventDefault();

      if (competitiveMode) {
        applyBackspacePenalty();
        return;
      }

      // normal behavior (non-competitive)
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

    setTyped(prev => {
      const next = [...prev];
      next[idx] = k;
      return next;
    });

    setMarks(old => {
      const next = [...old];
      next[idx] = ok ? 1 : -1;
      return next;
    });

    if (ok) {
      setHits(h => h + 1);
      gsap.fromTo(".caret",
        { boxShadow: "0 0 0px rgba(226,183,20,0.0)" },
        { boxShadow: "rgba(226,183,20,0.7) 0px 3px 0px 0px", duration: 0.12, yoyo: true, repeat: 1 }
      );
    } else {
      setErrors(er => er + 1);
      gsap.fromTo(wrapRef.current, { x: -3 }, { x: 0, duration: 0.15, ease: "power2.out" });
    }

    const nextIndex = Math.min(idx + 1, buffer.length);
    setIdx(nextIndex);
    maybePreloadMore(nextIndex);

    e.preventDefault();
  }

  // ---- metrics (include penalty in elapsed) ----
  const elapsedSec = startedAt ? Math.max(0, getEffectiveElapsedMs() / 1000) : 0;
  const grossWords = hits / 5;
  const wpm = startedAt ? (grossWords / Math.max(0.001, elapsedSec / 60)) : 0;

  const primaryLabel = durationSec === 60 ? "WPM" : "Words";
  const primaryValue = durationSec === 60 ? wpm.toFixed(0) : Math.floor(grossWords);
  const subValue = durationSec === 60 ? null : `WPM ${wpm.toFixed(0)}`;
  const accuracy = hits + errors ? (hits / (hits + errors)) * 100 : 100;

  const testStats = {
    wpm,
    accuracy,
    hits,
    words: grossWords,
    duration: durationSec,
    mode: competitiveMode ? "competitive" : "classic",
  };

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto" onMouseDown={() => inputRef.current?.focus()}>
      {/* stats (hidden during focus) */}
      {!focusMode && (
        <div className="mb-6 flex items-center justify-center gap-8 text-sm">
          <Stat label={primaryLabel} value={primaryValue} sub={subValue} />
          <Stat label="Accuracy" value={`${accuracy.toFixed(0)}%`} />
          <Stat label="Time" value={`${remaining}s`} />
        </div>
      )}

      {/* floating timer HUD in focus mode */}
      {focusMode && (
        <div className="fixed -top-20 left-1/2 -translate-x-1/2 text-base md:text-lg font-semibold text-brand drop-neon z-50">
          {remaining}s
        </div>
      )}

      {/* ✅ tiny penalty toast */}
      <AnimatePresence>
        {competitiveMode && showPenaltyToast && !ended && (
          <motion.div
            key={penaltyToastKey}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="fixed -top-20 left-[55%] -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <div className="text-xs font-semibold px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-300 shadow">
              -0.5s
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab→Enter hint */}
      {showTabHint && !ended && (
        <div className="fixed -bottom-14 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded bg-black/60 border border-white/10 text-white/80 z-50">
          Tab → Enter to restart
        </div>
      )}

      {focusMode && !ended && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-6 text-sm text-white/60 z-40">
          <div>WPM: {wpm.toFixed(0)}</div>
          <div>ACC: {accuracy.toFixed(0)}%</div>
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
            const userChar = typed[i];

            let cls = "";
            if (mark === 1) cls = "text-brand opacity-50";
            else if (mark === -1) cls = "text-red-500";
            else cls = "text-white/70";

            if (active) cls += " caret underline decoration-2 text-white";

            if (ch === " ") {
              return (
                <span
                  key={i}
                  ref={(el) => (charRefs.current[i] = el)}
                  className="relative inline-block"
                >
                  <span className="text-white/50">{"\u00A0"}</span>

                  {userChar && mark === -1 && (
                    <span className="absolute left-0 top-0 text-red-500 opacity-50">
                      {userChar}
                    </span>
                  )}

                  {active && (
                    <span className="absolute left-0 top-0 underline decoration-2 text-white caret">
                      {"\u00A0"}
                    </span>
                  )}
                </span>
              );
            }

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
        <>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-center gap-3"
          >
            <button onClick={resetTest} className="btn-primary">Retry</button>
          </motion.div>

          <ResultModal
            open={showResults}
            stats={testStats}
            onClose={() => { setShowResults(false); inputRef.current?.focus(); }}
            onRetry={() => { setShowResults(false); resetTest(); }}
            durationSec={durationSec}
          />
        </>
      )}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="text-center">
      <div className="text-white/60">{label}</div>
      <div className="text-xl drop-neon">{value}</div>
      {sub ? <div className="text-[11px] mt-0.5 text-white/40">{sub}</div> : null}
    </div>
  );
}

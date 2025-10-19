'use client';
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const STORAGE_KEY = "tmt_stats";

export default function ResultModal({ open, stats, onClose, onRetry }) {
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);
  const savedOnceRef = useRef(false);       // localStorage save guard
  const pushedToDBRef = useRef(false);      // DB sync guard

  const { isSignedIn } = useUser();

  // ---- helpers --------------------------------------------------------------

  // Get best-for-this-duration from localStorage only (avoid mixing categories)
  function getLocalBestForDuration(duration) {
    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(arr) || arr.length === 0) return null;

      const dur = Number(duration);
      if (!Number.isFinite(dur)) return null;

      let bestWpm = -1;
      let bestAccuracy = -1;

      for (const r of arr) {
        const rDur = Number(r?.duration);
        if (rDur !== dur) continue;
        const w = Number(r?.wpm) || 0;
        const a = Number(r?.accuracy) || 0;
        if (w > bestWpm) bestWpm = w;
        if (a > bestAccuracy) bestAccuracy = a;
      }

      if (bestWpm < 0 && bestAccuracy < 0) return null; // none for that duration

      return {
        bestWpm: Math.max(0, bestWpm),
        bestAccuracy: Math.max(0, bestAccuracy),
        duration: dur,
      };
    } catch {
      return null;
    }
  }

  // ---- DB sync once when modal opens ---------------------------------------

  useEffect(() => {
    if (!open || !isSignedIn || !stats || pushedToDBRef.current) return;

    const sessionDur = Number(stats.duration);
    if (!Number.isFinite(sessionDur)) return; // must have a valid duration

    // current session payload (rounded like your API expects)
    let payload = {
      bestWpm: Math.round(Number(stats.wpm) || 0),
      bestAccuracy: Math.round(Number(stats.accuracy) || 0),
      duration: sessionDur,
    };

    // if local best for this duration beats current, send that instead
    const localBest = getLocalBestForDuration(sessionDur);
    if (localBest) {
      if (localBest.bestWpm > payload.bestWpm) payload.bestWpm = localBest.bestWpm;
      if (localBest.bestAccuracy > payload.bestAccuracy) payload.bestAccuracy = localBest.bestAccuracy;
    }

    // Only send if it’s at least meaningful (>= 1 WPM)
    if (payload.bestWpm > 0) {
      pushedToDBRef.current = true;
      (async () => {
        try {
          const res = await fetch("/api/saveScore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            console.error("saveScore error:", res.status, txt);
          }
        } catch (e) {
          console.error("saveScore fetch failed:", e);
        }
      })();
    }
  }, [open, isSignedIn, stats]);

  // ---- animate in -----------------------------------------------------------

  useEffect(() => {
    if (open && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.86, y: 22 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "power3.out" }
      );
      setTimeout(() => firstButtonRef.current?.focus(), 50);
    }
  }, [open]);

  // ---- save this session to localStorage (once per open) --------------------

  useEffect(() => {
    if (!open || !stats || savedOnceRef.current) return;

    const entry = {
      wpm: Number(stats.wpm?.toFixed?.(1) ?? stats.wpm ?? 0),
      accuracy: Number(stats.accuracy?.toFixed?.(1) ?? stats.accuracy ?? 0),
      words: Number((stats.words ?? 0).toFixed?.(0) ?? stats.words ?? 0),
      hits: Number(stats.hits ?? 0),
      duration: Number(stats.duration ?? 60),
      date: new Date().toISOString(),
    };
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.push(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      savedOnceRef.current = true;
    } catch {
      // ignore storage errors
    }
  }, [open, stats]);

  // ---- keyboard shortcuts ---------------------------------------------------

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); onClose?.(); }
      if (e.key === "Enter")  { e.preventDefault(); onRetry?.(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onRetry]);

  if (!open) return null;

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Typing test results"
    >
      <motion.div
        ref={modalRef}
        className="bg-[#1e1e1f] rounded-2xl p-6 md:p-8 w-[92%] max-w-xl md:max-w-2xl text-center border border-white/10 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-bold text-brand mb-2">Test Completed!</h2>
        <p className="text-white/50 text-xs mb-5">
          {new Date().toLocaleString()} • {Number(stats?.duration ?? 60)}s session
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left text-white/90 mb-6">
          <Stat label="WPM" value={Number(stats.wpm).toFixed(0)} />
          <Stat label="Accuracy" value={`${Number(stats.accuracy).toFixed(1)}%`} />
          <Stat label="Words" value={Number(stats.words).toFixed(0)} />
          <Stat label="Characters" value={Number(stats.hits)} />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            ref={firstButtonRef}
            onClick={onRetry}
            className="px-4 py-2 bg-brand text-ink rounded-md hover:bg-[#d8a800] transition focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            Retry
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            Close
          </button>
          <Link
            href="/stats"
            className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            View Stats
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 p-3">
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-lg md:text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

'use client';
import { useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

// ✅ NEW: split keys
const KEY_CLASSIC = "tmt_stats_classic";
const KEY_COMP = "tmt_stats_competitive";

// ✅ legacy key for migration compatibility (optional)
const LEGACY_KEY = "tmt_stats";

export default function ResultModal({ open, stats, onClose, onRetry }) {
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);

  const savedOnceRef = useRef(false);  // localStorage save guard
  const pushedToDBRef = useRef(false); // DB sync guard

  const { isSignedIn } = useUser();

  // ✅ Determine mode + storage key safely
  const mode = useMemo(() => {
    const m = String(stats?.mode || "classic").toLowerCase();
    return m === "competitive" ? "competitive" : "classic";
  }, [stats?.mode]);

  const storageKey = mode === "competitive" ? KEY_COMP : KEY_CLASSIC;

  // ✅ Helper: best-for-duration from the correct bucket
  function getLocalBestForDuration(duration) {
    try {
      const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
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

      if (bestWpm < 0 && bestAccuracy < 0) return null;

      return {
        bestWpm: Math.max(0, bestWpm),
        bestAccuracy: Math.max(0, bestAccuracy),
        duration: dur,
      };
    } catch {
      return null;
    }
  }

  // ✅ Reset guards when modal closes/opens again
  useEffect(() => {
    if (!open) {
      savedOnceRef.current = false;
      pushedToDBRef.current = false;
    }
  }, [open]);

  // ✅ Animate in
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

  // ✅ Save to localStorage (mode-specific key)
  useEffect(() => {
    if (!open || !stats || savedOnceRef.current) return;

    const entry = {
      mode, // ✅ store mode for debugging
      wpm: Number(stats.wpm?.toFixed?.(1) ?? stats.wpm ?? 0),
      accuracy: Number(stats.accuracy?.toFixed?.(1) ?? stats.accuracy ?? 0),
      words: Number((stats.words ?? 0).toFixed?.(0) ?? stats.words ?? 0),
      hits: Number(stats.hits ?? 0),
      duration: Number(stats.duration ?? 60),
      date: new Date().toISOString(),
    };

    try {
      // ✅ Optional: if legacy exists and new classic doesn't, migrate once
      if (mode === "classic") {
        const legacy = localStorage.getItem(LEGACY_KEY);
        const classicExists = localStorage.getItem(KEY_CLASSIC);
        if (legacy && !classicExists) localStorage.setItem(KEY_CLASSIC, legacy);
      }

      const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
      const safeArr = Array.isArray(existing) ? existing : [];
      safeArr.push(entry);

      localStorage.setItem(storageKey, JSON.stringify(safeArr));
      savedOnceRef.current = true;
    } catch {
      // ignore
    }
  }, [open, stats, storageKey, mode]);

  // ✅ DB sync once when modal opens (use best-for-duration from the same mode bucket)
  useEffect(() => {
    if (!open || !isSignedIn || !stats || pushedToDBRef.current) return;

    const sessionDur = Number(stats.duration);
    if (!Number.isFinite(sessionDur)) return;

    let payload = {
      bestWpm: Math.round(Number(stats.wpm) || 0),
      bestAccuracy: Math.round(Number(stats.accuracy) || 0),
      duration: sessionDur,
      mode, // ✅ IMPORTANT
    };

    const localBest = getLocalBestForDuration(sessionDur);
    if (localBest) {
      if (localBest.bestWpm > payload.bestWpm) payload.bestWpm = localBest.bestWpm;
      if (localBest.bestAccuracy > payload.bestAccuracy) payload.bestAccuracy = localBest.bestAccuracy;
    }

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
  }, [open, isSignedIn, stats, mode, storageKey]);

  // ✅ Keyboard shortcuts
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
        <h2 className="text-2xl font-bold text-brand mb-1">Test Completed!</h2>

        <p className="text-white/50 text-xs mb-5">
          {new Date().toLocaleString()} • {Number(stats?.duration ?? 60)}s •{" "}
          <span className="text-white/60">{mode === "competitive" ? "Competitive" : "Classic"}</span>
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

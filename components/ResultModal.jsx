'use client';
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { buildResultShareAsset } from "@/lib/resultShare";

const KEY_CLASSIC = "tmt_stats_classic";
const KEY_COMP = "tmt_stats_competitive";
const LEGACY_KEY = "tmt_stats";

export default function ResultModal({ open, stats, onClose, onRetry }) {
  const modalRef = useRef(null);
  const firstButtonRef = useRef(null);
  const savedOnceRef = useRef(false);
  const pushedToDBRef = useRef(false);
  const profileTrackedRef = useRef(false);

  const [shareBusy, setShareBusy] = useState("");
  const [shareMessage, setShareMessage] = useState("");

  const { user, isSignedIn } = useUser();

  const mode = useMemo(() => {
    const currentMode = String(stats?.mode || "classic").toLowerCase();
    return currentMode === "competitive" ? "competitive" : "classic";
  }, [stats?.mode]);

  const storageKey = mode === "competitive" ? KEY_COMP : KEY_CLASSIC;
  const testType = stats?.testType === "words" ? "words" : "time";
  const shouldPersistResult = testType === "time";

  function getLocalBestForDuration(duration) {
    try {
      const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (!Array.isArray(arr) || arr.length === 0) return null;

      const dur = Number(duration);
      if (!Number.isFinite(dur)) return null;

      let bestWpm = -1;
      let bestAccuracy = -1;

      for (const row of arr) {
        const rowDuration = Number(row?.duration);
        if (rowDuration !== dur) continue;

        const rowWpm = Number(row?.wpm) || 0;
        const rowAccuracy = Number(row?.accuracy) || 0;

        if (rowWpm > bestWpm) bestWpm = rowWpm;
        if (rowAccuracy > bestAccuracy) bestAccuracy = rowAccuracy;
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

  useEffect(() => {
    if (!open) {
      savedOnceRef.current = false;
      pushedToDBRef.current = false;
      profileTrackedRef.current = false;
      setShareBusy("");
      setShareMessage("");
    }
  }, [open]);

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

  useEffect(() => {
    if (!open || !stats || savedOnceRef.current || !shouldPersistResult) return;

    const entry = {
      mode,
      wpm: Number(stats.wpm?.toFixed?.(1) ?? stats.wpm ?? 0),
      accuracy: Number(stats.accuracy?.toFixed?.(1) ?? stats.accuracy ?? 0),
      words: Number((stats.words ?? 0).toFixed?.(0) ?? stats.words ?? 0),
      hits: Number(stats.hits ?? 0),
      duration: Number(stats.duration ?? 60),
      date: new Date().toISOString(),
    };

    try {
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
      // ignore local save failures
    }
  }, [open, stats, storageKey, mode, shouldPersistResult]);

  useEffect(() => {
    if (!open || !isSignedIn || !stats || pushedToDBRef.current || !shouldPersistResult) return;

    const sessionDur = Number(stats.duration);
    if (!Number.isFinite(sessionDur)) return;

    const payload = {
      bestWpm: Math.round(Number(stats.wpm) || 0),
      bestAccuracy: Math.round(Number(stats.accuracy) || 0),
      duration: sessionDur,
      mode,
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
        } catch (error) {
          console.error("saveScore fetch failed:", error);
        }
      })();
    }
  }, [open, isSignedIn, stats, mode, shouldPersistResult, storageKey]);

  useEffect(() => {
    if (!open || !isSignedIn || !stats || profileTrackedRef.current) return;

    profileTrackedRef.current = true;
    (async () => {
      try {
        await fetch("/api/profile/record-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            mode,
            testType,
            duration: Number(stats.duration || 0),
            targetWordCount: Number(stats.targetWordCount || 0),
            wpm: Number(stats.wpm || 0),
            accuracy: Number(stats.accuracy || 0),
            elapsedSec: Number(stats.elapsedSec || 0),
            characters: Number(stats.characters ?? stats.hits ?? 0),
            hits: Number(stats.hits || 0),
            backspaces: Number(stats.backspaces || 0),
          }),
        });
      } catch (error) {
        console.error("profile record-test failed:", error);
      }
    })();
  }, [open, isSignedIn, stats, mode, testType]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        onRetry?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onRetry]);

  if (!open) return null;

  const onBackdrop = (event) => {
    if (event.target === event.currentTarget) onClose?.();
  };

  const metaLabel =
    testType === "words"
      ? `${Number(stats?.targetWordCount ?? 0)} words`
      : `${Number(stats?.duration ?? 60)}s`;

  async function getShareAsset() {
    return buildResultShareAsset({
      stats,
      username: user?.username || user?.firstName || "Typist",
    });
  }

  async function handleDownloadCard() {
    setShareBusy("download");
    setShareMessage("");

    try {
      const { blob, file } = await getShareAsset();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setShareMessage(error.message || "Could not generate the result image.");
    } finally {
      setShareBusy("");
    }
  }

  async function handleShareCard() {
    setShareBusy("share");
    setShareMessage("");

    try {
      const { file, blob } = await getShareAsset();
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My TheMonkeyType result",
          text: "Sharing my latest typing result from TheMonkeyType.",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = file.name;
        anchor.click();
        URL.revokeObjectURL(url);
        setShareMessage("Direct sharing is not supported here, so the card was downloaded instead.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setShareMessage(error.message || "Could not share the result image.");
      }
    } finally {
      setShareBusy("");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onMouseDown={onBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Typing test results"
    >
      <motion.div
        ref={modalRef}
        className="w-[92%] max-w-xl rounded-2xl border border-white/10 bg-[#1e1e1f] p-6 text-center shadow-lg md:max-w-2xl md:p-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="mb-1 text-2xl font-bold text-brand">Test Completed!</h2>

        <p className="mb-5 text-xs text-white/50">
          {new Date().toLocaleString()} • {metaLabel} •{" "}
          <span className="text-white/60">{mode === "competitive" ? "Competitive" : "Classic"}</span>
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4 text-left text-white/90 md:grid-cols-4">
          <Stat label="WPM" value={Number(stats.wpm).toFixed(0)} />
          <Stat label="Accuracy" value={`${Number(stats.accuracy).toFixed(1)}%`} />
          <Stat
            label={testType === "words" ? "Time" : "Words"}
            value={
              testType === "words"
                ? `${Number(stats?.elapsedSec || 0).toFixed(1)}s`
                : Number(stats.words).toFixed(0)
            }
          />
          <Stat label="Characters" value={Number(stats.characters ?? stats.hits ?? 0)} />
        </div>

        {!mode || mode === "classic" ? (
          <div className={`mb-6 grid grid-cols-1 gap-4 text-left text-white/90 ${stats?.beginnerMode ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            <Stat label="Backspaces" value={Number(stats.backspaces || 0)} />
            {testType === "words" ? (
              <Stat label="Words Target" value={Number(stats.targetWordCount || 0)} />
            ) : (
              <Stat label="Test Type" value="Time" />
            )}
            {stats?.beginnerMode ? (
              <Stat label="Mistakes" value={Number(stats.mistakes || 0)} />
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button ref={firstButtonRef} onClick={onRetry} className="btn-primary">
            Retry
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <Link href="/stats" className="btn-secondary">
            View Stats
          </Link>
          {isSignedIn ? (
            <Link href="/profile" className="btn-secondary">
              View Profile
            </Link>
          ) : null}
          <button onClick={handleDownloadCard} className="btn-secondary" disabled={shareBusy !== ""}>
            {shareBusy === "download" ? "Preparing..." : "Download Card"}
          </button>
          <button onClick={handleShareCard} className="btn-secondary" disabled={shareBusy !== ""}>
            {shareBusy === "share" ? "Preparing..." : "Share Result"}
          </button>
        </div>

        {shareMessage ? <p className="mt-4 text-sm text-white/55">{shareMessage}</p> : null}
      </motion.div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="text-lg font-semibold text-white md:text-xl">{value}</div>
    </div>
  );
}

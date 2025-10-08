'use client';
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";

export default function ResultModal({ open, stats, onClose, onRetry }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (open && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        ref={modalRef}
        className="bg-[#1e1e1f] rounded-2xl p-8 w-[90%] max-w-1/2 text-center border border-white/10 shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h2 className="text-2xl font-bold text-brand mb-4">Test Completed!</h2>

        <div className="grid grid-cols-2 gap-4 text-left text-white/90 mb-6">
          <Stat label="WPM" value={stats.wpm.toFixed(0)} />
          <Stat label="Accuracy" value={`${stats.accuracy.toFixed(1)}%`} />
          <Stat label="Words Typed" value={stats.words.toFixed(0)} />
          <Stat label="Characters" value={stats.hits} />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-brand text-ink rounded-md hover:bg-[#d8a800] transition"
          >
            Retry
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

'use client';
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { IoMdSettings } from "react-icons/io";

export default function TopBar({
  lang, setLang,
  duration, setDuration,
  punctuation, setPunctuation,
  numbers, setNumbers
}) {
  const [open, setOpen] = useState(false);           // mobile modal
  const modalRef = useRef(null);
  const times = [15, 30, 60, 120];

  useEffect(() => {
    gsap.fromTo(".topbar-stagger",{y:-8,opacity:0},{y:0,opacity:1,duration:0.4,stagger:0.03});
  }, []);

  const pulse = (el) =>
    gsap.fromTo(
      el,
      { boxShadow: "0 0 0 rgba(226,183,20,0)" },
      { boxShadow: "0 0 18px rgba(226,183,20,0.6)", duration: 0.18, yoyo: true, repeat: 1 }
    );

  // Close modal with ESC / backdrop
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Shared controls UI (used in inline bar + modal)
  const Controls = ({ compact = false }) => (
    <div
      className={
        (compact ? "flex flex-col gap-3" : "flex items-center gap-3") +
        " text-sm"
      }
    >
      <div className={compact ? "flex gap-2" : ""}>
        <button
          onClick={(e)=>{ setPunctuation(v=>!v); pulse(e.currentTarget); }}
          className={
            "topbar-stagger px-3 py-1 rounded-md transition-all " +
            (punctuation
              ? "text-brand font-bold"
              : "text-white/70 hover:text-white")
          }
        >
          @ Punctuation
        </button>
        <button
          onClick={(e)=>{ setNumbers(v=>!v); pulse(e.currentTarget); }}
          className={
            "topbar-stagger px-3 py-1 rounded-md transition-all " +
            (numbers
              ? "text-brand font-bold"
              : "text-white/70 hover:text-white")
          }
        >
          # Numbers
        </button>
      </div>

      {!compact && <div className="h-5 w-px bg-white/10 mx-1" />}

      <div className={compact ? "grid grid-cols-4 gap-2" : "flex items-center gap-1"}>
        {times.map((t)=>(
          <button key={t}
            onClick={(e)=>{ setDuration(t); pulse(e.currentTarget); }}
            className={
              "topbar-stagger px-3 py-1 rounded-md transition-all " +
              (duration===t
                ? "text-brand font-bold"
                : "text-white/70 hover:text-white")
            }>
            {t}s
          </button>
        ))}
      </div>

      {!compact && <div className="h-5 w-px bg-white/10 mx-1" />}

      <label className={compact ? "block" : "sr-only"} htmlFor="lang">Language</label>
      <select
        id="lang"
        value={lang}
        onChange={(e)=>setLang(e.target.value)}
        className={
          "topbar-stagger bg-black/40 border border-white/10 text-white/90 rounded-md px-3 py-1 " +
          "focus:outline-none focus:ring-2 focus:ring-brand"
        }
        aria-label="Language"
      >
        <option value="english">English</option>
        <option value="urdu">Urdu</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );

  return (
    <>
      {/* Desktop/Tablet inline bar */}
      <div className="hidden md:flex mx-auto mt-4 mb-2 items-center justify-center gap-3 bg-black/20 rounded-full py-2 px-4 w-max backdrop-blur-sm">
        <Controls />
      </div>

      {/* Mobile: single button that opens modal */}
      <div className="flex md:hidden justify-center mt-3 mb-2">
        <button
          onClick={()=>setOpen(true)}
          className="px-4 py-2 text-white/70 rounded-full flex text-sm font-semibold active:scale-95 transition bg-black/20"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="settings-modal"
        ><IoMdSettings className="text-xl py-1 text-white/70 "/> 
          Test Settings
        </button>
      </div>

      {/* Mobile modal */}
      {open && (
        <div
          id="settings-modal"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={()=>setOpen(false)}
          />
          <div
            ref={modalRef}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md
                       bg-[#1f1f20] border border-white/10 rounded-2xl p-5 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-brand">Test Settings</h2>
              <button
                onClick={()=>setOpen(false)}
                className="text-white/70 hover:text-white px-2 py-1 rounded-md hover:bg-white/10"
                aria-label="Close settings"
              >
                ✕
              </button>
            </div>

            {/* Controls in compact layout */}
            <Controls compact />

            <div className="mt-5 flex justify-end">
              <button
                onClick={()=>setOpen(false)}
                className="px-4 py-1.5 rounded-md bg-brand text-ink font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

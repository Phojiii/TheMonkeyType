'use client';
import { useEffect } from "react";
import { gsap } from "gsap";

export default function TopBar({
  lang, setLang,
  duration, setDuration,
  punctuation, setPunctuation,
  numbers, setNumbers
}) {
  useEffect(() => {
    gsap.fromTo(".topbar-stagger",{y:-8,opacity:0},{y:0,opacity:1,duration:0.4,stagger:0.03});
  }, []);

  const times = [15, 30, 60, 120];
  const pulse = (el) => gsap.fromTo(el,{boxShadow:"0 0 0 rgba(226,183,20,0)"},{boxShadow:"0 0 18px rgba(226,183,20,0.6)",duration:0.18,yoyo:true,repeat:1});

  return (
    <div className="mx-auto mt-4 mb-2 flex items-center justify-center gap-3 bg-black/20 rounded-full py-2 px-4 w-max backdrop-blur-sm">
      <button
        onClick={(e)=>{ setPunctuation(v=>!v); pulse(e.currentTarget); }}
        className={"topbar-stagger text-xs px-2 py-1 rounded-md transition-all " + (punctuation ? "bg-brand text-ink shadow-[0_0_10px_rgba(226,183,20,0.35)]" : "text-white/60 hover:text-white hover:bg-white/10")}>
        @ Punctuation
      </button>
      <button
        onClick={(e)=>{ setNumbers(v=>!v); pulse(e.currentTarget); }}
        className={"topbar-stagger text-xs px-2 py-1 rounded-md transition-all " + (numbers ? "bg-brand text-ink shadow-[0_0_10px_rgba(226,183,20,0.35)]" : "text-white/60 hover:text-white hover:bg-white/10")}>
        # Numbers
      </button>

      <div className="h-5 w-px bg-white/10 mx-1" />

      <div className="flex items-center gap-1">
        {times.map(t=>(
          <button key={t}
            onClick={(e)=>{ setDuration(t); pulse(e.currentTarget); }}
            className={"topbar-stagger px-2 py-1 rounded-md text-sm transition-all " + (duration===t ? "bg-brand text-ink shadow-[0_0_10px_rgba(226,183,20,0.35)]" : "text-white/70 hover:text-white")}>
            {t}
          </button>
        ))}
      </div>

      <div className="h-5 w-px bg-white/10 mx-1" />
      <select
        value={lang}
        onChange={(e)=>setLang(e.target.value)}
        className="topbar-stagger bg-brand border border-white/10 text-white/90 text-sm rounded-md px-3 py-1 focus:outline-none hover:bg-white/15 transition"
        aria-label="Language">
        <option value="english">English</option>
        <option value="urdu">Urdu</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
}

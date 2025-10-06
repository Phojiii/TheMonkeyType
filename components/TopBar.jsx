'use client';
import { useEffect } from "react";
import { gsap } from "gsap";

export default function TopBar({ lang, setLang, duration, setDuration }){
  useEffect(()=>{
    gsap.fromTo('.topbar-stagger', {y:-8, opacity:0}, {y:0, opacity:1, duration:0.4, stagger:0.03});
  }, []);

  const times = [15, 30, 60, 120];

  return (
    <div className="mx-auto mt-4 mb-2 flex items-center justify-center gap-3 bg-black/20 rounded-full py-2 px-4 w-max backdrop-blur-sm">
      <Segment label="punctuation" />
      <Segment label="# numbers" />
      <Segment label="A words" />
      <Segment label="quote" />
      <Segment label="zen" />
      <div className="h-5 w-px bg-white/10 mx-1" />
      <div className="flex items-center gap-1">
        {times.map(t => (
          <button key={t}
            onClick={()=>setDuration(t)}
            className={"topbar-stagger px-2 py-1 rounded-md text-sm " + (duration===t ? "bg-brand text-ink" : "text-white/70 hover:text-white")}>
            {t}
          </button>
        ))}
      </div>
      <div className="h-5 w-px bg-white/10 mx-1" />
      <select
        value={lang}
        onChange={e=>setLang(e.target.value)}
        className="topbar-stagger bg-white/10 border border-white/10 text-white/90 text-sm rounded-md px-3 py-1 focus:outline-none"
        aria-label="Language">
        <option value="english">English</option>
        <option value="urdu">Urdu</option>
        <option value="spanish">Spanish</option>
      </select>
    </div>
  );
}

function Segment({ label }){
  return <div className="topbar-stagger text-xs text-white/60 px-2 py-1 rounded-md hover:text-white">{label}</div>;
}

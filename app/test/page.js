'use client';
import { useEffect, useState } from "react";
import TypingTest from "@/components/TypingTest";
import TopBar from "@/components/TopBar";
import { gsap } from "gsap";

export default function TestPage(){
  const [lang, setLang] = useState("english");
  const [duration, setDuration] = useState(60);
  const [paragraph, setParagraph] = useState("");

  async function loadParagraph(selectedLang){
    const r = await fetch(`/api/paragraph?lang=${encodeURIComponent(selectedLang)}`);
    const data = await r.json();
    setParagraph(data.paragraph);
  }

  useEffect(()=>{
    const tl = gsap.timeline();
    tl.fromTo('.page-stagger', {y:16, opacity:0}, {y:0, opacity:1, duration:0.6, stagger:0.08, ease:"power2.out"});
  }, []);

  useEffect(()=>{ loadParagraph(lang); }, [lang]);

  return (
    <main className="min-h-screen bg-ink text-white px-6 py-6">
      <TopBar lang={lang} setLang={setLang} duration={duration} setDuration={setDuration} />
      <div className="mt-10">
        {paragraph ? <TypingTest text={paragraph} durationSec={duration} /> : <div className="skeleton h-40 w-full max-w-5xl mx-auto" />}
      </div>
    </main>
  );
}

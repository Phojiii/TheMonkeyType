// lib/textbanks.js
export const TEXTBANKS = {
  english: [
    "another new help thing what or in both last get turn he be form write interest one give so follow use new about some head life person fact present by work as down for where new under think great however then some these number with well",
    "practice brings steady hands and quiet confidence as you learn to read ahead and type with rhythm instead of rushing for speed in short bursts that fade",
    "keep your shoulders loose and your wrists low let your eyes track the next word while your fingers finish the current one accuracy first speed follows"
  ],
  urdu: [
    "لفظوں کی روانی میں ہاتھ نرم رکھیں رفتار خود آہستہ آہستہ بڑھتی ہے درستگی پہلے آتی ہے",
    "روز تھوڑی سی مشق مسلسل رفتار اور دھیان کو بہتر بناتی ہے غلطیوں سے سیکھیں اور اگلے لفظ پر نظر رکھیں"
  ],
  spanish: [
    "practicar cada día mejora el ritmo y la precisión los dedos aprenden el camino y la mente se calma",
    "respira hondo mantén la postura relajada y deja que la velocidad llegue con el tiempo la constancia vence"
  ],
};

export function wordsFor(lang = "english") {
  const bank = TEXTBANKS[lang] || TEXTBANKS.english;
  return bank.join(" ").split(/\s+/g).map(w => w.trim()).filter(Boolean);
}

const PUNCT = [",", ".", "!", "?", ";", ":", "—"];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function maybePunct(enable) {
  if (!enable) return "";
  if (Math.random() < 0.18) {
    const p = Math.random();
    if (p < 0.6) return pick([",", "."]);
    return pick(PUNCT);
  }
  return "";
}
function numberToken() {
  const len = rand(1, 4);
  let s = "";
  for (let i = 0; i < len; i++) s += String(rand(0, 9));
  return s;
}

/** Streaming generator */
export function makeStreamGenerator({ lang = "english", punctuation = false, numbers = false } = {}) {
  const base = wordsFor(lang);
  let cursor = 0;

  const nextWord = () => {
    if (numbers && Math.random() < 0.1) return numberToken();
    const w = base[cursor % base.length];
    cursor++;
    return w;
  };

  const nextChunk = (count = 60) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      const w = nextWord();
      const p = maybePunct(punctuation);
      out.push(p ? `${w}${p}` : w);
    }
    let s = out.join(" ");
    if (Math.random() < 0.5) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
      if (!/[.!?]$/.test(s)) s += ".";
    }
    return s + " ";
  };

  return { nextChunk };
}

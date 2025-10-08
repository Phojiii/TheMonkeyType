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

// Flat word list for a language
export function wordsFor(lang = "english") {
  const bank = TEXTBANKS[lang] || TEXTBANKS.english;
  return bank.join(" ").split(/\s+/g).map(w => w.trim()).filter(Boolean);
}

const PUNCT = [",", ".", "!", "?", ";", ":", "—"];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
  const len = randInt(1, 4);
  let s = "";
  for (let i = 0; i < len; i++) s += String(randInt(0, 9));
  return s;
}

/**
 * Random-word stream generator (Monkeytype-like).
 * Each chunk is fresh and randomized, not tied to a cursor.
 * Options: { lang, punctuation, numbers }
 */

// Pick a ready-made sentence OR synthesize ~60 tokens when punctuation/numbers requested.
export function randomParagraph(
  lang = "english",
  { punctuation = false, numbers = false } = {}
) {
  const bank = TEXTBANKS[lang] || TEXTBANKS.english;

  // If no special flags, return one of the preset lines
  if (!punctuation && !numbers) {
    return bank[Math.floor(Math.random() * bank.length)];
  }

  // Otherwise generate a paragraph using the streaming generator
  const { nextChunk } = makeStreamGenerator({ lang, punctuation, numbers });
  return nextChunk(60).trim(); // ~60 tokens
}
export function makeStreamGenerator({ lang = "english", punctuation = false, numbers = false } = {}) {
  const words = wordsFor(lang);
  const wordCount = Math.max(1, words.length);

  const nextToken = () => {
    if (numbers && Math.random() < 0.10) return numberToken();
    return words[Math.floor(Math.random() * wordCount)];
  };

  const nextChunk = (count = 60) => {
    const out = new Array(count);
    for (let i = 0; i < count; i++) {
      const w = nextToken();
      const p = maybePunct(punctuation);
      out[i] = p ? `${w}${p}` : w;
    }
    // Occasionally capitalize & end with punctuation for natural feel
    let s = out.join(" ");
    if (Math.random() < 0.5) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
      if (!/[.!?]$/.test(s)) s += ".";
    }
    return s + " ";
  };

  return { nextChunk };
}

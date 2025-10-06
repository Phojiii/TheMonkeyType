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
export function randomParagraph(lang="english"){
  const bank = TEXTBANKS[lang] || TEXTBANKS.english;
  const i = Math.floor(Math.random()*bank.length);
  return bank[i];
}

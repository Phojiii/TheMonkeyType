export const BEGINNER_PASS_WPM = 60;

export const BEGINNER_LESSONS = [
  {
    id: "home-row-anchor",
    title: "Home Row Anchor Keys",
    description: "Start with the center anchor keys and build clean rhythm with your index fingers.",
    focusKeys: ["f", "j"],
    text: "f j f j ff jj fj jf fff jjj fjfj jfjf",
  },
  {
    id: "home-row-reach",
    title: "Home Row Reach",
    description: "Stretch across the full home row while keeping your hands planted in position.",
    focusKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    text: "asdf jkl; asdf jkl; sad fad ask flask fall lad alas",
  },
  {
    id: "home-row-words",
    title: "Home Row Words",
    description: "Turn the home row into real words with zero mistakes and steady speed.",
    focusKeys: ["a", "s", "d", "f", "j", "k", "l", ";"],
    text: "all add fall ask flask salad lad dads flask sad",
  },
  {
    id: "top-row-intro",
    title: "Top Row Introduction",
    description: "Reach upward smoothly and return to the home row without lifting your wrists.",
    focusKeys: ["e", "r", "u", "i"],
    text: "red rude ride fire fries rise tire true rider",
  },
  {
    id: "top-row-words",
    title: "Top Row Word Flow",
    description: "Blend the top row with home row fingers for faster, smoother transitions.",
    focusKeys: ["q", "w", "e", "r", "u", "i", "o", "p"],
    text: "power wire proof quiet write rope pure worry",
  },
  {
    id: "bottom-row-intro",
    title: "Bottom Row Introduction",
    description: "Drop to the lower row while keeping your fingers returning to home position.",
    focusKeys: ["c", "v", "m", ","],
    text: "calm civic vivid mimic comic vivid calm move",
  },
  {
    id: "bottom-row-words",
    title: "Bottom Row Word Flow",
    description: "Mix lower-row movement into short words while staying accurate and relaxed.",
    focusKeys: ["z", "x", "c", "v", "b", "n", "m"],
    text: "zinc cabin mix main vivid max comic value",
  },
  {
    id: "full-keyboard-finish",
    title: "Full Keyboard Finish",
    description: "Bring all the lessons together and prove you can type cleanly across the board.",
    focusKeys: ["a", "s", "d", "f", "j", "k", "l", ";", "q", "w", "e", "r", "u", "i", "o", "p", "z", "x", "c", "v", "b", "n", "m"],
    text: "quick brave minds move with clear focus and zero mistakes",
  },
];

export function getLessonWordCount(lesson) {
  return String(lesson?.text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function didPassBeginnerLesson(stats) {
  return (
    Number(stats?.accuracy || 0) === 100 &&
    Number(stats?.wpm || 0) >= BEGINNER_PASS_WPM &&
    Number(stats?.mistakes || 0) === 0
  );
}

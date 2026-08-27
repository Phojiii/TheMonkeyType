"use client";

import Image from "next/image";
import { useMemo } from "react";

const KEYBOARD_ROWS = [
  [
    { label: "`", shift: "~", finger: "left-pinky" },
    { label: "1", shift: "!", finger: "left-pinky" },
    { label: "2", shift: "@", finger: "left-ring" },
    { label: "3", shift: "#", finger: "left-middle" },
    { label: "4", shift: "$", finger: "left-index" },
    { label: "5", shift: "%", finger: "left-index" },
    { label: "6", shift: "^", finger: "right-index" },
    { label: "7", shift: "&", finger: "right-index" },
    { label: "8", shift: "*", finger: "right-middle" },
    { label: "9", shift: "(", finger: "right-ring" },
    { label: "0", shift: ")", finger: "right-pinky" },
    { label: "-", shift: "_", finger: "right-pinky" },
    { label: "=", shift: "+", finger: "right-pinky" },
    { label: "delete", width: 1.55, finger: "right-pinky", align: "end", icon: "" },
  ],
  [
    { label: "tab", width: 1.35, finger: "left-pinky", align: "start", icon: "" },
    { label: "q", finger: "left-pinky" },
    { label: "w", finger: "left-ring" },
    { label: "e", finger: "left-middle" },
    { label: "r", finger: "left-index" },
    { label: "t", finger: "left-index" },
    { label: "y", finger: "right-index" },
    { label: "u", finger: "right-index" },
    { label: "i", finger: "right-middle" },
    { label: "o", finger: "right-ring" },
    { label: "p", finger: "right-pinky" },
    { label: "[", shift: "{", finger: "right-pinky" },
    { label: "]", shift: "}", finger: "right-pinky" },
    { label: "\\", shift: "|", finger: "right-pinky" },
  ],
  [
    { label: "caps lock", width: 1.6, finger: "left-pinky", align: "start", icon: "" },
    { label: "a", finger: "left-pinky", home: true },
    { label: "s", finger: "left-ring", home: true },
    { label: "d", finger: "left-middle", home: true },
    { label: "f", finger: "left-index", home: true },
    { label: "g", finger: "left-index" },
    { label: "h", finger: "right-index" },
    { label: "j", finger: "right-index", home: true },
    { label: "k", finger: "right-middle", home: true },
    { label: "l", finger: "right-ring", home: true },
    { label: ";", shift: ":", finger: "right-pinky", home: true },
    { label: "'", shift: "\"", finger: "right-pinky" },
    { label: "enter", width: 1.8, finger: "right-pinky", align: "end", icon: "" },
  ],
  [
    { label: "shift", width: 1.95, finger: "left-pinky", align: "start", icon: "" },
    { label: "z", finger: "left-pinky" },
    { label: "x", finger: "left-ring" },
    { label: "c", finger: "left-middle" },
    { label: "v", finger: "left-index" },
    { label: "b", finger: "left-index" },
    { label: "n", finger: "right-index" },
    { label: "m", finger: "right-index" },
    { label: ",", shift: "<", finger: "right-middle" },
    { label: ".", shift: ">", finger: "right-ring" },
    { label: "/", shift: "?", finger: "right-pinky" },
    { label: "shift", width: 2.05, finger: "right-pinky", align: "end", icon: "" },
  ],
  [
    { label: "ctrl", width: 1.12, finger: "left-pinky", align: "start" },
    { label: "alt", width: 1.05, finger: "left-thumb" },
    { label: "cmd", width: 1.05, finger: "left-thumb" },
    { label: "space", width: 4.65, finger: "thumbs" },
    { label: "cmd", width: 1.05, finger: "right-thumb" },
    { label: "alt", width: 1.05, finger: "right-thumb" },
    { label: "ctrl", width: 1.12, finger: "right-pinky", align: "end" },
  ],
];

const FINGER_LABELS = {
  "left-pinky": "L Pinky",
  "left-ring": "L Ring",
  "left-middle": "L Middle",
  "left-index": "L Index",
  "right-index": "R Index",
  "right-middle": "R Middle",
  "right-ring": "R Ring",
  "right-pinky": "R Pinky",
  "left-thumb": "L Thumb",
  "right-thumb": "R Thumb",
  thumbs: "Thumbs",
};

function normalizeKey(key) {
  if (!key) return "";
  if (key === " ") return "space";
  if (key === "Backspace") return "delete";
  if (key === "Enter") return "enter";
  if (key === "Tab") return "tab";
  if (key === "CapsLock") return "caps lock";
  if (key === "Shift") return "shift";
  if (key === "Control") return "ctrl";
  if (key === "Alt") return "alt";
  return String(key).toLowerCase();
}

function getHandImagePath(activeKey) {
  const keyMap = {
    ",": "/KeyBoard-Layout/,.webp",
    ".": "/KeyBoard-Layout/.....webp",
    ";": "/KeyBoard-Layout/;.webp",
    "/": "/KeyBoard-Layout/forward-slash.webp",
    "space": "/KeyBoard-Layout/space.webp",
  };

  if (keyMap[activeKey]) return keyMap[activeKey];
  if (/^[a-z]$/.test(activeKey)) return `/KeyBoard-Layout/${activeKey}.webp`;
  return null;
}

function getActiveHandSide(activeFinger, activeKey) {
  if (activeKey === "space" || activeFinger === "thumbs") return "right";
  if (String(activeFinger || "").startsWith("left-")) return "left";
  if (String(activeFinger || "").startsWith("right-")) return "right";
  return "";
}

function HandImageOverlay({ activeKey, activeSide }) {
  const activeSrc = getHandImagePath(activeKey);
  const showLeftActive = activeSrc && activeSide === "left";
  const showRightActive = activeSrc && activeSide === "right";
  const showLeftRest = activeSide !== "left";
  const showRightRest = activeSide !== "right";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[30rem] overflow-hidden md:h-[30rem]"
      aria-hidden="true"
    >
      <div className="relative inset-x-[11%] bottom-[-0.35rem] flex items-end justify-between md:inset-x-[10%]">
        {showLeftRest ? (
          <Image
            src="/KeyBoard-Layout/left-rest.webp"
            alt=""
            width={280}
            height={220}
            className="absolute -left-80 -top-14 h-auto w-4/5"
          />
        ) : null}
        {showRightRest ? (
          <Image
            src="/KeyBoard-Layout/right-rest.webp"
            alt=""
            width={280}
            height={220}
            className="absolute -right-10 -top-4 h-auto w-4/5"
          />
        ) : null}
      </div>

      {showLeftActive ? (
          <Image
            src={activeSrc}
            alt=""
            width={280}
            height={220}
            className="absolute -left-60 -top-12 h-auto w-4/5"
          />
      ) : null}

      {showRightActive ? (
          <Image
            src={activeSrc}
            alt=""
            width={280}
            height={220}
            className={`absolute h-auto ${
              activeKey === "space"
                ? "-right-32 -top-6 h-auto w-4/5"
                : "-right-32 -top-6 h-auto w-4/5"
            }`}
          />
      ) : null}
    </div>
  );
}

function Keycap({ keyData, isExpected, isPressed, pressedCorrect }) {
  const stateClass = isPressed
    ? pressedCorrect
      ? "border-green-500/55 bg-green-50 text-green-900 shadow-[0_0_0_1px_rgba(34,197,94,0.14),0_10px_20px_rgba(34,197,94,0.18)]"
      : "border-red-500/55 bg-red-50 text-red-900 shadow-[0_0_0_1px_rgba(239,68,68,0.12),0_10px_20px_rgba(239,68,68,0.18)]"
    : isExpected
      ? "border-[#a17f00] bg-[#222] text-[#F9C916] shadow-[0_0_0_1px_rgba(14,165,233,0.18),0_14px_28px_rgba(14,165,233,0.2)]"
      : "border-[#a17f00] bg-[#F9C916] text-[#2e3d4d] shadow-[0_2px_0_rgba(161,127,0,0.95),0_10px_18px_rgba(0,0,0,0.05)]";

  const isWideLabel = keyData.label.length > 2 || keyData.icon;

  return (
    <div
      className={`relative flex h-12 items-center rounded-[0.72rem] border px-3 font-semibold transition md:h-14 ${
        keyData.align === "start"
          ? "justify-start"
          : keyData.align === "end"
            ? "justify-end"
            : "justify-center"
      } ${stateClass}`}
    >
      {keyData.shift ? (
        <div className="flex w-full flex-col items-center leading-none">
          <span className="text-[0.68rem] text-[#7a8793]">{keyData.shift}</span>
          <span className="mt-1 text-[0.95rem] text-[#2d3b4a]">{keyData.label}</span>
        </div>
      ) : (
        <div className={`flex items-center gap-1 ${isWideLabel ? "text-[0.9rem]" : "text-[1rem]"}`}>
          <span>{keyData.label}</span>
          {keyData.icon ? <span className="text-[0.86rem] text-[#6f7b86]">{keyData.icon}</span> : null}
        </div>
      )}

      {keyData.home ? (
        <span className="absolute bottom-1.5 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-[#6d5500]" />
      ) : null}
    </div>
  );
}

export default function BeginnerKeyboard({
  expectedKey,
  pressedKey,
  pressedCorrect = false,
  lesson,
  progressLabel = "",
  feedback = null,
  passRequirement = "100% ACC - 0 mistakes - 60+ WPM",
  focusMode = false,
  onToggleFocusMode,
}) {
  const activeExpected = normalizeKey(expectedKey);
  const activePressed = normalizeKey(pressedKey);

  const activeFinger = useMemo(() => {
    for (const row of KEYBOARD_ROWS) {
      for (const key of row) {
        if (normalizeKey(key.label) === activeExpected) {
          if (key.label === "space") return "thumbs";
          return key.finger || "";
        }
      }
    }
    return "";
  }, [activeExpected]);

  const activeSide = useMemo(
    () => getActiveHandSide(activeFinger, activeExpected),
    [activeExpected, activeFinger]
  );

  return (
    <section className="mt-10 rounded-[1.9rem] border border-white/8 bg-[#27282b]/90 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:p-6">
      {feedback ? (
        <div
          className={`mb-5 rounded-[1.4rem] border px-4 py-3 text-sm leading-6 ${
            feedback.passed
              ? "border-brand/30 bg-brand/10 text-white/80"
              : "border-red-400/20 bg-red-500/10 text-red-100/90"
          }`}
        >
          <div className="font-semibold">{feedback.title}</div>
          <div className="mt-1">{feedback.body}</div>
        </div>
      ) : null}

      <div className="relative overflow-hidden rounded-[1.85rem] border border-[#c9cbca] bg-[#323437] px-4 pb-32 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_14px_28px_rgba(0,0,0,0.08)] md:px-5 md:pt-5">
        <div className="mb-4 flex items-center justify-end gap-2 text-[11px] font-medium tracking-[0.04em] text-[#626b74]">
          <button
            onClick={() => onToggleFocusMode?.()}
            className="rounded-xl bg-[#F9C916] px-4 py-2 font-semibold text-black shadow-lg transition hover:scale-105"
          >
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </button>
          <span className="text-sm text-[#F9C916]"></span>
          <span className="underline decoration-[#F9C916] decoration-1 underline-offset-2 text-[#F9C916] transition-colors hover:text-[#F9C916]/80">
            Customize Keyboard
          </span>
        </div>

        <div className="relative z-20 space-y-2.5">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid gap-2"
              style={{ gridTemplateColumns: row.map((key) => `${key.width || 1}fr`).join(" ") }}
            >
              {row.map((key, keyIndex) => {
                const normalized = normalizeKey(key.label);
                return (
                  <Keycap
                    key={`${key.label}-${keyIndex}`}
                    keyData={key}
                    isExpected={normalized === activeExpected}
                    isPressed={normalized === activePressed}
                    pressedCorrect={pressedCorrect}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <HandImageOverlay activeKey={activeExpected} activeSide={activeSide} />
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-brand/80">
            Beginner Lesson {progressLabel || ""}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {lesson?.title || "Typing lesson"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/55">
            {lesson?.description ||
              "Follow the highlighted key, keep your fingers anchored, and build clean typing rhythm one lesson at a time."}
          </p>
        </div>

        <div className="min-w-[13rem] rounded-[1.4rem] border border-white/8 bg-black/15 px-4 py-3 text-sm text-white/60">
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/35">Use finger</div>
          <div className="mt-1 text-base font-semibold text-brand">
            {FINGER_LABELS[activeFinger] || "Watch the next key"}
          </div>
          <div className="mt-3 border-t border-white/8 pt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">
            Pass requirement
          </div>
          <div className="mt-1 text-sm font-semibold text-white/88">{passRequirement}</div>
        </div>
      </div>
    </section>
  );
}


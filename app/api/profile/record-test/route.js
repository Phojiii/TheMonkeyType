import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/profile";
import { postPersonalBestAnnouncement } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TIME = new Set([15, 30, 60, 120]);
const ALLOWED_WORDS = new Set([10, 25, 50, 100]);
const ACHIEVEMENT_IDS = new Set([
  "first-60-wpm",
  "seven-day-streak",
  "100-perfect-words",
  "no-backspaces",
]);

function getCurrentStreak(activityDates) {
  const dates = new Set(activityDates);
  const cursor = new Date();
  let streak = 0;

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

function findDiscordAccount(user) {
  const accounts = Array.isArray(user?.externalAccounts) ? user.externalAccounts : [];
  return (
    accounts.find((account) => String(account?.provider || "").toLowerCase().includes("discord")) ||
    null
  );
}

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }

  const user = await currentUser();
  const profileDoc = await ensureUserProfile(user);
  const body = await req.json();
  const discordAccount = findDiscordAccount(user);

  const testType = body?.testType === "words" ? "words" : "time";
  const duration = Number(body?.duration || 0);
  const targetWordCount = Number(body?.targetWordCount || 0);
  const categoryKey = testType === "words" ? String(targetWordCount) : String(duration);

  if (
    (testType === "time" && !ALLOWED_TIME.has(duration)) ||
    (testType === "words" && !ALLOWED_WORDS.has(targetWordCount))
  ) {
    return NextResponse.json({ error: "Invalid test category" }, { status: 400 });
  }

  const profile = profileDoc.toObject();
  const currentBucket =
    profile?.bests?.[testType]?.[categoryKey] || { wpm: 0, accuracy: 0, elapsedSec: 0 };
  const previousWpm = Number(currentBucket?.wpm || 0);
  const previousAccuracy = Number(currentBucket?.accuracy || 0);

  const wpm = Math.min(1000, Math.max(0, Number(body?.wpm) || 0));
  const accuracy = Math.min(100, Math.max(0, Number(body?.accuracy) || 0));
  const words = Math.max(0, Number(body?.words) || 0);
  const backspaces = Math.max(0, Math.round(Number(body?.backspaces) || 0));
  const elapsedSec = Math.min(100_000, Math.max(0, Number(body?.elapsedSec || body?.duration) || 0));

  const nextBest = {
    wpm: Math.max(previousWpm, Math.round(wpm)),
    accuracy: Math.max(previousAccuracy, Math.round(accuracy)),
    elapsedSec:
      testType === "words"
        ? Number(currentBucket?.elapsedSec || 0) > 0
          ? Math.min(Number(currentBucket.elapsedSec || 0), elapsedSec || Number.MAX_SAFE_INTEGER)
          : elapsedSec
        : Number(currentBucket?.elapsedSec || 0),
  };

  const runDate = new Date();
  const today = runDate.toISOString().slice(0, 10);
  const activityDates = [...new Set([...(profile.activityDates || []), today])]
    .sort()
    .slice(-400);
  const perfectWords = Number(profile.perfectWords || 0) + (accuracy >= 100 ? Math.floor(words) : 0);
  const keyErrorTotals = new Map((profile.keyErrors || []).map(({ key, count }) => [key, Number(count) || 0]));
  const incomingKeyErrors = body?.keyErrors && typeof body.keyErrors === "object" ? body.keyErrors : {};

  for (const [rawKey, rawCount] of Object.entries(incomingKeyErrors).slice(0, 64)) {
    const key = String(rawKey).trim().toLowerCase().slice(0, 8);
    const count = Math.min(100_000, Math.max(0, Math.round(Number(rawCount) || 0)));
    if (!key || !count) continue;
    keyErrorTotals.set(key, Math.min(1_000_000, (keyErrorTotals.get(key) || 0) + count));
  }

  const keyErrors = [...keyErrorTotals.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 64);
  const achievements = Array.isArray(profile.achievements) ? [...profile.achievements] : [];
  const unlockedIds = new Set(achievements.map((achievement) => achievement.id));
  const unlock = (id) => {
    if (ACHIEVEMENT_IDS.has(id) && !unlockedIds.has(id)) {
      unlockedIds.add(id);
      achievements.push({ id, unlockedAt: runDate });
    }
  };

  if (wpm >= 60) unlock("first-60-wpm");
  if (backspaces === 0) unlock("no-backspaces");
  if (perfectWords >= 100) unlock("100-perfect-words");
  if (getCurrentStreak(activityDates) >= 7) unlock("seven-day-streak");

  const run = {
    date: runDate,
    wpm: Math.round(wpm),
    accuracy: Math.round(accuracy),
    words: Math.round(words),
    elapsedSec,
    duration,
    testType,
    backspaces,
  };

  await profileDoc.updateOne({
    $inc: {
      "aggregate.testsCompleted": 1,
      "aggregate.totalTypingSeconds": elapsedSec,
      "aggregate.totalCharacters": Number(body?.characters || body?.hits || 0),
      "aggregate.totalBackspaces": backspaces,
    },
    $set: {
      [`bests.${testType}.${categoryKey}`]: nextBest,
      keyErrors,
      recentRuns: [...(profile.recentRuns || []), run].slice(-120),
      activityDates,
      perfectWords,
      achievements,
    },
  });

  if (
    testType === "words" &&
    discordAccount &&
    (nextBest.wpm > previousWpm || nextBest.accuracy > previousAccuracy)
  ) {
    try {
      await postPersonalBestAnnouncement({
        profileSlug: profileDoc.slug,
        username: profileDoc.displayName || profileDoc.username || "Anonymous",
        discordUsername:
          discordAccount.username ||
          discordAccount.emailAddress ||
          discordAccount.providerUserId ||
          "",
        duration: Number(categoryKey),
        mode: "words",
        bestWpm: nextBest.wpm,
        bestAccuracy: nextBest.accuracy,
        previousWpm,
        previousAccuracy,
      });
    } catch (discordError) {
      console.error("Word-mode personal best Discord post failed:", discordError);
    }
  }

  return NextResponse.json({ ok: true, best: nextBest });
}

import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/profile";
import { postPersonalBestAnnouncement } from "@/lib/discord";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_TIME = new Set([15, 30, 60, 120]);
const ALLOWED_WORDS = new Set([10, 25, 50, 100]);

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

  const nextBest = {
    wpm: Math.max(previousWpm, Math.round(Number(body?.wpm || 0))),
    accuracy: Math.max(previousAccuracy, Math.round(Number(body?.accuracy || 0))),
    elapsedSec:
      testType === "words"
        ? Number(currentBucket?.elapsedSec || 0) > 0
          ? Math.min(Number(currentBucket.elapsedSec || 0), Number(body?.elapsedSec || 0) || Number.MAX_SAFE_INTEGER)
          : Number(body?.elapsedSec || 0)
        : Number(currentBucket?.elapsedSec || 0),
  };

  await profileDoc.updateOne({
    $inc: {
      "aggregate.testsCompleted": 1,
      "aggregate.totalTypingSeconds": Number(body?.elapsedSec || body?.duration || 0),
      "aggregate.totalCharacters": Number(body?.characters || body?.hits || 0),
      "aggregate.totalBackspaces": Number(body?.backspaces || 0),
    },
    $set: {
      [`bests.${testType}.${categoryKey}`]: nextBest,
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

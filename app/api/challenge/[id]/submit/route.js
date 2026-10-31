import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Challenge from "@/models/Challange";
import UserProfile from "@/models/UserProfile";

export const runtime = "nodejs";

function winnerFromResults(challenge) {
  const left = challenge.createdByResult;
  const right = challenge.opponentResult;
  if (!left || !right) return "";

  if (left.wpm !== right.wpm) {
    return left.wpm > right.wpm ? challenge.createdBy : challenge.opponentId;
  }
  if (left.accuracy !== right.accuracy) {
    return left.accuracy > right.accuracy ? challenge.createdBy : challenge.opponentId;
  }
  const leftFinished = new Date(left.finishedAt || 0).getTime();
  const rightFinished = new Date(right.finishedAt || 0).getTime();
  if (leftFinished !== rightFinished) {
    return leftFinished < rightFinished ? challenge.createdBy : challenge.opponentId;
  }
  return "";
}

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    await connectDB();

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }
    if (![challenge.createdBy, challenge.opponentId].includes(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (challenge.status !== "active") {
      return NextResponse.json({ error: "Challenge is not active" }, { status: 409 });
    }
    if (challenge.expiresAt <= new Date()) {
      challenge.status = "expired";
      await challenge.save();
      return NextResponse.json({ error: "Challenge expired" }, { status: 409 });
    }

    const result = {
      wpm: Number(body?.wpm),
      accuracy: Number(body?.accuracy),
      words: Number(body?.words),
      hits: Number(body?.hits),
      characters: Number(body?.characters),
      elapsedSec: Number(body?.elapsedSec),
      finishedAt: new Date(),
    };
    const calculatedWpm = (result.hits / 5 / result.elapsedSec) * 60;
    const calculatedAccuracy = result.characters > 0
      ? (result.hits / result.characters) * 100
      : 0;

    if (
      ![
        result.wpm,
        result.accuracy,
        result.words,
        result.hits,
        result.characters,
        result.elapsedSec,
      ].every(Number.isFinite) ||
      result.wpm < 0 || result.wpm > 300 ||
      result.accuracy < 0 || result.accuracy > 100 ||
      result.words < 0 || result.hits < 0 ||
      result.characters < result.hits || result.characters > 100_000 ||
      result.elapsedSec <= 0 || result.elapsedSec > challenge.duration + 5 ||
      Math.abs(result.words - result.hits / 5) > 0.2 ||
      Math.abs(result.wpm - calculatedWpm) > 1.5 ||
      Math.abs(result.accuracy - calculatedAccuracy) > 1.5
    ) {
      return NextResponse.json({ error: "Submitted challenge result is inconsistent" }, { status: 400 });
    }

    if (challenge.createdBy === userId) {
      if (!challenge.createdByResult) challenge.createdByResult = result;
    } else {
      if (!challenge.opponentResult) challenge.opponentResult = result;
    }

    if (challenge.createdByResult && challenge.opponentResult) {
      challenge.status = "done";
      challenge.completedAt = new Date();
      challenge.winnerId = winnerFromResults(challenge);
    }

    await challenge.save();

    if (challenge.status === "done" && challenge.winnerId) {
      await UserProfile.updateOne(
        { userId: challenge.winnerId, "achievements.id": { $ne: "first-1v1-win" } },
        { $push: { achievements: { id: "first-1v1-win", unlockedAt: new Date() } } }
      );
    }

    return NextResponse.json({
      success: true,
      status: challenge.status,
      winnerId: challenge.winnerId || "",
    });
  } catch (error) {
    console.error("Challenge submit error:", error);
    return NextResponse.json({ error: "Failed to submit result" }, { status: 500 });
  }
}

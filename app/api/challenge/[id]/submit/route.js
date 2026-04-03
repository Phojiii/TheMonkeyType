import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Challenge from "@/models/Challange";

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
    const result = {
      wpm: Math.max(0, Math.round(Number(body?.wpm) || 0)),
      accuracy: Math.max(0, Math.round(Number(body?.accuracy) || 0)),
      words: Math.max(0, Math.round(Number(body?.words) || 0)),
      hits: Math.max(0, Math.round(Number(body?.hits) || 0)),
      finishedAt: new Date(),
    };

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

import { NextResponse } from "next/server";
import { currentUser, getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { makeStreamGenerator } from "@/lib/textbanks";
import Challenge from "@/models/Challange";
import Score from "@/models/Score";

export const runtime = "nodejs";

const ALLOWED_DURATIONS = new Set([15, 30, 60, 120]);
const ONLINE_WINDOW_MS = 45_000;
const PENDING_WINDOW_MS = 60_000;

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildChallengeText(duration) {
  const wordTargets = {
    15: [35, 50],
    30: [70, 95],
    60: [140, 185],
    120: [280, 360],
  };

  const [minWords, maxWords] = wordTargets[duration] || wordTargets[60];
  const punctuation = Math.random() < 0.35;
  const numbers = Math.random() < 0.18;
  const generator = makeStreamGenerator({
    lang: "english",
    punctuation,
    numbers,
  });

  return generator.nextChunk(randomBetween(minWords, maxWords)).trim();
}

function isOnline(lastSeenAt) {
  return !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const opponentUserId = String(body?.opponentUserId || "").trim();
    const requestedDuration = Number(body?.duration || 60);
    const duration = ALLOWED_DURATIONS.has(requestedDuration) ? requestedDuration : 60;

    if (!opponentUserId) {
      return NextResponse.json({ error: "Missing opponent" }, { status: 400 });
    }
    if (opponentUserId === userId) {
      return NextResponse.json({ error: "You cannot challenge yourself" }, { status: 400 });
    }

    await connectDB();

    const now = new Date();
    await Challenge.updateMany(
      { status: { $in: ["pending", "active"] }, expiresAt: { $lte: now } },
      { $set: { status: "expired" } }
    );

    const [me, opponentScore] = await Promise.all([
      currentUser(),
      Score.findOne({ userId: opponentUserId })
        .sort({ lastSeenAt: -1, updatedAt: -1 })
        .lean(),
    ]);

    if (!opponentScore) {
      return NextResponse.json({ error: "Opponent not found" }, { status: 404 });
    }
    if (!isOnline(opponentScore.lastSeenAt)) {
      return NextResponse.json({ error: "Opponent is offline" }, { status: 409 });
    }

    const existing = await Challenge.findOne({
      status: { $in: ["pending", "active"] },
      $or: [
        { createdBy: userId, opponentId: opponentUserId },
        { createdBy: opponentUserId, opponentId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (existing) {
      return NextResponse.json(
        {
          error:
            existing.status === "active"
              ? "A challenge between these players is already active"
              : "A challenge request is already pending",
          challengeId: String(existing._id),
          status: existing.status,
        },
        { status: 409 }
      );
    }

    const challenge = await Challenge.create({
      createdBy: userId,
      createdByUsername:
        me?.username || me?.firstName || me?.emailAddresses?.[0]?.emailAddress || "Anonymous",
      createdByImageUrl: me?.imageUrl || "",
      opponentId: opponentUserId,
      opponentUsername: opponentScore.username || "Anonymous",
      opponentImageUrl: opponentScore.imageUrl || "",
      duration,
      text: buildChallengeText(duration),
      status: "pending",
      expiresAt: new Date(Date.now() + PENDING_WINDOW_MS),
    });

    return NextResponse.json({
      success: true,
      challengeId: String(challenge._id),
      status: challenge.status,
    });
  } catch (error) {
    console.error("Challenge create error:", error);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}

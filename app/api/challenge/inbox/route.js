import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Challenge from "@/models/Challange";

export const runtime = "nodejs";

function serializeChallenge(challenge, userId) {
  if (!challenge) return null;

  const isCreator = challenge.createdBy === userId;
  const me = isCreator
    ? {
        userId: challenge.createdBy,
        username: challenge.createdByUsername,
        imageUrl: challenge.createdByImageUrl,
        result: challenge.createdByResult || null,
      }
    : {
        userId: challenge.opponentId,
        username: challenge.opponentUsername,
        imageUrl: challenge.opponentImageUrl,
        result: challenge.opponentResult || null,
      };

  const opponent = isCreator
    ? {
        userId: challenge.opponentId,
        username: challenge.opponentUsername,
        imageUrl: challenge.opponentImageUrl,
        result: challenge.opponentResult || null,
      }
    : {
        userId: challenge.createdBy,
        username: challenge.createdByUsername,
        imageUrl: challenge.createdByImageUrl,
        result: challenge.createdByResult || null,
      };

  return {
    id: String(challenge._id),
    status: challenge.status,
    duration: challenge.duration,
    expiresAt: challenge.expiresAt,
    createdAt: challenge.createdAt,
    acceptedAt: challenge.acceptedAt,
    winnerId: challenge.winnerId || "",
    me,
    opponent,
  };
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ pending: null, active: null }, { status: 200 });
    }

    await connectDB();

    const now = new Date();
    await Challenge.updateMany(
      { status: { $in: ["pending", "active"] }, expiresAt: { $lte: now } },
      { $set: { status: "expired" } }
    );

    const [pending, active] = await Promise.all([
      Challenge.findOne({ opponentId: userId, status: "pending" }).sort({ createdAt: -1 }).lean(),
      Challenge.findOne({
        status: "active",
        $or: [{ createdBy: userId }, { opponentId: userId }],
      })
        .sort({ updatedAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      pending: serializeChallenge(pending, userId),
      active: serializeChallenge(active, userId),
    });
  } catch (error) {
    console.error("Challenge inbox error:", error);
    return NextResponse.json({ error: "Failed to load challenges" }, { status: 500 });
  }
}

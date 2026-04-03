import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Challenge from "@/models/Challange";

export const runtime = "nodejs";

function shapeParticipant(challenge, role) {
  if (role === "creator") {
    return {
      me: {
        userId: challenge.createdBy,
        username: challenge.createdByUsername,
        imageUrl: challenge.createdByImageUrl,
        result: challenge.createdByResult || null,
      },
      opponent: {
        userId: challenge.opponentId,
        username: challenge.opponentUsername,
        imageUrl: challenge.opponentImageUrl,
        result: challenge.opponentResult || null,
      },
    };
  }

  return {
    me: {
      userId: challenge.opponentId,
      username: challenge.opponentUsername,
      imageUrl: challenge.opponentImageUrl,
      result: challenge.opponentResult || null,
    },
    opponent: {
      userId: challenge.createdBy,
      username: challenge.createdByUsername,
      imageUrl: challenge.createdByImageUrl,
      result: challenge.createdByResult || null,
    },
  };
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const challenge = await Challenge.findById(id).lean();
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const role = challenge.createdBy === userId ? "creator" : challenge.opponentId === userId ? "opponent" : null;
    if (!role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (["pending", "active"].includes(challenge.status) && new Date(challenge.expiresAt) <= new Date()) {
      await Challenge.updateOne({ _id: challenge._id }, { $set: { status: "expired" } });
      challenge.status = "expired";
    }

    const shaped = shapeParticipant(challenge, role);

    return NextResponse.json({
      challenge: {
        id: String(challenge._id),
        role,
        status: challenge.status,
        duration: challenge.duration,
        text: challenge.text,
        createdAt: challenge.createdAt,
        acceptedAt: challenge.acceptedAt,
        completedAt: challenge.completedAt,
        expiresAt: challenge.expiresAt,
        winnerId: challenge.winnerId || "",
        ...shaped,
      },
    });
  } catch (error) {
    console.error("Challenge detail error:", error);
    return NextResponse.json({ error: "Failed to load challenge" }, { status: 500 });
  }
}

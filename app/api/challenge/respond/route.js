import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Challenge from "@/models/Challange";

export const runtime = "nodejs";

const ACTIVE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const challengeId = String(body?.challengeId || "").trim();
    const action = String(body?.action || "").trim().toLowerCase();

    if (!challengeId || !["accept", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await connectDB();

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }
    if (challenge.opponentId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (challenge.status !== "pending") {
      return NextResponse.json({ error: "Challenge is no longer pending" }, { status: 409 });
    }
    if (challenge.expiresAt <= new Date()) {
      challenge.status = "expired";
      await challenge.save();
      return NextResponse.json({ error: "Challenge expired" }, { status: 409 });
    }

    if (action === "reject") {
      challenge.status = "rejected";
      challenge.rejectedAt = new Date();
      await challenge.save();
      return NextResponse.json({ success: true, status: challenge.status });
    }

    challenge.status = "active";
    challenge.acceptedAt = new Date();
    challenge.expiresAt = new Date(Date.now() + ACTIVE_WINDOW_MS);
    await challenge.save();

    return NextResponse.json({
      success: true,
      status: challenge.status,
      challengeId: String(challenge._id),
    });
  } catch (error) {
    console.error("Challenge respond error:", error);
    return NextResponse.json({ error: "Failed to respond to challenge" }, { status: 500 });
  }
}

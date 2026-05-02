import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 45_000;

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    await connectDB();

    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get("limit") || 20);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 50)
      : 20;

    const cutoff = new Date(Date.now() - ONLINE_WINDOW_MS);

    const users = await Score.aggregate([
      { $match: { lastSeenAt: { $gte: cutoff } } },
      { $sort: { lastSeenAt: -1, bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },
      { $group: { _id: "$userId", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
      ...(userId ? [{ $match: { userId: { $ne: userId } } }] : []),
      { $limit: limit },
      {
        $project: {
          _id: 0,
          userId: 1,
          username: 1,
          imageUrl: 1,
          bestWpm: 1,
          bestAccuracy: 1,
          category: 1,
          country: 1,
          mode: 1,
          lastSeenAt: 1,
        },
      },
    ]);

    return NextResponse.json({
      users: users.map((entry) => ({
        userId: entry.userId,
        username: entry.username || "Anonymous",
        imageUrl: entry.imageUrl || "",
        bestWpm: Number(entry.bestWpm || 0),
        bestAccuracy: Number(entry.bestAccuracy || 0),
        category: Number(entry.category || 0),
        country: (entry.country || "").toUpperCase(),
        mode: entry.mode || "classic",
        lastSeenAt: entry.lastSeenAt || null,
      })),
    });
  } catch (error) {
    console.error("Online users GET error:", error);
    return NextResponse.json({ error: "Failed to load online users" }, { status: 500 });
  }
}

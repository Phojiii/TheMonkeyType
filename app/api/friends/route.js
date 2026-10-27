import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Follow from "@/models/Follow";
import Score from "@/models/Score";
import UserProfile from "@/models/UserProfile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ONLINE_WINDOW_MS = 45_000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function summarizeWeek(profile) {
  const cutoff = Date.now() - WEEK_MS;
  const runs = (profile?.recentRuns || []).filter((run) => new Date(run.date).getTime() >= cutoff);
  return {
    tests: runs.length,
    averageWpm: runs.length ? Math.round(runs.reduce((sum, run) => sum + Number(run.wpm || 0), 0) / runs.length) : 0,
    bestWpm: Math.max(0, ...runs.map((run) => Number(run.wpm || 0))),
    words: Math.round(runs.reduce((sum, run) => sum + Number(run.words || 0), 0)),
  };
}

function serializeProfile(profile, score, followed = true) {
  return {
    userId: profile.userId,
    username: profile.displayName || profile.username || "Typist",
    slug: profile.slug,
    imageUrl: profile.imageUrl || "",
    followed,
    online: Boolean(score?.lastSeenAt && Date.now() - new Date(score.lastSeenAt).getTime() < ONLINE_WINDOW_MS),
    bestWpm: Number(score?.bestWpm || 0),
    weekly: summarizeWeek(profile),
  };
}

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const { searchParams } = new URL(req.url);
    const targetId = String(searchParams.get("target") || "").trim();
    const query = String(searchParams.get("q") || "").trim().slice(0, 40);
    const follows = await Follow.find({ followerUserId: userId }).sort({ createdAt: -1 }).lean();
    const followedIds = follows.map((follow) => follow.followedUserId);
    const selfProfile = await UserProfile.findOne({ userId }).lean();

    if (targetId) {
      return NextResponse.json({ isFollowing: followedIds.includes(targetId) }, { headers: { "Cache-Control": "private, no-store" } });
    }

    const followedProfiles = followedIds.length
      ? await UserProfile.find({ userId: { $in: followedIds } }).lean()
      : [];
    const scores = followedIds.length
      ? await Score.find({ userId: { $in: followedIds } }).sort({ lastSeenAt: -1, bestWpm: -1 }).lean()
      : [];
    const latestScores = new Map();
    for (const score of scores) if (!latestScores.has(score.userId)) latestScores.set(score.userId, score);
    const profileById = new Map(followedProfiles.map((profile) => [profile.userId, profile]));
    const friends = followedIds
      .map((id) => profileById.get(id))
      .filter(Boolean)
      .map((profile) => serializeProfile(profile, latestScores.get(profile.userId)));

    let results = [];
    if (query.length >= 2) {
      const regex = new RegExp(escapeRegex(query), "i");
      const matches = await UserProfile.find({
        userId: { $ne: userId },
        $or: [{ username: regex }, { displayName: regex }, { slug: regex }],
      }).limit(15).lean();
      const matchIds = matches.map((profile) => profile.userId);
      const matchScores = matchIds.length
        ? await Score.find({ userId: { $in: matchIds } }).sort({ lastSeenAt: -1, bestWpm: -1 }).lean()
        : [];
      const scoreById = new Map();
      for (const score of matchScores) if (!scoreById.has(score.userId)) scoreById.set(score.userId, score);
      results = matches.map((profile) => serializeProfile(profile, scoreById.get(profile.userId), followedIds.includes(profile.userId)));
    }

    return NextResponse.json({ me: summarizeWeek(selfProfile), friends, results }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Friends GET failed:", error);
    return NextResponse.json({ error: "Failed to load friends" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const targetId = String(body?.userId || "").trim();
    const action = String(body?.action || "follow").trim().toLowerCase();
    if (!targetId || targetId === userId || !["follow", "unfollow"].includes(action)) {
      return NextResponse.json({ error: "Invalid follow request" }, { status: 400 });
    }

    await connectDB();
    const targetExists = await UserProfile.exists({ userId: targetId });
    if (!targetExists) return NextResponse.json({ error: "Typist not found" }, { status: 404 });

    if (action === "follow") {
      try {
        await Follow.updateOne(
          { followerUserId: userId, followedUserId: targetId },
          { $setOnInsert: { followerUserId: userId, followedUserId: targetId } },
          { upsert: true }
        );
      } catch (error) {
        if (error?.code !== 11000) throw error;
      }
    } else {
      await Follow.deleteOne({ followerUserId: userId, followedUserId: targetId });
    }

    return NextResponse.json({ success: true, isFollowing: action === "follow" });
  } catch (error) {
    console.error("Friends POST failed:", error);
    return NextResponse.json({ error: "Failed to update follow" }, { status: 500 });
  }
}

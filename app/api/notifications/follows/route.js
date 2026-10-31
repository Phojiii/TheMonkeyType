import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import FollowNotification from "@/models/FollowNotification";
import Score from "@/models/Score";
import UserProfile from "@/models/UserProfile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    const notifications = await FollowNotification.find({ recipientUserId: userId })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
    const actorIds = [...new Set(notifications.map((item) => item.actorUserId))];
    const [profiles, scores] = await Promise.all([
      actorIds.length ? UserProfile.find({ userId: { $in: actorIds } }).select("userId username displayName slug imageUrl").lean() : [],
      actorIds.length ? Score.find({ userId: { $in: actorIds } }).sort({ lastSeenAt: -1 }).lean() : [],
    ]);

    const profileById = new Map(profiles.map((profile) => [profile.userId, profile]));
    const scoreById = new Map();
    for (const score of scores) if (!scoreById.has(score.userId)) scoreById.set(score.userId, score);

    return NextResponse.json(
      {
        notifications: notifications.map((notification) => {
          const actor = profileById.get(notification.actorUserId);
          const score = scoreById.get(notification.actorUserId);
          return {
            id: String(notification._id),
            type: "follow",
            createdAt: notification.createdAt,
            readAt: notification.readAt,
            actor: {
              userId: notification.actorUserId,
              username: actor?.displayName || actor?.username || score?.username || "A typist",
              slug: actor?.slug || "",
              imageUrl: actor?.imageUrl || score?.imageUrl || "",
            },
          };
        }),
        unreadCount: await FollowNotification.countDocuments({ recipientUserId: userId, readAt: null }),
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Follow notifications GET failed:", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await connectDB();

    await FollowNotification.updateMany(
      { recipientUserId: userId, readAt: null },
      { $set: { readAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Follow notifications POST failed:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}

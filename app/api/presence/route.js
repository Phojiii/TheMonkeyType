import { getAuth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId) return new Response(JSON.stringify({ ok: false }), { status: 401 });

  await connectDB();
  // Update all docs for that user (classic + competitive + durations)
  await Score.updateMany({ userId }, { $set: { lastSeenAt: new Date() } });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}

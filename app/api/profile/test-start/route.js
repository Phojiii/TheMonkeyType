import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/profile";
import { connectDB } from "@/lib/mongodb";
import TypingTestSession from "@/models/TypingTestSession";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const requestStartedAt = new Date();
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const profile = await ensureUserProfile(user);
  const body = await req.json();
  const testType = body?.testType === "words" ? "words" : "time";
  const category = Number(testType === "words" ? body?.targetWordCount : body?.duration);
  const mode = body?.mode === "competitive" ? "competitive" : "classic";
  const allowed = testType === "words" ? [10, 25, 50, 100] : [15, 30, 60, 120];
  if (!allowed.includes(category)) {
    return NextResponse.json({ error: "Invalid test category" }, { status: 400 });
  }

  await connectDB();
  const sessionId = randomUUID();
  const startedAt = requestStartedAt;
  await TypingTestSession.create({
    sessionId,
    userId,
    testType,
    category,
    mode,
    startedAt,
    expiresAt: new Date(startedAt.getTime() + 2 * 60 * 60 * 1000),
  });
  await profile.updateOne({
    $inc: {
      "aggregate.testsStarted": 1,
    },
  });

  return NextResponse.json({ ok: true, sessionId });
}

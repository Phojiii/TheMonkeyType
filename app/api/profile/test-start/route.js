import { currentUser, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureUserProfile } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }

  const user = await currentUser();
  const profile = await ensureUserProfile(user);
  await profile.updateOne({
    $inc: {
      "aggregate.testsStarted": 1,
    },
  });

  return NextResponse.json({ ok: true });
}

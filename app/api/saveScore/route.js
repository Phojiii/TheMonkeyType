import { getAuth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([15, 30, 60, 120]);

export async function POST(req) {
  try {
    // debug: log incoming request body (non-sensitive) to help trace failures
    let bodyPreview = null;
    const { userId } = getAuth(req);
    if (!userId) {
      console.debug("saveScore: no userId from getAuth()");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await currentUser();
    const body = await req.json();
    try { bodyPreview = JSON.parse(JSON.stringify(body)); } catch {}
    console.debug("saveScore: userId=", userId, "body=", bodyPreview);

    const bestWpm = Math.round(Number(body?.bestWpm ?? 0));
    const bestAccuracy = Math.round(Number(body?.bestAccuracy ?? 0));
    const duration = Number(body?.duration);
    if (!ALLOWED.has(duration)) {
      console.debug("saveScore: invalid duration:", body?.duration, "parsed:", duration);
      return new Response(JSON.stringify({ error: "Invalid duration", received: body?.duration }), { status: 400 });
    }

    await connectDB();

    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      body?.debugCountry ||
      "";
    const country = (headerCountry || "").toUpperCase();

    const username = user?.username || user?.emailAddresses?.[0]?.emailAddress || "Anonymous";
    const imageUrl = user?.imageUrl || "";

    // One row per (userId, category), $max updates the personal best safely
    try {
      await Score.updateOne(
        { userId, category: duration },
        {
          $setOnInsert: { userId, category: duration },
          $set: { username, imageUrl, country },
          $max: { bestWpm, bestAccuracy },
        },
        { upsert: true }
      );
    } catch (err) {
      if (err?.code === 11000) {
        // Duplicate because the old unique index on userId still exists
        return new Response(JSON.stringify({
          error: "Duplicate key on old index. Drop index userId_1 and create a compound unique index on {userId, category}.",
        }), { status: 409 });
      }
      throw err;
    }

    // Let ISR cache know
    try { revalidateTag("leaderboard"); } catch {}

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Save score error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

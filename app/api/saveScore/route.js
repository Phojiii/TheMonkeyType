import { getAuth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([15, 30, 60, 120]);
const ALLOWED_MODES = new Set(["classic", "competitive"]);

export async function POST(req) {
  try {
    console.log("==== /api/saveScore HIT ====");

    // 🔍 Log headers (important for Clerk)
    console.log("Headers:", Object.fromEntries(req.headers.entries()));

    // 🔍 Clerk auth check
    const auth = getAuth(req);
    console.log("getAuth result:", auth);

    const { userId } = auth;
    if (!userId) {
      console.log("❌ NO USER ID — returning 401");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 🔍 Current user
    const user = await currentUser();
    console.log("currentUser():", user ? {
      id: user.id,
      username: user.username,
      email: user.emailAddresses?.[0]?.emailAddress,
    } : null);

    const body = await req.json();
    console.log("Request body:", body);

    const bestWpm = Math.round(Number(body?.bestWpm ?? 0));
    const bestAccuracy = Math.round(Number(body?.bestAccuracy ?? 0));
    const duration = Number(body?.duration);

    const rawMode = String(body?.mode || "classic").toLowerCase();
    const mode = ALLOWED_MODES.has(rawMode) ? rawMode : "classic";

    if (!ALLOWED.has(duration)) {
      console.log("❌ Invalid duration:", duration);
      return new Response(
        JSON.stringify({ error: "Invalid duration", received: body?.duration }),
        { status: 400 }
      );
    }

    await connectDB();
    console.log("✅ MongoDB connected");

    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      body?.debugCountry ||
      "";
    const country = (headerCountry || "").toUpperCase();

    const username =
      user?.username || user?.emailAddresses?.[0]?.emailAddress || "Anonymous";
    const imageUrl = user?.imageUrl || "";

    console.log("Upserting score:", {
      userId,
      duration,
      mode,
      bestWpm,
      bestAccuracy,
      country,
    });

    try {
      await Score.updateOne(
        { userId, category: duration, mode },
        {
          $setOnInsert: { userId, category: duration, mode },
          $set: { username, imageUrl, country }, // ✅ don't include mode here
          $max: { bestWpm, bestAccuracy },
        },
        { upsert: true }
      );

    } catch (err) {
      console.error("❌ Mongo error:", err);
      if (err?.code === 11000) {
        return new Response(
          JSON.stringify({
            error:
              "Duplicate key. Ensure unique index is { userId, category, mode }.",
          }),
          { status: 409 }
        );
      }
      throw err;
    }

    try {
      revalidateTag("leaderboard");
    } catch (e) {
      console.log("revalidateTag skipped:", e?.message);
    }

    console.log("✅ Score saved successfully");
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("🔥 Save score fatal error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

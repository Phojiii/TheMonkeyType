import { currentUser, getAuth } from "@clerk/nextjs/server";
import { revalidateTag } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { ensureUserProfile } from "@/lib/profile";
import { postPersonalBestAnnouncement } from "@/lib/discord";
import Score from "@/models/Score";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set([15, 30, 60, 120]);
const ALLOWED_MODES = new Set(["classic", "competitive"]);

function findDiscordAccount(user) {
  const accounts = Array.isArray(user?.externalAccounts) ? user.externalAccounts : [];
  return (
    accounts.find((account) => String(account?.provider || "").toLowerCase().includes("discord")) ||
    null
  );
}

export async function POST(req) {
  try {
    const auth = getAuth(req);
    const { userId } = auth;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const bestWpm = Math.round(Number(body?.bestWpm ?? 0));
    const bestAccuracy = Math.round(Number(body?.bestAccuracy ?? 0));
    const duration = Number(body?.duration);

    const rawMode = String(body?.mode || "classic").toLowerCase();
    const mode = ALLOWED_MODES.has(rawMode) ? rawMode : "classic";

    if (!ALLOWED.has(duration)) {
      return new Response(
        JSON.stringify({ error: "Invalid duration", received: body?.duration }),
        { status: 400 }
      );
    }

    await connectDB();

    const user = await currentUser();
    const profile = await ensureUserProfile(user);
    const previous = await Score.findOne({ userId, category: duration, mode }).lean();

    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      body?.debugCountry ||
      "";
    const country = (headerCountry || "").toUpperCase();

    const username =
      user?.username || user?.emailAddresses?.[0]?.emailAddress || "Anonymous";
    const imageUrl = user?.imageUrl || "";

    await Score.updateOne(
      { userId, category: duration, mode },
      {
        $setOnInsert: { userId, category: duration, mode },
        $set: { username, imageUrl, country },
        $max: { bestWpm, bestAccuracy },
      },
      { upsert: true }
    );

    const improvedWpm = bestWpm > Number(previous?.bestWpm || 0);
    const improvedAccuracy = bestAccuracy > Number(previous?.bestAccuracy || 0);
    const discordAccount = findDiscordAccount(user);

    if (profile && discordAccount && (improvedWpm || improvedAccuracy)) {
      try {
        await postPersonalBestAnnouncement({
          profileSlug: profile.slug,
          username: profile.displayName || username,
          discordUsername:
            discordAccount.username ||
            discordAccount.emailAddress ||
            discordAccount.providerUserId ||
            "",
          duration,
          mode,
          bestWpm: Math.max(bestWpm, Number(previous?.bestWpm || 0)),
          bestAccuracy: Math.max(bestAccuracy, Number(previous?.bestAccuracy || 0)),
          previousWpm: Number(previous?.bestWpm || 0),
          previousAccuracy: Number(previous?.bestAccuracy || 0),
        });
      } catch (discordError) {
        console.error("Personal best Discord post failed:", discordError);
      }
    }

    try {
      revalidateTag("leaderboard");
    } catch (error) {
      console.log("revalidateTag skipped:", error?.message);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Save score fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

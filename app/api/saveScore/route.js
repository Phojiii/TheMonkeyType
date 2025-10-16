import { getAuth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";

export const dynamic = "force-dynamic"; // avoid any accidental caching

export async function POST(req) {
  try {
    const { userId, sessionId } = getAuth(req); // <-- read from request
    // optional: see it in server logs
    console.log("saveScore userId/sessionId =>", userId, sessionId);

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = await currentUser(); // safe now that userId exists
    const { bestWpm = 0, bestAccuracy = 0 } = await req.json();

    await connectDB();

    const doc = await Score.findOne({ userId });
    if (doc) {
      doc.bestWpm = Math.max(doc.bestWpm, bestWpm);
      doc.bestAccuracy = Math.max(doc.bestAccuracy, bestAccuracy);
      doc.username = user?.username || user?.emailAddresses?.[0]?.emailAddress || "Anonymous";
      doc.imageUrl = user?.imageUrl || "";
      doc.updatedAt = new Date();
      await doc.save();
    } else {
      await Score.create({
        userId,
        username: user?.username || user?.emailAddresses?.[0]?.emailAddress || "Anonymous",
        imageUrl: user?.imageUrl || "",
        bestWpm,
        bestAccuracy,
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Save score error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

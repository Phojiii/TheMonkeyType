import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";

export async function GET() {
  try {
    await connectDB();

    const topScores = await Score.find({})
      .sort({ bestWpm: -1 })
      .limit(50)
      .select("username bestWpm bestAccuracy imageUrl userId");

    return new Response(JSON.stringify(topScores), { status: 200 });
  } catch (err) {
    console.error("Leaderboard error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

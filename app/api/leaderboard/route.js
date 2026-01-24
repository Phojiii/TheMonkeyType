import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import { getAuth } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const ALLOWED = new Set(["15", "30", "60", "120", "all"]);
const ALLOWED_MODES = new Set(["classic", "competitive"]);

export async function GET(req) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const { searchParams } = new URL(req.url);

    const rawCategory = (searchParams.get("category") || "all").toLowerCase();
    const categoryParam = ALLOWED.has(rawCategory) ? rawCategory : "all";

    const modeRaw = (searchParams.get("mode") || "classic").toLowerCase();
    const mode = ALLOWED_MODES.has(modeRaw) ? modeRaw : "classic";

    const rawScope = (searchParams.get("scope") || "global").toLowerCase();
    const scope = rawScope === "country" ? "country" : "global";

    const reqLimit = parseInt(searchParams.get("limit") || "100", 10);
    const limit = Number.isFinite(reqLimit)
      ? Math.min(Math.max(reqLimit, 1), 200)
      : 100;

    const isAll = categoryParam === "all";
    const category = isAll ? null : Number(categoryParam);

    const headerCountry =
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("cf-ipcountry") ||
      "";
    const country = (searchParams.get("country") || headerCountry || "").toUpperCase();

    const baseMatch = { mode };
    if (!isAll) baseMatch.category = category;
    if (scope === "country" && country) baseMatch.country = country;

    let rows;

    if (isAll) {
      // ✅ must respect mode + optional country
      const matchAll = { mode };
      if (scope === "country" && country) matchAll.country = country;

      rows = await Score.aggregate([
        { $match: matchAll },

        { $sort: { bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },

        { $group: { _id: "$userId", doc: { $first: "$$ROOT" } } },
        { $replaceRoot: { newRoot: "$doc" } },

        { $sort: { bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },
        { $limit: limit },

        // ✅ PBs per category in SAME MODE
        {
          $lookup: {
            from: "scores",
            let: { uid: "$userId", m: "$mode" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$uid"] },
                      { $eq: ["$mode", "$$m"] },
                    ],
                  },
                },
              },
              { $project: { _id: 0, category: 1, bestWpm: 1, bestAccuracy: 1 } },
              { $sort: { category: 1 } },
            ],
            as: "pbByCategory",
          },
        },

        {
          $project: {
            _id: 0,
            id: "$_id",
            userId: 1,
            username: 1,
            imageUrl: 1,
            bestWpm: 1,
            bestAccuracy: 1,
            category: 1,
            country: 1,
            mode: 1,
            lastSeenAt: 1, // ✅ include
            updatedAt: 1,
            pbByCategory: 1,
          },
        },
      ]);
    } else {
      // single category
      rows = await Score.aggregate([
        { $match: baseMatch },
        { $sort: { bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },
        { $limit: limit },

        {
          $lookup: {
            from: "scores",
            let: { uid: "$userId", m: "$mode" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$uid"] },
                      { $eq: ["$mode", "$$m"] },
                    ],
                  },
                },
              },
              { $project: { _id: 0, category: 1, bestWpm: 1, bestAccuracy: 1 } },
              { $sort: { category: 1 } },
            ],
            as: "pbByCategory",
          },
        },

        {
          $project: {
            _id: 0,
            id: "$_id",
            userId: 1,
            username: 1,
            imageUrl: 1,
            bestWpm: 1,
            bestAccuracy: 1,
            category: 1,
            country: 1,
            mode: 1,
            lastSeenAt: 1, // ✅ include
            updatedAt: 1,
            pbByCategory: 1,
          },
        },
      ]);
    }

    // ---- rank for current user (✅ respect mode)
    let me = null;
    if (userId) {
      if (isAll) {
        const matchAll = { mode };
        if (scope === "country" && country) matchAll.country = country;

        const ranked = await Score.aggregate([
          { $match: matchAll },
          { $sort: { bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },
          { $group: { _id: "$userId", doc: { $first: "$$ROOT" } } },
          { $replaceRoot: { newRoot: "$doc" } },
          { $sort: { bestWpm: -1, bestAccuracy: -1, updatedAt: -1 } },
          { $project: { userId: 1 } },
        ]);

        const myIndex = ranked.findIndex((r) => r.userId === userId);
        if (myIndex >= 0) me = { userId, rank: myIndex + 1, total: ranked.length };
      } else {
        const forRank = await Score.find(baseMatch, { userId: 1 })
          .sort({ bestWpm: -1, bestAccuracy: -1, updatedAt: -1 })
          .lean();

        const myIndex = forRank.findIndex((r) => r.userId === userId);
        if (myIndex >= 0) me = { userId, rank: myIndex + 1, total: forRank.length };
      }
    }

    const payload = rows.map((r) => ({
      id: String(r.id || r._id || ""),
      userId: r.userId,
      username: r.username || "Anonymous",
      imageUrl: r.imageUrl || "",
      bestWpm: Number(r.bestWpm || 0),
      bestAccuracy: Number(r.bestAccuracy || 0),
      category: Number(r.category || 0),
      country: (r.country || "").toUpperCase(),
      mode: r.mode || mode,
      lastSeenAt: r.lastSeenAt || null, // ✅ send to client
      updatedAt: r.updatedAt || null,
      pbByCategory: (r.pbByCategory || []).map((x) => ({
        category: Number(x.category),
        bestWpm: Number(x.bestWpm || 0),
        bestAccuracy: Number(x.bestAccuracy || 0),
      })),
    }));

    return NextResponse.json(
      {
        scores: payload,
        meta: {
          scope,
          category: isAll ? "all" : category,
          country: scope === "country" ? country || null : null,
          mode,
          count: payload.length,
        },
        me,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (e) {
    console.error("Leaderboard GET error:", e);
    return NextResponse.json({ error: "Failed to load leaderboard" }, { status: 500 });
  }
}

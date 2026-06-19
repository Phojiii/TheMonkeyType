import { connectDB } from "@/lib/mongodb";
import Score from "@/models/Score";
import UserProfile from "@/models/UserProfile";

const TIME_CATEGORIES = [15, 30, 60, 120];
const WORD_CATEGORIES = [10, 25, 50, 100];

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function slugifyProfile(value, fallback = "typist") {
  const base = normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || fallback;
}

export function getUserDisplayName(user) {
  return (
    normalizeWhitespace(user?.username) ||
    normalizeWhitespace([user?.firstName, user?.lastName].filter(Boolean).join(" ")) ||
    normalizeWhitespace(user?.emailAddresses?.[0]?.emailAddress?.split("@")[0]) ||
    "Anonymous"
  );
}

export function buildDefaultProfileFields(user) {
  const displayName = getUserDisplayName(user);
  const hasStableUsername = Boolean(normalizeWhitespace(user?.username));
  const fallbackSuffix = String(user?.id || "").slice(-6).toLowerCase();
  const slugBase = hasStableUsername ? displayName : `${displayName}-${fallbackSuffix || "player"}`;

  return {
    username: normalizeWhitespace(user?.username) || displayName,
    slug: slugifyProfile(slugBase, `typist-${fallbackSuffix || "player"}`),
    displayName,
    imageUrl: user?.imageUrl || "",
    joinedAt: user?.createdAt ? new Date(user.createdAt) : new Date(),
  };
}

export function buildPublicProfileUrl(slug) {
  return `/profile/${slugifyProfile(slug)}`;
}

function mapToPlainObject(mapLike) {
  if (!mapLike) return {};
  if (mapLike instanceof Map) return Object.fromEntries(mapLike.entries());
  return typeof mapLike === "object" ? mapLike : {};
}

function normalizeBestEntry(entry) {
  return {
    wpm: Number(entry?.wpm || 0),
    accuracy: Number(entry?.accuracy || 0),
    elapsedSec: Number(entry?.elapsedSec || 0),
  };
}

export function calculateLevelFromProfile(profile) {
  const aggregate = profile?.aggregate || {};
  const xp =
    Number(aggregate.testsCompleted || 0) * 12 +
    Math.floor(Number(aggregate.totalTypingSeconds || 0) / 30) +
    Math.floor(Number(aggregate.totalCharacters || 0) / 250);

  const level = Math.max(1, Math.floor(Math.sqrt(xp / 40)) + 1);
  const currentLevelFloor = Math.pow(Math.max(level - 1, 1) - 1, 2) * 40;
  const nextLevelAt = Math.pow(level, 2) * 40;
  const progress = Math.max(0, xp - currentLevelFloor);
  const needed = Math.max(1, nextLevelAt - currentLevelFloor);

  return {
    xp,
    level,
    progress,
    needed,
    nextLevelAt,
  };
}

export async function ensureUserProfile(user) {
  if (!user?.id) return null;

  await connectDB();

  const defaults = buildDefaultProfileFields(user);

  return UserProfile.findOneAndUpdate(
    { userId: user.id },
    {
      $setOnInsert: {
        joinedAt: defaults.joinedAt,
        slug: defaults.slug,
      },
      $set: {
        username: defaults.username,
        displayName: defaults.displayName,
        imageUrl: defaults.imageUrl,
      },
    },
    { upsert: true, new: true }
  );
}

async function computePlacement(userId, category, mode = "classic") {
  const ranked = await Score.find(
    { category, mode },
    { userId: 1, bestWpm: 1, bestAccuracy: 1, updatedAt: 1 }
  )
    .sort({ bestWpm: -1, bestAccuracy: -1, updatedAt: -1 })
    .lean();

  const index = ranked.findIndex((entry) => entry.userId === userId);
  return {
    category,
    mode,
    rank: index >= 0 ? index + 1 : null,
    total: ranked.length,
  };
}

function mergeTimeBests(profile, scores) {
  const fromProfile = mapToPlainObject(profile?.bests?.time);
  const merged = {};

  for (const category of TIME_CATEGORIES) {
    const key = String(category);
    merged[key] = normalizeBestEntry(fromProfile[key]);
  }

  for (const score of scores) {
    if (score.mode !== "classic") continue;
    const key = String(Number(score.category || 0));
    if (!TIME_CATEGORIES.includes(Number(key))) continue;

    merged[key] = {
      wpm: Math.max(Number(merged[key]?.wpm || 0), Number(score.bestWpm || 0)),
      accuracy: Math.max(Number(merged[key]?.accuracy || 0), Number(score.bestAccuracy || 0)),
      elapsedSec: Number(merged[key]?.elapsedSec || 0),
    };
  }

  return merged;
}

function mergeWordBests(profile) {
  const fromProfile = mapToPlainObject(profile?.bests?.words);
  const merged = {};

  for (const category of WORD_CATEGORIES) {
    const key = String(category);
    merged[key] = normalizeBestEntry(fromProfile[key]);
  }

  return merged;
}

function pickProfileTitle(profile, levelInfo) {
  if (normalizeWhitespace(profile?.title)) return profile.title;

  const level = levelInfo.level;

  if (level >= 1000) return "Typing Legend";

  if (level >= 999) return "Grandmaster III";
  if (level >= 995) return "Grandmaster II";
  if (level >= 990) return "Grandmaster I";

  if (level >= 975) return "Typing Master III";
  if (level >= 950) return "Typing Master II";
  if (level >= 900) return "Typing Master I";

  if (level >= 850) return "Keyboard Knight III";
  if (level >= 800) return "Keyboard Knight II";
  if (level >= 750) return "Keyboard Knight I";

  if (level >= 700) return "Wordsmith III";
  if (level >= 650) return "Wordsmith II";
  if (level >= 600) return "Wordsmith I";

  if (level >= 550) return "Speedster III";
  if (level >= 500) return "Speedster II";
  if (level >= 450) return "Speedster I";

  if (level >= 400) return "Scribe III";
  if (level >= 350) return "Scribe II";
  if (level >= 300) return "Scribe I";

  if (level >= 250) return "Typist III";
  if (level >= 200) return "Typist II";
  if (level >= 150) return "Typist I";

  if (level >= 100) return "Novice III";
  if (level >= 50) return "Novice II";

  return "Novice I";
}

export async function getProfileBundleBySlug(slug) {
  await connectDB();

  const safeSlug = slugifyProfile(slug);
  let profile = await UserProfile.findOne({ slug: safeSlug }).lean();

  if (!profile) {
    const fallbackScore = await Score.findOne({
      username: new RegExp(`^${String(slug).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!fallbackScore) return null;

    profile = {
      userId: fallbackScore.userId,
      username: fallbackScore.username || "Anonymous",
      slug: safeSlug,
      displayName: fallbackScore.username || "Anonymous",
      imageUrl: fallbackScore.imageUrl || "",
      joinedAt: fallbackScore.createdAt || fallbackScore.updatedAt || new Date(),
      bio: "",
      title: "",
      keyboardLayout: "QWERTY",
      altLayoutAccount: "",
      socials: {},
      aggregate: {
        testsStarted: 0,
        testsCompleted: 0,
        totalTypingSeconds: 0,
        totalCharacters: 0,
        totalBackspaces: 0,
      },
      bests: {
        time: {},
        words: {},
      },
    };
  }

  const scores = await Score.find({ userId: profile.userId }).sort({ category: 1 }).lean();
  const [placement15, placement60] = await Promise.all([
    computePlacement(profile.userId, 15, "classic"),
    computePlacement(profile.userId, 60, "classic"),
  ]);

  const levelInfo = calculateLevelFromProfile(profile);
  const timeBests = mergeTimeBests(profile, scores);
  const wordBests = mergeWordBests(profile);

  return {
    profile: {
      ...profile,
      joinedAt: profile.joinedAt ? new Date(profile.joinedAt).toISOString() : null,
      title: pickProfileTitle(profile, levelInfo),
      levelInfo,
      timeBests,
      wordBests,
    },
    placements: [placement15, placement60],
    scoreRows: scores.map((score) => ({
      category: Number(score.category || 0),
      bestWpm: Number(score.bestWpm || 0),
      bestAccuracy: Number(score.bestAccuracy || 0),
      mode: score.mode || "classic",
      updatedAt: score.updatedAt ? new Date(score.updatedAt).toISOString() : null,
    })),
  };
}

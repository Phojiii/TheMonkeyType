import mongoose from "mongoose";

const PersonalBestSchema = new mongoose.Schema(
  {
    wpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    elapsedSec: { type: Number, default: 0 },
  },
  { _id: false }
);

const AggregateStatsSchema = new mongoose.Schema(
  {
    testsStarted: { type: Number, default: 0 },
    testsCompleted: { type: Number, default: 0 },
    totalTypingSeconds: { type: Number, default: 0 },
    totalCharacters: { type: Number, default: 0 },
    totalBackspaces: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    username: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    joinedAt: { type: Date, default: Date.now },
    bio: { type: String, default: "" },
    title: { type: String, default: "" },
    keyboardLayout: { type: String, default: "QWERTY" },
    altLayoutAccount: { type: String, default: "" },
    socials: {
      website: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitch: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      instagram: { type: String, default: "" },
      github: { type: String, default: "" },
      discord: { type: String, default: "" },
    },
    aggregate: { type: AggregateStatsSchema, default: () => ({}) },
    bests: {
      time: {
        type: Map,
        of: PersonalBestSchema,
        default: () => new Map(),
      },
      words: {
        type: Map,
        of: PersonalBestSchema,
        default: () => new Map(),
      },
    },
  },
  { timestamps: true, collection: "user_profiles" }
);

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);

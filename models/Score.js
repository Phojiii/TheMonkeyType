// models/Score.js
import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String, default: "Anonymous" },
    imageUrl: { type: String, default: "" },
    category: { type: Number, required: true },
    bestWpm: { type: Number, default: 0 },
    bestAccuracy: { type: Number, default: 0 },
    country: { type: String, default: "" },
  },
  { timestamps: true, collection: "scores" }
);

// Each user should have at most one row per category
ScoreSchema.index({ userId: 1, category: 1 }, { unique: true });

// Useful leaderboards
ScoreSchema.index({ category: 1, bestWpm: -1, bestAccuracy: -1 });
ScoreSchema.index({ category: 1, country: 1, bestWpm: -1, bestAccuracy: -1 });

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);

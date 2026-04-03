import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    wpm: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    words: { type: Number, default: 0 },
    hits: { type: Number, default: 0 },
    finishedAt: { type: Date, default: null },
  },
  { _id: false }
);

const ChallengeSchema = new mongoose.Schema(
  {
    createdBy: { type: String, required: true, index: true },
    createdByUsername: { type: String, default: "Anonymous" },
    createdByImageUrl: { type: String, default: "" },
    opponentId: { type: String, required: true, index: true },
    opponentUsername: { type: String, default: "Anonymous" },
    opponentImageUrl: { type: String, default: "" },
    duration: { type: Number, enum: [15, 30, 60, 120], default: 60 },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "active", "done", "expired", "rejected"],
      default: "pending",
      index: true,
    },
    createdByResult: { type: ResultSchema, default: null },
    opponentResult: { type: ResultSchema, default: null },
    winnerId: { type: String, default: "", index: true },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, collection: "challenges" }
);

ChallengeSchema.index({ createdBy: 1, opponentId: 1, status: 1, createdAt: -1 });
ChallengeSchema.index({ opponentId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

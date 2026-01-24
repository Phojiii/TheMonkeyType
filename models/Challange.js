import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema(
  {
    createdBy: { type: String, required: true, index: true },
    opponentId: { type: String, required: true, index: true },

    duration: { type: Number, default: 60 },
    text: { type: String, required: true },

    status: { type: String, enum: ["pending", "active", "done", "expired"], default: "pending", index: true },

    createdByResult: { wpm: Number, accuracy: Number, finishedAt: Date },
    opponentResult: { wpm: Number, accuracy: Number, finishedAt: Date },

    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, collection: "challenges" }
);

export default mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);

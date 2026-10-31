import mongoose from "mongoose";

const TypingTestSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    testType: { type: String, enum: ["time", "words"], required: true },
    category: { type: Number, required: true },
    mode: { type: String, enum: ["classic", "competitive"], required: true },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "typing_test_sessions" }
);

export default mongoose.models.TypingTestSession ||
  mongoose.model("TypingTestSession", TypingTestSessionSchema);

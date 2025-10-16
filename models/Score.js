import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String }, // optional Clerk username or email
  imageUrl: { type: String }, // Clerk profile image
  bestWpm: { type: Number, default: 0 },
  bestAccuracy: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Score || mongoose.model("Score", ScoreSchema);

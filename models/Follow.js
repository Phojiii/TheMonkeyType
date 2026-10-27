import mongoose from "mongoose";

const FollowSchema = new mongoose.Schema(
  {
    followerUserId: { type: String, required: true, index: true },
    followedUserId: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: "user_follows" }
);

FollowSchema.index({ followerUserId: 1, followedUserId: 1 }, { unique: true });

export default mongoose.models.Follow || mongoose.model("Follow", FollowSchema);

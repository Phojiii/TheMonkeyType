import mongoose from "mongoose";

const FollowNotificationSchema = new mongoose.Schema(
  {
    recipientUserId: { type: String, required: true, index: true },
    actorUserId: { type: String, required: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "follow_notifications" }
);

FollowNotificationSchema.index({ recipientUserId: 1, createdAt: -1 });

export default mongoose.models.FollowNotification ||
  mongoose.model("FollowNotification", FollowNotificationSchema);

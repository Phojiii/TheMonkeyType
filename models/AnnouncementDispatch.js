import mongoose from "mongoose";

const AnnouncementDispatchSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true },
    version: { type: String, required: true },
    status: {
      type: String,
      enum: ["sending", "sent", "failed"],
      default: "sending",
    },
    channelId: { type: String, default: "" },
    messageId: { type: String, default: "" },
    sentAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

AnnouncementDispatchSchema.index({ kind: 1, version: 1 }, { unique: true });

export default mongoose.models.AnnouncementDispatch ||
  mongoose.model("AnnouncementDispatch", AnnouncementDispatchSchema);

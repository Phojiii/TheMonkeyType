import mongoose from "mongoose";

const ContactRateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true, collection: "contact_rate_limits" }
);

export default mongoose.models.ContactRateLimit ||
  mongoose.model("ContactRateLimit", ContactRateLimitSchema);

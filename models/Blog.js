import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: "", trim: true },
    author: { type: String, default: "TheMonkeyType Team", trim: true },
    date: { type: Date, default: Date.now, index: true },
    cover: { type: String, default: "", trim: true },
    content: { type: String, required: true },
  },
  { timestamps: true, collection: "blogs" }
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

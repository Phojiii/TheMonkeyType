import { list } from "@vercel/blob";
import matter from "gray-matter";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI");
}

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

const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

async function migrate() {
  await mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
    dbName: "themonkeytype",
  });

  const { blobs } = await list({ prefix: "blogs/" });
  const mdFiles = blobs.filter((blob) => blob.pathname.endsWith(".md"));

  let migrated = 0;

  for (const file of mdFiles) {
    const response = await fetch(file.url, { cache: "no-store" });
    if (!response.ok) {
      console.warn(`Skipping ${file.pathname}: ${response.status}`);
      continue;
    }

    const raw = await response.text();
    const { data, content } = matter(raw);
    const slug = file.pathname.split("/").pop().replace(/\.md$/, "");

    await Blog.updateOne(
      { slug },
      {
        $set: {
          slug,
          title: data.title || "Untitled",
          excerpt: data.excerpt || "",
          author: data.author || "TheMonkeyType Team",
          date: data.date ? new Date(data.date) : new Date(),
          cover: data.cover || "",
          content,
        },
      },
      { upsert: true }
    );

    migrated += 1;
    console.log(`Migrated ${slug}`);
  }

  console.log(`Done. Migrated ${migrated} blog post(s).`);
  await mongoose.disconnect();
}

migrate().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

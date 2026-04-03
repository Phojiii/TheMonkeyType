// lib/blog.js
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/Blog";

export async function getAllPosts() {
  try {
    await connectDB();

    const posts = await Blog.find(
      {},
      { _id: 0, slug: 1, title: 1, excerpt: 1, author: 1, date: 1, cover: 1 }
    )
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return posts.map((post) => ({
      slug: post.slug,
      title: post.title || "Untitled",
      excerpt: post.excerpt || "",
      author: post.author || "TheMonkeyType Team",
      date: post.date || new Date().toISOString(),
      cover: post.cover || "",
    }));
  } catch (err) {
    console.error("getAllPosts() failed:", err);
    return [];
  }
}

export async function getPostBySlug(slug) {
  try {
    await connectDB();

    const post = await Blog.findOne({ slug }).lean();
    if (!post) return null;

    return {
      slug: post.slug,
      title: post.title || "Untitled",
      excerpt: post.excerpt || "",
      author: post.author || "TheMonkeyType Team",
      date: post.date || new Date().toISOString(),
      cover: post.cover || "",
      content: post.content || "",
    };
  } catch (err) {
    console.error("getPostBySlug() failed:", err);
    return null;
  }
}

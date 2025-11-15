// lib/blog.js
import { list } from "@vercel/blob";
import matter from "gray-matter";

export async function getAllPosts() {
  try {
    // ✅ List all blobs under the "blogs/" prefix
    const { blobs } = await list({ prefix: "blogs/" });

    // Keep only markdown files
    const mdFiles = blobs.filter((b) => b.pathname.endsWith(".md"));

    const posts = [];

    // Fetch each blog file and parse its frontmatter
    for (const file of mdFiles) {
      const res = await fetch(file.url, { cache: "no-store" });
      if (!res.ok) continue;

      const text = await res.text();
      const { data } = matter(text);

      const slug = file.pathname.split("/").pop().replace(".md", "");

      posts.push({
        slug,
        title: data.title || "Untitled",
        excerpt: data.excerpt || "",
        author: data.author || "TheMonkeyType Team",
        date: data.date || new Date().toISOString(),
        cover: data.cover || "",
      });
    }

    // Sort by newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    console.error("getAllPosts() failed:", err);
    return [];
  }
}
export async function getPostBySlug(slug) {
  try {
    const { blobs } = await list({ prefix: `blogs/${slug}` });
    const file = blobs.find((b) => b.pathname.endsWith(".md"));
    if (!file) return null;

    const res = await fetch(file.url, { cache: "no-store" });
    const text = await res.text();

    const { data, content } = matter(text);

    return {
      slug,
      ...data,
      content,
    };
  } catch (err) {
    console.error("getPostBySlug() failed:", err);
    return null;
  }
}
